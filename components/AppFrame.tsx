import type { ReactNode } from "react";
import { currentUser } from "@/lib/auth/currentUser";
import { listUndismissedActivity } from "@/lib/activity/store";
import AppFrameShell from "./AppFrameShell";

export default async function AppFrame({ children }: { children: ReactNode }) {
  const user = await currentUser();
  const notifications = user ? await listUndismissedActivity(user.id) : [];
  return (
    <AppFrameShell name={user?.name ?? ""} email={user?.email ?? ""} notifications={notifications}>
      {children}
    </AppFrameShell>
  );
}
