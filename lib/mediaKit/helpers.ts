import { EMPTY_PROFILE_INPUT, type CreatorProfile, type CreatorProfileInput } from "./types";

// The essentials that gate onboarding: niche, at least one platform, and a rate floor.
export function isMediaKitComplete(profile: CreatorProfile | CreatorProfileInput | null): boolean {
  if (!profile) return false;
  const hasNiche = profile.niche.trim().length > 0;
  const hasPlatform = profile.platforms.some((p) => p.platform.trim() && p.handle.trim());
  const hasRateFloor = typeof profile.rateFloor === "number" && profile.rateFloor > 0;
  return hasNiche && hasPlatform && hasRateFloor;
}

// The text block every AI engine grounds its work on.
export function profileSummary(profile: CreatorProfile | CreatorProfileInput): string {
  const lines: string[] = [];
  if (profile.niche) lines.push(`Niche: ${profile.niche}`);
  if (profile.bio) lines.push(`Bio: ${profile.bio}`);
  if (profile.platforms.length) {
    const platforms = profile.platforms
      .map((p) => {
        const stats = [
          p.followers ? `${p.followers.toLocaleString()} followers` : null,
          p.engagementRate ? `${p.engagementRate}% engagement` : null,
        ]
          .filter(Boolean)
          .join(", ");
        return `${p.platform} @${p.handle}${stats ? ` (${stats})` : ""}`;
      })
      .join("; ");
    lines.push(`Platforms: ${platforms}`);
  }
  const audience = profile.audience ?? EMPTY_PROFILE_INPUT.audience;
  const audienceBits = [audience.age, audience.geo, audience.gender].filter(Boolean).join(", ");
  if (audienceBits) lines.push(`Audience: ${audienceBits}`);
  if (profile.tone) lines.push(`Tone/voice: ${profile.tone}`);
  if (profile.pastDeals) lines.push(`Past brand deals: ${profile.pastDeals}`);
  if (profile.rateFloor) lines.push(`Rate floor: $${profile.rateFloor} per deliverable`);
  return lines.join("\n");
}

// The name pitches/proposals are signed with.
export function creatorDisplayName(user: { name: string | null; email: string }): string {
  if (user.name) return user.name;
  return user.email.split("@")[0] || "the creator";
}
