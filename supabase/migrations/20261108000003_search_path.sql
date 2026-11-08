-- Fixa search_path das funções (recomendação do linter de segurança do Supabase).
alter function sipatgo.recalc_participant_score(uuid) set search_path = '';
alter function sipatgo.trg_recalc_score() set search_path = '';
alter function sipatgo.trg_recalc_score_winner() set search_path = '';
alter function sipatgo.trg_participant_score_row() set search_path = '';
do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'sipatgo' and p.proname = 'schedule_tick') then
    execute 'alter function sipatgo.schedule_tick(text) set search_path = ''''';
  end if;
end $$;
