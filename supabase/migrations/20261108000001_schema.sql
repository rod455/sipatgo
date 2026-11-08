-- =====================================================================
-- SipatGo — schema completo
-- Tudo vive no schema `sipatgo` para ficar 100% isolado de qualquer outro
-- produto que compartilhe o mesmo projeto/banco (ex.: Mentorque).
-- O app acessa o banco apenas pelo servidor (DATABASE_URL); nenhuma tabela
-- é exposta para os papéis anon/authenticated do Supabase.
-- =====================================================================

create schema if not exists sipatgo;


set search_path = sipatgo, public;

-- ---------------------------------------------------------------------
-- Multiempresa
-- ---------------------------------------------------------------------
create table sipatgo.companies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,40}$'),
  name text not null,
  logo_url text,
  primary_color text not null default '#0F766E',
  secondary_color text not null default '#134E4A',
  accent_color text not null default '#F59E0B',
  timezone text not null default 'America/Sao_Paulo',
  consent_text text not null default 'Autorizo o tratamento dos meus dados pessoais (nome, CPF, data de nascimento, setor e desempenho na campanha) exclusivamente para a realização da SIPAT, conforme a LGPD (Lei 13.709/2018).',
  consent_version text not null default 'v1',
  notifications_webhook_url text,
  created_at timestamptz not null default now()
);

create table sipatgo.campaigns (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references sipatgo.companies(id) on delete cascade,
  name text not null,
  theme text not null default '',
  start_date date not null,
  end_date date not null,
  release_time time not null default '08:00',
  makeup_deadline timestamptz,                -- null = sexta (end_date) 18:00 no fuso da company
  makeup_factor numeric not null default 0.5 check (makeup_factor between 0 and 1),
  min_days_for_certificate int not null default 3 check (min_days_for_certificate between 1 and 5),
  opening_message text,
  opening_video_url text,
  wall_challenge text,
  wall_voting_deadline timestamptz,           -- null = quinta (dia 4) 23:59
  status text not null default 'draft' check (status in ('draft','scheduled','active','closed')),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);
create index on sipatgo.campaigns (company_id);

create table sipatgo.campaign_days (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references sipatgo.campaigns(id) on delete cascade,
  day_index int not null check (day_index between 1 and 5),
  date date not null,
  title text not null default '',
  theme text not null default '',
  youtube_video_id text,
  video_duration_s int,
  has_wheel boolean not null default false,
  unique (campaign_id, day_index)
);

create table sipatgo.activities (
  id uuid primary key default gen_random_uuid(),
  campaign_day_id uuid not null unique references sipatgo.campaign_days(id) on delete cascade,
  type text not null check (type in ('true_false','timed_quiz','find_errors','match_pairs','new_habits')),
  config jsonb not null default '{}'::jsonb,
  points_per_item int not null default 100,
  retry_points int not null default 50,
  bonus_max int not null default 20,
  bonus_window_s int not null default 20
);

create table sipatgo.family_games (
  id uuid primary key default gen_random_uuid(),
  campaign_day_id uuid not null unique references sipatgo.campaign_days(id) on delete cascade,
  type text not null check (type in ('word_search','light_quiz')),
  config jsonb not null default '{}'::jsonb
);

create table sipatgo.materials (
  id uuid primary key default gen_random_uuid(),
  campaign_day_id uuid not null references sipatgo.campaign_days(id) on delete cascade,
  title text not null,
  url text not null,
  kind text not null default 'link' check (kind in ('pdf','link')),
  sort int not null default 0
);

-- ---------------------------------------------------------------------
-- Pessoas
-- ---------------------------------------------------------------------
create table sipatgo.participants (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references sipatgo.companies(id) on delete cascade,
  campaign_id uuid references sipatgo.campaigns(id) on delete set null,
  name text not null,
  cpf text not null check (cpf ~ '^[0-9]{11}$'),
  birth_date date not null,
  email text,
  sector text not null default 'Geral',
  role text not null default 'participant' check (role in ('participant','leader','admin','superadmin')),
  avatar_config jsonb,
  avatar_url text,
  pin_hash text,
  pin_set boolean not null default false,
  pin_reset_required boolean not null default false,
  failed_logins int not null default 0,
  locked_until timestamptz,
  session_version int not null default 1,     -- incrementar invalida sessões abertas
  consent_at timestamptz,
  first_login_at timestamptz,
  created_at timestamptz not null default now(),
  unique (company_id, cpf)
);
create index on sipatgo.participants (campaign_id);
create index on sipatgo.participants (campaign_id, sector);

