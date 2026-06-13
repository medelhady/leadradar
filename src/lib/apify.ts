import { ApifyPlace } from "@/types";

const APIFY_TOKEN = process.env.APIFY_API_TOKEN!;
const ACTOR_ID = "nwua9Gu5YrADL7ZDj"; // Google Maps Scraper

export async function scrapeGoogleMaps(
  keyword: string,
  city: string,
  state: string,
  maxResults: number
): Promise<ApifyPlace[]> {
  const query = `${keyword} in ${city}, ${state}`;

  // Start the actor run
  const runRes = await fetch(
    `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        searchStringsArray: [query],
        maxCrawledPlacesPerSearch: maxResults,
        language: "en",
        countryCode: "us",
        includeWebResults: false,
      }),
    }
  );

  if (!runRes.ok) {
    const err = await runRes.text();
    throw new Error(`Apify run failed: ${err}`);
  }

  const runData = await runRes.json();
  const runId = runData.data.id;

  // Poll for completion
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes max

  while (attempts < maxAttempts) {
    await new Promise((r) => setTimeout(r, 5000));
    attempts++;

    const statusRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`
    );
    const statusData = await statusRes.json();
    const status = statusData.data.status;

    if (status === "SUCCEEDED") {
      const datasetId = statusData.data.defaultDatasetId;
      const itemsRes = await fetch(
        `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}&limit=${maxResults}`
      );
      const items = await itemsRes.json();
      return items as ApifyPlace[];
    }

    if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
      throw new Error(`Apify actor ${status}`);
    }
  }

  throw new Error("Apify run timed out after 5 minutes");
}
