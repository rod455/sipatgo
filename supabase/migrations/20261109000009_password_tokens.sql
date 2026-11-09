-- Links de uso único (1 h) para o RH criar ou redefinir a senha por e-mail.
create table if not exists sipatgo.password_tokens (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references sipatgo.participants(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists password_tokens_participant_idx on sipatgo.password_tokens (participant_id, created_at desc);
alter table sipatgo.password_tokens enable row level security;
revoke all on sipatgo.password_tokens from anon, authenticated;
-- Envio de e-mail (n8n -> Gmail), configurado por ambiente:
-- insert into sipatgo.app_settings (key, value) values
--   ('mail_webhook_url', 'https://.../webhook/...'), ('mail_webhook_key', '<segredo>')
--   on conflict (key) do update set value = excluded.value;
