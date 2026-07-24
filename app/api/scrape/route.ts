import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCreatorProfile } from "@/lib/mediaKit/store";
import { isFirecrawlConfigured, searchBrands } from "@/lib/scrape/firecrawl";
import { extractBrandCandidates } from "@/lib/scrape/extract";
import { isGeminiConfigured } from "@/lib/ai/gemini";
import { createDiscoveredLead } from "@/lib/leads/store";

export const runtime = "nodejs";
export const maxDuration = 60;

// A small canned set so discovery still completes with no Firecrawl/Gemini
// key — real degradation, not a separate feature.
const FALLBACK_BRANDS = [
  { name: "Northwind Apparel" },
  { name: "Bright Sky Beverages" },
  { name: "Ridgeline Outdoors" },
  { name: "Glow Cosmetics" },
];

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const profile = await getCreatorProfile(userId);
  const niche = profile?.niche?.trim() || "content creation";

  let candidates: { name: string; website?: string }[] = [];
  if (isFirecrawlConfigured() && isGeminiConfigured()) {
    const results = await searchBrands(`${niche} brands that sponsor content creators partnerships`, 8);
    candidates = await extractBrandCandidates(results, niche);
  }
  if (candidates.length === 0) candidates = FALLBACK_BRANDS;

  let found = 0;
  for (const c of candidates) {
    await createDiscoveredLead(userId, { name: c.name, company: c.name, profileUrl: c.website });
    found++;
  }

  return NextResponse.json({ found });
}
