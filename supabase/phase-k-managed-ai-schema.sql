-- Phase K — managed Gemini keys (platform provides keys for Pro users).
-- Run in Supabase → SQL Editor.

alter table public.platform_settings add column if not exists managed_ai_on boolean not null default false;

-- Platform's own Gemini keys (admin managed; secret → engine-encrypted; invisible to users).
create table if not exists public.platform_ai_keys (
  id         uuid primary key default gen_random_uuid(),
  key_enc    text not null,
  hint       text,
  status     text not null default 'active',   -- active | invalid
  created_at timestamptz not null default now()
);
-- RLS ON with NO policies → clients cannot read/write; only the engine (service role) can.
alter table public.platform_ai_keys enable row level security;
