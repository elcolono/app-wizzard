// app/api/puck/[...all]/route.ts

import { puckHandler, tool } from "@puckeditor/cloud-client";
import { z } from "zod";

const HEADING_SIZE_ORDER = [
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "5xl",
];

type PageComponent = {
  type?: string;
  id?: string;
  props?: Record<string, any>;
};

type BuildMemory = {
  appliedOpsCount: number;
  created: Array<{ id: string; type: string; zone: string }>;
  updated: Array<{ id: string; changedKeys: string[] }>;
  moved: Array<{ id: string; zone: string; index: number }>;
  deleted: string[];
  notes: string[];
  humanSummary: string;
};

function collectComponents(
  content: any,
  acc: PageComponent[] = [],
): PageComponent[] {
  if (!Array.isArray(content)) return acc;
  for (const item of content) {
    if (!item || typeof item !== "object") continue;
    const props = (item as any).props ?? {};
    const id =
      typeof (item as any).id === "string"
        ? (item as any).id
        : typeof props.id === "string"
          ? props.id
          : undefined;
    acc.push({ type: (item as any).type, id, props });
    if (Array.isArray(props.content)) {
      collectComponents(props.content, acc);
    }
  }
  return acc;
}

function isIncreaseIntent(text: string): boolean {
  return /(vergr(?:ö|oe)ß|gr(?:ö|oe)ßer|bigger|larger|increase|enlarge)/i.test(
    text,
  );
}

function getNextHeadingSize(current?: string): string | undefined {
  if (!current) return undefined;
  const index = HEADING_SIZE_ORDER.indexOf(current);
  if (index === -1 || index >= HEADING_SIZE_ORDER.length - 1) return undefined;
  return HEADING_SIZE_ORDER[index + 1];
}

function normalizeUpdateBuild(
  build: Array<any>,
  description: string,
  pageData: any,
): Array<any> {
  const components = collectComponents(pageData?.content);
  const byId = new Map<string, PageComponent>();
  for (const c of components) {
    if (c.id) byId.set(c.id, c);
  }

  const increaseIntent = isIncreaseIntent(description ?? "");
  const teamHeading = components.find(
    (c) =>
      c.type === "Heading" &&
      typeof c.props?.title === "string" &&
      /team/i.test(c.props.title),
  );

  const normalized: any[] = [];

  for (const op of build ?? []) {
    if (!op || typeof op !== "object") continue;
    if (op.op !== "update") {
      normalized.push(op);
      continue;
    }

    const nextOp: any = { ...op, props: { ...(op.props ?? {}) } };
    const hasId = typeof nextOp.id === "string" && byId.has(nextOp.id);
    if (!hasId && typeof nextOp.id === "string" && /team/i.test(nextOp.id)) {
      if (teamHeading?.id) nextOp.id = teamHeading.id;
    }

    const existing =
      typeof nextOp.id === "string" ? byId.get(nextOp.id) : undefined;
    if (!existing) continue;

    if (Object.prototype.hasOwnProperty.call(nextOp.props, "size")) {
      const rawSize = nextOp.props.size;
      const currentSize =
        typeof existing.props?.size === "string"
          ? existing.props.size
          : undefined;

      if (typeof rawSize === "string" && rawSize.trim() === "") {
        delete nextOp.props.size;
      }

      const requestedSize =
        typeof nextOp.props.size === "string" ? nextOp.props.size : undefined;
      if (
        increaseIntent &&
        existing.type === "Heading" &&
        currentSize &&
        (!requestedSize ||
          requestedSize === currentSize ||
          !HEADING_SIZE_ORDER.includes(requestedSize))
      ) {
        const nextSize = getNextHeadingSize(currentSize);
        if (nextSize) nextOp.props.size = nextSize;
      }
    }

    if (Object.keys(nextOp.props ?? {}).length === 0) continue;
    normalized.push(nextOp);
  }

  return normalized;
}

function isLikelyGerman(text: string): boolean {
  if (!text) return false;
  return /\b(und|oder|bitte|titel|größe|größer|seite|mach|baue|füge|ändern)\b/i.test(
    text,
  );
}

