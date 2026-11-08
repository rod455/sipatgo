-- Leads do formulário de contato do site: ficam salvos aqui e são enviados
-- por e-mail via webhook do n8n (sipatgo.app_settings.leads_webhook_url).
create table if not exists sipatgo.leads (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  empresa text not null,
  cargo text,
  pessoas int not null,
  mes text,
  mensagem text,
  origem text not null default 'site',
  user_agent text,
  referer text,
  notified boolean not null default false,
  notify_error text,
  created_at timestamptz not null default now()
);
create index if not exists leads_created_idx on sipatgo.leads (created_at desc);
alter table sipatgo.leads enable row level security;
revoke all on sipatgo.leads from anon, authenticated;
-- A URL do webhook é configurada por ambiente:
-- insert into sipatgo.app_settings (key, value) values ('leads_webhook_url', 'https://.../webhook/...')
--   on conflict (key) do update set value = excluded.value;
