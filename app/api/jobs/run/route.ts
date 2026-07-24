import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { claimJobs, countQueued } from "@/lib/jobs/store";
import { runOneJob } from "@/lib/jobs/run";
import { listAgents } from "@/lib/agents/store";
import { getCreatorProfile } from "@/lib/mediaKit/store";
import { profileSummary, creatorDisplayName } from "@/lib/mediaKit/helpers";
import { getUser } from "@/lib/db/users";
import type { JobRecord } from "@/lib/jobs/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const HANDLED_KINDS = ["outreach", "proposal", "follow-up", "research"] as const;
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
    await runOneJob({ userId, job, agents, creatorContext, creatorName });
  });

  const remaining = await countQueued(userId, [...HANDLED_KINDS]);
  return NextResponse.json({ processed: claimed.length, remaining });
}
