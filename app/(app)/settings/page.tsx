import { auth } from "@clerk/nextjs/server";
import { getNotificationPrefs } from "@/lib/db/users";
import NotificationToggles from "@/components/NotificationToggles";

export default async function SettingsPage() {
  const { userId } = await auth();
  const prefs = userId ? await getNotificationPrefs(userId) : undefined;

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Settings</h1>
      <p style={{ fontSize: 15, color: "var(--color-fog)", marginBottom: 28 }}>Choose what your team lets you know about.</p>
      {prefs ? (
        <NotificationToggles initial={prefs} />
      ) : (
        <p style={{ fontSize: 14, color: "var(--color-stone)" }}>Sign in to manage your notifications.</p>
      )}
    </div>
  );
}
