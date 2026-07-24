create table if not exists creator_profile (
  user_id text primary key references users(id),
  niche text not null default '',
  bio text not null default '',
  platforms jsonb not null default '[]'::jsonb,
  audience jsonb not null default '{}'::jsonb,
  tone text not null default '',
  past_deals text not null default '',
  rate_floor integer,
  updated_at timestamptz not null default now()
);
