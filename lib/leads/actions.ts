"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { acceptLead, assignLeadAgent, createLead, importLeadsCsv, rejectLead, updateLeadStage } from "./store";
import type { LeadInput, LeadStatus } from "./types";

export async function addLeadAction(input: LeadInput) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const };
  const id = await createLead(userId, input);
  revalidatePath("/deals");
  return { ok: true as const, id };
}

export async function importLeadsCsvAction(csvText: string, agentId?: string) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const, count: 0 };
  const count = await importLeadsCsv(userId, csvText, agentId ?? null);
  revalidatePath("/deals");
  return { ok: true as const, count };
}

export async function updateLeadStageAction(id: string, status: LeadStatus) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const };
  await updateLeadStage(userId, id, status);
  revalidatePath("/deals");
  return { ok: true as const };
}

export async function assignLeadAgentAction(id: string, agentId: string | null) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const };
  await assignLeadAgent(userId, id, agentId);
  revalidatePath("/deals");
  return { ok: true as const };
}

export async function acceptLeadAction(id: string) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const };
  await acceptLead(userId, id);
  revalidatePath("/deals");
  return { ok: true as const };
}

export async function rejectLeadAction(id: string) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const };
  await rejectLead(userId, id);
  revalidatePath("/deals");
  return { ok: true as const };
}
