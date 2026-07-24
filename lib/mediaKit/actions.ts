"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { currentUser } from "@/lib/auth/currentUser";
import { upsertCreatorProfile } from "./store";
import type { CreatorProfileInput } from "./types";

export async function saveMediaKit(input: CreatorProfileInput) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const };
  await currentUser(); // ensures the users row exists (creator_profile references it)
  await upsertCreatorProfile(userId, input);
  revalidatePath("/profile");
  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
