import type { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isDbConfigured } from "@/lib/db";
import { getCreatorProfile } from "@/lib/mediaKit/store";
import { isMediaKitComplete } from "@/lib/mediaKit/helpers";
import AppFrame from "@/components/AppFrame";

export default async function AppSectionLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();
  if (userId && isDbConfigured()) {
    const profile = await getCreatorProfile(userId);
    if (!isMediaKitComplete(profile)) redirect("/onboarding");
  }
  return <AppFrame>{children}</AppFrame>;
}