create table sipatgo.consents (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references sipatgo.participants(id) on delete cascade,
  text_version text not null,
  text_snapshot text not null,
  accepted_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Progresso
-- ---------------------------------------------------------------------
create table sipatgo.video_views (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references sipatgo.participants(id) on delete cascade,
  campaign_day_id uuid not null references sipatgo.campaign_days(id) on delete cascade,
  started_at timestamptz not null default now(),
  watched_pct numeric not null default 0,
  completed_at timestamptz,
  is_makeup boolean not null default false,
  points_awarded int not null default 0,
  unique (participant_id, campaign_day_id)
);

-- Relógio do servidor por participante/dinâmica (start-item / submit-item)
create table sipatgo.activity_clocks (
  participant_id uuid not null references sipatgo.participants(id) on delete cascade,
  activity_id uuid not null references sipatgo.activities(id) on delete cascade,
  started_at timestamptz not null default now(),
  wrong_streak int not null default 0,       -- usado em find_errors (cliques errados desde o último acerto)
  primary key (participant_id, activity_id)
);

create table sipatgo.attempts (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references sipatgo.participants(id) on delete cascade,
  activity_id uuid not null references sipatgo.activities(id) on delete cascade,
  item_index int not null,                   -- -1 = clique fora de hotspot (find_errors)
  attempt_no int not null,
  is_correct boolean not null,
  response_time_ms int not null,
  points_awarded int not null default 0,
  bonus_awarded int not null default 0,
  is_makeup boolean not null default false,
  created_at timestamptz not null default now()
);
create index on sipatgo.attempts (participant_id, activity_id);
create index on sipatgo.attempts (activity_id, item_index);
-- só existe UM acerto por item
create unique index attempts_one_correct_per_item
  on sipatgo.attempts (participant_id, activity_id, item_index) where is_correct;

create table sipatgo.day_completions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references sipatgo.participants(id) on delete cascade,
  campaign_day_id uuid not null references sipatgo.campaign_days(id) on delete cascade,
  completed_at timestamptz not null default now(),
  is_makeup boolean not null default false,
  total_points int not null default 0,
  total_time_ms int not null default 0,
  correct_first_try int not null default 0,
  bonus_points int not null default 0,
  unique (participant_id, campaign_day_id)
);

create table sipatgo.participant_scores (
  participant_id uuid primary key references sipatgo.participants(id) on delete cascade,
  campaign_id uuid not null references sipatgo.campaigns(id) on delete cascade,
  total_points int not null default 0,
  total_time_ms bigint not null default 0,
  days_completed int not null default 0,
  updated_at timestamptz not null default now()
);
create index on sipatgo.participant_scores (campaign_id, total_points desc, total_time_ms asc);

create table sipatgo.badges (
  code text primary key,
  name text not null,
  description text not null,
  icon text not null,
  sort int not null default 0
);

create table sipatgo.participant_badges (
  participant_id uuid not null references sipatgo.participants(id) on delete cascade,
  badge_code text not null references sipatgo.badges(code),
  awarded_at timestamptz not null default now(),
  primary key (participant_id, badge_code)
);

