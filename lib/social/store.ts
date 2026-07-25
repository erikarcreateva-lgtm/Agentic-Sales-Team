import "server-only";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { socialAccounts } from "@/lib/db/schema";
import { encryptToken, decryptToken } from "./crypto";

export interface SocialAccount {
  provider: string;
  openId: string;
  displayName: string;
  avatarUrl: string;
  connectedAt: string;
}

export async function getSocialAccount(userId: string, provider: string): Promise<SocialAccount | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db.select().from(socialAccounts).where(and(eq(socialAccounts.userId, userId), eq(socialAccounts.provider, provider)));
  if (!row) return null;
  return {
    provider: row.provider,
    openId: row.openId ?? "",
    displayName: row.displayName ?? "",
    avatarUrl: row.avatarUrl ?? "",
    connectedAt: row.connectedAt.toISOString(),
  };
}

export async function getSocialAccountRefreshToken(userId: string, provider: string): Promise<string | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db.select().from(socialAccounts).where(and(eq(socialAccounts.userId, userId), eq(socialAccounts.provider, provider)));
  if (!row?.refreshToken) return null;
  return decryptToken(row.refreshToken);
}

export async function saveSocialAccount(
  userId: string,
  input: {
    provider: string;
    openId: string;
    displayName: string;
    avatarUrl: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    refreshExpiresIn: number;
    scope: string;
    snapshot: Record<string, unknown>;
  }
) {
  const db = getDb();
  if (!db) return;
  const now = new Date();
  const values = {
    userId,
    provider: input.provider,
    openId: input.openId,
    displayName: input.displayName,
    avatarUrl: input.avatarUrl,
    accessToken: encryptToken(input.accessToken),
    refreshToken: encryptToken(input.refreshToken),
    tokenExpiresAt: new Date(now.getTime() + input.expiresIn * 1000),
    refreshExpiresAt: new Date(now.getTime() + input.refreshExpiresIn * 1000),
    scope: input.scope,
    snapshot: input.snapshot,
    needsReconnect: false,
    connectedAt: now,
  };
  await db
    .insert(socialAccounts)
    .values(values)
    .onConflictDoUpdate({ target: [socialAccounts.userId, socialAccounts.provider], set: values });
}
