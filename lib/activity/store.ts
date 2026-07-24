import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { activity } from "@/lib/db/schema";

export async function logActivity(input: { userId: string; agentId?: string | null; type: string; leadId?: string | null; text: string }) {
  const db = getDb();
  if (!db) return;
  await db.insert(activity).values({
    userId: input.userId,
    agentId: input.agentId ?? null,
    type: input.type,
    leadId: input.leadId ?? null,
    text: input.text,
  });
}

export async function listActivity(userId: string, limit = 50) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(activity).where(eq(activity.userId, userId)).orderBy(desc(activity.createdAt)).limit(limit);
}

export interface NotificationItem {
  id: string;
  agentId: string | null;
  text: string;
  createdAt: string;
}

// The notifications bell — only undismissed rows. Dismissing only hides them
// from here; analytics/dashboard always read the raw, unfiltered log.
export async function listUndismissedActivity(userId: string, limit = 15): Promise<NotificationItem[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(activity)
    .where(and(eq(activity.userId, userId), eq(activity.dismissed, false)))
    .orderBy(desc(activity.createdAt))
    .limit(limit);
  return rows.map((r) => ({ id: r.id, agentId: r.agentId, text: r.text, createdAt: r.createdAt.toISOString() }));
}

export async function dismissAllActivity(userId: string) {
  const db = getDb();
  if (!db) return;
  await db.update(activity).set({ dismissed: true }).where(and(eq(activity.userId, userId), eq(activity.dismissed, false)));
}
