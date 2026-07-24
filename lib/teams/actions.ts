"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createTeam, updateTeam } from "./store";
import type { TeamInput } from "@/lib/agents/types";

export async function createTeamAction(input: TeamInput) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const };
  const id = await createTeam(userId, input);
  revalidatePath("/agents");
  revalidatePath("/dashboard");
  return { ok: true as const, id };
}

export async function updateTeamAction(id: string, patch: Partial<TeamInput>) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const };
  await updateTeam(userId, id, patch);
  revalidatePath("/agents");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
