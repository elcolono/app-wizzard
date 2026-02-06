// @ts-nocheck
// deno-lint-ignore-file no-explicit-any

export type ComponentReference = {
  componentId: string;
  componentType: string;
  componentPath: string;
  pageId: string;
  layoutId?: string;
};

export type RequestBody = {
  appId?: string;
  instruction?: string;
  pageId?: string;
  componentReference?: ComponentReference;
};

// JSON Patch Operations
export type JsonPatchOperation = "add" | "replace" | "remove";

export type PatchOp = {
  type: "patch";
  operation: JsonPatchOperation;
  path: string;
  value?: any;
};

// Migration Operations
export type MigrationOperation =
  | "create_table"
  | "add_column"
  | "drop_column"
  | "alter_table"
  | "create_index"
  | "drop_table"
  | "seed_rows";

export type MigrationOp = {
  type: "migration";
  operation: MigrationOperation;
  table: string;
  schema?: Record<string, any>;
  column?: any;
  index?: any;
  changes?: string[];
  rows?: any[];
  mode?: "insert" | "upsert";
  onConflict?: string;
  max_rows?: number;
};

// Union type for all AI operations
export type AIOperation = PatchOp | MigrationOp;
