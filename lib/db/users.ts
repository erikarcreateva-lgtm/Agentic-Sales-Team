import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "./index";
import { users } from "./schema";
import { DEFAULT_NOTIFICATION_PREFS, type NotificationPrefs } from "@/lib/settings/types";

export async function upsertUser(input: { id: string; email: string; name: string | null }) {
  const db = getDb();
  if (!db) return;
  await db
    .insert(users)
    .values({ id: input.id, email: input.email, name: input.name })
    .onConflictDoUpdate({
      target: users.id,
      set: { email: input.email, name: input.name },
    });
}

export async function getUser(userId: string): Promise<{ id: string; name: string | null; email: string } | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.id, userId));
  return row ?? null;
}

export async function getNotificationPrefs(userId: string): Promise<NotificationPrefs> {
  const db = getDb();
  if (!db) return DEFAULT_NOTIFICATION_PREFS;
  const [row] = await db.select({ notifications: users.notifications }).from(users).where(eq(users.id, userId));
  return { ...DEFAULT_NOTIFICATION_PREFS, ...(row?.notifications as Partial<NotificationPrefs> | undefined) };
}

export async function setNotificationPrefs(userId: string, prefs: NotificationPrefs) {
  const db = getDb();
  if (!db) return;
  await db.update(users).set({ notifications: prefs }).where(eq(users.id, userId));
}
