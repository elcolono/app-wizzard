create table if not exists public.ai_tool_calls (
  id text primary key,
  created_at timestamptz not null default now(),
  messages jsonb not null,
  tools jsonb not null,
  tool_name text not null,
  tool_args jsonb
);

create index if not exists ai_tool_calls_created_at_idx
  on public.ai_tool_calls (created_at);

alter table public.ai_tool_calls enable row level security;

create policy "ai_tool_calls_no_access"
  on public.ai_tool_calls
  for all
  using (false)
  with check (false);
