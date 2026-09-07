-- Phase 4A — show which key is which (last 4 chars), keep multiple keys.
-- Run in Supabase → SQL Editor.
alter table public.ai_keys add column if not exists hint text;