-- ---------------------------------------------------------------------
-- Roleta e brindes
-- ---------------------------------------------------------------------
create table sipatgo.prizes (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references sipatgo.campaigns(id) on delete cascade,
  internal_name text not null,
  stock_total int not null default 0 check (stock_total >= 0),
  stock_available int not null default 0 check (stock_available >= 0),
  weight int not null default 1 check (weight >= 1),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table sipatgo.wheel_spins (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references sipatgo.participants(id) on delete cascade,
  campaign_day_id uuid not null references sipatgo.campaign_days(id) on delete cascade,
  prize_id uuid references sipatgo.prizes(id) on delete set null,
  slot int not null default 0,
  created_at timestamptz not null default now(),
  unique (participant_id, campaign_day_id)
);

create table sipatgo.prize_awards (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references sipatgo.participants(id) on delete cascade,
  prize_id uuid not null references sipatgo.prizes(id) on delete restrict,
  wheel_spin_id uuid references sipatgo.wheel_spins(id) on delete set null,
  code text not null unique,
  status text not null default 'pending' check (status in ('pending','delivered','cancelled')),
  delivered_at timestamptz,
  delivered_by uuid references sipatgo.participants(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Mural
-- ---------------------------------------------------------------------
create table sipatgo.wall_posts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references sipatgo.campaigns(id) on delete cascade,
  participant_id uuid not null references sipatgo.participants(id) on delete cascade,
  image_path text not null,
  caption text not null default '' check (char_length(caption) <= 280),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references sipatgo.participants(id) on delete set null,
  reviewed_at timestamptz,
  day_index int not null check (day_index between 1 and 5),
  points_awarded int not null default 0,
  created_at timestamptz not null default now()
);
create index on sipatgo.wall_posts (campaign_id, status);

create table sipatgo.wall_votes (
  post_id uuid not null references sipatgo.wall_posts(id) on delete cascade,
  participant_id uuid not null references sipatgo.participants(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, participant_id)
);

create table sipatgo.wall_daily_winners (
  campaign_id uuid not null references sipatgo.campaigns(id) on delete cascade,
  day_index int not null,
  post_id uuid not null references sipatgo.wall_posts(id) on delete cascade,
  points_awarded int not null default 100,
  created_at timestamptz not null default now(),
  primary key (campaign_id, day_index)
);

-- ---------------------------------------------------------------------
-- Presencial
-- ---------------------------------------------------------------------
create table sipatgo.events (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references sipatgo.campaigns(id) on delete cascade,
  campaign_day_id uuid references sipatgo.campaign_days(id) on delete set null,
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  points int not null default 100,
  secret text not null default replace(gen_random_uuid()::text, '-', ''),
  code text not null unique,                 -- código curto de 6 chars para digitar
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table sipatgo.checkins (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references sipatgo.events(id) on delete cascade,
  participant_id uuid not null references sipatgo.participants(id) on delete cascade,
  points_awarded int not null default 0,
  created_at timestamptz not null default now(),
  unique (event_id, participant_id)
);

-- ---------------------------------------------------------------------
-- Família, certificados, notificações
-- ---------------------------------------------------------------------
create table sipatgo.family_game_completions (
  participant_id uuid not null references sipatgo.participants(id) on delete cascade,
  family_game_id uuid not null references sipatgo.family_games(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (participant_id, family_game_id)
);

create table sipatgo.certificates (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references sipatgo.participants(id) on delete cascade,
  campaign_id uuid not null references sipatgo.campaigns(id) on delete cascade,
  code text not null unique,
  hours numeric not null,
  days_completed int not null,
  issued_at timestamptz not null default now(),
  pdf_url text,
  unique (participant_id, campaign_id)
);

create table sipatgo.notification_log (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references sipatgo.companies(id) on delete cascade,
  campaign_id uuid references sipatgo.campaigns(id) on delete cascade,
  type text not null,
  dedupe_key text unique,                    -- evita disparo duplicado de jobs
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','sent','failed','skipped')),
  error text,
  created_at timestamptz not null default now()
);
create index on sipatgo.notification_log (company_id, created_at desc);

-- =====================================================================
-- Pontuação materializada (fonte do ranking)
-- =====================================================================
create or replace function sipatgo.recalc_participant_score(p_participant uuid)
returns void language plpgsql as $$
declare
  v_campaign uuid;
begin
  select campaign_id into v_campaign from sipatgo.participants where id = p_participant;
  if v_campaign is null then
    return;
  end if;

  insert into sipatgo.participant_scores as s (participant_id, campaign_id, total_points, total_time_ms, days_completed, updated_at)
  select
    p_participant,
    v_campaign,
    coalesce((select sum(a.points_awarded + a.bonus_awarded)
                from sipatgo.attempts a
                join sipatgo.activities ac on ac.id = a.activity_id
                join sipatgo.campaign_days d on d.id = ac.campaign_day_id
               where a.participant_id = p_participant and d.campaign_id = v_campaign), 0)
    + coalesce((select sum(v.points_awarded)
                  from sipatgo.video_views v
                  join sipatgo.campaign_days d on d.id = v.campaign_day_id
                 where v.participant_id = p_participant and d.campaign_id = v_campaign), 0)
    + coalesce((select sum(c.points_awarded)
                  from sipatgo.checkins c
                  join sipatgo.events e on e.id = c.event_id
                 where c.participant_id = p_participant and e.campaign_id = v_campaign), 0)
    + coalesce((select sum(w.points_awarded)
                  from sipatgo.wall_posts w
                 where w.participant_id = p_participant and w.campaign_id = v_campaign and w.status = 'approved'), 0)
    + coalesce((select sum(dw.points_awarded)
                  from sipatgo.wall_daily_winners dw
                  join sipatgo.wall_posts w on w.id = dw.post_id
                 where w.participant_id = p_participant and dw.campaign_id = v_campaign), 0),
    coalesce((select sum(a.response_time_ms)
                from sipatgo.attempts a
                join sipatgo.activities ac on ac.id = a.activity_id
                join sipatgo.campaign_days d on d.id = ac.campaign_day_id
               where a.participant_id = p_participant and a.is_correct and d.campaign_id = v_campaign), 0),
    (select count(*) from sipatgo.day_completions dc
       join sipatgo.campaign_days d on d.id = dc.campaign_day_id
      where dc.participant_id = p_participant and d.campaign_id = v_campaign),
    now()
  on conflict (participant_id) do update
    set campaign_id = excluded.campaign_id,
        total_points = excluded.total_points,
        total_time_ms = excluded.total_time_ms,
        days_completed = excluded.days_completed,
        updated_at = now();
end $$;

create or replace function sipatgo.trg_recalc_score()
returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    perform sipatgo.recalc_participant_score(old.participant_id);
    return old;
  end if;
  perform sipatgo.recalc_participant_score(new.participant_id);
  if tg_op = 'UPDATE' and new.participant_id is distinct from old.participant_id then
    perform sipatgo.recalc_participant_score(old.participant_id);
  end if;
  return new;
end $$;

create trigger attempts_score after insert or update or delete on sipatgo.attempts
  for each row execute function sipatgo.trg_recalc_score();
create trigger video_views_score after insert or update or delete on sipatgo.video_views
  for each row execute function sipatgo.trg_recalc_score();
create trigger checkins_score after insert or update or delete on sipatgo.checkins
  for each row execute function sipatgo.trg_recalc_score();
create trigger wall_posts_score after insert or update or delete on sipatgo.wall_posts
  for each row execute function sipatgo.trg_recalc_score();
create trigger day_completions_score after insert or update or delete on sipatgo.day_completions
  for each row execute function sipatgo.trg_recalc_score();

create or replace function sipatgo.trg_recalc_score_winner()
returns trigger language plpgsql as $$
declare v_pid uuid;
begin
  select participant_id into v_pid from sipatgo.wall_posts
   where id = case when tg_op = 'DELETE' then old.post_id else new.post_id end;
  if v_pid is not null then
    perform sipatgo.recalc_participant_score(v_pid);
  end if;
  return coalesce(new, old);
end $$;

create trigger wall_winners_score after insert or update or delete on sipatgo.wall_daily_winners
  for each row execute function sipatgo.trg_recalc_score_winner();

-- Participante novo / trocado de campanha já aparece no ranking com 0
create or replace function sipatgo.trg_participant_score_row()
returns trigger language plpgsql as $$
begin
  if new.campaign_id is not null then
    perform sipatgo.recalc_participant_score(new.id);
  end if;
  return new;
end $$;

create trigger participants_score_row after insert or update of campaign_id on sipatgo.participants
  for each row execute function sipatgo.trg_participant_score_row();

-- =====================================================================
-- Views
-- =====================================================================
create or replace view sipatgo.v_ranking_individual as
select
  p.campaign_id,
  p.id as participant_id,
  p.name,
  p.sector,
  p.role,
  p.avatar_config,
  coalesce(s.total_points, 0) as total_points,
  coalesce(s.total_time_ms, 0) as total_time_ms,
  coalesce(s.days_completed, 0) as days_completed,
  coalesce((select array_agg(pb.badge_code order by b.sort)
              from sipatgo.participant_badges pb join sipatgo.badges b on b.code = pb.badge_code
             where pb.participant_id = p.id), '{}') as badges,
  rank() over (partition by p.campaign_id
               order by coalesce(s.total_points, 0) desc, coalesce(s.total_time_ms, 0) asc) as position
from sipatgo.participants p
left join sipatgo.participant_scores s on s.participant_id = p.id
where p.campaign_id is not null
  and p.role in ('participant','leader');

create or replace view sipatgo.v_ranking_sector as
with base as (
  select p.campaign_id, p.sector, p.id,
         coalesce(s.total_points, 0) as pts,
         coalesce(s.days_completed, 0) as days
  from sipatgo.participants p
  left join sipatgo.participant_scores s on s.participant_id = p.id
  where p.campaign_id is not null and p.role in ('participant','leader')
)
select
  campaign_id,
  sector,
  count(*)::int as members,
  round(avg(pts)::numeric, 1) as avg_points,
  sum(pts)::int as sum_points,
  count(*) filter (where days > 0)::int as active_members,
  round(100.0 * count(*) filter (where days > 0) / nullif(count(*), 0), 1) as adhesion_pct,
  rank() over (partition by campaign_id order by avg(pts) desc,
               (count(*) filter (where days > 0))::numeric / nullif(count(*), 0) desc) as position
from base
group by campaign_id, sector;

create or replace view sipatgo.v_ranking_daily as
with pts as (
  select a.participant_id, d.campaign_id, d.day_index,
         sum(a.points_awarded + a.bonus_awarded) as points,
         sum(case when a.is_correct then a.response_time_ms else 0 end) as time_ms
  from sipatgo.attempts a
  join sipatgo.activities ac on ac.id = a.activity_id
  join sipatgo.campaign_days d on d.id = ac.campaign_day_id
  group by 1, 2, 3
  union all
  select v.participant_id, d.campaign_id, d.day_index, sum(v.points_awarded), 0
  from sipatgo.video_views v
  join sipatgo.campaign_days d on d.id = v.campaign_day_id
  group by 1, 2, 3
)
select pts.campaign_id, pts.day_index, pts.participant_id, p.name, p.sector, p.avatar_config,
       sum(pts.points)::int as points, sum(pts.time_ms)::bigint as time_ms,
       rank() over (partition by pts.campaign_id, pts.day_index order by sum(pts.points) desc, sum(pts.time_ms) asc) as position
from pts
join sipatgo.participants p on p.id = pts.participant_id
where p.role in ('participant','leader')
group by pts.campaign_id, pts.day_index, pts.participant_id, p.name, p.sector, p.avatar_config;

create or replace view sipatgo.v_attendance as
select p.campaign_id, p.id as participant_id, p.name, p.cpf, p.sector, d.day_index, d.id as campaign_day_id,
       case when dc.id is null then 'none'
            when dc.is_makeup then 'makeup'
            else 'done' end as status,
       dc.completed_at, dc.total_points
from sipatgo.participants p
join sipatgo.campaign_days d on d.campaign_id = p.campaign_id
left join sipatgo.day_completions dc on dc.participant_id = p.id and dc.campaign_day_id = d.id
where p.role in ('participant','leader');

-- =====================================================================
-- Badges (catálogo)
-- =====================================================================
insert into sipatgo.badges (code, name, description, icon, sort) values
  ('first_day',    'Primeiro passo',   'Concluiu o dia 1',                                 '👣', 1),
  ('streak_3',     'Três seguidos',    '3 dias consecutivos no dia certo',                 '🔥', 2),
  ('streak_5',     'Semana perfeita',  '5 dias no dia certo',                              '🏅', 3),
  ('perfect_day',  'Gabaritou',        '5/5 na 1ª tentativa em um dia',                    '🎯', 4),
  ('perfect_week', 'Nota máxima',      '25/25 na 1ª tentativa',                            '💯', 5),
  ('speedster',    'Relâmpago',        'Bônus de velocidade ≥ 80 em um dia',               '⚡', 6),
  ('early_bird',   'Madrugador',       'Concluiu um dia antes das 09:00',                  '🌅', 7),
  ('social',       'Influência',       'Teve um post aprovado no mural',                   '📸', 8),
  ('top_post',     'Destaque',         'Post mais votado do dia',                          '⭐', 9),
  ('family',       'Em família',       'Concluiu um game da família',                      '👨‍👩‍👧', 10),
  ('family_week',  'Família completa', 'Concluiu os 5 games da família',                   '🏡', 11),
  ('present',      'Presente',         'Fez check-in em um evento presencial',             '📍', 12),
  ('podium',       'Pódio',            'Terminou no top 3 da campanha',                    '🏆', 13),
  ('team_winner',  'Time campeão',     'Faz parte do setor vencedor',                      '🤝', 14)
on conflict (code) do update set name = excluded.name, description = excluded.description,
  icon = excluded.icon, sort = excluded.sort;

-- =====================================================================
-- Isolamento / RLS
-- RLS ligado em todas as tabelas SEM políticas = nada acessível via API
-- pública do Supabase (anon/authenticated). Somente o servidor do SipatGo,
-- conectado por DATABASE_URL, lê e escreve.
-- =====================================================================
do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'sipatgo' loop
    execute format('alter table sipatgo.%I enable row level security', t.tablename);
  end loop;

  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on schema sipatgo from anon';
    execute 'revoke all on all tables in schema sipatgo from anon';
    execute 'revoke all on all functions in schema sipatgo from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on schema sipatgo from authenticated';
    execute 'revoke all on all tables in schema sipatgo from authenticated';
    execute 'revoke all on all functions in schema sipatgo from authenticated';
  end if;
end $$;

-- Views respeitam permissões de quem consulta
alter view sipatgo.v_ranking_individual set (security_invoker = true);
alter view sipatgo.v_ranking_sector set (security_invoker = true);
alter view sipatgo.v_ranking_daily set (security_invoker = true);
alter view sipatgo.v_attendance set (security_invoker = true);
