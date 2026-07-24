import { bigserial, boolean, index, integer, jsonb, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

// The account. id is the Clerk user id (text), not a UUID — Clerk owns auth,
// so there is no passwordHash here.
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name"),
  workspaceName: text("workspace_name").notNull().default("My Workspace"),
  notifications: jsonb("notifications").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// The Media Kit — one row per user. Read by every AI engine as "creatorContext".
export const creatorProfile = pgTable("creator_profile", {
  userId: text("user_id").primaryKey().references(() => users.id),
  niche: text("niche").notNull().default(""),
  bio: text("bio").notNull().default(""),
  platforms: jsonb("platforms").notNull().default([]),
  audience: jsonb("audience").notNull().default({}),
  tone: text("tone").notNull().default(""),
  pastDeals: text("past_deals").notNull().default(""),
  rateFloor: integer("rate_floor"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Agents the user created themselves. The five presets are static data in
// lib/agentTypes.ts and never get a row here.
export const agents = pgTable(
  "agents",
  {
    userId: text("user_id").notNull().references(() => users.id),
    id: text("id").notNull(),
    name: text("name").notNull(),
    initials: text("initials").notNull(),
    role: text("role").notNull(),
    color: text("color").notNull(),
    status: text("status").notNull().default("waiting"),
    task: text("task").notNull().default(""),
    score: integer("score"),
    goal: text("goal").notNull().default(""),
    char: text("char"),
    type: text("type").notNull().default("custom"),
    capabilities: jsonb("capabilities").notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.id] })]
);

// Per-user edits layered on top of a preset agent (name/role/color/goal live
// in `settings`; role/goal also get their own columns so engines can read
// them directly without unpacking JSON).
export const agentConfig = pgTable(
  "agent_config",
  {
    userId: text("user_id").notNull().references(() => users.id),
    agentId: text("agent_id").notNull(),
    role: text("role"),
    goal: text("goal"),
    permissions: jsonb("permissions").notNull().default({}),
    settings: jsonb("settings").notNull().default({}),
  },
  (t) => [primaryKey({ columns: [t.userId, t.agentId] })]
);

// removed = soft-deleted, paused = temporarily off. Works for presets and
// custom agents alike.
export const agentStates = pgTable(
  "agent_states",
  {
    userId: text("user_id").notNull().references(() => users.id),
    agentId: text("agent_id").notNull(),
    removed: boolean("removed").notNull().default(false),
    paused: boolean("paused").notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.userId, t.agentId] })]
);

// Teams (pods) the user created. The one "Deal Team" template is static data
// in lib/agentTypes.ts and never gets a row here.
export const teams = pgTable(
  "teams",
  {
    userId: text("user_id").notNull().references(() => users.id),
    id: text("id").notNull(),
    name: text("name").notNull(),
    icon: text("icon"),
    iconBg: text("icon_bg"),
    description: text("description").notNull().default(""),
    goal: text("goal").notNull().default(""),
    members: jsonb("members").notNull().default([]),
    activity: jsonb("activity").notNull().default([]),
    meetings: integer("meetings").notNull().default(0),
    pipeline: integer("pipeline").notNull().default(0),
    leads: integer("leads").notNull().default(0),
    template: text("template"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.id] })]
);

// A replacement member list for any team (template or custom), so the
// creator can tweak membership without duplicating the team.
export const teamMembers = pgTable(
  "team_members",
  {
    userId: text("user_id").notNull().references(() => users.id),
    teamId: text("team_id").notNull(),
    members: jsonb("members").notNull().default([]),
  },
  (t) => [primaryKey({ columns: [t.userId, t.teamId] })]
);

