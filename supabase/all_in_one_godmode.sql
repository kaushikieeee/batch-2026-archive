-- =============================================
-- Batch of 2026 - All-in-one Supabase bootstrap
-- =============================================
-- Run this ONCE in Supabase SQL Editor.
-- Safe to re-run: uses IF NOT EXISTS / additive ALTER patterns.

create extension if not exists pgcrypto;

-- -------------------------------------------------
-- Users
-- -------------------------------------------------
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password text not null,
  is_admin boolean not null default false,
  must_change_password boolean not null default true,
  welcome_message text,
  personal_letter text,
  welcome_image_url text,
  
  -- Profile Fields
  name text,
  section text,
  role text,
  quote text,
  bio text,
  phone text,
  instagram text,
  snapchat text,
  linkedin text,
  email text,
  image text,
  accent_color text default 'yellow',
  badge text default '✨',
  
  -- Privacy settings
  show_phone boolean not null default false,
  show_instagram boolean not null default false,
  show_snapchat boolean not null default false,
  show_email boolean not null default false,
  show_linkedin boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -------------------------------------------------
-- Wall messages
-- -------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Anonymous',
  message text not null,
  status text not null default 'approved',
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------
-- Students (Yearbook profile)
-- -------------------------------------------------
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  section text,
  role text,
  quote text,
  bio text,
  phone text,
  instagram text,
  linkedin text,
  image text,
  accent_color text default 'yellow',
  badge text default '✨',

  -- Song feature fields
  anthem_title text,
  anthem_artist text,
  anthem_preview_url text,
  anthem_album_art_url text,
  anthem_source text,
  anthem_source_track_id text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -------------------------------------------------
-- Student messages (Yearbook modal notes)
-- -------------------------------------------------
create table if not exists public.student_messages (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.users(id) on delete cascade,
  message text not null,
  author text,
  status text not null default 'approved',
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------
-- Media (photos/videos shown in vault)
-- -------------------------------------------------
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  year text,
  src text,
  caption text,
  aspect text not null default 'square',
  status text not null default 'approved',
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------
-- Backward-compatible additive columns (for existing DBs)
-- -------------------------------------------------
alter table if exists public.users
  add column if not exists is_admin boolean not null default false,
  add column if not exists must_change_password boolean not null default true,
  add column if not exists welcome_message text,
  add column if not exists personal_letter text,
  add column if not exists welcome_image_url text,
  add column if not exists name text,
  add column if not exists section text,
  add column if not exists role text,
  add column if not exists quote text,
  add column if not exists bio text,
  add column if not exists phone text,
  add column if not exists instagram text,
  add column if not exists snapchat text,
  add column if not exists linkedin text,
  add column if not exists email text,
  add column if not exists image text,
  add column if not exists accent_color text default 'yellow',
  add column if not exists badge text default '✨',
  add column if not exists show_phone boolean not null default false,
  add column if not exists show_instagram boolean not null default false,
  add column if not exists show_snapchat boolean not null default false,
  add column if not exists show_email boolean not null default false,
  add column if not exists show_linkedin boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.messages
  add column if not exists status text not null default 'approved',
  add column if not exists reviewed_by text,
  add column if not exists reviewed_at timestamptz;

alter table if exists public.media
  add column if not exists status text not null default 'approved',
  add column if not exists reviewed_by text,
  add column if not exists reviewed_at timestamptz;

alter table if exists public.student_messages
  add column if not exists status text not null default 'approved',
  add column if not exists reviewed_by text,
  add column if not exists reviewed_at timestamptz;

alter table if exists public.students
  add column if not exists bio text,
  add column if not exists phone text,
  add column if not exists instagram text,
  add column if not exists linkedin text,
  add column if not exists accent_color text default 'yellow',
  add column if not exists badge text default '✨',
  add column if not exists anthem_title text,
  add column if not exists anthem_artist text,
  add column if not exists anthem_preview_url text,
  add column if not exists anthem_album_art_url text,
  add column if not exists anthem_source text,
  add column if not exists anthem_source_track_id text,
  add column if not exists updated_at timestamptz not null default now();

-- -------------------------------------------------
-- Moderation + shape constraints
-- -------------------------------------------------
alter table if exists public.messages
  drop constraint if exists messages_status_check;
alter table if exists public.messages
  add constraint messages_status_check
  check (status in ('pending', 'approved', 'rejected'));

alter table if exists public.media
  drop constraint if exists media_status_check;
alter table if exists public.media
  add constraint media_status_check
  check (status in ('pending', 'approved', 'rejected'));

alter table if exists public.student_messages
  drop constraint if exists student_messages_status_check;
alter table if exists public.student_messages
  add constraint student_messages_status_check
  check (status in ('pending', 'approved', 'rejected'));

alter table if exists public.media
  drop constraint if exists media_aspect_check;
alter table if exists public.media
  add constraint media_aspect_check
  check (aspect in ('square', 'wide', 'tall'));

-- -------------------------------------------------
-- Keep old published content visible after migration
-- -------------------------------------------------
update public.messages set status = 'approved' where status is null;
update public.media set status = 'approved' where status is null;
update public.student_messages set status = 'approved' where status is null;

-- -------------------------------------------------
-- Performance indexes
-- -------------------------------------------------
create index if not exists idx_messages_status_created_at
  on public.messages (status, created_at desc);

create index if not exists idx_media_status_created_at
  on public.media (status, created_at desc);

create index if not exists idx_student_messages_student_status_created_at
  on public.student_messages (student_id, status, created_at desc);

create index if not exists idx_students_section_name
  on public.students (section, name);

create index if not exists idx_users_username
  on public.users (username);

-- -------------------------------------------------
-- Seed/lock godmode account
-- -------------------------------------------------
insert into public.users (username, password, is_admin)
values ('Kaushik S', 'rashmika_av@124', true)
on conflict (username)
do update set
  password = excluded.password,
  is_admin = true,
  updated_at = now();

-- -------------------------------------------------
-- Optional helper view for admin moderation dashboard
-- -------------------------------------------------
create or replace view public.admin_pending_counts as
select
  (select count(*) from public.messages where status = 'pending') as pending_wall_messages,
  (select count(*) from public.media where status = 'pending') as pending_media,
  (select count(*) from public.student_messages where status = 'pending') as pending_student_memos;

-- -------------------------------------------------
-- Relink keys and drop old students
-- -------------------------------------------------
alter table if exists public.student_messages
  drop constraint if exists student_messages_student_id_fkey;

alter table if exists public.student_messages
  add constraint student_messages_student_id_fkey
  foreign key (student_id) references public.users(id) on delete cascade;

-- Allow godmode to bypass password change automatically
update public.users set must_change_password = false where is_admin = true;

-- EXTRA 2026 CAPSULE FEATURES
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS time_capsule TEXT,
ADD COLUMN IF NOT EXISTS signature_url TEXT,
ADD COLUMN IF NOT EXISTS anthem_title TEXT,
ADD COLUMN IF NOT EXISTS anthem_artist TEXT,
ADD COLUMN IF NOT EXISTS anthem_preview_url TEXT,
ADD COLUMN IF NOT EXISTS anthem_album_art_url TEXT,
ADD COLUMN IF NOT EXISTS anthem_source TEXT,
ADD COLUMN IF NOT EXISTS anthem_source_track_id TEXT;

-- -------------------------------------------------
-- Slambook / Direct Messages
-- -------------------------------------------------
create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid constraint direct_messages_sender_id_fkey references public.users(id) on delete cascade,
  receiver_id uuid constraint direct_messages_receiver_id_fkey references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_dm_participants on public.direct_messages(sender_id, receiver_id);

-- Enable Realtime for Direct Messages
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Ignore failures if already added
END $$;

-- -------------------------------------------------
-- Dummy User for testing
-- -------------------------------------------------
insert into public.users (username, password, name, section, role, is_admin, must_change_password)
values ('dummy', 'dummy123', 'Dummy User', 'CSE-A', 'Tester', false, true)
on conflict (username) do update set must_change_password = true;


-- Setup Storage for Avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('batchof2026', 'batchof2026', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Anon Upload" ON storage.objects;
DROP POLICY IF EXISTS "Anon Update" ON storage.objects;
DROP POLICY IF EXISTS "Anon Delete" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'batchof2026');

CREATE POLICY "Anon Upload" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'batchof2026');

