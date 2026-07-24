create table if not exists agents (
  user_id text not null references users(id),
  id text not null,
  name text not null,
  initials text not null,
  role text not null,
  color text not null,
  status text not null default 'waiting',
  task text not null default '',
  score integer,
  goal text not null default '',
  char text,
  type text not null default 'custom',
  capabilities jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists agent_config (
  user_id text not null references users(id),
  agent_id text not null,
  role text,
  goal text,
  permissions jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  primary key (user_id, agent_id)
);

create table if not exists agent_states (
  user_id text not null references users(id),
  agent_id text not null,
  removed boolean not null default false,
  paused boolean not null default false,
  primary key (user_id, agent_id)
);

create table if not exists teams (
  user_id text not null references users(id),
  id text not null,
  name text not null,
  icon text,
  icon_bg text,
  description text not null default '',
  goal text not null default '',
  members jsonb not null default '[]'::jsonb,
  activity jsonb not null default '[]'::jsonb,
  meetings integer not null default 0,
  pipeline integer not null default 0,
  leads integer not null default 0,
  template text,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists team_members (
  user_id text not null references users(id),
  team_id text not null,
  members jsonb not null default '[]'::jsonb,
  primary key (user_id, team_id)
);
