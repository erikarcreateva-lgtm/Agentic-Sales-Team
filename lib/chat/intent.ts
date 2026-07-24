import "server-only";
import { geminiJSON, isGeminiConfigured } from "@/lib/ai/gemini";

export type ChatIntentKind = "scrape" | "outreach" | "research" | "proposal" | "follow-up" | "book-meeting" | "chat";

export interface ChatIntent {
  intent: ChatIntentKind;
  targetBrand: string | null;
  niche: string | null;
  timeText: string | null;
}

const SCHEMA = {
  type: "object",
  properties: {
    intent: { type: "string", enum: ["scrape", "outreach", "research", "proposal", "follow-up", "book-meeting", "chat"] },
    targetBrand: { type: "string" },
    niche: { type: "string" },
    timeText: { type: "string" },
  },
  required: ["intent"],
};

export async function classifyIntent(text: string): Promise<ChatIntent> {
  if (!isGeminiConfigured()) return fallbackClassify(text);

  const system = [
    `You classify one message sent in a team chat where a creator directs their AI sales helpers. Pick exactly one intent:`,
    `"scrape" — find/discover new brands in a niche or topic (no specific brand named).`,
    `"outreach" — draft a first pitch/DM for one named brand that hasn't been pitched yet.`,
    `"research" — write a vetting brief on one named brand.`,
    `"proposal" — draft a priced proposal for one named brand.`,
    `"follow-up" — write a follow-up nudge for one named brand that's gone quiet.`,
    `"book-meeting" — book a call/meeting with one named brand at some time.`,
    `"chat" — anything else: small talk or unclear requests.`,
    `Also extract: targetBrand (the brand name mentioned, if any), niche (the topic/niche mentioned for a scrape request, if any), timeText (the natural-language time phrase for a booking request, if any, e.g. "next Tuesday at 2pm").`,
    `Return ONLY JSON matching the schema. Omit a field (or leave it empty) if it doesn't apply.`,
  ].join("\n\n");

  try {
    const r = await geminiJSON<Partial<ChatIntent>>(system, [{ role: "user", text }], SCHEMA, { maxTokens: 200, temperature: 0.2 });
    return {
      intent: r.intent ?? "chat",
      targetBrand: r.targetBrand?.trim() || null,
      niche: r.niche?.trim() || null,
      timeText: r.timeText?.trim() || null,
    };
  } catch {
    return fallbackClassify(text);
  }
}

// No AI key (or the call failed) — simple keyword heuristics so chat still
// does something reasonable instead of just going silent.
function fallbackClassify(text: string): ChatIntent {
  const lower = text.toLowerCase();
  let intent: ChatIntentKind = "chat";
  if (/\bfind\b|\bdiscover\b|new brands/.test(lower)) intent = "scrape";
  else if (/\bpitch\b|\bdm\b|\boutreach\b/.test(lower)) intent = "outreach";
  else if (/propos/.test(lower)) intent = "proposal";
  else if (/follow.?up|nudge|circl(e|ing) back/.test(lower)) intent = "follow-up";
  else if (/\bbrief\b|\bresearch\b|\bvet\b/.test(lower)) intent = "research";
  else if (/\bbook\b|\bschedul|\bcall\b|\bmeeting\b/.test(lower)) intent = "book-meeting";

  const brandMatch = text.match(/(?:for|with)\s+([A-Za-z0-9 .&'-]+?)(?:\s+(?:next|tomorrow|today|at)\b|[.?!]|$)/i);
  const targetBrand = brandMatch ? brandMatch[1].trim() : null;
  const timeMatch = text.match(/\b(next\s+\w+|tomorrow|today)[^.?!]*/i);

  return {
    intent,
    targetBrand,
    niche: intent === "scrape" ? text : null,
    timeText: timeMatch ? timeMatch[0].trim() : null,
  };
}
