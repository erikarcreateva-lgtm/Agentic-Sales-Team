import "server-only";
import { geminiJSON, isGeminiConfigured } from "./gemini";
import type { AgentRecord } from "@/lib/agents/types";
import type { Lead, LeadResearch } from "@/lib/leads/types";

const RESEARCH_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    priorities: { type: "array", items: { type: "string" } },
    hooks: { type: "array", items: { type: "string" } },
    angle: { type: "string" },
  },
  required: ["summary", "priorities", "hooks", "angle"],
};

// An internal brief for the creator's own eyes — not outbound text — that
// the outreach/proposal engines then read to sharpen their pitch.
export async function draftResearch(agent: AgentRecord, lead: Lead, creatorContext: string): Promise<LeadResearch> {
  if (!isGeminiConfigured()) return fallback(lead);

  const system = [
    `You are vetting a brand ahead of a creator partnership pitch. Write a short internal brief — not outbound text — covering what the brand likely cares about and how to hook them.`,
    `Your internal goal: ${agent.goal || "find the sharpest possible angle for a pitch"}.`,
    `Return a 2-3 sentence summary of the brand, 2-4 priorities/values it likely cares about, 2-4 concrete hooks a pitch could use, and one short recommended angle.`,
    `Base this on the brand's name, company, and platform below plus general knowledge of similar brands — don't invent specific facts you can't reasonably infer, and never present a guess as confirmed fact.`,
    `This brief is read by the creator, not sent to the brand — no first-person voice needed.`,
    `Ground the recommended angle in the creator's own Media Kit below, so the hook fits who they actually are.`,
    `Media Kit:\n${creatorContext}`,
    `Return ONLY JSON matching the schema.`,
  ].join("\n\n");

  const facts = [`Brand: ${lead.name}`, lead.company ? `Company: ${lead.company}` : null, lead.platform ? `Platform: ${lead.platform}` : null]
    .filter(Boolean)
    .join("\n");

  const r = await geminiJSON<LeadResearch>(system, [{ role: "user", text: facts }], RESEARCH_SCHEMA, { maxTokens: 500, temperature: 0.5 });
  return {
    summary: r.summary?.trim() || "",
    priorities: Array.isArray(r.priorities) ? r.priorities.filter((p) => typeof p === "string" && p.trim()) : [],
    hooks: Array.isArray(r.hooks) ? r.hooks.filter((h) => typeof h === "string" && h.trim()) : [],
    angle: r.angle?.trim() || "",
  };
}

function fallback(lead: Lead): LeadResearch {
  return {
    summary: `Research brief unavailable (Gemini not configured). ${lead.name} would need manual research before pitching.`,
    priorities: [],
    hooks: [],
    angle: "",
  };
}
