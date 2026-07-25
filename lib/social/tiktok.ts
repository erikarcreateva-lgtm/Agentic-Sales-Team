import "server-only";

export function isTikTokConfigured(): boolean {
  return Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET && process.env.TIKTOK_REDIRECT_URI);
}

// state carries the signed-in user id, checked back against auth() on callback.
export function tiktokAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    scope: "user.info.basic,user.info.profile,user.info.stats",
    response_type: "code",
    redirect_uri: process.env.TIKTOK_REDIRECT_URI!,
    state,
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
}

export interface TikTokTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
  openId: string;
  scope: string;
}

export async function refreshTikTokTokens(refreshToken: string): Promise<TikTokTokens> {
  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`TikTok token refresh failed: ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(`TikTok token refresh failed: ${json.error_description ?? json.error}`);
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in,
    refreshExpiresIn: json.refresh_expires_in,
    openId: json.open_id,
    scope: json.scope,
  };
}

export async function exchangeCodeForTokens(code: string): Promise<TikTokTokens> {
  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: process.env.TIKTOK_REDIRECT_URI!,
    }),
  });
  if (!res.ok) throw new Error(`TikTok token exchange failed: ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(`TikTok token exchange failed: ${json.error_description ?? json.error}`);
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in,
    refreshExpiresIn: json.refresh_expires_in,
    openId: json.open_id,
    scope: json.scope,
  };
}

export interface TikTokUserInfo {
  displayName: string;
  avatarUrl: string;
  bio: string;
  followerCount: number;
  followingCount: number;
  likesCount: number;
  videoCount: number;
}

export async function fetchTikTokUserInfo(accessToken: string): Promise<TikTokUserInfo> {
  const fields = "display_name,avatar_url,bio_description,follower_count,following_count,likes_count,video_count";
  const res = await fetch(`https://open.tiktokapis.com/v2/user/info/?fields=${fields}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`TikTok user info failed: ${res.status}`);
  const json = await res.json();
  const u = json.data?.user ?? {};
  return {
    displayName: u.display_name ?? "",
    avatarUrl: u.avatar_url ?? "",
    bio: u.bio_description ?? "",
    followerCount: u.follower_count ?? 0,
    followingCount: u.following_count ?? 0,
    likesCount: u.likes_count ?? 0,
    videoCount: u.video_count ?? 0,
  };
}
