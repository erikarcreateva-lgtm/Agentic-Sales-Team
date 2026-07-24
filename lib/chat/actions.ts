"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createMessage } from "./store";
import { classifyIntent } from "./intent";
import { listAgents } from "@/lib/agents/store";
import { pickAgentForCapability } from "@/lib/agents/pick";
import { listLeads, updateLeadStage } from "@/lib/leads/store";
import { getCreatorProfile } from "@/lib/mediaKit/store";
import { profileSummary, creatorDisplayName } from "@/lib/mediaKit/helpers";
import { getUser } from "@/lib/db/users";
import { runDiscovery } from "@/lib/scrape/discover";
import { enqueueJob, claimJobById } from "@/lib/jobs/store";
import { runOneJob } from "@/lib/jobs/run";
import { parseMeetingTime } from "@/lib/ai/meetingTime";
import { createMeeting } from "@/lib/meetings/store";
import { logActivity } from "@/lib/activity/store";
import { geminiGenerate, isGeminiConfigured } from "@/lib/ai/gemini";
import type { CapabilityId } from "@/lib/agentTypes";
import type { AgentRecord } from "@/lib/agents/types";
import type { Lead } from "@/lib/leads/types";

const INTENT_CAPABILITY: Record<string, CapabilityId> = {
  scrape: "scrape",
  outreach: "outreach",
  research: "research",
  proposal: "proposal",
  "follow-up": "follow-up",
  "book-meeting": "book-meeting",
};

function findMentionedAgent(text: string, agents: AgentRecord[]): AgentRecord | null {
  const m = text.match(/@([A-Za-z][\w'-]*)/);
  if (!m) return null;
  const word = m[1].toLowerCase();
  return (
    agents.find((a) => {
      const first = a.name.toLowerCase().split(" ")[0];
      return a.name.toLowerCase().includes(word) || a.role.toLowerCase().includes(word) || first === word || word.includes(first);
    }) ?? null
  );
}

function findLeadByName(leads: Lead[], text: string | null): Lead | null {
  if (!text) return null;
  const q = text.trim().toLowerCase();
  if (!q) return null;
  return (
    leads.find((l) => {
      const name = l.name.toLowerCase();
      const company = l.company?.toLowerCase() ?? "";
      return name.includes(q) || q.includes(name) || (company && (company.includes(q) || q.includes(company)));
    }) ?? null
  );
}

export async function sendChatMessageAction(text: string) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const };
  const trimmed = text.trim();
  if (!trimmed) return { ok: false as const };

  await createMessage(userId, { agentId: null, who: "me", text: trimmed });

  const [agents, leads, profile, user] = await Promise.all([
    listAgents(userId),
    listLeads(userId, { review: "accepted" }),
    getCreatorProfile(userId),
    getUser(userId),
  ]);
  const creatorContext = profile ? profileSummary(profile) : "";
  const creatorName = user ? creatorDisplayName(user) : "the creator";

  const mentioned = findMentionedAgent(trimmed, agents);
  const parsedIntent = await classifyIntent(trimmed);
  const capability = parsedIntent.intent === "chat" ? null : INTENT_CAPABILITY[parsedIntent.intent];
  // Route to a capable teammate if the mentioned agent can't do this job.
  const actingAgent = capability ? pickAgentForCapability(agents, capability, mentioned?.id) : (mentioned ?? agents[0] ?? null);

  let reply: string;

  if (parsedIntent.intent === "scrape") {
    const result = await runDiscovery(userId, parsedIntent.niche);
    reply =
      result.found > 0
        ? `Found ${result.found} new brand${result.found === 1 ? "" : "s"}: ${result.names.join(", ")}. They're waiting in your Pending area for you to approve.`
        : `I searched but didn't find anything new this time — try again in a bit.`;
  } else if (parsedIntent.intent === "outreach" || parsedIntent.intent === "research" || parsedIntent.intent === "proposal" || parsedIntent.intent === "follow-up") {
    const lead = findLeadByName(leads, parsedIntent.targetBrand);
    if (!lead) {
      reply = parsedIntent.targetBrand
        ? `I couldn't find a brand called "${parsedIntent.targetBrand}" in your pipeline — check the name, or add it first on Brand deals.`
        : `Which brand? Mention its name and I'll get on it.`;
    } else if (!actingAgent) {
      reply = `I don't have a helper that can do that yet.`;
    } else {
      const jobId = await enqueueJob(userId, actingAgent.id, parsedIntent.intent, { leadId: lead.id });
      const claimed = await claimJobById(userId, jobId);
      reply = claimed
        ? (await runOneJob({ userId, job: claimed, agents, creatorContext, creatorName })).summary
        : `I couldn't start that job — try again in a moment.`;
    }
  } else if (parsedIntent.intent === "book-meeting") {
    const lead = findLeadByName(leads, parsedIntent.targetBrand);
    if (!lead) {
      reply = parsedIntent.targetBrand
        ? `I couldn't find a brand called "${parsedIntent.targetBrand}" — check the name, or add it first.`
        : `Which brand, and when? e.g. "book a call with Acme next Tuesday at 2pm".`;
    } else {
      const { whenAt, whenLabel } = await parseMeetingTime(parsedIntent.timeText || trimmed, new Date());
      await createMeeting(userId, { agentId: actingAgent?.id ?? null, leadId: lead.id, title: `Call with ${lead.name}`, kind: "call", whenAt, whenLabel });
      await updateLeadStage(userId, lead.id, "booked");
      await logActivity({ userId, agentId: actingAgent?.id ?? null, leadId: lead.id, type: "meeting_booked", text: `Booked a call with ${lead.name} for ${whenLabel}` });
      reply = `Booked — a call with ${lead.name} for ${whenLabel}. Check your Calendar.`;
    }
  } else {
    reply = await chatReply(trimmed, actingAgent, creatorName);
  }

  await createMessage(userId, { agentId: actingAgent?.id ?? null, who: "ai", text: reply });
  revalidatePath("/chat");
  return { ok: true as const };
}

async function chatReply(text: string, agent: AgentRecord | null, creatorName: string): Promise<string> {
  const fallback = `I'm not totally sure what you need there — try asking me to find brands, write a proposal, follow up, research a brand, or book a call.`;
  if (!isGeminiConfigured()) return fallback;
  try {
    const system = [
      `You are ${agent?.name ?? "a teammate"}, a member of ${creatorName}'s AI sales team, replying in a group chat.`,
      `Reply in 1-2 short, friendly sentences. If the message isn't something you can actually do, say so plainly and suggest what you can help with: finding brands, researching a brand, drafting a proposal, following up, or booking a call.`,
      `Never claim to have done something you haven't.`,
    ].join("\n\n");
    const r = await geminiGenerate(system, [{ role: "user", text }], { maxTokens: 150, temperature: 0.6 });
    return r.trim() || fallback;
  } catch {
    return fallback;
  }
}
