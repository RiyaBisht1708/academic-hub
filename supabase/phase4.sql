-- Phase 4 migration: Ratings, Reviews, Versioning
-- Run in Supabase SQL Editor (after phase3b.sql)

-- 1. Extend resources with rating + version metadata
alter table public.resources
  add column if not exists current_version integer not null default 1;

alter table public.resources
  add column if not exists average_rating numeric(3, 2) not null default 0;

alter table public.resources
  add column if not exists review_count integer not null default 0;

-- 2. Reviews table
create table if not exists public.resource_reviews (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid references public.resources on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  reviewer_name text not null,
  rating integer not null,
  comment text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resource_reviews_rating_check check (rating >= 1 and rating <= 5),
  unique (resource_id, user_id)
);

-- 3. Version history table
create table if not exists public.resource_versions (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid references public.resources on delete cascade not null,
  version_number integer not null,
  file_url text not null,
  uploader text not null,
  uploader_id uuid references auth.users not null,
  created_at timestamptz not null default now(),
  unique (resource_id, version_number)
);

-- 4. Backfill version 1 for existing resources
insert into public.resource_versions (resource_id, version_number, file_url, uploader, uploader_id, created_at)
select id, 1, file_url, uploader, uploader_id, created_at
from public.resources
on conflict (resource_id, version_number) do nothing;

-- 5. Keep rating stats in sync
create or replace function public.refresh_resource_rating(p_resource_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.resources
  set
    average_rating = coalesce(
      (select round(avg(rating)::numeric, 2) from public.resource_reviews where resource_id = p_resource_id),
      0
    ),
    review_count = (select count(*)::integer from public.resource_reviews where resource_id = p_resource_id)
  where id = p_resource_id;
end;
$$;

create or replace function public.trigger_refresh_resource_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_resource_rating(coalesce(new.resource_id, old.resource_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_refresh_resource_rating on public.resource_reviews;

create trigger trg_refresh_resource_rating
after insert or update or delete on public.resource_reviews
for each row execute function public.trigger_refresh_resource_rating();

-- 6. RLS
alter table public.resource_reviews enable row level security;
alter table public.resource_versions enable row level security;

drop policy if exists "Users can read reviews for visible resources" on public.resource_reviews;
drop policy if exists "Users can insert own reviews on approved resources" on public.resource_reviews;
drop policy if exists "Users can update own reviews" on public.resource_reviews;
drop policy if exists "Users or admins can delete reviews" on public.resource_reviews;

create policy "Users can read reviews for visible resources"
  on public.resource_reviews for select
  to authenticated
  using (
    exists (
      select 1 from public.resources r
      where r.id = resource_id
      and (
        r.status = 'Approved'
        or r.uploader_id = auth.uid()
        or public.is_admin()
      )
    )
  );

create policy "Users can insert own reviews on approved resources"
  on public.resource_reviews for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.resources r
      where r.id = resource_id and r.status = 'Approved'
    )
  );

create policy "Users can update own reviews"
  on public.resource_reviews for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users or admins can delete reviews"
  on public.resource_reviews for delete
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can read versions for visible resources" on public.resource_versions;
drop policy if exists "Uploaders can insert versions" on public.resource_versions;

create policy "Users can read versions for visible resources"
  on public.resource_versions for select
  to authenticated
  using (
    exists (
      select 1 from public.resources r
      where r.id = resource_id
      and (
        r.status = 'Approved'
        or r.uploader_id = auth.uid()
        or public.is_admin()
      )
    )
  );

create policy "Uploaders can insert versions"
  on public.resource_versions for insert
  to authenticated
  with check (
    exists (
      select 1 from public.resources r
      where r.id = resource_id
      and (r.uploader_id = auth.uid() or public.is_admin())
    )
  );

-- 7. Allow uploaders to update own resources (for new version file_url)
drop policy if exists "Uploaders can update own resources" on public.resources;

create policy "Uploaders can update own resources"
  on public.resources for update
  to authenticated
  using (uploader_id = auth.uid())
  with check (uploader_id = auth.uid());
