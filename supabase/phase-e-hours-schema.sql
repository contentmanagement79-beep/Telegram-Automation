-- Phase E (part 1) — business hours. Run in Supabase → SQL Editor.
alter table public.personas add column if not exists hours_enabled boolean not null default false;
alter table public.personas add column if not exists hours_start   integer not null default 9;
alter table public.personas add column if not exists hours_end     integer not null default 22;
alter table public.personas add column if not exists tz_offset     integer not null default 6;   -- hours from UTC (Bangladesh = 6)
alter table public.personas add column if not exists away_message  text default '';
