-- Create apps and apps_credentials tables with RLS
-- Each user can create multiple apps, each with its own Supabase project

-- Enable extensions if not already enabled
create extension if not exists "pgcrypto";

-- 1) Apps table (non-sensitive data)
create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  image text,
  app_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.apps enable row level security;

-- RLS Policies for apps table
-- Users can only see their own apps
create policy "apps_select_owner" on public.apps
  for select using (auth.uid() = user_id);

-- Users can create new apps
create policy "apps_insert_owner" on public.apps
  for insert with check (auth.uid() = user_id);

-- Users can update their own apps
create policy "apps_update_owner" on public.apps
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Users can delete their own apps
create policy "apps_delete_owner" on public.apps
  for delete using (auth.uid() = user_id);

-- Trigger for updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_apps_updated_at on public.apps;
create trigger trg_apps_updated_at
before update on public.apps
for each row execute function public.set_updated_at();

-- 2) Apps credentials table (sensitive data - separate for security)
create table if not exists public.apps_credentials (
  app_id uuid primary key references public.apps(id) on delete cascade,
  supabase_url text not null,
  supabase_anon_key text not null,
  supabase_service_key text not null, -- SENSITIVE - never expose to clients
  project_ref text not null, -- Supabase project reference
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.apps_credentials enable row level security;

-- RLS Policies for apps_credentials table
-- NO access for regular users - credentials are sensitive
create policy "apps_credentials_no_access" on public.apps_credentials
  for all using (false) with check (false);

-- Note: Service role (Edge Functions) bypasses RLS automatically

-- Indexes for performance
create index if not exists idx_apps_user_id on public.apps(user_id);
create index if not exists idx_apps_created_at on public.apps(created_at desc);
create index if not exists idx_apps_credentials_app_id on public.apps_credentials(app_id);

-- Optional: View for admin purposes (if needed)
-- create view public.apps_overview as
-- select 
--   a.id,
--   a.user_id,
--   a.title,
--   a.description,
--   a.image,
--   a.created_at,
--   a.updated_at,
--   ac.project_ref,
--   ac.supabase_url
-- from public.apps a
-- left join public.apps_credentials ac on ac.app_id = a.id;

-- Grant permissions
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.apps to authenticated;
grant select, insert, update, delete on public.apps_credentials to service_role;
