import { auth } from "@clerk/nextjs/server";
import { getCreatorProfile } from "@/lib/mediaKit/store";
import { EMPTY_PROFILE_INPUT } from "@/lib/mediaKit/types";
import { isTikTokConfigured } from "@/lib/social/tiktok";
import { getSocialAccount } from "@/lib/social/store";
import MediaKitForm from "@/components/MediaKitForm";
import ConnectTikTok from "@/components/ConnectTikTok";

export default async function ProfilePage() {
  const { userId } = await auth();
  const profile = userId ? await getCreatorProfile(userId) : null;
  const tiktokAccount = userId ? await getSocialAccount(userId, "tiktok") : null;

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Your Media Kit</h1>
      <p style={{ fontSize: 15, color: "var(--color-fog)", marginBottom: 28 }}>
        Every agent grounds its work in this — keep it current so pitches stay sharp.
      </p>
      <div style={{ marginBottom: 28, maxWidth: 720 }}>
        <ConnectTikTok configured={isTikTokConfigured()} account={tiktokAccount} />
      </div>
      <MediaKitForm initial={profile ?? EMPTY_PROFILE_INPUT} />
    </div>
  );
}
