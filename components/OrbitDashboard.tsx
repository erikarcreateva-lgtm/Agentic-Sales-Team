"use client";
import { useEffect, useRef, useState } from "react";
import { css, Box } from "@/components/primitives";
import { statusMeta } from "@/lib/status";
import { av, hubIcon } from "@/lib/visuals";
import { AGENT_TYPES, type CapabilityId } from "@/lib/agentTypes";
import type { StatusKey } from "@/lib/status";

// The minimal shape the orbit needs — satisfied by both the static AgentType
// presets (logged-out showcase) and real merged AgentRecords (logged-in).
interface OrbitAgent {
  id: string;
  name: string;
  initials: string;
  color: string;
  status: StatusKey;
  capabilities: CapabilityId[];
}

interface OrbitTeamPill {
  id: string;
  label: string;
  members: string[];
}

// [animation, tint] per activity type.
const hubIcons: Record<string, [string, string]> = {
  email: ["iconFly 2.6s ease-in-out infinite", "#2b48d4"],
  call: ["iconRing 1.6s ease-in-out infinite", "#1B7A3D"],
  research: ["iconSwing 2.4s ease-in-out infinite", "#fa5f2e"],
  writing: ["iconPop 2.4s ease-in-out infinite", "#9270d7"],
  meeting: ["iconPop 2.8s ease-in-out infinite", "#e60023"],
  idle: ["breathe 3s ease-in-out infinite", "#8c8c8c"],
};

const typeByCapability: Record<CapabilityId, string> = {
  scrape: "research",
  research: "research",
  outreach: "email",
  "follow-up": "email",
  proposal: "writing",
  "book-meeting": "meeting",
};

function agentActivityType(a: OrbitAgent): string {
  return typeByCapability[a.capabilities[0]] || "writing";
}

// Demo stats + activity — this is a self-contained showcase until real agents/data exist.
const DEMO_STATS = {
  activeAgents: 3,
  tasksRunning: 4,
  leadsWorked: 18,
  perAgent: [
    { agentId: "discovery", leadsWorked: 7 },
    { agentId: "outreach", leadsWorked: 18 },
    { agentId: "proposal", leadsWorked: 5 },
    { agentId: "followup", leadsWorked: 9 },
    { agentId: "scheduler", leadsWorked: 4 },
  ],
};

const DEMO_ACTIVITY: { agentId: string; text: string }[] = [
  { agentId: "scheduler", text: "booked a call with Northwind Apparel" },
  { agentId: "followup", text: "followed up with Bright Sky Beverages" },
  { agentId: "proposal", text: "sent a proposal to Ridgeline Outdoors" },
  { agentId: "outreach", text: "drafted a pitch for Glow Cosmetics" },
  { agentId: "discovery", text: "found 3 new fitness brands to pitch" },
];

