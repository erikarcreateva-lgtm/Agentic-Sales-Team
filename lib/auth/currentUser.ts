import "server-only";
import { auth, currentUser as clerkCurrentUser } from "@clerk/nextjs/server";
import { upsertUser } from "@/lib/db/users";

export async function currentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await clerkCurrentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? "";
  const name = clerkUser?.fullName ?? clerkUser?.firstName ?? null;

  await upsertUser({ id: userId, email, name });

  return { id: userId, email, name };
}
