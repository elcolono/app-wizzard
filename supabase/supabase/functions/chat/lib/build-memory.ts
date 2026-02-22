import type { BuildMemory } from "./types.ts";

export const collectIdsFromContent = (
  content: any,
  ids = new Set<string>(),
): Set<string> => {
  if (!Array.isArray(content)) return ids;
  for (const item of content) {
    if (!item || typeof item !== "object") continue;
    const props = (item as any).props ?? {};
    const id =
      typeof (item as any).id === "string"
        ? (item as any).id
        : typeof props.id === "string"
          ? props.id
          : undefined;
    if (id) ids.add(id);
    if (Array.isArray(props.content)) {
      collectIdsFromContent(props.content, ids);
    }
  }
  return ids;
};

const isLikelyGerman = (text: string): boolean =>
  /\b(und|oder|bitte|titel|größe|größer|seite|mach|baue|füge|ändern)\b/i.test(
    text,
  );

export const summarizeAppliedBuild = (
  build: Array<any>,
  description = "",
): BuildMemory => {
  const created: BuildMemory["created"] = [];
  const updatedById = new Map<string, Set<string>>();
  const moved: BuildMemory["moved"] = [];
  const deleted: string[] = [];
  const notes = new Set<string>();

  for (const op of build ?? []) {
    if (!op || typeof op !== "object" || typeof op.op !== "string") continue;

    if (op.op === "reset") {
      notes.add("full_rebuild");
      continue;
    }
    if (op.op === "add") {
      created.push({
        id: typeof op.id === "string" ? op.id : "unknown",
        type: typeof op.type === "string" ? op.type : "unknown",
        zone: typeof op.zone === "string" ? op.zone : "root:default-zone",
      });
      continue;
    }
    if (op.op === "update" && typeof op.id === "string") {
      const keys = Object.keys(op.props ?? {});
      if (keys.length === 0) continue;
      const set = updatedById.get(op.id) ?? new Set<string>();
      for (const key of keys) set.add(key);
      updatedById.set(op.id, set);
      continue;
    }
    if (
      op.op === "move" &&
      typeof op.id === "string" &&
      typeof op.zone === "string" &&
      typeof op.index === "number"
    ) {
      moved.push({ id: op.id, zone: op.zone, index: op.index });
      continue;
    }
    if (op.op === "delete" && typeof op.id === "string") {
      deleted.push(op.id);
    }
  }

  if (
    created.some(
      (c) => /hero/i.test(c.id) || /hero/i.test(c.type) || /hero/i.test(c.zone),
    )
  ) {
    notes.add("hero_section_present");
  }

  if (
    created.length === 0 &&
    moved.length === 0 &&
    deleted.length === 0 &&
    !notes.has("full_rebuild") &&
    updatedById.size > 0
  ) {
    notes.add("local_edit_only");
  }

  const updated = Array.from(updatedById.entries()).map(
    ([id, changedKeySet]) => ({
      id,
      changedKeys: Array.from(changedKeySet).sort(),
    }),
  );
  const appliedOpsCount = (build ?? []).filter(
    (op) => op && typeof op === "object" && typeof op.op === "string",
  ).length;
  if (appliedOpsCount === 0) notes.add("no_changes_applied");

  const german = isLikelyGerman(description);
  const humanSummary =
    appliedOpsCount > 0
      ? german
        ? `Änderungen angewendet: ${created.length} erstellt, ${updated.length} aktualisiert, ${moved.length} verschoben, ${deleted.length} gelöscht.`
        : `Applied changes: ${created.length} created, ${updated.length} updated, ${moved.length} moved, ${deleted.length} deleted.`
      : german
        ? "Keine Änderungen angewendet."
        : "No changes were applied.";

  return {
    appliedOpsCount,
    created,
    updated,
    moved,
    deleted,
    notes: Array.from(notes),
    humanSummary,
  };
};

const asBuildMemory = (value: any): BuildMemory | undefined => {
  if (!value || typeof value !== "object") return undefined;
  if (typeof value.humanSummary !== "string") return undefined;
  if (typeof value.appliedOpsCount !== "number") return undefined;
  return value as BuildMemory;
};

export const extractRecentBuildMemories = (messages: any[] = []): BuildMemory[] => {
  const memories: BuildMemory[] = [];
  for (const m of messages) {
    const parts = Array.isArray(m?.parts) ? m.parts : [];
    for (const p of parts) {
      const candidates = [
        p?.memory,
        p?.output?.memory,
        p?.result?.memory,
        p?.data?.memory,
      ];
      for (const candidate of candidates) {
        const memory = asBuildMemory(candidate);
        if (memory) memories.push(memory);
      }
    }
  }
  return memories.slice(-2);
};

export const formatBuildMemoryContext = (
  memories: BuildMemory[],
): string | undefined => {
  if (!memories.length) return undefined;
  const lines = memories.map((memory, index) => {
    const created = memory.created
      .map((c) => c.id)
      .slice(0, 5)
      .join(", ");
    const updated = memory.updated
      .map((u) => u.id)
      .slice(0, 5)
      .join(", ");
    const deleted = memory.deleted.slice(0, 5).join(", ");
    return `Recent applied changes #${index + 1}: ${memory.humanSummary} created=[${created}] updated=[${updated}] deleted=[${deleted}] notes=[${memory.notes.join(", ")}]`;
  });
  return lines.join("\n");
};
