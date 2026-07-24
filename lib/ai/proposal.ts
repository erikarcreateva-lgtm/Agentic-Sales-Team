import "server-only";
import { geminiJSON, isGeminiConfigured } from "./gemini";
import { PITCH_GUARDRAILS } from "./guardrails";
import type { AgentRecord } from "@/lib/agents/types";
import type { Lead } from "@/lib/leads/types";

export interface ProposalResult {
  title: string;
  body: string;
  packages: string[];
}

const PROPOSAL_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    body: { type: "string" },
    packages: { type: "array", items: { type: "string" } },
  },
  required: ["title", "body", "packages"],
};

// There's no separate rate-card catalog — scope and pricing come entirely
// from the creator's Media Kit (rate floor, audience) plus the brand's
// research brief, if one exists yet.
export async function draftProposal(agent: AgentRecord, lead: Lead, creatorContext: string): Promise<ProposalResult> {
  if (!isGeminiConfigured()) return fallback(lead);

  const system = [
    `You are drafting a partnership proposal that the creator will send in their OWN first-person voice ("I" / "my" / "me").`,
    `Your internal goal for this proposal: ${agent.goal || "close a fairly priced partnership"}.`,
    `Write a titled, priced proposal for the brand below: a 150-250 word body, plus 2-4 deliverable packages that fit the creator's own platforms, priced against their rate floor. Include a soft next step at the end (e.g. "happy to hop on a quick call").`,
    `Ground every number in the Media Kit below — never invent a rate floor or platform that isn't there.`,
    PITCH_GUARDRAILS,
    `Media Kit:\n${creatorContext}`,
    `Return ONLY JSON matching the schema.`,
  ].join("\n\n");

  const facts = [
    `Brand: ${lead.name}`,
    lead.company ? `Company: ${lead.company}` : null,
    lead.platform ? `Brand's platform: ${lead.platform}` : null,
    lead.research ? `Research brief: ${JSON.stringify(lead.research)}` : "No research brief on file yet — propose based on the Media Kit alone.",
  ]
    .filter(Boolean)
    .join("\n");

  const r = await geminiJSON<ProposalResult>(system, [{ role: "user", text: facts }], PROPOSAL_SCHEMA, { maxTokens: 700, temperature: 0.6 });
  return {
    title: r.title?.trim() || `Partnership proposal for ${lead.company || lead.name}`,
    body: r.body?.trim() || "",
    packages: Array.isArray(r.packages) ? r.packages.filter((p) => typeof p === "string" && p.trim()) : [],
  };
}

function fallback(lead: Lead): ProposalResult {
  return {
    title: `Partnership proposal for ${lead.company || lead.name}`,
    body: `Thanks for the interest in working together — I'd love to put together a partnership that fits. I'll follow up shortly with scoped packages and pricing once I've had a chance to look at what would work best for both of us.`,
    packages: [],
  };
}
