-- Phase L — pluggable voice providers (ElevenLabs or any HTTP TTS).
-- Run in Supabase → SQL Editor.

alter table public.platform_settings add column if not exists managed_voice_on boolean not null default false;

create table if not exists public.voice_providers (
  id               uuid primary key default gen_random_uuid(),
  scope            text not null default 'user',   -- user | platform
  user_id          uuid references auth.users (id) on delete cascade,
  name             text,
  endpoint         text not null,                   -- may contain {voice}
  method           text not null default 'POST',
  header_name      text,                            -- e.g. xi-api-key | Authorization
  header_value_enc text,                            -- encrypted (may include "Bearer …")
  body_template    text,                            -- JSON, uses {text} and {voice}
  voice            text,                            -- voice id/name substituted into {voice}
  response_type    text not null default 'audio',   -- audio | base64 | url
  json_path        text,                            -- for base64/url responses (dot path)
  enabled          boolean not null default true,
  created_at       timestamptz not null default now()
);
create index if not exists idx_voice_user on public.voice_providers (user_id);

-- RLS: users manage only their own (scope='user'); platform rows (scope='platform',
-- user_id null) have no client policy → only the engine (service role) can read them.
alter table public.voice_providers enable row level security;
create policy "own voice provider" on public.voice_providers for all
  using (scope = 'user' and auth.uid() = user_id)
  with check (scope = 'user' and auth.uid() = user_id);
