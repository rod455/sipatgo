-- Registro de cada acesso do colaborador (para auditoria e planilhas).
alter table sipatgo.participants
  add column if not exists last_login_at timestamptz,
  add column if not exists login_count int not null default 0;

create table if not exists sipatgo.login_events (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references sipatgo.participants(id) on delete cascade,
  kind text not null check (kind in ('pin', 'primeiro_acesso')),
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists login_events_participant_idx on sipatgo.login_events (participant_id, created_at desc);
alter table sipatgo.login_events enable row level security;
revoke all on sipatgo.login_events from anon, authenticated;

-- Quem já tinha entrado antes deste registro conta com 1 acesso (o primeiro).
update sipatgo.participants set last_login_at = coalesce(last_login_at, first_login_at),
       login_count = greatest(login_count, case when first_login_at is not null then 1 else 0 end)
 where first_login_at is not null;
