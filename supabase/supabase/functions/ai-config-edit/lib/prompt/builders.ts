// @ts-nocheck
// deno-lint-ignore-file no-explicit-any

import configSchema from "../../config_schema.json" assert { type: "json" };
import { MAX_PROMPT_TABLES, MAX_PROMPT_COLUMNS, MAX_PROMPT_COMPONENTS, COMPONENT_CATALOG } from "../../config.ts";

export function buildPromptSchema(
  schema: any[] | null,
  instruction: string
): any[] | null {
  if (!Array.isArray(schema)) return null;
  const tokens = new Set(
    (instruction?.toLowerCase().match(/[a-z0-9_]+/g) || []).slice(0, 50)
  );

  const score = (tableName: string) =>
    tokens.has(tableName.toLowerCase()) ? 1 : 0;

  const sorted = [...schema].sort((a: any, b: any) => {
    const sa = score(String(a.table || a.table_name || ""));
    const sb = score(String(b.table || b.table_name || ""));
    return sb - sa;
  });

  const limitedTables = sorted.slice(0, MAX_PROMPT_TABLES);
  return limitedTables.map((t: any) => ({
    table: String(t.table || t.table_name || ""),
    columns: Array.isArray(t.columns)
      ? t.columns.slice(0, MAX_PROMPT_COLUMNS).map((c: any) => ({
          name: String(c.name || c.column_name || ""),
          type: String(c.type || c.data_type || ""),
          nullable: Boolean(c.nullable ?? c.is_nullable === "YES"),
          default: c.default ?? null,
        }))
      : [],
  }));
}

export function buildPromptComponentCatalog(instruction: string): any[] | null {
  if (!Array.isArray(COMPONENT_CATALOG) || COMPONENT_CATALOG.length === 0) {
    return null;
  }

  const tokens = new Set(
    (instruction?.toLowerCase().match(/[a-z0-9_]+/g) || []).slice(0, 50)
  );

  const score = (name: string, category: string) => {
    const loweredName = name.toLowerCase();
    const loweredCat = category.toLowerCase();
    let result = 0;
    if (tokens.has(loweredName)) result += 2;
    if (tokens.has(loweredCat)) result += 1;
    return result;
  };

  const sorted = [...COMPONENT_CATALOG].sort((a: any, b: any) => {
    const sa = score(String(a.type ?? ""), String(a.category ?? ""));
    const sb = score(String(b.type ?? ""), String(b.category ?? ""));
    if (sb !== sa) return sb - sa;
    return String(a.type ?? "").localeCompare(String(b.type ?? ""));
  });

  return sorted.slice(0, MAX_PROMPT_COMPONENTS).map((entry) => ({
    type: entry.type,
    category: entry.category,
    description: entry.description,
    props: entry.props ?? {},
    supportsChildren: Boolean(entry.supportsChildren),
    dataBindings: Array.isArray(entry.dataBindings) ? entry.dataBindings : [],
  }));
}

export function buildPromptConfigSchemaSlice(): any {
  // TODO: Later optimize by extracting only relevant schema parts
  // (pages, DataBinding, ComponentConfig, Action) to reduce token usage
  // For now, send the complete schema for maximum accuracy
  try {
    return configSchema;
  } catch (_e) {
    console.error("Failed to load config schema:", _e);
    return null;
  }
}

