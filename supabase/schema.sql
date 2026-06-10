-- ============================================================
-- ScrimSync — Schéma Supabase complet
-- Exécutez ce fichier dans l'éditeur SQL de Supabase
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLE: players
-- ============================================================
create table if not exists players (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  token text unique not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- TABLE: availability
-- ============================================================
create table if not exists availability (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references players(id) on delete cascade,
  week_start date not null,
  day_of_week int not null check (day_of_week between 1 and 7),
  start_hour int not null check (start_hour in (19, 20, 21, 22, 23)),
  created_at timestamptz not null default now(),
  unique (player_id, week_start, day_of_week, start_hour)
);

-- ============================================================
-- TABLE: availability_submissions
-- ============================================================
create table if not exists availability_submissions (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references players(id) on delete cascade,
  week_start date not null,
  submitted_at timestamptz not null default now(),
  unique (player_id, week_start)
);

-- ============================================================
-- TABLE: scrims
-- ============================================================
create table if not exists scrims (
  id uuid primary key default uuid_generate_v4(),
  week_start date not null,
  day_of_week int not null check (day_of_week between 1 and 7),
  start_hour int not null check (start_hour in (19, 20, 21, 22, 23)),
  opponent_name text not null,
  opponent_opgg_url text not null,
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- TABLE: team_settings
-- ============================================================
create table if not exists team_settings (
  id uuid primary key default uuid_generate_v4(),
  team_name text not null default 'Notre équipe',
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEX
-- ============================================================
create index if not exists idx_availability_week_start on availability(week_start);
create index if not exists idx_availability_player_week on availability(player_id, week_start);
create index if not exists idx_submissions_week_start on availability_submissions(week_start);
create index if not exists idx_scrims_week_start on scrims(week_start);

-- ============================================================
-- ROW LEVEL SECURITY
-- Service role bypasses RLS — nos API routes utilisent service role
-- On désactive RLS pour garder l'accès simple via service role
-- ============================================================
alter table players disable row level security;
alter table availability disable row level security;
alter table availability_submissions disable row level security;
alter table scrims disable row level security;
alter table team_settings disable row level security;

-- ============================================================
-- SEED — 5 joueurs de test
-- Tokens de test : changez-les en production !
-- ============================================================
insert into players (name, token) values
  ('Shaark',  'shaark-test-token'),
  ('Top',     'top-test-token'),
  ('Jungle',  'jungle-test-token'),
  ('ADC',     'adc-test-token'),
  ('Support', 'support-test-token')
on conflict (token) do nothing;

-- ============================================================
-- SEED — Settings d'équipe
-- ============================================================
insert into team_settings (team_name) values ('Notre équipe')
on conflict do nothing;

-- ============================================================
-- VERIFICATION (optionnel — lancez séparément)
-- ============================================================
-- select * from players;
-- select count(*) from players;