CREATE POLICY "Anon Update" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'batchof2026');

CREATE POLICY "Anon Delete"
ON storage.objects
FOR DELETE
USING (bucket_id = 'batchof2026');


-- EXTRA PROFILE & GRANULAR VISIBILITY
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS youtube TEXT,
ADD COLUMN IF NOT EXISTS github TEXT,
ADD COLUMN IF NOT EXISTS x_twitter TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS visibility_preferences JSONB DEFAULT '{"email": true, "phone": true, "instagram": true, "linkedin": true, "youtube": true, "github": true, "x_twitter": true, "website": true, "dob": true}'::jsonb;

-- =============================================
-- ADVANCED ADMIN SECURITY & RLS
-- =============================================
CREATE OR REPLACE FUNCTION public.admin_get_users(admin_user text, admin_pass text)
RETURNS SETOF public.users AS $$
DECLARE
  caller_is_admin boolean;
BEGIN
  SELECT is_admin INTO caller_is_admin FROM public.users 
  WHERE username = admin_user AND password = admin_pass;
  
  IF caller_is_admin THEN
    RETURN QUERY SELECT * FROM public.users ORDER BY username;
  ELSE
    RAISE EXCEPTION 'Access Denied: Not an Administrator';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Base RLS Flag activation
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Create read policies so Anon users can load site data
CREATE POLICY "public_read" ON public.users FOR SELECT USING (true);
CREATE POLICY "public_read" ON public.messages FOR SELECT USING (true);
CREATE POLICY "public_read" ON public.media FOR SELECT USING (true);
CREATE POLICY "public_read" ON public.students FOR SELECT USING (true);
CREATE POLICY "public_read" ON public.student_messages FOR SELECT USING (true);
CREATE POLICY "public_read" ON public.direct_messages FOR SELECT USING (true);

-- Create permissive write policies. 
-- Note: In a pure anon custom table app, writes map to 'true' here unless explicitly constrained via custom RPCs.
CREATE POLICY "public_all" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON public.messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON public.media FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON public.student_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON public.direct_messages FOR ALL USING (true) WITH CHECK (true);

