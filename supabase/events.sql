-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New query)

create table if not exists events (
  id           uuid        primary key default uuid_generate_v4(),
  type         text        not null check (type in ('match', 'tournament')),
  title        text        not null,
  event_date   date        not null,
  event_time   text        not null,
  description  text,
  result       text        check (result in ('win', 'loss')),
  score        text,
  created_by   text        not null default 'admin',
  created_by_name text,
  created_at   timestamptz not null default now()
);

create index if not exists idx_events_date on events(event_date asc);
