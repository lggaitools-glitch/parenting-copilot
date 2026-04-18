create extension if not exists pgcrypto;

create table if not exists public.baby_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  parent_name text not null,
  baby_name text not null,
  baby_age_months integer not null,
  feeding_type text not null,
  sleep_setup text not null,
  current_challenges text[] not null default '{}',
  current_goals text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.baby_profiles
  add column if not exists current_challenges text[] not null default '{}';

alter table public.baby_profiles
  add column if not exists current_goals text[] not null default '{}';

alter table public.baby_profiles
  drop column if exists current_challenge;

alter table public.baby_profiles
  drop column if exists current_goal;

create table if not exists public.sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  date date not null,
  bedtime text not null,
  night_wakings integer not null default 0,
  longest_stretch text not null,
  naps integer not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role text not null check (role in ('user', 'assistant')),
  text text not null,
  timestamp bigint not null,
  created_at timestamptz not null default now()
);

alter table public.baby_profiles enable row level security;
alter table public.sleep_logs enable row level security;
alter table public.chat_messages enable row level security;

create policy "users manage own profile"
on public.baby_profiles
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users manage own sleep logs"
on public.sleep_logs
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users manage own chat messages"
on public.chat_messages
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
