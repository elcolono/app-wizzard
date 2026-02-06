// @ts-nocheck
// deno-lint-ignore-file no-explicit-any

export async function executeDdlOperation(
  m: any,
  runSql: (sql: string) => Promise<void>
): Promise<void> {
  console.log("Processing migration:", m);
  
  if (m.operation === "create_table") {
    const cols = Object.entries(m.schema || {})
      .map(([name, def]: [string, any]) => {
        let col = `${name} ${def.type}`;
        if (def.primary_key) col += " PRIMARY KEY";
        if (def.unique) col += " UNIQUE";
        if (!def.nullable) col += " NOT NULL";
        if (def.default) col += ` DEFAULT ${def.default}`;
        return col;
      })
      .join(", ");
    const sql = `create table if not exists ${m.table} (${cols});`;
    console.log("Generated SQL for create_table:", sql);
    await runSql(sql);
  } else if (m.operation === "add_column") {
    const c = m.column || {};
    let col = `${c.name} ${c.type}`;
    if (!c.nullable) col += " NOT NULL";
    if (c.default) col += ` DEFAULT ${c.default}`;
    const sql = `alter table ${m.table} add column if not exists ${col};`;
    console.log("Generated SQL for add_column:", sql);
    await runSql(sql);
  } else if (m.operation === "drop_column") {
    const c = m.column;
    const sql = `alter table ${m.table} drop column if exists ${c};`;
    console.log("Generated SQL for drop_column:", sql);
    await runSql(sql);
  } else if (m.operation === "create_index") {
    const idx = m.index || {};
    const unique = idx.unique ? "unique " : "";
    const name =
      idx.name || `${m.table}_${(idx.columns || []).join("_")}_idx`;
    const cols = (idx.columns || []).join(", ");
    const sql = `create ${unique}index if not exists ${name} on ${m.table} (${cols});`;
    console.log("Generated SQL for create_index:", sql);
    await runSql(sql);
  } else if (m.operation === "drop_table") {
    const sql = `drop table if exists ${m.table} cascade;`;
    console.log("Generated SQL for drop_table:", sql);
    await runSql(sql);
  } else if (m.operation === "alter_table") {
    // Minimal support: raw alter fragments
    for (const change of m.changes || []) {
      const sql = `alter table ${m.table} ${change};`;
      console.log("Generated SQL for alter_table:", sql);
      await runSql(sql);
    }
  }
}

