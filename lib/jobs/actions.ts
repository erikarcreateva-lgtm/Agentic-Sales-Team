"use server";
import { auth } from "@clerk/nextjs/server";
import { getLead } from "@/lib/leads/store";
import { listAgents } from "@/lib/agents/store";
import { pickAgentForCapability } from "@/lib/agents/pick";
import { enqueueJob } from "./store";

export async function enqueueProposalAction(leadId: string) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const, error: "Not signed in." };
  const lead = await getLead(userId, leadId);
  if (!lead) return { ok: false as const, error: "Brand not found." };
  const agents = await listAgents(userId);
  const agent = pickAgentForCapability(agents, "proposal", lead.agentId);
  if (!agent) return { ok: false as const, error: "No Proposal-capable helper is available." };
  await enqueueJob(userId, agent.id, "proposal", { leadId });
  return { ok: true as const };
}

export async function enqueueResearchAction(leadId: string) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const, error: "Not signed in." };
  const lead = await getLead(userId, leadId);
  if (!lead) return { ok: false as const, error: "Brand not found." };
  const agents = await listAgents(userId);
  const agent = pickAgentForCapability(agents, "research", lead.agentId);
  if (!agent) return { ok: false as const, error: "No Research-capable helper is available." };
  await enqueueJob(userId, agent.id, "research", { leadId });
  return { ok: true as const };
}

export async function enqueueFollowupAction(leadId: string) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const, error: "Not signed in." };
  const lead = await getLead(userId, leadId);
  if (!lead) return { ok: false as const, error: "Brand not found." };
  const agents = await listAgents(userId);
  const agent = pickAgentForCapability(agents, "follow-up", lead.agentId);
  if (!agent) return { ok: false as const, error: "No Follow-up-capable helper is available." };
  await enqueueJob(userId, agent.id, "follow-up", { leadId });
  return { ok: true as const };
}
