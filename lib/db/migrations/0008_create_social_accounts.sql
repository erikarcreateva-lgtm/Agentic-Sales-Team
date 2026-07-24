create table if not exists social_accounts (
  user_id text not null references users(id),
  provider text not null,
  open_id text,
  username text,
  display_name text,
  avatar_url text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  refresh_expires_at timestamptz,
  scope text,
  snapshot jsonb not null default '{}'::jsonb,
  needs_reconnect boolean not null default false,
  connected_at timestamptz not null default now(),
  primary key (user_id, provider)
);