function summarizeAppliedBuild(
  build: Array<any>,
  description: string,
): BuildMemory {
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
      (c) =>
        /hero/i.test(c.id) || /hero/i.test(c.type) || /hero/i.test(c.zone),
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
  let humanSummary = german
    ? "Keine Änderungen angewendet."
    : "No changes were applied.";
  if (appliedOpsCount > 0) {
    humanSummary = german
      ? `Änderungen angewendet: ${created.length} erstellt, ${updated.length} aktualisiert, ${moved.length} verschoben, ${deleted.length} gelöscht.`
      : `Applied changes: ${created.length} created, ${updated.length} updated, ${moved.length} moved, ${deleted.length} deleted.`;
  }

  return {
    appliedOpsCount,
    created,
    updated,
    moved,
    deleted,
    notes: Array.from(notes),
    humanSummary,
  };
}

// Das atomare Schema für die Operationen (Bleibt gleich)
const BuildOperationSchema = z.discriminatedUnion("op", [
  z.object({
    op: z
      .literal("reset")
      .describe("Clear the current page before rebuilding."),
  }),
  z.object({
    op: z.literal("updateRoot").describe("Update root-level page metadata."),
    props: z
      .record(z.string(), z.any())
      .describe("Root props to merge, e.g. page title or subtitle."),
  }),
  z.object({
    op: z.literal("add").describe("Insert a new component instance."),
    type: z
      .string()
      .describe("Component type key from the component library, e.g. Heading."),
    id: z
      .string()
      .describe("Unique component id (prefer UUID-based ids for stability)."),
    props: z
      .record(z.string(), z.any())
      .default({})
      .describe(
        "Initial props for add. Only set content: [] if the component has a content slot. All other props must be sent via update.",
      ),
    index: z
      .number()
      .describe("Zero-based position of the component inside the target zone."),
    zone: z
      .string()
      .describe(
        "Target zone in parentId:slot format, e.g. root:default-zone or hero-container-1:content",
      ),
  }),
  z.object({
    op: z.literal("update").describe("Update props of an existing component."),
    id: z.string().describe("Id of the component to update."),
    props: z
      .record(z.string(), z.any())
      .describe("Partial props to merge into the existing component."),
  }),
  z.object({
    op: z
      .literal("move")
      .describe("Move an existing component to a new place."),
    id: z.string().describe("Id of the component to move."),
    index: z
      .number()
      .describe("Zero-based destination index inside the target zone."),
    zone: z.string().describe("Destination zone in parentId:slot format."),
  }),
  z.object({
    op: z.literal("delete").describe("Remove an existing component."),
    id: z.string().describe("Id of the component to delete."),
  }),
]);

const updatePageInputSchema = z.object({
  description: z
    .string()
    .describe("A brief description of what is being changed or built."),
  resetConfirmed: z
    .boolean()
    .default(false)
    .describe(
      "Must be true only after the user explicitly confirmed a reset/rebuild.",
    ),
  build: z
    .array(BuildOperationSchema)
    .default([])
    .describe("The sequence of atomic operations to execute."),
});

const updatePageOutputSchema = z.object({
  build: z
    .array(BuildOperationSchema)
    .describe("The resolved operations that were applied."),
  status: z.object({
    loading: z.boolean().describe("Whether the page is still being processed."),
    label: z.string().describe("Human-friendly status text."),
  }),
  memory: z.object({
    appliedOpsCount: z.number(),
    created: z.array(
      z.object({
        id: z.string(),
        type: z.string(),
        zone: z.string(),
      }),
    ),
    updated: z.array(
      z.object({
        id: z.string(),
        changedKeys: z.array(z.string()),
      }),
    ),
    moved: z.array(
      z.object({
        id: z.string(),
        zone: z.string(),
        index: z.number(),
      }),
    ),
    deleted: z.array(z.string()),
    notes: z.array(z.string()),
    humanSummary: z.string(),
  }),
});

