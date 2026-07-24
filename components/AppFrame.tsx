import type { ReactNode } from "react";
import { currentUser } from "@/lib/auth/currentUser";
import AppFrameShell from "./AppFrameShell";

export default async function AppFrame({ children }: { children: ReactNode }) {
  const user = await currentUser();
  return (
    <AppFrameShell name={user?.name ?? ""} email={user?.email ?? ""}>
      {children}
    </AppFrameShell>
  );
}
