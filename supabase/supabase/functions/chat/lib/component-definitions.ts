export const createComponentNameLookup = (components: any): Map<string, string> => {
  const lookup = new Map<string, string>();
  if (!components || typeof components !== "object") return lookup;
  for (const name of Object.keys(components)) {
    if (typeof name === "string" && name.length > 0) {
      lookup.set(name.toLowerCase(), name);
    }
  }
  return lookup;
};

export const parseComponentQuery = (
  query: unknown,
  lookup: Map<string, string>,
): { names: string[]; missing: string[] } => {
  const rawQuery = typeof query === "string" ? query : "";
  const parts = rawQuery
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  const names: string[] = [];
  const missing: string[] = [];
  const seenRequested = new Set<string>();
  const seenResolved = new Set<string>();

  for (const part of parts) {
    const requestedKey = part.toLowerCase();
    if (seenRequested.has(requestedKey)) continue;
    seenRequested.add(requestedKey);

    const resolved = lookup.get(requestedKey);
    if (!resolved) {
      missing.push(part);
      continue;
    }
    if (seenResolved.has(resolved)) continue;
    seenResolved.add(resolved);
    names.push(resolved);
  }

  return { names, missing };
};

export const pickComponentDefinitions = (
  components: any,
  names: string[],
): Record<string, unknown> => {
  const selected: Record<string, unknown> = {};
  if (!components || typeof components !== "object") return selected;
  for (const name of names) {
    if (!(name in components)) continue;
    selected[name] = components[name];
  }
  return selected;
};
