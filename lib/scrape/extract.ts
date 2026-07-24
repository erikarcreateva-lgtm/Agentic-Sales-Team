import "server-only";
import { geminiJSON, isGeminiConfigured } from "@/lib/ai/gemini";
import type { WebResult } from "./firecrawl";

export interface BrandCandidate {
  name: string;
  website?: string;
}

const EXTRACT_SCHEMA = {
  type: "object",
  properties: {
    brands: {
      type: "array",
      items: {
        type: "object",
        properties: { name: { type: "string" }, website: { type: "string" } },
        required: ["name"],
      },
    },
  },
  required: ["brands"],
};

// Turns raw web-search snippets into distinct, plausible brand candidates —
// filters out listicle sites, forums, and the platforms themselves.
export async function extractBrandCandidates(results: WebResult[], niche: string): Promise<BrandCandidate[]> {
  if (!isGeminiConfigured() || results.length === 0) return [];

  const system = [
    `You extract real, distinct brand names from web search results about brands that sponsor "${niche}" content creators.`,
    `Only include actual company/brand names that plausibly run creator sponsorships or ambassador programs — skip listicle/blog sites, forums, and social platforms themselves (e.g. skip "TikTok", "Reddit", "Creator Hero").`,
    `Return 4-8 distinct brands. Include each brand's website domain only if it's clearly identifiable.`,
    `Return ONLY JSON matching the schema.`,
  ].join("\n\n");

  const facts = results.map((r) => `URL: ${r.url}\nTitle: ${r.title}\nDescription: ${r.description}`).join("\n\n");

  const r = await geminiJSON<{ brands: BrandCandidate[] }>(system, [{ role: "user", text: facts }], EXTRACT_SCHEMA, { maxTokens: 500, temperature: 0.4 });

  const seen = new Set<string>();
  return (r.brands ?? []).filter((b) => {
    const key = b.name?.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
