import type { SocialAccount } from "@/lib/social/store";
import { primaryButtonStyle } from "@/components/forms";

export default function ConnectTikTok({ configured, account }: { configured: boolean; account: SocialAccount | null }) {
  if (!configured) return null;

  return (
    <div
      style={{
        border: "1px solid var(--color-linen)",
        borderRadius: "var(--radius-card-sm)",
        padding: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {account?.avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={account.avatarUrl} alt="" width={40} height={40} style={{ borderRadius: "50%", objectFit: "cover" }} />
        )}
        <div>
          <div style={{ fontSize: 15, fontWeight: 800 }}>TikTok</div>
          <div style={{ fontSize: 13, color: "var(--color-fog)" }}>
            {account ? `Connected as ${account.displayName}` : "Auto-fill your stats and profile photo."}
          </div>
        </div>
      </div>
      {account ? (
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1B7A3D" }}>Connected</span>
          <form action="/api/auth/tiktok/refresh" method="POST">
            <button
              type="submit"
              style={{ fontSize: 13, fontWeight: 600, color: "var(--color-fog)", background: "none", border: "none", textDecoration: "underline", cursor: "pointer", padding: 0 }}
            >
              Refresh stats & photo
            </button>
          </form>
        </div>
      ) : (
        <a href="/api/auth/tiktok/start" style={primaryButtonStyle}>
          Connect TikTok
        </a>
      )}
    </div>
  );
}
