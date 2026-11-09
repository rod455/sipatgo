-- Trecho do vídeo do dia (ex.: 2 min de uma palestra TEDx). Vazio = vídeo inteiro.
alter table sipatgo.campaign_days
  add column if not exists video_start_s int check (video_start_s is null or video_start_s >= 0),
  add column if not exists video_end_s int check (video_end_s is null or video_end_s > 0);
