-- Run this once in the Supabase project's SQL editor before seeding data.
-- Each record keeps its id in its own column and the full record (the same
-- shape the app already uses) in a `data` jsonb column — see backend/src/data/supabaseStore.js.

create table if not exists staff (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists patients (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists appointments_week (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- RLS stays enabled with no policies: the backend talks to Supabase using the
-- service_role key, which bypasses RLS. Nothing else should have direct table access.
alter table staff enable row level security;
alter table patients enable row level security;
alter table appointments_week enable row level security;
