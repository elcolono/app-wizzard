-- Add versioned app configs with history support
-- Migration: 20251001170000 (after 20251001164450_update_apps_credentials_rls.sql)

-- 1) Versionstabelle (append-only)
create table if not exists public.app_configs (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  version int not null,
  data jsonb not null default '{}'::jsonb,
  message text, -- optional: Commit-Message/Kommentar
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  unique (app_id, version)
);

-- 2) Pointer-Tabelle für aktive Version
create table if not exists public.app_config_pointers (
  app_id uuid primary key references public.apps(id) on delete cascade,
  version int not null,
  updated_by uuid not null default auth.uid(),
  updated_at timestamptz not null default now()
);

-- 3) RLS
alter table public.app_configs enable row level security;
alter table public.app_config_pointers enable row level security;

-- App-Besitzer darf lesen (alle Versionen) und neue Versionen anlegen (append-only)
create policy "app_configs_select_owner" on public.app_configs
  for select using (
    exists (select 1 from public.apps a where a.id = app_configs.app_id and a.user_id = auth.uid())
  );

create policy "app_configs_insert_owner" on public.app_configs
  for insert with check (
    exists (select 1 from public.apps a where a.id = app_configs.app_id and a.user_id = auth.uid())
  );

-- Updates/Deletes unterbinden (immutabel)
create policy "app_configs_no_update" on public.app_configs
  for update using (false) with check (false);
create policy "app_configs_no_delete" on public.app_configs
  for delete using (false);

-- Pointer: Besitzer darf lesen/schreiben
create policy "pointers_select_owner" on public.app_config_pointers
  for select using (
    exists (select 1 from public.apps a where a.id = app_config_pointers.app_id and a.user_id = auth.uid())
  );

create policy "pointers_upsert_owner" on public.app_config_pointers
  for insert with check (
    exists (select 1 from public.apps a where a.id = app_config_pointers.app_id and a.user_id = auth.uid())
  );

create policy "pointers_update_owner" on public.app_config_pointers
  for update using (
    exists (select 1 from public.apps a where a.id = app_config_pointers.app_id and a.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.apps a where a.id = app_config_pointers.app_id and a.user_id = auth.uid())
  );

-- 4) Indizes
create index if not exists idx_app_configs_app_id_version_desc on public.app_configs(app_id, version desc);
create index if not exists idx_app_configs_created_at on public.app_configs(created_at desc);

-- 5) Helper-Funktion für nächste Version
create or replace function public.next_app_config_version(p_app_id uuid)
returns int language sql stable as $$
  select coalesce(max(version), 0) + 1 from public.app_configs where app_id = p_app_id;
$$;

-- 6) View für "aktuelle" Config:
--    Nimmt den Pointer, wenn vorhanden; sonst die höchste Version
create or replace view public.apps_with_active_config as
select
  a.id,
  a.user_id,
  a.title,
  a.description,
  a.image,
  a.created_at,
  a.updated_at,
  coalesce(p.version, (
    select max(c.version) from public.app_configs c where c.app_id = a.id
  )) as active_version,
  (
    select c.data from public.app_configs c
    where c.app_id = a.id
    order by c.version desc
    limit 1
  ) as latest_config,
  (
    select c2.data from public.app_configs c2
    where c2.app_id = a.id
      and c2.version = coalesce(p.version, (
        select max(c3.version) from public.app_configs c3 where c3.app_id = a.id
      ))
    limit 1
  ) as app_config
from public.apps a
left join public.app_config_pointers p on p.app_id = a.id;

-- 7) Backfill: bestehende apps.app_config -> app_configs v1 + Pointer
--    Nur falls Spalte existiert und Daten hat
do $$
declare r record;
begin
  for r in
    select id, app_config from public.apps
    where app_config is not null and app_config::text <> '{}'::text
  loop
    insert into public.app_configs (app_id, version, data, message, created_by)
    values (r.id, 1, r.app_config, 'initial import', 
            coalesce(auth.uid(), (select user_id from public.apps where id = r.id)));

    insert into public.app_config_pointers (app_id, version, updated_by)
    values (r.id, 1, coalesce(auth.uid(), (select user_id from public.apps where id = r.id)))
    on conflict (app_id) do nothing;
  end loop;
end$$;

-- Grant permissions
grant select on public.app_configs to authenticated;
grant insert on public.app_configs to authenticated;
grant select on public.app_config_pointers to authenticated;
grant insert, update on public.app_config_pointers to authenticated;
grant select on public.apps_with_active_config to authenticated;
