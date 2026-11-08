-- Login do RH por e-mail + senha (independente do PIN de colaborador).
alter table sipatgo.participants add column if not exists password_hash text;
create index if not exists participants_email_idx on sipatgo.participants (lower(email)) where email is not null;
