-- ============================================================
--  AUTOGRAM — PHASE 3 SCHEMA
--  Run in Supabase → SQL Editor. Each row is owned by an auth user.
--  Sensitive columns (…_enc) are written ENCRYPTED by the server /
--  Python engine — never store raw secrets from the browser.
-- ============================================================

-- profile (safe to re-run) --------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
do $$ begin
  create policy "own profile" on public.profiles for all
    using (auth.uid() = id) with check (auth.uid() = id);
exception when duplicate_object then null; end $$;

-- telegram connection (one per user) ---------------------------------------
create table if not exists public.telegram_accounts (
  user_id            uuid primary key references auth.users (id) on delete cascade,
  api_id             integer,
  api_hash_enc       text,          -- encrypted
  phone              text,
  session_string_enc text,          -- encrypted (keeps you logged in)
  status             text not null default 'disconnected', -- disconnected | connected | error
  last_error         text,
  updated_at         timestamptz not null default now()
);
alter table public.telegram_accounts enable row level security;
create policy "own telegram" on public.telegram_accounts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- AI keys (multiple per user, rotate when exhausted) -----------------------
create table if not exists public.ai_keys (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  provider   text not null default 'gemini',
  label      text,
  key_enc    text not null,         -- encrypted
  status     text not null default 'active', -- active | exhausted | invalid
  created_at timestamptz not null default now()
);
create index if not exists idx_ai_keys_user on public.ai_keys (user_id);
alter table public.ai_keys enable row level security;
create policy "own ai keys" on public.ai_keys for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- persona / tone / prompt (one per user) -----------------------------------
create table if not exists public.personas (
  user_id             uuid primary key references auth.users (id) on delete cascade,
  persona_name        text not null default 'Assistant',
  role_bio            text default 'the store assistant',
  tone_config         jsonb not null default '{}'::jsonb,   -- {formality,emoji,language,length,traits}
  topics              text default '',
  limitations         text default '',
  custom_instructions text default '',
  store_info          text default '',
  greeting            text default '',
  disclose_ai         boolean not null default true,
  voice_enabled       boolean not null default true,        -- only reply with voice when asked
  voice_name          text not null default 'en-US-JennyNeural',
  -- four separate, user-editable commands (must be distinct)
  cmd_takeover_stop   text not null default '//stop',
  cmd_takeover_start  text not null default '//start',
  cmd_global_stop     text not null default '//stopall',
  cmd_global_start    text not null default '//startall',
  mode                text not null default 'byok',         -- byok | managed
  bot_running         boolean not null default true,
  updated_at          timestamptz not null default now()
);
alter table public.personas enable row level security;
create policy "own persona" on public.personas for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- structured product catalog (accurate prices, no hallucination) -----------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  category    text,
  price       text,
  description text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists idx_products_user on public.products (user_id);
alter table public.products enable row level security;
create policy "own products" on public.products for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
