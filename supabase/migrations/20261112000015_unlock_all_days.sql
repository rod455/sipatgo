-- Campanha com todos os dias abertos para todos os colaboradores (homologação/treino).
alter table sipatgo.campaigns add column if not exists unlock_all_days boolean not null default false;
