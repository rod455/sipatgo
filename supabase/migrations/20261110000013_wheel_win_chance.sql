-- Roleta: nem todo giro ganha. Chance de ganhar por giro (0 a 100%), definida pelo RH.
alter table sipatgo.campaigns add column if not exists wheel_win_pct int not null default 30
  check (wheel_win_pct between 0 and 100);
