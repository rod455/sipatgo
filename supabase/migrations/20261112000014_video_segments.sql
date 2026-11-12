-- Vários trechos do mesmo vídeo, tocados em sequência: [{"start":109,"end":188}, ...]
alter table sipatgo.campaign_days add column if not exists video_segments jsonb;