export default function OrbitDashboard({ agents: agentsProp, teams: teamsProp }: { agents?: OrbitAgent[]; teams?: OrbitTeamPill[] }) {
  const agents = agentsProp ?? AGENT_TYPES;
  const byId = (id: string) => agents.find((a) => a.id === id);
  const teamPills: OrbitTeamPill[] = [
    { id: "all", label: "Everyone", members: agents.map((a) => a.id) },
    ...(teamsProp ?? [{ id: "deal-team", label: "Deal Team", members: agents.map((a) => a.id) }]),
  ];
  const [hubTeam, setHubTeam] = useState("all");

  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(1100);
  const [reduced, setReduced] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!wrapRef.current) return;
    const el = wrapRef.current;
    const ro = new ResizeObserver((entries) => {
      const cw = entries[0]?.contentRect.width;
      if (cw) setW(cw);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  useEffect(() => {
    const hub = setInterval(() => setTick((t) => t + 1), 3200);
    return () => clearInterval(hub);
  }, []);

  const ws = DEMO_STATS;
  const acts = DEMO_ACTIVITY;
  const paMap = new Map(ws.perAgent.map((p) => [p.agentId, p]));
  const maxOut = Math.max(1, ...ws.perAgent.map((p) => p.leadsWorked));

  const activePill = teamPills.find((p) => p.id === hubTeam) ?? teamPills[0];
  const hubMembers = agents.filter((a) => activePill.members.includes(a.id));
  const HN = Math.max(hubMembers.length, 1);
  const nodes = hubMembers.map((a, i) => {
    const ang = ((-90 + (i * 360) / HN) * Math.PI) / 180;
    const x = Math.round(380 + Math.cos(ang) * 272);
    const y = Math.round(262 + Math.sin(ang) * 186);
    const type = agentActivityType(a);
    const ic = hubIcons[type];
    const m = statusMeta(a.status);
    const latest = acts.find((f) => f.agentId === a.id);
    return { a, i, x, y, m, ic, type, badge: latest ? latest.text.slice(0, 40) : a.status === "working" ? "Working…" : "Idle" };
  });
  const collabs = HN >= 5 ? [[0, 2], [1, 4]] : [];

  const hubWorking = ws.activeAgents;
  const leadsWorked = ws.leadsWorked;
  const tasksRunning = ws.tasksRunning;
  const monthLabel = new Date().toLocaleString("en-US", { month: "long" }).toUpperCase();

  const actLine = (f?: { agentId: string; text: string }) => (f ? (byId(f.agentId)?.name ?? "Agent") + " " + f.text : "");
  const hubLive = actLine(acts[0]).slice(0, 90);
  const hubLive2 = actLine(acts[1]).slice(0, 90);

  const cardHeight = 560;
  const hubScale = Math.max(0.6, Math.min((w - 40) / 760, (cardHeight - 60) / 524, 1.1));

  return (
    <div ref={wrapRef} style={css("position:relative;width:100%")}>
      <div
        style={css(
          "position:relative;background:var(--color-canvas);border:1px solid var(--color-linen);border-radius:var(--radius-card);height:" +
            cardHeight +
            "px;overflow:hidden"
        )}
      >
        <div style={css("position:absolute;top:16px;left:20px;right:170px;display:flex;gap:8px;z-index:3;flex-wrap:wrap")}>
          {teamPills.map((p) => (
            <Box
              key={p.id}
              onClick={() => setHubTeam(p.id)}
              style={
                "font-size:11.5px;font-weight:600;border-radius:var(--radius-pill);padding:5px 13px;cursor:pointer;transition:all .12s;" +
                (hubTeam === p.id
                  ? "background:var(--color-ink);color:#fff;border:1px solid var(--color-ink)"
                  : "background:var(--color-canvas);color:var(--color-fog);border:1px solid var(--color-stone)")
              }
              styleHover="border-color:var(--color-ink)"
            >
              {p.label}
            </Box>
          ))}
        </div>
        {hubWorking > 0 && (
          <div
            style={css(
              "position:absolute;top:16px;right:20px;display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:#1B7A3D;background:#E7F7EC;border:1px solid #bfe6cc;border-radius:var(--radius-pill);padding:4px 12px;z-index:3"
            )}
          >
            <span style={css("width:6px;height:6px;border-radius:50%;background:#2FA45C;animation:pulse 2s infinite")} />
            Working now
          </div>
        )}

        <div
          style={css(
            "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(" + hubScale.toFixed(3) + ");width:760px;height:524px"
          )}
        >
          <div style={css("position:absolute;left:380px;top:262px;width:560px;height:380px;transform:translate(-50%,-50%);border:1px solid var(--color-linen);border-radius:50%")} />
          <div style={css("position:absolute;left:380px;top:262px;width:400px;height:270px;transform:translate(-50%,-50%);border:1px solid var(--color-linen);border-radius:50%")} />

          <svg width="760" height="524" viewBox="0 0 760 524" style={{ position: "absolute", left: 0, top: 0 }}>
            {nodes.map((n) => (
              <line key={"l" + n.i} x1="380" y1="262" x2={n.x} y2={n.y} stroke="#d9d3ea" strokeWidth="1.5" strokeDasharray="3 7" style={{ animation: "dashMove 1.8s linear infinite" }} />
            ))}
            {!reduced &&
              nodes.map((n) => (
                <circle key={"p" + n.i} r="2.6" fill="#9270d7" opacity="0.9">
                  <animateMotion dur={2.4 + (n.i % 4) * 0.6 + "s"} begin={n.i * 0.4 + "s"} repeatCount="indefinite" path={"M" + n.x + " " + n.y + " L380 262"} />
                </circle>
              ))}
            {collabs.map((c, i) => (
              <line key={"c" + i} x1={nodes[c[0]].x} y1={nodes[c[0]].y} x2={nodes[c[1]].x} y2={nodes[c[1]].y} stroke="#fa5f2e" strokeWidth="1.5" strokeDasharray="2 6" style={{ animation: "dashMove 1.2s linear infinite" }} />
            ))}
          </svg>

          {/* center hub */}
          <div style={css("position:absolute;left:380px;top:262px;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:10px;z-index:2")}>
            <div style={css("position:relative;width:124px;height:124px;display:flex;align-items:center;justify-content:center")}>
              <div style={css("position:absolute;left:0;top:0;right:0;bottom:0;border-radius:50%;border:2px solid rgba(146,112,215,.5);animation:ringPulse 3s ease-out infinite")} />
              <div style={css("position:absolute;left:0;top:0;right:0;bottom:0;border-radius:50%;border:2px solid rgba(146,112,215,.5);animation:ringPulse 3s ease-out 1.5s infinite")} />
              <div style={css("width:124px;height:124px;border-radius:50%;border:6px solid var(--color-violet);display:flex;align-items:center;justify-content:center;background:#fff")}>
                <div style={css("width:100px;height:100px;border-radius:50%;background:var(--color-canvas);display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden")}>
                  <div style={css("font-size:26px;font-weight:900;color:var(--color-ink);line-height:1")}>{leadsWorked}</div>
                  <div style={css("font-size:8.5px;font-weight:700;letter-spacing:.1em;color:var(--color-fog);margin-top:4px;text-align:center;line-height:1.4")}>
                    BRANDS WORKED<br />{monthLabel}
                  </div>
                </div>
              </div>
            </div>
            <div style={css("display:flex;gap:8px")}>
              <div style={css("display:inline-flex;align-items:center;gap:5px;font-size:10.5px;font-weight:600;color:var(--color-ink);background:var(--color-canvas);border:1px solid var(--color-linen);border-radius:var(--radius-pill);padding:4px 11px")}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--color-red)" style={{ flex: "none" }} aria-hidden="true">
                  <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
                </svg>
                {hubWorking} working · {tasksRunning} tasks
              </div>
            </div>
          </div>

          {/* agent nodes */}
          {nodes.map((n) => (
            <div
              key={n.a.id}
              aria-label={n.a.name}
              style={css("position:absolute;left:" + n.x + "px;top:" + n.y + "px;transform:translate(-50%,-50%);width:170px;display:flex;flex-direction:column;align-items:center;z-index:2")}
            >
              <div style={css("display:flex;flex-direction:column;align-items:center;gap:6px;animation:floaty " + (5 + (n.i % 3)) + "s ease-in-out " + (n.i * 0.45).toFixed(2) + "s infinite")}>
                <div style={css("position:relative")}>
                  <div style={css("padding:3px;border-radius:50%;background:#fff;border:1px solid var(--color-linen)")}>
                    <div style={css(av(n.a, 46) + ";border:2px solid #fff")}>{n.a.initials}</div>
                  </div>
                  <div style={css("position:absolute;top:-8px;right:-10px;width:22px;height:22px;border-radius:50%;background:#fff;border:1px solid var(--color-linen);display:flex;align-items:center;justify-content:center;animation:" + n.ic[0])}>
                    <span style={css(hubIcon(n.type, n.ic[1]))} />
                  </div>
                </div>
                <div style={css("display:flex;align-items:center;gap:5px;margin-top:2px")}>
                  <span style={css("width:7px;height:7px;border-radius:50%;background:" + n.m.dot + ";flex:none;" + (n.a.status === "working" ? "animation:pulse 2s infinite" : ""))} />
                  <span style={css("font-size:12px;font-weight:700;color:var(--color-ink)")}>{n.a.name}</span>
                </div>
                <div style={css("width:60px;height:3px;border-radius:2px;background:var(--color-linen);overflow:hidden")}>
                  <div style={css("width:" + Math.round(((paMap.get(n.a.id)?.leadsWorked ?? 0) / maxOut) * 100) + "%;height:100%;border-radius:2px;background:" + n.a.color)} />
                </div>
                <div
                  style={css(
                    "display:flex;align-items:center;gap:6px;font-size:10.5px;font-weight:600;color:var(--color-ink);background:var(--color-canvas);border:1px solid var(--color-linen);border-radius:var(--radius-pill);padding:4px 10px;white-space:nowrap;max-width:168px;overflow:hidden;text-overflow:ellipsis;animation:" +
                      (tick % 2 ? "badgePopA" : "badgePopB") +
                      " .4s ease"
                  )}
                >
                  <span>{n.badge}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* floating particles */}
        <div style={css("position:absolute;left:18%;bottom:30%;width:5px;height:5px;border-radius:50%;background:rgba(146,112,215,.5);animation:rise 7s ease-in-out infinite")} />
        <div style={css("position:absolute;left:72%;bottom:24%;width:4px;height:4px;border-radius:50%;background:rgba(250,95,46,.45);animation:rise 9s ease-in-out 2s infinite")} />
        <div style={css("position:absolute;left:48%;bottom:18%;width:3px;height:3px;border-radius:50%;background:rgba(230,0,35,.4);animation:rise 8s ease-in-out 4s infinite")} />
        <div style={css("position:absolute;left:85%;bottom:55%;width:4px;height:4px;border-radius:50%;background:rgba(146,112,215,.4);animation:rise 10s ease-in-out 1s infinite")} />

        {/* live activity strip */}
        <div style={css("position:absolute;bottom:16px;left:20px;display:flex;flex-direction:column;align-items:flex-start;gap:6px;z-index:3;max-width:70%")}>
          <div style={css("display:flex;align-items:center;gap:7px;font-size:11px;font-weight:600;color:var(--color-fog);background:var(--color-canvas);border:1px solid var(--color-linen);border-radius:var(--radius-pill);padding:5px 13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%")}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--color-violet)" style={{ flex: "none" }} aria-hidden="true">
              <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3Z" />
            </svg>
            {hubLive2}
          </div>
          <div style={css("display:flex;align-items:center;gap:7px;font-size:11px;font-weight:600;color:var(--color-ink);background:var(--color-canvas);border:1px solid var(--color-linen);border-radius:var(--radius-pill);padding:5px 13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%")}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--color-red)" style={{ flex: "none" }} aria-hidden="true">
              <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3Z" />
            </svg>
            {hubLive}
          </div>
        </div>
      </div>
    </div>
  );
}
