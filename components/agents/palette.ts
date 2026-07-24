export const AGENT_COLORS = ["#0EA5E9", "#5122C1", "#7C3AED", "#8B5CF6", "#F43F7E", "#FA5F2E", "#2FA45C", "#B45309"];

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
  return (initials || "AI").toUpperCase();
}
