-- NR-5, item 5.3.1 "i": a programação da SIPAT é definida pela CIPA.
-- Campo para registrar a ata/data da reunião da CIPA que aprovou a programação.
alter table sipatgo.campaigns add column if not exists cipa_approval text;
