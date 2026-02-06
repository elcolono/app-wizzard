// @ts-nocheck
// deno-lint-ignore-file no-explicit-any

import { attachDummyImages } from "../utils/helpers.ts";

// Helper to escape SQL string values
function escapeSqlValue(val: any): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "string") {
    // Escape single quotes by doubling them
    return `'${val.replace(/'/g, "''")}'`;
  }
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  if (typeof val === "number") return String(val);
  // For other types, convert to string and escape
  return `'${String(val).replace(/'/g, "''")}'`;
}

export async function executeSeedOperation(
  s: any,
  runSql: (sql: string) => Promise<void>
): Promise<number> {
  const table = String(s.table);
  // Validate table name (basic SQL injection prevention)
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
    throw new Error(`Invalid table name: ${table}`);
  }

  const rowsRaw = Array.isArray(s.rows) ? s.rows.slice(0, 10) : [];
  if (!table || rowsRaw.length === 0) {
    throw new Error("seed_rows requires non-empty table and rows (max 10)");
  }
  const rows = attachDummyImages(rowsRaw, table);
  const mode = s.mode === "insert" ? "insert" : "upsert";
  const onConflict = typeof s.onConflict === "string" ? s.onConflict : undefined;

  if (rows.length === 0) return 0;

  // Get columns from first row
  const columns = Object.keys(rows[0]);
  if (columns.length === 0) {
    throw new Error("No columns found in seed rows");
  }

  // Validate column names
  for (const col of columns) {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col)) {
      throw new Error(`Invalid column name: ${col}`);
    }
  }

  const quotedColumns = columns.map((col) => `"${col}"`).join(", ");

  // Build VALUES clauses
  const valuesList = rows.map((row: any) => {
    const values = columns.map((col) => escapeSqlValue(row[col]));
    return `(${values.join(", ")})`;
  });

  if (mode === "insert") {
    // Simple INSERT
    const sql = `INSERT INTO ${table} (${quotedColumns}) VALUES ${valuesList.join(", ")};`;
    console.log(`Executing INSERT SQL for ${table}:`, sql.substring(0, 200) + "...");
    await runSql(sql);
  } else {
    // UPSERT using ON CONFLICT
    let conflictCol = onConflict;

    // If onConflict is specified but not in columns, try to find a suitable column
    if (conflictCol && !columns.includes(conflictCol)) {
      console.warn(
        `Conflict column '${conflictCol}' not found in row columns, falling back to first column: ${columns[0]}`
      );
      conflictCol = columns[0];
    }

    // If still no valid column, fallback to first column
    if (!conflictCol) {
      conflictCol = columns[0];
    }

    // Verify the conflict column exists (should always be true now)
    if (!columns.includes(conflictCol)) {
      throw new Error(
        `Cannot determine conflict column. Available columns: ${columns.join(", ")}`
      );
    }

    const updateSet = columns
      .filter((col) => col !== conflictCol)
      .map((col) => `"${col}" = EXCLUDED."${col}"`)
      .join(", ");

    const upsertSql = `INSERT INTO ${table} (${quotedColumns}) VALUES ${valuesList.join(", ")} ON CONFLICT ("${conflictCol}") DO UPDATE SET ${updateSet};`;

    try {
      console.log(
        `Executing UPSERT SQL for ${table} (onConflict: ${conflictCol}):`,
        upsertSql.substring(0, 200) + "..."
      );
      await runSql(upsertSql);
    } catch (upsertError: any) {
      // If UPSERT fails due to missing unique constraint, fallback to INSERT
      if (
        upsertError?.code === "42P10" ||
        upsertError?.message?.includes("no unique or exclusion constraint")
      ) {
        console.warn(
          `UPSERT failed: column '${conflictCol}' has no unique constraint. Falling back to INSERT.`
        );
        const insertSql = `INSERT INTO ${table} (${quotedColumns}) VALUES ${valuesList.join(", ")};`;
        console.log(
          `Executing INSERT SQL for ${table} (fallback from UPSERT):`,
          insertSql.substring(0, 200) + "..."
        );
        await runSql(insertSql);
      } else {
        // Re-throw if it's a different error
        throw upsertError;
      }
    }
  }

  return rows.length;
}

