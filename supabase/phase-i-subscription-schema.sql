-- Phase I — manual (bKash/Nagad) subscription. Run in Supabase → SQL Editor.

alter table public.platform_settings add column if not exists pay_number       text default '';
alter table public.platform_settings add column if not exists pay_instructions text default '';
alter table public.platform_settings add column if not exists price_text       text default '';
alter table public.platform_settings add column if not exists pro_days         integer not null default 30;

create table if not exists public.subscription_requests (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  method     text,                 -- bkash | nagad | other
  trx_id     text,
  note       text,
  status     text not null default 'pending',   -- pending | approved | rejected
  created_at timestamptz not null default now()
);
create index if not exists idx_subreq_user on public.subscription_requests (user_id);

alter table public.subscription_requests enable row level security;
create policy "insert own request" on public.subscription_requests for insert
  with check (auth.uid() = user_id);
create policy "read own request" on public.subscription_requests for select
  using (auth.uid() = user_id);
