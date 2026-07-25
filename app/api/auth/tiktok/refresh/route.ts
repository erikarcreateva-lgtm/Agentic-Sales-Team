import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { refreshTikTokTokens, fetchTikTokUserInfo } from "@/lib/social/tiktok";
import { saveSocialAccount, getSocialAccountRefreshToken } from "@/lib/social/store";
import { getCreatorProfile, upsertCreatorProfile } from "@/lib/mediaKit/store";
import { EMPTY_PROFILE_INPUT } from "@/lib/mediaKit/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId } = await auth();
  const origin = new URL(req.url).origin;
  if (!userId) return NextResponse.redirect(`${origin}/sign-in`);

  try {
    const storedRefreshToken = await getSocialAccountRefreshToken(userId, "tiktok");
    if (!storedRefreshToken) return NextResponse.redirect(`${origin}/profile?tiktok=error`);

    const tokens = await refreshTikTokTokens(storedRefreshToken);
    const info = await fetchTikTokUserInfo(tokens.accessToken);

    await saveSocialAccount(userId, {
      provider: "tiktok",
      openId: tokens.openId,
      displayName: info.displayName,
      avatarUrl: info.avatarUrl,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      refreshExpiresIn: tokens.refreshExpiresIn,
      scope: tokens.scope,
      snapshot: {
        followerCount: info.followerCount,
        followingCount: info.followingCount,
        likesCount: info.likesCount,
        videoCount: info.videoCount,
        bio: info.bio,
      },
    });

    const profile = await getCreatorProfile(userId);
    const base = profile ?? { ...EMPTY_PROFILE_INPUT, userId, updatedAt: "" };
    const otherPlatforms = base.platforms.filter((p) => p.platform !== "TikTok");
    const platforms = [...otherPlatforms, { platform: "TikTok", handle: info.displayName, followers: info.followerCount, engagementRate: null }];

    await upsertCreatorProfile(userId, {
      niche: base.niche,
      bio: base.bio || info.bio,
      platforms,
      audience: base.audience,
      tone: base.tone,
      pastDeals: base.pastDeals,
      rateFloor: base.rateFloor,
    });

    return NextResponse.redirect(`${origin}/profile?tiktok=connected`);
  } catch {
    return NextResponse.redirect(`${origin}/profile?tiktok=error`);
  }
}
