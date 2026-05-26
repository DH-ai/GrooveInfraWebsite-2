-- ============================================================================
-- Groove Infra: projects table + storage bucket
-- Run this once in your Supabase project (SQL editor → New query → Run).
-- ============================================================================

-- 1) Table -------------------------------------------------------------------
create table if not exists public.projects (
  id                bigserial primary key,
  slug              text not null unique,
  title             text not null,
  category          text not null check (category in ('commercial','retail','residential','civil')),
  location          text not null,
  client_name       text not null,
  testimonial       text,
  basic_description text,
  description       text not null,
  year              integer,
  area              text,
  duration          text,
  featured          boolean default false,
  highlight         text,
  tags              text[],
  cover_image       text,
  images            text[] default '{}',
  logo              text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists projects_category_idx on public.projects (category);
create index if not exists projects_featured_idx on public.projects (featured);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- 2) RLS ---------------------------------------------------------------------
-- Reads happen from the server using either the anon or service-role key.
-- Writes happen only from the server using the service-role key (bypasses RLS).
alter table public.projects enable row level security;

drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read"
  on public.projects
  for select
  to anon, authenticated
  using (true);

-- 3) Storage bucket ----------------------------------------------------------
-- Create the bucket as public so the public URLs work directly in <Image>.
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do update set public = excluded.public;

-- Allow public read of objects in the bucket
drop policy if exists "project_images_public_read" on storage.objects;
create policy "project_images_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'project-images');

-- Writes/deletes are done with the service-role key from the API routes,
-- which bypasses RLS — no extra storage policies needed for that path.
