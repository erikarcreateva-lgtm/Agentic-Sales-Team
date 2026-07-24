"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { dismissAllActivity } from "./store";

export async function dismissNotificationsAction() {
  const { userId } = await auth();
  if (!userId) return { ok: false as const };
  await dismissAllActivity(userId);
  revalidatePath("/", "layout");
  return { ok: true as const };
}
