-- Participante de teste: vê e joga todos os dias liberados, mesmo antes da data
-- ou com a campanha em rascunho. Uso interno (homologação de conteúdo).
alter table sipatgo.participants add column if not exists preview_all boolean not null default false;
