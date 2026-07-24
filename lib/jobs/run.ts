import "server-only";
import { completeJob, failJob } from "@/lib/jobs/store";
import { getLead, updateLeadAfterOutreach, updateLeadResearch } from "@/lib/leads/store";
import { draftOutreach } from "@/lib/ai/outreach";
import { draftProposal } from "@/lib/ai/proposal";
import { draftFollowup } from "@/lib/ai/followup";
import { draftResearch } from "@/lib/ai/research";
import { createProposal } from "@/lib/proposals/store";
import { createDraft, getLastPitchForLead } from "@/lib/outreach/store";
import { logActivity } from "@/lib/activity/store";
import type { JobRecord } from "./types";
import type { AgentRecord } from "@/lib/agents/types";

export interface RunJobResult {
  ok: boolean;
  summary: string;
  data?: Record<string, unknown>;
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n).trim() + "…" : s;
}

// The single per-job dispatch, shared by the polling runner route and by
// team chat (which runs a job immediately, in-process, for a fast reply).
export async function runOneJob(params: {
  userId: string;
  job: JobRecord;
  agents: AgentRecord[];
  creatorContext: string;
  creatorName: string;
}): Promise<RunJobResult> {
  const { userId, job, agents, creatorContext, creatorName } = params;

  try {
    const leadId = job.params.leadId as string | undefined;
    if (!leadId) throw new Error("Missing brand");
    const lead = await getLead(userId, leadId);
    if (!lead) throw new Error("Brand not found");
    const agent = agents.find((a) => a.id === job.agentId) ?? agents[0];
    if (!agent) throw new Error("No helper available");

    if (job.kind === "outreach") {
      const result = await draftOutreach(agent, lead, creatorContext, creatorName);
      const draftId = await createDraft(userId, { agentId: agent.id, leadId, kind: "pitch", subject: result.subject, body: result.body, rationale: result.rationale });
      await updateLeadAfterOutreach(userId, leadId, result.stage, result.score);
      await logActivity({ userId, agentId: agent.id, leadId, type: "email_drafted", text: `Drafted a pitch for ${lead.name}` });
      await completeJob(job.id, { draftId });
      return { ok: true, summary: `I drafted a pitch for ${lead.name}: "${result.subject}" — ${truncate(result.body, 160)}`, data: { draftId } };
    }

    if (job.kind === "proposal") {
      const result = await draftProposal(agent, lead, creatorContext);
      const proposalId = await createProposal(userId, { agentId: agent.id, leadId, title: result.title, body: result.body, packages: result.packages });
      await logActivity({ userId, agentId: agent.id, leadId, type: "proposal_drafted", text: `Drafted a proposal for ${lead.name}` });
      await completeJob(job.id, { proposalId });
      return { ok: true, summary: `I drafted a proposal for ${lead.name}: "${result.title}". ${truncate(result.body, 160)} You can read the whole thing on their page.`, data: { proposalId } };
    }

    if (job.kind === "follow-up") {
      const priorPitch = await getLastPitchForLead(userId, leadId);
      const result = await draftFollowup(agent, lead, creatorContext, creatorName, priorPitch ? { subject: priorPitch.subject, body: priorPitch.body } : null);
      const draftId = await createDraft(userId, { agentId: agent.id, leadId, kind: "follow-up", subject: result.subject, body: result.body, rationale: result.rationale });
      await logActivity({ userId, agentId: agent.id, leadId, type: "followup_drafted", text: `Followed up with ${lead.name}` });
      await completeJob(job.id, { draftId });
      return { ok: true, summary: `I followed up with ${lead.name}: "${result.subject}" — ${truncate(result.body, 160)}`, data: { draftId } };
    }

    if (job.kind === "research") {
      const result = await draftResearch(agent, lead, creatorContext);
      await updateLeadResearch(userId, leadId, result);
      await logActivity({ userId, agentId: agent.id, leadId, type: "brand_researched", text: `Wrote a brief on ${lead.name}` });
      await completeJob(job.id, { research: result });
      return { ok: true, summary: `Here's the brief on ${lead.name}: ${result.summary} Best angle: ${result.angle}`, data: { research: result } };
    }

    throw new Error(`Unhandled job kind: ${job.kind}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await failJob(job.id, message);
    return { ok: false, summary: `I ran into a problem: ${message}` };
  }
}
