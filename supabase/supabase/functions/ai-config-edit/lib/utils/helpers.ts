// @ts-nocheck
// deno-lint-ignore-file no-explicit-any

export function toSlug(value: any): string {
  const s = String(value ?? "").toLowerCase();
  return s.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "item";
}

export function attachDummyImages(rows: any[], table: string): any[] {
  const tableSlug = toSlug(table);
  const imageLikeKeys = (key: string) =>
    /image_url$/.test(key) ||
    /thumbnail_url$/.test(key) ||
    /^image$/.test(key) ||
    /^thumbnail$/.test(key) ||
    /cover_image$/.test(key) ||
    /avatar_url$/.test(key);

  return rows.map((row, idx) => {
    const seedSource = row.slug ?? row.name ?? row.title ?? row.id ?? idx;
    const seed = `${tableSlug}-${toSlug(seedSource)}`;
    const placeholder = `https://picsum.photos/seed/${seed}/600/400`;
    const next = { ...row } as Record<string, any>;
    for (const k of Object.keys(next)) {
      if (imageLikeKeys(k)) {
        const val = next[k];
        if (val == null || val === "" || typeof val !== "string") {
          next[k] = placeholder;
        }
      }
    }
    return next;
  });
}

