-- Run this in Supabase Dashboard → SQL Editor → New query → Run

-- User profiles (extends Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null,
  branch text not null,
  semester integer not null,
  role text not null default 'Student',
  upload_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- Academic resources metadata
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  semester integer not null,
  subject text not null,
  category text not null,
  file_url text not null,
  uploader text not null,
  uploader_id uuid references auth.users not null,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.resources enable row level security;

create policy "Authenticated users can read profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Authenticated users can read resources"
  on public.resources for select
  to authenticated
  using (true);

create policy "Authenticated users can insert resources"
  on public.resources for insert
  to authenticated
  with check (auth.uid() = uploader_id);

-- Atomic upload counter increment
create or replace function public.increment_upload_count(user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set upload_count = upload_count + 1
  where id = user_id;
end;
$$;

grant execute on function public.increment_upload_count(uuid) to authenticated;

-- Storage bucket (public read for PDF downloads)
insert into storage.buckets (id, name, public)
values ('resources', 'resources', true)
on conflict (id) do update set public = true;

create policy "Authenticated users can upload PDFs"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'resources');

create policy "Anyone can download PDFs"
  on storage.objects for select
  to public
  using (bucket_id = 'resources');
