-- Phase J — account suspend. Run in Supabase → SQL Editor.
-- Reuse the plans table for a suspended flag (one row per user; created on first admin action).
alter table public.plans add column if not exists suspended boolean not null default false;
