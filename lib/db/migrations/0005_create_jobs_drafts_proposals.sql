create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id),
  agent_id text,
  kind text not null,
  status text not null default 'queued',
  params jsonb not null default '{}'::jsonb,
  result jsonb,
  error text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create index if not exists jobs_user_status_idx on jobs (user_id, status);

create table if not exists outreach_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id),
  agent_id text,
  lead_id uuid not null references leads(id) on delete cascade,
  kind text not null default 'pitch',
  subject text not null default '',
  body text not null default '',
  rationale text not null default '',
  status text not null default 'draft',
  dismissed boolean not null default false,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists outreach_drafts_user_lead_idx on outreach_drafts (user_id, lead_id);

create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id),
  agent_id text,
  lead_id uuid not null references leads(id) on delete cascade,
  title text not null default '',
  body text not null default '',
  products jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists proposals_user_lead_idx on proposals (user_id, lead_id);
