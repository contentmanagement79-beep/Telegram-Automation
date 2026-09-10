-- Phase F — Multi-connection (personal + bot together). Run in Supabase → SQL Editor.

-- Allow multiple telegram connections per user (one 'user' + one 'bot').
alter table public.telegram_accounts add column if not exists id uuid default gen_random_uuid();
update public.telegram_accounts set id = gen_random_uuid() where id is null;
alter table public.telegram_accounts alter column id set not null;
alter table public.telegram_accounts drop constraint if exists telegram_accounts_pkey;
alter table public.telegram_accounts add primary key (id);
create unique index if not exists uniq_user_mode on public.telegram_accounts (user_id, mode);

-- Route follow-ups through the connection the customer actually used.
alter table public.customers add column if not exists via text not null default 'user';
