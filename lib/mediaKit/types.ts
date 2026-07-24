export interface PlatformEntry {
  platform: string;
  handle: string;
  followers: number | null;
  engagementRate: number | null;
}

export interface Audience {
  age: string;
  geo: string;
  gender: string;
}

export interface CreatorProfile {
  userId: string;
  niche: string;
  bio: string;
  platforms: PlatformEntry[];
  audience: Audience;
  tone: string;
  pastDeals: string;
  rateFloor: number | null;
  updatedAt: string;
}

export type CreatorProfileInput = Omit<CreatorProfile, "userId" | "updatedAt">;

export const EMPTY_PROFILE_INPUT: CreatorProfileInput = {
  niche: "",
  bio: "",
  platforms: [],
  audience: { age: "", geo: "", gender: "" },
  tone: "",
  pastDeals: "",
  rateFloor: null,
};

export const PLATFORM_OPTIONS = ["TikTok", "Instagram", "YouTube", "X / Twitter", "Twitch", "Other"];
