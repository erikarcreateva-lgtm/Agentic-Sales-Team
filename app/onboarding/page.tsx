import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isDbConfigured } from "@/lib/db";
import { getCreatorProfile } from "@/lib/mediaKit/store";
import { isMediaKitComplete } from "@/lib/mediaKit/helpers";
import { EMPTY_PROFILE_INPUT } from "@/lib/mediaKit/types";
import OnboardingWizard from "@/components/OnboardingWizard";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = isDbConfigured() ? await getCreatorProfile(userId) : null;
  if (isMediaKitComplete(profile)) redirect("/dashboard");

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-canvas)" }}>
      <OnboardingWizard initial={profile ?? EMPTY_PROFILE_INPUT} />
    </div>
  );
}
