-- Create table to cache per-app database schema snapshots
create table if not exists public.app_schema_cache (
  app_id uuid primary key references public.apps(id) on delete cascade,
  schema jsonb not null,
  schema_hash text,
  refreshed_at timestamptz not null default now()
);

create index if not exists app_schema_cache_refreshed_at_idx on public.app_schema_cache (refreshed_at desc);

-- Enable RLS; service role bypasses RLS; we add a conservative read policy for owners if needed later
alter table public.app_schema_cache enable row level security;

-- Optional: allow authenticated users to read their own cache via RLS (owner based on apps.user_id)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'app_schema_cache' and policyname = 'read_own_app_schema_cache'
  ) then
    create policy read_own_app_schema_cache on public.app_schema_cache
      for select to authenticated
      using (
        exists (
          select 1 from public.apps a
          where a.id = app_schema_cache.app_id
            and a.user_id = auth.uid()
        )
      );
  end if;
end $$;


