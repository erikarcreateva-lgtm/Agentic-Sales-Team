import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { outreachDrafts } from "@/lib/db/schema";
import type { DraftKind, OutreachDraft } from "./types";

function toDraft(row: typeof outreachDrafts.$inferSelect): OutreachDraft {
  return {
    id: row.id,
    agentId: row.agentId,
    leadId: row.leadId,
    kind: row.kind as DraftKind,
    subject: row.subject,
    body: row.body,
    rationale: row.rationale,
    status: row.status as OutreachDraft["status"],
    dismissed: row.dismissed,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createDraft(
  userId: string,
  input: { agentId: string | null; leadId: string; kind: DraftKind; subject: string; body: string; rationale: string }
): Promise<string> {
  const db = getDb();
  if (!db) return "";
  const [row] = await db.insert(outreachDrafts).values({ userId, ...input }).returning({ id: outreachDrafts.id });
  return row.id;
}

export async function listDraftsForLead(userId: string, leadId: string): Promise<OutreachDraft[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(outreachDrafts)
    .where(and(eq(outreachDrafts.userId, userId), eq(outreachDrafts.leadId, leadId)))
    .orderBy(desc(outreachDrafts.createdAt));
  return rows.map(toDraft);
}

// The most recent pitch for a lead — what a follow-up nudge builds on.
export async function getLastPitchForLead(userId: string, leadId: string): Promise<OutreachDraft | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(outreachDrafts)
    .where(and(eq(outreachDrafts.userId, userId), eq(outreachDrafts.leadId, leadId), eq(outreachDrafts.kind, "pitch")))
    .orderBy(desc(outreachDrafts.createdAt))
    .limit(1);
  return row ? toDraft(row) : null;
}
