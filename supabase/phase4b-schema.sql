-- Phase 4B — connect the tenant's own website API for live data.
-- Run in Supabase → SQL Editor.
create table if not exists public.integrations (
  user_id          uuid primary key references auth.users (id) on delete cascade,
  api_url          text,
  header_name      text,
  header_value_enc text,          -- encrypted by the engine
  enabled          boolean not null default false,
  note             text,
  updated_at       timestamptz not null default now()
);
alter table public.integrations enable row level security;
create policy "own integration" on public.integrations for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
