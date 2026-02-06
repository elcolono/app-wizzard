// @ts-nocheck
// deno-lint-ignore-file no-explicit-any

export async function ensureSchemaSnapshotRpc(target: any) {
  // Try a lightweight call first; if missing, create it via DDL-only execute_sql
  const tryFetch = async () => {
    const { data, error } = await target.rpc("get_schema_snapshot");
    return { data, error } as { data: any; error: any };
  };

  let { data, error } = await tryFetch();
  if (!error) return true;

  // Create function using DDL-only executor
  const ddl = `
create or replace function public.get_schema_snapshot()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_agg(t order by t->>'table')
  from (
    select json_build_object(
      'table', c.table_name,
      'columns', json_agg(
        json_build_object(
          'name', c.column_name,
          'type', c.data_type,
          'nullable', (c.is_nullable = 'YES'),
          'default', c.column_default
        ) order by c.ordinal_position
      )
    ) as t
    from information_schema.columns c
    where c.table_schema = 'public'
    group by c.table_name
  ) s;
$$;

revoke all on function public.get_schema_snapshot() from public, anon, authenticated;
grant execute on function public.get_schema_snapshot() to service_role;`;

  const { error: ddlError } = await target.rpc("execute_sql", { sql: ddl });
  if (ddlError) {
    console.error("Failed to create get_schema_snapshot():", ddlError);
    return false;
  }

  ({ data, error } = await tryFetch());
  return !error;
}

export async function fetchSchemaSnapshot(target: any): Promise<any[] | null> {
  const { data, error } = await target.rpc("get_schema_snapshot");
  if (error) {
    console.error("get_schema_snapshot error:", error);
    return null;
  }
  return Array.isArray(data) ? data : data ?? null;
}

