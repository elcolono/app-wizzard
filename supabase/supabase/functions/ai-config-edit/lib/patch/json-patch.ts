// @ts-nocheck
// deno-lint-ignore-file no-explicit-any

// Minimal JSON Pointer resolver
export function getByPointer(
  root: any,
  pointer: string
): { parent: any; key: string | number } {
  if (pointer === "" || pointer === "/")
    return { parent: { "": root }, key: "" } as any;
  const parts = pointer
    .split("/")
    .slice(1)
    .map((p) => p.replace(/~1/g, "/").replace(/~0/g, "~"));

  let parent: any = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const seg = parts[i];
    parent = parent?.[seg];
    if (parent === undefined) break;
  }
  const key = parts[parts.length - 1];
  return { parent, key };
}

export function applyJsonPatch(doc: any, patch: any[]): any {
  // Supports only add/replace/remove
  const clone = structuredClone(doc);
  for (const op of patch) {
    if (!op || typeof op !== "object") throw new Error("Invalid patch op");

    // Support both old format (op) and new format (operation)
    const kind = op.operation || op.op;
    const path = op.path;

    if (!kind || typeof kind !== "string")
      throw new Error("Patch missing operation");
    if (!path || typeof path !== "string")
      throw new Error("Patch missing path");

    const { parent, key } = getByPointer(clone, path);
    if (parent === undefined) throw new Error("Path not found: " + path);

    if (kind === "remove") {
      if (Array.isArray(parent)) {
        const idx = Number(key);
        if (Number.isNaN(idx))
          throw new Error("Invalid array index at " + path);
        parent.splice(idx, 1);
      } else {
        delete parent[key as any];
      }
    } else if (kind === "replace") {
      (parent as any)[key as any] = op.value;
    } else if (kind === "add") {
      if (Array.isArray(parent)) {
        const idx = key === "-" ? parent.length : Number(key);
        if (key !== "-" && Number.isNaN(Number(key)))
          throw new Error("Invalid array index at " + path);
        parent.splice(idx, 0, op.value);
      } else {
        (parent as any)[key as any] = op.value;
      }
    } else {
      throw new Error("Unsupported operation: " + kind);
    }
  }
  return clone;
}
