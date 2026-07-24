import "server-only";
import { and, desc, eq, gte, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { activity, jobs } from "@/lib/db/schema";
import type { ActivityItem, DashboardStats } from "./types";

function startOfMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Which agents have a job actively running right now — drives the dashboard's
// "Working now" pill and the pulsing green dots.
export async function getWorkingAgentIds(userId: string): Promise<Set<string>> {
  const db = getDb();
  if (!db) return new Set();
  const rows = await db.select({ agentId: jobs.agentId }).from(jobs).where(and(eq(jobs.userId, userId), eq(jobs.status, "running")));
  return new Set(rows.map((r) => r.agentId).filter((x): x is string => Boolean(x)));
}

// Monthly-scoped stats for the orbit dashboard's center hub + output bars.
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const db = getDb();
  if (!db) return { activeAgents: 0, tasksRunning: 0, leadsWorked: 0, perAgent: [] };

  const [runningRows, queuedRows, monthActivity] = await Promise.all([
    db.select({ agentId: jobs.agentId }).from(jobs).where(and(eq(jobs.userId, userId), eq(jobs.status, "running"))),
    db.select({ id: jobs.id }).from(jobs).where(and(eq(jobs.userId, userId), inArray(jobs.status, ["running", "queued"]))),
    db.select({ agentId: activity.agentId, leadId: activity.leadId }).from(activity).where(and(eq(activity.userId, userId), gte(activity.createdAt, startOfMonth()))),
  ]);

  const leadSet = new Set<string>();
  const perAgentLeads = new Map<string, Set<string>>();
  for (const row of monthActivity) {
    if (!row.leadId) continue;
    leadSet.add(row.leadId);
    if (row.agentId) {
      if (!perAgentLeads.has(row.agentId)) perAgentLeads.set(row.agentId, new Set());
      perAgentLeads.get(row.agentId)!.add(row.leadId);
    }
  }

  return {
    activeAgents: new Set(runningRows.map((r) => r.agentId).filter(Boolean)).size,
    tasksRunning: queuedRows.length,
    leadsWorked: leadSet.size,
    perAgent: [...perAgentLeads.entries()].map(([agentId, set]) => ({ agentId, leadsWorked: set.size })),
  };
}

export async function getRecentActivity(userId: string, limit = 8): Promise<ActivityItem[]> {
  const db = getDb();
  if (!db) return [];
  return db.select({ agentId: activity.agentId, text: activity.text }).from(activity).where(eq(activity.userId, userId)).orderBy(desc(activity.createdAt)).limit(limit);
}

export interface AnalyticsSummary {
  totals: {
    brandsAdded: number;
    pitchesDrafted: number;
    briefsWritten: number;
    proposalsDrafted: number;
    followupsSent: number;
    callsBooked: number;
  };
  perDay: { date: string; count: number }[];
  perAgent: { agentId: string; count: number }[];
}

const TYPE_MAP: Record<string, keyof AnalyticsSummary["totals"]> = {
  lead_added: "brandsAdded",
  email_drafted: "pitchesDrafted",
  brand_researched: "briefsWritten",
  proposal_drafted: "proposalsDrafted",
  followup_drafted: "followupsSent",
  meeting_booked: "callsBooked",
};

// The full picture for the Analytics page — reads the raw, unfiltered log
// (clearing the notifications bell never touches these numbers).
export async function getAnalyticsSummary(userId: string): Promise<AnalyticsSummary> {
  const empty: AnalyticsSummary = {
    totals: { brandsAdded: 0, pitchesDrafted: 0, briefsWritten: 0, proposalsDrafted: 0, followupsSent: 0, callsBooked: 0 },
    perDay: [],
    perAgent: [],
  };
  const db = getDb();
  if (!db) return empty;

  const rows = await db.select({ agentId: activity.agentId, type: activity.type, createdAt: activity.createdAt }).from(activity).where(eq(activity.userId, userId));

  const totals = { ...empty.totals };
  const perAgentCount = new Map<string, number>();
  const perDayCount = new Map<string, number>();

  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - 13);
  windowStart.setHours(0, 0, 0, 0);

  for (const row of rows) {
    const key = TYPE_MAP[row.type];
    if (key) totals[key]++;
    if (row.agentId) perAgentCount.set(row.agentId, (perAgentCount.get(row.agentId) ?? 0) + 1);
    if (row.createdAt >= windowStart) {
      const k = dayKey(row.createdAt);
      perDayCount.set(k, (perDayCount.get(k) ?? 0) + 1);
    }
  }

  const perDay: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    perDay.push({ date: k, count: perDayCount.get(k) ?? 0 });
  }

  return {
    totals,
    perDay,
    perAgent: [...perAgentCount.entries()].map(([agentId, count]) => ({ agentId, count })).sort((a, b) => b.count - a.count),
  };
}