export const POST = async (request: Request) => {
  // 1. Request klonen, um den Body für uns UND den puckHandler nutzbar zu machen
  const clonedRequest = request.clone();
  const body = await clonedRequest.json();
  const { config, pageData } = body;

  // 2. Den Kontext für die KI vorbereiten
  // Wir geben ihr die Kategorien und die exakte Definition der Komponentenfelder
  const componentDefinitions = JSON.stringify(
    config?.components || {},
    null,
    2,
  );
  const categories = JSON.stringify(config?.categories || {}, null, 2);

  return puckHandler(request, {
    host: process.env.SUPABASE_URL,
    apiKey: process.env.SUPABASE_ANON_KEY,
    ai: {
      context: `You are an expert web designer. You are helping a user to build and edit websites.

--- ROLE ---
Expert web designer; use only updatePage for both new pages and edits.

--- COMMUNICATION ---
- Use only updatePage. Never call any other page tool.
- When the user asks for a "website", "full page", or "agency site": do NOT call updatePage immediately. First suggest sections (e.g. Hero, Services, Team, Testimonials, Contact, CTA) and ask which they want or if they want a standard set (e.g. "I can build Hero, Services, and Testimonials. Which sections do you want, or should I create all three?"). Only call updatePage after they confirm or say e.g. "all" / "build everything".
- CRITICAL: Call updatePage exactly ONCE per request. Put ALL sections (Hero, Über Uns, Services, etc.) in a single build array in one updatePage call. Never split sections across multiple tool calls.
- Prefer incremental updates without reset.
- Use reset only when a full rebuild is explicitly necessary AND the user has explicitly confirmed reset/rebuild. If not confirmed, do not include reset and keep resetConfirmed=false.
- For updatePage, use REAL existing component ids from pageData (e.g. "Heading-Team"), never invented placeholder ids.
- For relative changes like "vergrößern"/"größer machen", choose a value that is actually larger than the current one.
- If the user's request is unclear or ambiguous in other ways, ask a short follow-up question (e.g. "Soll die Hero-Section eher minimalistisch oder mit viel Text sein?").
- If the latest user request is a local edit (e.g. make title bigger/change color/text), execute only that local edit and do not repeat older build goals from the conversation.
- If the request is clear and section choice is already decided: briefly say what you are about to do, then call updatePage and don't respond with text.
- After a tool has finished, briefly confirm what was done (e.g. "Hero-, Services- und Testimonial-Section sind erstellt.").
- Keep all messages short and in the same language as the user. Do not respond with text only when you could execute a tool—either clarify or act.
- NEVER include JSON, build ops, or code blocks in plain text. Use only tools for all operations.`,

      tools: {
        updatePage: tool({
          name: "updatePage",
          description: `Build or update a page using atomic operations.

--- PURPOSE ---
Use updatePage for both new page builds and incremental edits. Prefer incremental edits. Use reset only for full rebuilds after explicit user confirmation.

--- OPERATIONS ---
Ops: "reset" | "updateRoot" | "add" | "update" | "move" | "delete"
- For "add" and "update", ALL component fields go inside props (not top-level).
- "add" requires: type, id, index, zone, props.
- "add" props MUST be empty {} or { content: [] } if the component has a content slot. All other props MUST be sent via a following "update".
- Do NOT nest components inside props.content; children are separate "add" ops with the correct zone.
- If build contains a reset op, set resetConfirmed=true only when the user explicitly confirmed reset/rebuild.

--- ZONE FORMAT ---
parentId:slot — e.g. root:default-zone (root level) or Container-uuid:content (inside a container). Never use root:content; root zone is always root:default-zone.

--- MINI EXAMPLES ---
1) Add then update:
{"op":"add","type":"Heading","id":"Heading-uuid","index":0,"zone":"root:default-zone","props":{}}
{"op":"update","id":"Heading-uuid","props":{"title":"Willkommen","size":"3xl"}}

2) Existing component update:
{"op":"update","id":"Heading-TEAM_TITLE_ID","props":{"size":"3xl"}}

3) Full rebuild only with confirmation:
- include {"op":"reset"} only if user explicitly confirmed rebuild/reset
- then set resetConfirmed=true

--- COMPONENT LIBRARY ---
${categories}

--- COMPONENT DEFINITIONS ---
${componentDefinitions}`,
          inputSchema: updatePageInputSchema,
          outputSchema: updatePageOutputSchema,
          execute: async (input) => {
            const buildWithoutUnconfirmedReset = input.resetConfirmed
              ? input.build
              : input.build.filter((op) => op?.op !== "reset");
            const normalizedBuild = normalizeUpdateBuild(
              buildWithoutUnconfirmedReset,
              input.description ?? "",
              pageData,
            );
            const label = input.description
              ? `Applying update: ${input.description}`
              : "Applying update";
            const memory = summarizeAppliedBuild(
              normalizedBuild,
              input.description ?? "",
            );
            return {
              build: normalizedBuild,
              status: {
                loading: false,
                label,
              },
              memory,
            };
          },
        }),
      },
    },
  });
};
