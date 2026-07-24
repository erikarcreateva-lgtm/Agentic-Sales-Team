"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getNotificationPrefs, setNotificationPrefs } from "@/lib/db/users";
import type { NotificationPrefs } from "./types";

export async function updateNotificationPref(key: keyof NotificationPrefs, value: boolean) {
  const { userId } = await auth();
  if (!userId) return;
  const current = await getNotificationPrefs(userId);
  await setNotificationPrefs(userId, { ...current, [key]: value });
  revalidatePath("/settings");
}
