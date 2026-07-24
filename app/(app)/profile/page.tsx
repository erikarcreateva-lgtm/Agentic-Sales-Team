import { auth } from "@clerk/nextjs/server";
import { getCreatorProfile } from "@/lib/mediaKit/store";
import { EMPTY_PROFILE_INPUT } from "@/lib/mediaKit/types";
import MediaKitForm from "@/components/MediaKitForm";

export default async function ProfilePage() {
  const { userId } = await auth();
  const profile = userId ? await getCreatorProfile(userId) : null;

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Your Media Kit</h1>
      <p style={{ fontSize: 15, color: "var(--color-fog)", marginBottom: 28 }}>
        Every agent grounds its work in this — keep it current so pitches stay sharp.
      </p>
      <MediaKitForm initial={profile ?? EMPTY_PROFILE_INPUT} />
    </div>
  );
}
