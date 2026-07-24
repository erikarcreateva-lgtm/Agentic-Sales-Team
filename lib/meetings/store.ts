import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { meetings } from "@/lib/db/schema";
import type { Meeting, MeetingKind } from "./types";

function toMeeting(row: typeof meetings.$inferSelect): Meeting {
  return {
    id: row.id,
    agentId: row.agentId,
    leadId: row.leadId,
    title: row.title,
    kind: row.kind as MeetingKind,
    whenAt: row.whenAt.toISOString(),
    whenLabel: row.whenLabel,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listMeetings(userId: string): Promise<Meeting[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db.select().from(meetings).where(eq(meetings.userId, userId)).orderBy(asc(meetings.whenAt));
  return rows.map(toMeeting);
}

export async function createMeeting(
  userId: string,
  input: { agentId: string | null; leadId: string | null; title: string; kind: MeetingKind; whenAt: string; whenLabel: string }
): Promise<string> {
  const db = getDb();
  if (!db) return "";
  const [row] = await db
    .insert(meetings)
    .values({ userId, agentId: input.agentId, leadId: input.leadId, title: input.title, kind: input.kind, whenAt: new Date(input.whenAt), whenLabel: input.whenLabel })
    .returning({ id: meetings.id });
  return row.id;
}
