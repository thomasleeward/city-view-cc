-- City View Community Church initial Supabase schema
-- Run in the Supabase SQL editor after creating a project.

create extension if not exists "pgcrypto";

create type public.profile_role as enum ('admin');
create type public.assessment_type as enum ('disc', 'spiritual_gifts');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role public.profile_role not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sermon_series (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date_label text not null,
  start_date date not null,
  end_date date,
  image_url text,
  youtube_playlist_url text not null,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  -- Text/CTA for the homepage hero lives in site_settings.homepage_hero.
  -- These legacy text columns are kept for future slide-specific variants.
  headline text not null,
  subheadline text,
  image_url text,
  video_url text,
  cta_label text,
  cta_href text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assessment_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  assessment_type public.assessment_type not null,
  answers jsonb not null default '{}'::jsonb,
  scores jsonb not null default '{}'::jsonb,
  primary_result text not null,
  secondary_results text[] not null default '{}'::text[],
  pco_person_id text,
  pco_synced_at timestamptz,
  pco_sync_status text,
  pco_sync_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.site_settings (key, value)
values (
  'homepage_hero',
  jsonb_build_object(
    'eyebrow', 'City View Community Church',
    'headline', 'Sundays at 8:30AM & 10:30AM',
    'subheadline', 'We want Sunday to influence your Monday.',
    'ctaLabel', 'Plan Your Visit',
    'ctaHref', '/get-connected'
  )
)
on conflict (key) do nothing;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger sermon_series_updated_at
before update on public.sermon_series
for each row execute function public.set_updated_at();

create trigger hero_slides_updated_at
before update on public.hero_slides
for each row execute function public.set_updated_at();

create trigger site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

create trigger assessment_submissions_updated_at
before update on public.assessment_submissions
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'admin'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.sermon_series enable row level security;
alter table public.hero_slides enable row level security;
alter table public.site_settings enable row level security;
alter table public.assessment_submissions enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "Admins can read profiles"
on public.profiles for select
to authenticated
using (public.is_admin());

create policy "Public can read published sermon series"
on public.sermon_series for select
to anon, authenticated
using (is_published = true);

create policy "Admins can manage sermon series"
on public.sermon_series for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read active hero slides"
on public.hero_slides for select
to anon, authenticated
using (is_active = true);

create policy "Admins can manage hero slides"
on public.hero_slides for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read site settings"
on public.site_settings for select
to anon, authenticated
using (true);

create policy "Admins can manage site settings"
on public.site_settings for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage assessment submissions"
on public.assessment_submissions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public)
values
  ('sermon-images', 'sermon-images', true),
  ('hero-images', 'hero-images', true),
  ('site-images', 'site-images', true)
on conflict (id) do nothing;

create policy "Public can read sermon images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'sermon-images');

create policy "Admins can upload sermon images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'sermon-images' and public.is_admin());

create policy "Public can read hero images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'hero-images');

create policy "Admins can upload hero images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'hero-images' and public.is_admin());

create policy "Public can read site images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'site-images');

create policy "Admins can upload site images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'site-images' and public.is_admin());

-- Assessment submissions are created through a server action using the service
-- role key so public visitors cannot read or query saved results directly.
