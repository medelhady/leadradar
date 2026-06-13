import { NextRequest, NextResponse } from "next/server";
import { scrapeGoogleMaps } from "@/lib/apify";
import { scrapeEmails } from "@/lib/scraper";
import { supabase } from "@/lib/supabase";
import { Lead, SearchResult } from "@/types";

export const maxDuration = 300; // 5 min Vercel timeout

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keyword, city, state, maxResults } = body;

    if (!keyword || !city || !state) {
      return NextResponse.json({ error: "keyword, city, and state are required" }, { status: 400 });
    }

    const result: SearchResult = {
      leads: [],
      stats: { companiesFound: 0, emailsFound: 0, skippedDuplicates: 0 },
      errors: [],
    };

    // Step 1: Scrape Google Maps via Apify
    let places;
    try {
      places = await scrapeGoogleMaps(keyword, city, state, maxResults ?? 20);
    } catch (e: unknown) {
      return NextResponse.json(
        { error: `Apify scrape failed: ${e instanceof Error ? e.message : String(e)}` },
        { status: 500 }
      );
    }

    result.stats.companiesFound = places.length;

    // Step 2: For each place, scrape emails and save
    const tasks = places
      .filter((p) => p.website)
      .map(async (place) => {
        let emails: string[] = [];
        try {
          emails = await scrapeEmails(place.website!);
        } catch (e: unknown) {
          result.errors.push(`Email scrape failed for ${place.website}: ${e instanceof Error ? e.message : String(e)}`);
        }

        // Normalize website
        let website = place.website ?? "";
        if (!website.startsWith("http")) website = "https://" + website;
        try {
          website = new URL(website).hostname.replace("www.", "");
        } catch {
          // keep as-is
        }

        // Parse city/state from address if not present
        let placeCity = place.city ?? city;
        let placeState = place.state ?? state;
        if (!place.city && place.address) {
          const parts = place.address.split(",").map((s) => s.trim());
          if (parts.length >= 3) {
            placeCity = parts[parts.length - 3] ?? city;
            const stateZip = parts[parts.length - 2] ?? "";
            placeState = stateZip.split(" ")[0] ?? state;
          }
        }

        if (emails.length === 0) {
          // Save company without email if at least website found
          const lead: Omit<Lead, "id" | "created_at"> = {
            company_name: place.title,
            website,
            email: "",
            phone: place.phone ?? "",
            city: placeCity,
            state: placeState,
            rating: place.totalScore ?? null,
            reviews: place.reviewsCount ?? null,
          };

          // Check duplicate website
          const { data: existing } = await supabase
            .from("leads")
            .select("id")
            .eq("website", website)
            .limit(1);

          if (existing && existing.length > 0) {
            result.stats.skippedDuplicates++;
            return;
          }

          const { data } = await supabase.from("leads").insert([lead]).select().single();
          if (data) result.leads.push(data);
        } else {
          // Save one row per email
          for (const email of emails) {
            // Check for duplicate email
            const { data: existingEmail } = await supabase
              .from("leads")
              .select("id")
              .eq("email", email)
              .limit(1);

            if (existingEmail && existingEmail.length > 0) {
              result.stats.skippedDuplicates++;
              continue;
            }

            // Also check website (skip if website already saved with same email)
            const lead: Omit<Lead, "id" | "created_at"> = {
              company_name: place.title,
              website,
              email,
              phone: place.phone ?? "",
              city: placeCity,
              state: placeState,
              rating: place.totalScore ?? null,
              reviews: place.reviewsCount ?? null,
            };

            const { data } = await supabase.from("leads").insert([lead]).select().single();
            if (data) {
              result.leads.push(data);
              result.stats.emailsFound++;
            }
          }
        }
      });

    await Promise.allSettled(tasks);

    return NextResponse.json(result);
  } catch (e: unknown) {
    console.error("Search error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}
