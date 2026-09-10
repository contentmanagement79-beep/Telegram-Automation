-- Phase D — Follow-up automation. Run in Supabase → SQL Editor.

-- Persistent per-customer last activity (NOT purged like conversations).
create table if not exists public.customers (
  user_id     uuid not null references auth.users (id) on delete cascade,
  customer_id bigint not null,
  last_msg_at timestamptz not null default now(),
  primary key (user_id, customer_id)
);

-- Follow-up rules (create several for a drip sequence: 1 day, 3 days, 7 days…).
create table if not exists public.followups (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  delay_days integer not null default 1,      -- send when idle for >= this many days
  message    text,                            -- text / caption to send
  media_id   uuid references public.media_items (id) on delete set null,
  enabled    boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_followups_user on public.followups (user_id);

-- Which follow-up was already sent to which customer (reset when they reply).
create table if not exists public.followup_sends (
  user_id     uuid not null references auth.users (id) on delete cascade,
  customer_id bigint not null,
  followup_id uuid not null references public.followups (id) on delete cascade,
  sent_at     timestamptz not null default now(),
  primary key (user_id, customer_id, followup_id)
);

alter table public.customers       enable row level security;
alter table public.followups       enable row level security;
alter table public.followup_sends  enable row level security;
create policy "own customers" on public.customers for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own followups" on public.followups for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own followup_sends" on public.followup_sends for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
