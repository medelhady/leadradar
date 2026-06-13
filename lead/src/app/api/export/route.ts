import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const headers = [
    "ID",
    "Company Name",
    "Website",
    "Email",
    "Phone",
    "City",
    "State",
    "Rating",
    "Reviews",
    "Created At",
  ];

  const rows = (data ?? []).map((lead) => [
    lead.id,
    `"${(lead.company_name ?? "").replace(/"/g, '""')}"`,
    lead.website ?? "",
    lead.email ?? "",
    lead.phone ?? "",
    lead.city ?? "",
    lead.state ?? "",
    lead.rating ?? "",
    lead.reviews ?? "",
    lead.created_at ?? "",
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="leads-${Date.now()}.csv"`,
    },
  });
}
