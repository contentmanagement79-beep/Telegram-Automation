-- Phase G — persistent per-customer summary (survives the 7-day raw purge).
-- Run in Supabase → SQL Editor.
create table if not exists public.customer_profiles (
  user_id     uuid not null references auth.users (id) on delete cascade,
  customer_id bigint not null,
  summary     text,
  updated_at  timestamptz not null default now(),
  primary key (user_id, customer_id)
);
alter table public.customer_profiles enable row level security;
create policy "own profiles" on public.customer_profiles for select
  using (auth.uid() = user_id);
