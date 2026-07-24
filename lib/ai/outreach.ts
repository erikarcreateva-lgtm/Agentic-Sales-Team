import "server-only";
import { geminiJSON, isGeminiConfigured } from "./gemini";
import { PITCH_GUARDRAILS } from "./guardrails";
import type { AgentRecord } from "@/lib/agents/types";
import type { Lead, LeadStatus } from "@/lib/leads/types";

export interface OutreachResult {
  score: number;
  stage: LeadStatus;
  subject: string;
  body: string;
  rationale: string;
}

const OUTREACH_SCHEMA = {
  type: "object",
  properties: {
    score: { type: "integer" },
    stage: { type: "string", enum: ["new", "pitched", "negotiating", "replied", "booked"] },
    subject: { type: "string" },
    body: { type: "string" },
    rationale: { type: "string" },
  },
  required: ["score", "stage", "subject", "body", "rationale"],
};

// The flagship engine: scores the brand's fit and drafts the first-touch
// pitch — a polished email if there's an address, a short DM otherwise.
export async function draftOutreach(agent: AgentRecord, lead: Lead, creatorContext: string, creatorName: string): Promise<OutreachResult> {
  if (!isGeminiConfigured()) return fallback(lead, creatorName);

  const channel = lead.email
    ? `Channel: the brand has an email address, so write a polished 90-140 word partnership email with a real salutation ("Hi ${lead.name},") and a sign-off with your name.`
    : `Channel: the brand only has a ${lead.platform ?? "social"} profile, so write a short 2-4 sentence DM suited to that platform.`;

  const system = [
    `You ARE ${creatorName} — a real creator writing your OWN outreach to a brand. Write in first person: I / my / me.`,
    `Your internal goal: ${agent.goal || "land a paid brand partnership"}.`,
    `Do two things: (1) score this brand's fit for a partnership from 0-100 and pick the pipeline stage it belongs in (usually "pitched" once you've reached out), (2) write the outreach message.`,
    channel,
    `No hype, no emojis, no exclamation marks, no placeholder tokens like [Brand].`,
    PITCH_GUARDRAILS,
    `Media Kit:\n${creatorContext}`,
    `Return ONLY JSON matching the schema.`,
  ].join("\n\n");

  const facts = [
    `Brand: ${lead.name}`,
    lead.company ? `Company: ${lead.company}` : null,
    lead.title ? `Contact title: ${lead.title}` : null,
    lead.email ? `Has an email address` : `Platform: ${lead.platform ?? "unknown"}, no email on file`,
    lead.research ? `Research brief: ${JSON.stringify(lead.research)}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const r = await geminiJSON<OutreachResult>(system, [{ role: "user", text: facts }], OUTREACH_SCHEMA, { maxTokens: 700, temperature: 0.6 });
  return {
    score: Math.max(0, Math.min(100, Math.round(r.score ?? 55))),
    stage: r.stage ?? "pitched",
    subject: r.subject?.trim() || `Partnership with ${creatorName}`,
    body: r.body?.trim() || "",
    rationale: r.rationale?.trim() || "",
  };
}

function fallback(lead: Lead, creatorName: string): OutreachResult {
  const body = lead.email
    ? `Hi ${lead.name} team,\n\nI'm ${creatorName}, and I create content my audience trusts for honest recommendations. I'd love to explore a partnership with ${lead.company || lead.name} — happy to share more about my audience and rates whenever it's useful.\n\nBest,\n${creatorName}`
    : `Hi! I'm ${creatorName} — I'd love to explore a partnership with ${lead.company || lead.name}. Happy to share my audience stats and rates if you're open to it!`;
  return {
    score: 58,
    stage: "pitched",
    subject: `Partnership with ${creatorName}`,
    body,
    rationale: "Fallback pitch (Gemini not configured).",
  };
}
