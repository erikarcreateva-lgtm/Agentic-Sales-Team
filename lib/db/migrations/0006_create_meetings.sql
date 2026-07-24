create table if not exists meetings (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id),
  agent_id text,
  lead_id uuid references leads(id) on delete cascade,
  title text not null default '',
  kind text not null default 'call',
  when_at timestamptz not null,
  when_label text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists meetings_user_when_idx on meetings (user_id, when_at);
