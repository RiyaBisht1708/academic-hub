-- Phase 3A migration: RBAC + Resource Approval Workflow
-- Run in Supabase SQL Editor (after schema.sql and phase2.sql)

-- 1. Helper: check if current user is Admin (used by RLS policies)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'Admin'
  );
$$;

-- 2. Constrain roles on profiles (column already exists with default 'Student')
alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('Student', 'Admin'));

-- 3. Add approval status to resources
alter table public.resources
  add column if not exists status text not null default 'Pending';

alter table public.resources
  drop constraint if exists resources_status_check;

alter table public.resources
  add constraint resources_status_check
  check (status in ('Pending', 'Approved', 'Rejected'));

-- Backfill: existing uploads stay visible to everyone (run once at migration time)
update public.resources set status = 'Approved';

-- 4. Replace resource RLS policies
drop policy if exists "Authenticated users can read resources" on public.resources;
drop policy if exists "Authenticated users can insert resources" on public.resources;

create policy "Users can read allowed resources"
  on public.resources for select
  to authenticated
  using (
    status = 'Approved'
    or uploader_id = auth.uid()
    or public.is_admin()
  );

create policy "Users can insert own resources as pending"
  on public.resources for insert
  to authenticated
  with check (
    auth.uid() = uploader_id
    and status = 'Pending'
  );

create policy "Admins can update resources"
  on public.resources for update
  to authenticated
  using (public.is_admin());

create policy "Admins can delete resources"
  on public.resources for delete
  to authenticated
  using (public.is_admin());

-- 5. Admin can manage user roles (students can still update own profile via existing policy)
drop policy if exists "Admins can update any profile" on public.profiles;

create policy "Admins can update any profile"
  on public.profiles for update
  to authenticated
  using (public.is_admin());

-- 6. Promote your account to Admin (replace email with yours, run once)
-- update public.profiles set role = 'Admin' where email = 'your-email@example.com';
