import "server-only";
import { getCreatorProfile } from "@/lib/mediaKit/store";
import { createDiscoveredLead } from "@/lib/leads/store";
import { isGeminiConfigured } from "@/lib/ai/gemini";
import { isFirecrawlConfigured, searchBrands } from "./firecrawl";
import { extractBrandCandidates } from "./extract";

// A small canned set so discovery still completes with no Firecrawl/Gemini
// key — real degradation, not a separate feature.
const FALLBACK_BRANDS = [
  { name: "Northwind Apparel" },
  { name: "Bright Sky Beverages" },
  { name: "Ridgeline Outdoors" },
  { name: "Glow Cosmetics" },
];

export async function runDiscovery(userId: string, nicheOverride?: string | null): Promise<{ found: number; names: string[] }> {
  const profile = await getCreatorProfile(userId);
  const niche = nicheOverride?.trim() || profile?.niche?.trim() || "content creation";

  let candidates: { name: string; website?: string }[] = [];
  if (isFirecrawlConfigured() && isGeminiConfigured()) {
    const results = await searchBrands(`${niche} brands that sponsor content creators partnerships`, 8);
    candidates = await extractBrandCandidates(results, niche);
  }
  if (candidates.length === 0) candidates = FALLBACK_BRANDS;

  for (const c of candidates) {
    await createDiscoveredLead(userId, { name: c.name, company: c.name, profileUrl: c.website });
  }

  return { found: candidates.length, names: candidates.map((c) => c.name) };
}
