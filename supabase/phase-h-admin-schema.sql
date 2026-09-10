-- Phase H — monetization control. Run in Supabase → SQL Editor.

-- Global master switch (single row, id=1).
create table if not exists public.platform_settings (
  id              integer primary key default 1,
  monetization_on boolean not null default false
);
insert into public.platform_settings (id, monetization_on) values (1, false) on conflict (id) do nothing;

-- Each toggleable feature: 'free' (everyone) or 'pro' (subscribers only).
create table if not exists public.feature_flags (
  key  text primary key,
  tier text not null default 'free'   -- free | pro
);
insert into public.feature_flags (key, tier) values
  ('media','free'), ('voice','free'), ('followups','free'), ('integration','free'),
  ('conversations','free'), ('customers','free'), ('business_hours','free'), ('bot_mode','free')
on conflict (key) do nothing;

-- Per-user plan.
create table if not exists public.plans (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  plan       text not null default 'free',   -- free | pro
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

-- RLS: everyone reads settings/flags (not secret); own plan only. Writes via admin service role.
alter table public.platform_settings enable row level security;
alter table public.feature_flags     enable row level security;
alter table public.plans             enable row level security;
create policy "read settings" on public.platform_settings for select using (true);
create policy "read flags"    on public.feature_flags    for select using (true);
create policy "read own plan" on public.plans            for select using (auth.uid() = user_id);
