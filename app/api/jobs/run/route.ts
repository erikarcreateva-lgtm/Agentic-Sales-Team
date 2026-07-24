import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { claimJobs, completeJob, countQueued, failJob } from "@/lib/jobs/store";
import { listAgents } from "@/lib/agents/store";
import { getLead, updateLeadResearch } from "@/lib/leads/store";
import { getCreatorProfile } from "@/lib/mediaKit/store";
import { profileSummary, creatorDisplayName } from "@/lib/mediaKit/helpers";
import { getUser } from "@/lib/db/users";
import { draftProposal } from "@/lib/ai/proposal";
import { draftFollowup } from "@/lib/ai/followup";
import { draftResearch } from "@/lib/ai/research";
import { createProposal } from "@/lib/proposals/store";
import { createDraft, getLastPitchForLead } from "@/lib/outreach/store";
import { logActivity } from "@/lib/activity/store";
import type { JobRecord } from "@/lib/jobs/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const HANDLED_KINDS = ["proposal", "follow-up", "research"] as const;
const CONCURRENCY = 4;

async function runWithConcurrency<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const item = items[i++];
      await fn(item);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [profile, user, agents] = await Promise.all([getCreatorProfile(userId), getUser(userId), listAgents(userId)]);
  const creatorContext = profile ? profileSummary(profile) : "";
  const creatorName = user ? creatorDisplayName(user) : "the creator";

  const claimed = await claimJobs(userId, [...HANDLED_KINDS], 5);

  await runWithConcurrency(claimed, CONCURRENCY, async (job: JobRecord) => {
    try {
      const leadId = job.params.leadId as string | undefined;
      if (!leadId) throw new Error("Missing leadId");
      const lead = await getLead(userId, leadId);
      if (!lead) throw new Error("Brand not found");
      const agent = agents.find((a) => a.id === job.agentId) ?? agents[0];
      if (!agent) throw new Error("No helper available");

      if (job.kind === "proposal") {
        const result = await draftProposal(agent, lead, creatorContext);
        const proposalId = await createProposal(userId, { agentId: agent.id, leadId, title: result.title, body: result.body, packages: result.packages });
        await logActivity({ userId, agentId: agent.id, leadId, type: "proposal_drafted", text: `Drafted a proposal for ${lead.name}` });
        await completeJob(job.id, { proposalId });
        return;
      }

      if (job.kind === "follow-up") {
        const priorPitch = await getLastPitchForLead(userId, leadId);
        const result = await draftFollowup(agent, lead, creatorContext, creatorName, priorPitch ? { subject: priorPitch.subject, body: priorPitch.body } : null);
        const draftId = await createDraft(userId, { agentId: agent.id, leadId, kind: "follow-up", subject: result.subject, body: result.body, rationale: result.rationale });
        await logActivity({ userId, agentId: agent.id, leadId, type: "followup_drafted", text: `Followed up with ${lead.name}` });
        await completeJob(job.id, { draftId });
        return;
      }

      if (job.kind === "research") {
        const result = await draftResearch(agent, lead, creatorContext);
        await updateLeadResearch(userId, leadId, result);
        await logActivity({ userId, agentId: agent.id, leadId, type: "brand_researched", text: `Wrote a brief on ${lead.name}` });
        await completeJob(job.id, { research: result });
        return;
      }

      throw new Error(`Unhandled job kind: ${job.kind}`);
    } catch (err) {
      await failJob(job.id, err instanceof Error ? err.message : String(err));
    }
  });

  const remaining = await countQueued(userId, [...HANDLED_KINDS]);
  return NextResponse.json({ processed: claimed.length, remaining });
}
