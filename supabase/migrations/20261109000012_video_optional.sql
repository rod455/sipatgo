-- O vídeo deixa de ser obrigatório para a dinâmica (quem pula perde os pontos
-- do vídeo). Registra se o vídeo foi assistido até o fim ANTES de concluir o dia.
alter table sipatgo.day_completions add column if not exists video_watched boolean;
