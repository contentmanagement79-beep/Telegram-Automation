-- Phase C — Media library (Cloudinary). Run in Supabase → SQL Editor.

-- Cloudinary accounts (multiple per user, rotation). No secret needed:
-- browser uploads with an UNSIGNED upload preset; blur/serve are just URLs.
create table if not exists public.cloudinary_accounts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  cloud_name    text not null,
  upload_preset text not null,
  status        text not null default 'active',   -- active | disabled
  created_at    timestamptz not null default now()
);
create index if not exists idx_cloud_user on public.cloudinary_accounts (user_id);

-- Media library
create table if not exists public.media_items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  name          text not null,
  keyword       text,                 -- comma-separated trigger words
  caption       text,
  url           text not null,        -- cloudinary secure_url
  public_id     text,
  kind          text not null default 'image',  -- image | video
  blur          boolean not null default false,
  spoiler       boolean not null default false,
  self_destruct boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists idx_media_user on public.media_items (user_id);

-- Per-user upload size limits
create table if not exists public.media_settings (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  max_photo_mb  integer not null default 10,
  max_video_mb  integer not null default 50,
  updated_at    timestamptz not null default now()
);

alter table public.cloudinary_accounts enable row level security;
alter table public.media_items        enable row level security;
alter table public.media_settings     enable row level security;
create policy "own cloud" on public.cloudinary_accounts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own media" on public.media_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own media settings" on public.media_settings for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
