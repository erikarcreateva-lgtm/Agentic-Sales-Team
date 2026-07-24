import "server-only";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { teamMembers, teams } from "@/lib/db/schema";
import { TEAM_TEMPLATES } from "@/lib/agentTypes";
import type { TeamInput, TeamRecord } from "@/lib/agents/types";

function makeId(name: string) {
  const slug =
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 24) || "team";
  return `${slug}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function listTeams(userId: string): Promise<TeamRecord[]> {
  const db = getDb();
  if (!db) {
    return TEAM_TEMPLATES.map((t) => ({ id: t.id, name: t.name, description: "", goal: "", members: t.members, isPreset: true }));
  }

  const [customRows, memberRows] = await Promise.all([
    db.select().from(teams).where(eq(teams.userId, userId)),
    db.select().from(teamMembers).where(eq(teamMembers.userId, userId)),
  ]);

  const membersById = new Map(memberRows.map((r) => [r.teamId, r.members as string[]]));

  const presets: TeamRecord[] = TEAM_TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name,
    description: "",
    goal: "",
    members: membersById.get(t.id) ?? t.members,
    isPreset: true,
  }));

  const customs: TeamRecord[] = customRows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    goal: row.goal,
    members: membersById.get(row.id) ?? (row.members as string[]),
    isPreset: false,
  }));

  return [...presets, ...customs];
}

export async function getTeam(userId: string, id: string): Promise<TeamRecord | null> {
  const list = await listTeams(userId);
  return list.find((t) => t.id === id) ?? null;
}

export async function createTeam(userId: string, input: TeamInput): Promise<string> {
  const db = getDb();
  if (!db) return makeId(input.name);
  const id = makeId(input.name);
  await db.insert(teams).values({
    userId,
    id,
    name: input.name,
    description: input.description,
    goal: input.goal,
    members: input.members,
    template: null,
  });
  return id;
}

export async function updateTeam(userId: string, id: string, patch: Partial<TeamInput>) {
  const db = getDb();
  if (!db) return;
  const isPreset = TEAM_TEMPLATES.some((t) => t.id === id);

  if (patch.members) {
    await db
      .insert(teamMembers)
      .values({ userId, teamId: id, members: patch.members })
      .onConflictDoUpdate({
        target: [teamMembers.userId, teamMembers.teamId],
        set: { members: patch.members },
      });
  }

  if (!isPreset) {
    const { members: _members, ...rest } = patch;
    if (Object.keys(rest).length > 0) {
      await db
        .update(teams)
        .set(rest)
        .where(and(eq(teams.userId, userId), eq(teams.id, id)));
    }
  }
}
