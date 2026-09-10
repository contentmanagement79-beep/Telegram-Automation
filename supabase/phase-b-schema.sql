-- Phase B — Bot API mode (BotFather bot). Run in Supabase → SQL Editor.
alter table public.telegram_accounts add column if not exists mode text not null default 'user';
alter table public.telegram_accounts add column if not exists bot_token_enc text;
