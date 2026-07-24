import "server-only";
import { and, asc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import type { JobKind, JobRecord } from "./types";

function toJob(row: typeof jobs.$inferSelect): JobRecord {
  return {
    id: row.id,
    userId: row.userId,
    agentId: row.agentId,
    kind: row.kind as JobKind,
    status: row.status as JobRecord["status"],
    params: row.params as Record<string, unknown>,
  };
}

export async function enqueueJob(userId: string, agentId: string | null, kind: JobKind, params: Record<string, unknown>): Promise<string> {
  const db = getDb();
  if (!db) return "";
  const [row] = await db.insert(jobs).values({ userId, agentId, kind, params }).returning({ id: jobs.id });
  return row.id;
}

// Claims up to `limit` queued jobs of the given kinds. Each claim re-checks
// status='queued' in its own WHERE clause, so a job already grabbed elsewhere
// is safely skipped rather than double-processed.
export async function claimJobs(userId: string, kinds: JobKind[], limit = 5): Promise<JobRecord[]> {
  const db = getDb();
  if (!db) return [];
  const candidates = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.userId, userId), eq(jobs.status, "queued"), inArray(jobs.kind, kinds)))
    .orderBy(asc(jobs.createdAt))
    .limit(limit);

  const claimed: JobRecord[] = [];
  for (const job of candidates) {
    const updated = await db
      .update(jobs)
      .set({ status: "running", startedAt: new Date() })
      .where(and(eq(jobs.id, job.id), eq(jobs.status, "queued")))
      .returning();
    if (updated[0]) claimed.push(toJob(updated[0]));
  }
  return claimed;
}

// Claims one specific job by id (used by chat, which just created it and
// wants to run it immediately). Still guards on status='queued' so it can
// never double-process a job another runner already picked up.
export async function claimJobById(userId: string, id: string): Promise<JobRecord | null> {
  const db = getDb();
  if (!db) return null;
  const updated = await db
    .update(jobs)
    .set({ status: "running", startedAt: new Date() })
    .where(and(eq(jobs.id, id), eq(jobs.userId, userId), eq(jobs.status, "queued")))
    .returning();
  return updated[0] ? toJob(updated[0]) : null;
}

export async function completeJob(id: string, result: Record<string, unknown>) {
  const db = getDb();
  if (!db) return;
  await db.update(jobs).set({ status: "done", result, finishedAt: new Date() }).where(eq(jobs.id, id));
}

export async function failJob(id: string, error: string) {
  const db = getDb();
  if (!db) return;
  await db.update(jobs).set({ status: "failed", error, finishedAt: new Date() }).where(eq(jobs.id, id));
}

export async function countQueued(userId: string, kinds: JobKind[]): Promise<number> {
  const db = getDb();
  if (!db) return 0;
  const rows = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(and(eq(jobs.userId, userId), eq(jobs.status, "queued"), inArray(jobs.kind, kinds)));
  return rows.length;
}
