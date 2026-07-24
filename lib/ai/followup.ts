import "server-only";
import { geminiJSON, isGeminiConfigured } from "./gemini";
import { PITCH_GUARDRAILS } from "./guardrails";
import type { AgentRecord } from "@/lib/agents/types";
import type { Lead } from "@/lib/leads/types";

export interface FollowupResult {
  subject: string;
  body: string;
  rationale: string;
}

const FOLLOWUP_SCHEMA = {
  type: "object",
  properties: {
    subject: { type: "string" },
    body: { type: "string" },
    rationale: { type: "string" },
  },
  required: ["subject", "body", "rationale"],
};

export interface PriorPitch {
  subject: string;
  body: string;
}

// Re-engages a brand that's gone quiet. Builds on the prior pitch when one
// exists; otherwise writes a warm, generic reconnect note.
export async function draftFollowup(
  agent: AgentRecord,
  lead: Lead,
  creatorContext: string,
  creatorName: string,
  priorPitch: PriorPitch | null
): Promise<FollowupResult> {
  if (!isGeminiConfigured()) return fallback(lead, creatorName, priorPitch);

  const system = [
    `You ARE ${creatorName} — a real creator following up with a brand you already reached out to. Write in first person: I / my / me.`,
    `Your internal goal: ${agent.goal || "re-open the conversation without sounding pushy"}.`,
    `Write a short, warm, polite nudge — 2-4 sentences for a DM, or a brief email (under 80 words) if there's an email address. Reference what you already said only loosely (don't repeat the whole pitch); the goal is a light, friendly bump, not a re-pitch.`,
    priorPitch
      ? `Build on the prior message below — it's the thing you're following up on.`
      : `No prior pitch is on file for this brand — write a warm, generic check-in instead, as if reconnecting after reaching out previously.`,
    `No hype, no emojis, no exclamation marks, no placeholder tokens like [Brand].`,
    PITCH_GUARDRAILS,
    `Media Kit:\n${creatorContext}`,
    `Return ONLY JSON matching the schema.`,
  ].join("\n\n");

  const facts = [
    `Brand: ${lead.name}`,
    lead.company ? `Company: ${lead.company}` : null,
    lead.email ? `Contact: email` : `Contact: ${lead.platform ?? "social"} DM`,
    priorPitch ? `Prior message subject: ${priorPitch.subject}\nPrior message body:\n${priorPitch.body}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const r = await geminiJSON<FollowupResult>(system, [{ role: "user", text: facts }], FOLLOWUP_SCHEMA, { maxTokens: 500, temperature: 0.6 });
  return {
    subject: r.subject?.trim() || `Following up`,
    body: r.body?.trim() || "",
    rationale: r.rationale?.trim() || "",
  };
}

function fallback(lead: Lead, creatorName: string, priorPitch: PriorPitch | null): FollowupResult {
  const body = priorPitch
    ? `Hi again! Just circling back on my last note — still happy to chat about a partnership whenever it's convenient for you. No pressure at all!\n\n${creatorName}`
    : `Hi! Wanted to reconnect and see if a partnership with ${lead.company || lead.name} might still be a fit. Happy to share more whenever it's useful.\n\n${creatorName}`;
  return {
    subject: "Following up",
    body,
    rationale: "Fallback follow-up (Gemini not configured).",
  };
}
