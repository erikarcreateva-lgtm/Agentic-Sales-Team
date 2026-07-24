import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { logActivity } from "@/lib/activity/store";
import { parseLeadsCsv } from "./csv";
import type { Lead, LeadInput, LeadResearch, LeadReview, LeadSource, LeadStatus } from "./types";

function toLead(row: typeof leads.$inferSelect): Lead {
  return {
    id: row.id,
    userId: row.userId,
    agentId: row.agentId,
    name: row.name,
    title: row.title,
    company: row.company,
    email: row.email,
    status: row.status as LeadStatus,
    score: row.score,
    source: row.source as LeadSource,
    review: row.review as LeadReview,
    profileUrl: row.profileUrl,
    platform: row.platform,
    research: row.research as Lead["research"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listLeads(userId: string, opts?: { agentId?: string; review?: LeadReview }): Promise<Lead[]> {
  const db = getDb();
  if (!db) return [];
  const conditions = [eq(leads.userId, userId)];
  if (opts?.agentId) conditions.push(eq(leads.agentId, opts.agentId));
  if (opts?.review) conditions.push(eq(leads.review, opts.review));
  const rows = await db
    .select()
    .from(leads)
    .where(and(...conditions))
    .orderBy(desc(leads.createdAt));
  return rows.map(toLead);
}

export async function getLead(userId: string, id: string): Promise<Lead | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db.select().from(leads).where(and(eq(leads.userId, userId), eq(leads.id, id)));
  return row ? toLead(row) : null;
}

async function insertLead(userId: string, input: LeadInput, source: LeadSource, review: LeadReview): Promise<string> {
  const db = getDb();
  if (!db) return "";
  const [row] = await db
    .insert(leads)
    .values({
      userId,
      agentId: input.agentId ?? null,
      name: input.name,
      title: input.title ?? null,
      company: input.company ?? null,
      email: input.email ?? null,
      platform: input.platform ?? null,
      profileUrl: input.profileUrl ?? null,
      source,
      review,
      status: "new",
    })
    .returning({ id: leads.id });

  await logActivity({
    userId,
    agentId: input.agentId ?? null,
    type: "lead_added",
    leadId: row.id,
    text: `Added ${input.name}${input.company ? ` (${input.company})` : ""}`,
  });

  return row.id;
}

// Brands the Research agent finds on the web wait in Pending until accepted.
export async function createDiscoveredLead(userId: string, input: LeadInput): Promise<string> {
  return insertLead(userId, input, "scrape", "pending");
}

// Manual adds are accepted immediately — there's nothing to review.
export async function createLead(userId: string, input: LeadInput): Promise<string> {
  return insertLead(userId, input, "manual", "accepted");
}

export async function importLeadsCsv(userId: string, csvText: string, agentId?: string | null): Promise<number> {
  const rows = parseLeadsCsv(csvText);
  for (const row of rows) {
    await insertLead(userId, { ...row, agentId: agentId ?? undefined }, "manual", "accepted");
  }
  return rows.length;
}

export async function updateLeadStage(userId: string, id: string, status: LeadStatus) {
  const db = getDb();
  if (!db) return;
  await db
    .update(leads)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(leads.userId, userId), eq(leads.id, id)));
}

export async function updateLeadAfterOutreach(userId: string, id: string, status: LeadStatus, score: number) {
  const db = getDb();
  if (!db) return;
  await db
    .update(leads)
    .set({ status, score, updatedAt: new Date() })
    .where(and(eq(leads.userId, userId), eq(leads.id, id)));
}

export async function assignLeadAgent(userId: string, id: string, agentId: string | null) {
  const db = getDb();
  if (!db) return;
  await db
    .update(leads)
    .set({ agentId, updatedAt: new Date() })
    .where(and(eq(leads.userId, userId), eq(leads.id, id)));
}

export async function acceptLead(userId: string, id: string) {
  const db = getDb();
  if (!db) return;
  await db
    .update(leads)
    .set({ review: "accepted", updatedAt: new Date() })
    .where(and(eq(leads.userId, userId), eq(leads.id, id)));
}

export async function updateLeadResearch(userId: string, id: string, research: LeadResearch) {
  const db = getDb();
  if (!db) return;
  await db
    .update(leads)
    .set({ research, updatedAt: new Date() })
    .where(and(eq(leads.userId, userId), eq(leads.id, id)));
}

// Rejected pending brands never entered the working pipeline, so there's no
// history worth keeping — unlike accepted leads, this is a hard delete.
export async function rejectLead(userId: string, id: string) {
  const db = getDb();
  if (!db) return;
  await db.delete(leads).where(and(eq(leads.userId, userId), eq(leads.id, id)));
}
