import "server-only";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { agentConfig, agentStates, agents } from "@/lib/db/schema";
import { AGENT_TYPES, type CapabilityId } from "@/lib/agentTypes";
import type { AgentInput, AgentRecord } from "./types";

function makeId(name: string) {
  const slug =
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 24) || "agent";
  return `${slug}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function listAgents(userId: string): Promise<AgentRecord[]> {
  const db = getDb();
  if (!db) {
    return AGENT_TYPES.map((preset) => ({
      id: preset.id,
      name: preset.name,
      initials: preset.initials,
      role: preset.role,
      color: preset.color,
      status: preset.status,
      paused: false,
      task: "",
      goal: "",
      capabilities: preset.capabilities,
      isPreset: true,
    }));
  }

  const [customRows, configRows, stateRows] = await Promise.all([
    db.select().from(agents).where(eq(agents.userId, userId)),
    db.select().from(agentConfig).where(eq(agentConfig.userId, userId)),
    db.select().from(agentStates).where(eq(agentStates.userId, userId)),
  ]);

  const configById = new Map(configRows.map((r) => [r.agentId, r]));
  const stateById = new Map(stateRows.map((r) => [r.agentId, r]));

  const presets: AgentRecord[] = AGENT_TYPES.map((preset) => {
    const config = configById.get(preset.id);
    const settings = (config?.settings as Partial<AgentInput>) ?? {};
    const state = stateById.get(preset.id);
    return {
      id: preset.id,
      name: settings.name ?? preset.name,
      initials: settings.initials ?? preset.initials,
      role: config?.role ?? preset.role,
      color: settings.color ?? preset.color,
      status: state?.paused ? "offline" : preset.status,
      paused: state?.paused ?? false,
      task: "",
      goal: config?.goal ?? "",
      capabilities: preset.capabilities,
      isPreset: true,
    };
  });

  const customs: AgentRecord[] = customRows.map((row) => {
    const state = stateById.get(row.id);
    return {
      id: row.id,
      name: row.name,
      initials: row.initials,
      role: row.role,
      color: row.color,
      status: state?.paused ? "offline" : (row.status as AgentRecord["status"]),
      paused: state?.paused ?? false,
      task: row.task,
      goal: row.goal,
      capabilities: row.capabilities as CapabilityId[],
      isPreset: false,
    };
  });

  return [...presets, ...customs].filter((a) => !stateById.get(a.id)?.removed);
}

export async function getAgent(userId: string, id: string): Promise<AgentRecord | null> {
  const list = await listAgents(userId);
  return list.find((a) => a.id === id) ?? null;
}

export async function createAgent(userId: string, input: AgentInput): Promise<string> {
  const db = getDb();
  if (!db) return makeId(input.name);
  const id = makeId(input.name);
  await db.insert(agents).values({
    userId,
    id,
    name: input.name,
    initials: input.initials,
    role: input.role,
    color: input.color,
    status: "waiting",
    goal: input.goal,
    type: "custom",
    capabilities: input.capabilities,
  });
  return id;
}

export async function updateAgent(userId: string, id: string, patch: Partial<AgentInput>) {
  const db = getDb();
  if (!db) return;
  const isPreset = AGENT_TYPES.some((a) => a.id === id);

  if (isPreset) {
    const { role, goal, ...settingsPatch } = patch;
    const [existing] = await db.select().from(agentConfig).where(and(eq(agentConfig.userId, userId), eq(agentConfig.agentId, id)));
    const settings = { ...((existing?.settings as Partial<AgentInput>) ?? {}), ...settingsPatch };
    const nextRole = role ?? existing?.role ?? null;
    const nextGoal = goal ?? existing?.goal ?? null;
    await db
      .insert(agentConfig)
      .values({ userId, agentId: id, role: nextRole, goal: nextGoal, settings })
      .onConflictDoUpdate({
        target: [agentConfig.userId, agentConfig.agentId],
        set: { role: nextRole, goal: nextGoal, settings },
      });
    return;
  }

  await db
    .update(agents)
    .set(patch)
    .where(and(eq(agents.userId, userId), eq(agents.id, id)));
}

export async function setAgentPaused(userId: string, id: string, paused: boolean) {
  const db = getDb();
  if (!db) return;
  await db
    .insert(agentStates)
    .values({ userId, agentId: id, paused })
    .onConflictDoUpdate({
      target: [agentStates.userId, agentStates.agentId],
      set: { paused },
    });
}

export async function removeAgent(userId: string, id: string) {
  const db = getDb();
  if (!db) return;
  await db
    .insert(agentStates)
    .values({ userId, agentId: id, removed: true })
    .onConflictDoUpdate({
      target: [agentStates.userId, agentStates.agentId],
      set: { removed: true },
    });
}
