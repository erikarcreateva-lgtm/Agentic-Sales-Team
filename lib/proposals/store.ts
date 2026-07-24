import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { proposals } from "@/lib/db/schema";
import type { Proposal } from "./types";

function toProposal(row: typeof proposals.$inferSelect): Proposal {
  return {
    id: row.id,
    agentId: row.agentId,
    leadId: row.leadId,
    title: row.title,
    body: row.body,
    packages: row.products as string[],
    status: row.status as Proposal["status"],
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createProposal(
  userId: string,
  input: { agentId: string | null; leadId: string; title: string; body: string; packages: string[] }
): Promise<string> {
  const db = getDb();
  if (!db) return "";
  const [row] = await db
    .insert(proposals)
    .values({ userId, agentId: input.agentId, leadId: input.leadId, title: input.title, body: input.body, products: input.packages })
    .returning({ id: proposals.id });
  return row.id;
}

export async function listProposalsForLead(userId: string, leadId: string): Promise<Proposal[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(proposals)
    .where(and(eq(proposals.userId, userId), eq(proposals.leadId, leadId)))
    .orderBy(desc(proposals.createdAt));
  return rows.map(toProposal);
}