// The brands/deals pipeline. review gates brands discovered from the web —
// they wait as "pending" until the creator accepts them.
export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id),
    agentId: text("agent_id"),
    name: text("name").notNull(),
    title: text("title"),
    company: text("company"),
    email: text("email"),
    status: text("status").notNull().default("new"),
    score: integer("score"),
    source: text("source").notNull().default("manual"),
    review: text("review").notNull().default("accepted"),
    profileUrl: text("profile_url"),
    platform: text("platform"),
    research: jsonb("research"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("leads_user_agent_idx").on(t.userId, t.agentId), index("leads_user_review_idx").on(t.userId, t.review)]
);

// The event log. Feeds notifications, the dashboard, and analytics.
export const activity = pgTable(
  "activity",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id),
    agentId: text("agent_id"),
    type: text("type").notNull(),
    leadId: uuid("lead_id").references(() => leads.id),
    text: text("text").notNull(),
    dismissed: boolean("dismissed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("activity_user_created_idx").on(t.userId, t.createdAt)]
);

// The work queue. The runner claims queued rows atomically (update WHERE
// status='queued', only proceed if a row was affected) and runs the matching engine.
export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id),
    agentId: text("agent_id"),
    kind: text("kind").notNull(),
    status: text("status").notNull().default("queued"),
    params: jsonb("params").notNull().default({}),
    result: jsonb("result"),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
  },
  (t) => [index("jobs_user_status_idx").on(t.userId, t.status)]
);

// Agent-written outbound messages — first pitches and follow-up nudges alike
// (kind distinguishes them). Each is a draft the creator opens in their own
// mail app; there's no send-integration.
export const outreachDrafts = pgTable(
  "outreach_drafts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id),
    agentId: text("agent_id"),
    leadId: uuid("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
    kind: text("kind").notNull().default("pitch"),
    subject: text("subject").notNull().default(""),
    body: text("body").notNull().default(""),
    rationale: text("rationale").notNull().default(""),
    status: text("status").notNull().default("draft"),
    dismissed: boolean("dismissed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
  },
  (t) => [index("outreach_drafts_user_lead_idx").on(t.userId, t.leadId)]
);

// Agent-written priced proposals for a lead. `products` holds the deliverable
// package names, surfaced in the app as `packages`.
export const proposals = pgTable(
  "proposals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id),
    agentId: text("agent_id"),
    leadId: uuid("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
    title: text("title").notNull().default(""),
    body: text("body").notNull().default(""),
    products: jsonb("products").notNull().default([]),
    status: text("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
  },
  (t) => [index("proposals_user_lead_idx").on(t.userId, t.leadId)]
);

// Booked calls — the calendar's only source of truth.
export const meetings = pgTable(
  "meetings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id),
    agentId: text("agent_id"),
    leadId: uuid("lead_id").references(() => leads.id, { onDelete: "cascade" }),
    title: text("title").notNull().default(""),
    kind: text("kind").notNull().default("call"),
    whenAt: timestamp("when_at", { withTimezone: true }).notNull(),
    whenLabel: text("when_label").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("meetings_user_when_idx").on(t.userId, t.whenAt)]
);

// The team group chat. Every message — the creator's and each agent's — sits
// in one shared thread per user, ordered by id.
export const messages = pgTable(
  "messages",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: text("user_id").notNull().references(() => users.id),
    agentId: text("agent_id"),
    who: text("who").notNull(),
    text: text("text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("messages_user_id_idx").on(t.userId, t.id)]
);

// Connected socials (TikTok). Tokens are encrypted at rest before storage —
// never stored or sent to the browser in plain text.
export const socialAccounts = pgTable(
  "social_accounts",
  {
    userId: text("user_id").notNull().references(() => users.id),
    provider: text("provider").notNull(),
    openId: text("open_id"),
    username: text("username"),
    displayName: text("display_name"),
    avatarUrl: text("avatar_url"),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    refreshExpiresAt: timestamp("refresh_expires_at", { withTimezone: true }),
    scope: text("scope"),
    snapshot: jsonb("snapshot").notNull().default({}),
    needsReconnect: boolean("needs_reconnect").notNull().default(false),
    connectedAt: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.provider] })]
);
