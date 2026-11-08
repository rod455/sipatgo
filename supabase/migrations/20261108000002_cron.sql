-- Configurações internas + agendamento do job horário via pg_cron/pg_net.
-- A chave do cron fica no banco: o pg_cron a envia no header e a API confere.
create table if not exists sipatgo.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
alter table sipatgo.app_settings enable row level security;
insert into sipatgo.app_settings (key, value)
values ('cron_key', replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''))
on conflict (key) do nothing;

-- Agenda (ou reagenda) a chamada horária de {base_url}/api/cron/tick.
-- Requer as extensões pg_cron e pg_net (disponíveis no Supabase).
create or replace function sipatgo.schedule_tick(base_url text)
returns text language plpgsql as $$
declare
  v_cmd text;
begin
  insert into sipatgo.app_settings (key, value) values ('app_base_url', rtrim(base_url, '/'))
  on conflict (key) do update set value = excluded.value, updated_at = now();
  v_cmd := $cmd$
    select net.http_get(
      url := (select value from sipatgo.app_settings where key = 'app_base_url') || '/api/cron/tick',
      headers := jsonb_build_object('x-sipatgo-cron', (select value from sipatgo.app_settings where key = 'cron_key')),
      timeout_milliseconds := 55000
    );
  $cmd$;
  perform cron.schedule('sipatgo-tick', '2 * * * *', v_cmd);
  return 'agendado: ' || rtrim(base_url, '/') || '/api/cron/tick (minuto 2 de cada hora)';
end $$;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on sipatgo.app_settings from anon, authenticated';
    execute 'revoke all on function sipatgo.schedule_tick(text) from public, anon, authenticated';
  end if;
end $$;
