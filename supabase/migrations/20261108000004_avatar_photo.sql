-- Empresa decide se participantes podem usar a própria foto como avatar.
alter table sipatgo.companies add column if not exists allow_photo_avatar boolean not null default true;
