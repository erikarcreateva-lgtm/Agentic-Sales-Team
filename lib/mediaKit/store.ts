import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { creatorProfile } from "@/lib/db/schema";
import { EMPTY_PROFILE_INPUT, type Audience, type CreatorProfile, type CreatorProfileInput, type PlatformEntry } from "./types";

export async function getCreatorProfile(userId: string): Promise<CreatorProfile | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db.select().from(creatorProfile).where(eq(creatorProfile.userId, userId));
  if (!row) return null;
  return {
    userId: row.userId,
    niche: row.niche,
    bio: row.bio,
    platforms: (row.platforms as PlatformEntry[]) ?? [],
    audience: (row.audience as Audience) ?? EMPTY_PROFILE_INPUT.audience,
    tone: row.tone,
    pastDeals: row.pastDeals,
    rateFloor: row.rateFloor,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function upsertCreatorProfile(userId: string, input: CreatorProfileInput) {
  const db = getDb();
  if (!db) return;
  await db
    .insert(creatorProfile)
    .values({ userId, ...input, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: creatorProfile.userId,
      set: { ...input, updatedAt: new Date() },
    });
}
