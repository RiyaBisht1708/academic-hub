-- Phase 3B migration: Analytics, Activity Feed, Download Tracking
-- Run in Supabase SQL Editor (after phase3a.sql)

-- 1. Download tracking on resources
alter table public.resources
  add column if not exists download_count integer not null default 0;

alter table public.resources
  add column if not exists last_downloaded_at timestamptz;

-- 2. Activity feed log
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  actor_name text not null,
  action_type text not null,
  resource_id uuid references public.resources on delete set null,
  resource_title text,
  created_at timestamptz not null default now(),
  constraint activity_logs_action_type_check
    check (action_type in ('upload', 'approve', 'reject', 'bookmark', 'download'))
);

alter table public.activity_logs enable row level security;

create policy "Authenticated users can read activity logs"
  on public.activity_logs for select
  to authenticated
  using (true);

create policy "Authenticated users can insert activity logs"
  on public.activity_logs for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 3. Track download + increment counter (secure)
create or replace function public.track_download(p_resource_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  actor text;
begin
  select * into r from public.resources where id = p_resource_id;
  if not found then
    raise exception 'Resource not found';
  end if;

  if not (
    r.status = 'Approved'
    or r.uploader_id = auth.uid()
    or public.is_admin()
  ) then
    raise exception 'Access denied';
  end if;

  update public.resources
  set download_count = download_count + 1,
      last_downloaded_at = now()
  where id = p_resource_id;

  select full_name into actor from public.profiles where id = auth.uid();
  actor := coalesce(actor, 'Someone');

  insert into public.activity_logs (user_id, actor_name, action_type, resource_id, resource_title)
  values (auth.uid(), actor, 'download', p_resource_id, r.title);
end;
$$;

grant execute on function public.track_download(uuid) to authenticated;

-- 4. Helper to log activity from client (validates caller)
create or replace function public.log_activity(
  p_action_type text,
  p_resource_id uuid default null,
  p_resource_title text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor text;
begin
  if p_action_type not in ('upload', 'approve', 'reject', 'bookmark', 'download') then
    raise exception 'Invalid action type';
  end if;

  if p_action_type in ('approve', 'reject') and not public.is_admin() then
    raise exception 'Admin only action';
  end if;

  select full_name into actor from public.profiles where id = auth.uid();
  actor := coalesce(actor, 'Someone');

  insert into public.activity_logs (user_id, actor_name, action_type, resource_id, resource_title)
  values (auth.uid(), actor, p_action_type, p_resource_id, p_resource_title);
end;
$$;

grant execute on function public.log_activity(text, uuid, text) to authenticated;

-- 5. Admins can read all bookmarks (for user management & analytics)
drop policy if exists "Admins can read all bookmarks" on public.bookmarks;

create policy "Admins can read all bookmarks"
  on public.bookmarks for select
  to authenticated
  using (public.is_admin());
