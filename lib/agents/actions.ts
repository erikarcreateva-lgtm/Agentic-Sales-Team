"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createAgent, removeAgent, setAgentPaused, updateAgent } from "./store";
import type { AgentInput } from "./types";

export async function createAgentAction(input: AgentInput) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const };
  const id = await createAgent(userId, input);
  revalidatePath("/agents");
  revalidatePath("/dashboard");
  return { ok: true as const, id };
}

export async function updateAgentAction(id: string, patch: Partial<AgentInput>) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const };
  await updateAgent(userId, id, patch);
  revalidatePath("/agents");
  revalidatePath(`/agents/${id}`);
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function pauseAgentAction(id: string, paused: boolean) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const };
  await setAgentPaused(userId, id, paused);
  revalidatePath("/agents");
  revalidatePath(`/agents/${id}`);
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function removeAgentAction(id: string) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const };
  await removeAgent(userId, id);
  revalidatePath("/agents");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
