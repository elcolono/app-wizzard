// app/api/puck/[...all]/route.ts

import { puckHandler, tool } from "@puckeditor/cloud-client";
import { z } from "zod";

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

type ComponentIndexEntry = {
  name: string;
  description: string;
  fieldNames: string[];
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

function getFieldOptionValues(
  config: any,
  componentType: string | undefined,
  fieldName: string,
): string[] {
  if (!componentType) return [];
  const field = config?.components?.[componentType]?.fields?.[fieldName];
  const options = Array.isArray(field?.options) ? field.options : [];
  return options
    .map((option: any) =>
      typeof option === "string"
        ? option
        : typeof option?.value === "string"
          ? option.value
          : undefined,
    )
    .filter((value: string | undefined): value is string => Boolean(value));
}

function getNextOptionValue(
  options: string[],
  current?: string,
): string | undefined {
  if (!current || options.length === 0) return undefined;
  const index = options.indexOf(current);
  if (index === -1 || index >= options.length - 1) return undefined;
  return options[index + 1];
}

function isClassUpdateKey(key: string): boolean {
  return key === "class" || key === "className";
}

function areValuesEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (a == null || b == null) return false;
  if (typeof a === "object") {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }
  return false;
}

function normalizeUpdateBuild(
  build: Array<any>,
  description: string,
  pageData: any,
  config: any,
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
      const sizeOptions = getFieldOptionValues(config, existing.type, "size");

      if (typeof rawSize === "string" && rawSize.trim() === "") {
        delete nextOp.props.size;
      }

      const requestedSize =
        typeof nextOp.props.size === "string" ? nextOp.props.size : undefined;
      if (
        increaseIntent &&
        currentSize &&
        (!requestedSize ||
          requestedSize === currentSize ||
          (sizeOptions.length > 0 && !sizeOptions.includes(requestedSize)))
      ) {
        const nextSize = getNextOptionValue(sizeOptions, currentSize);
        if (nextSize) nextOp.props.size = nextSize;
      }
    }

    for (const [key, value] of Object.entries(nextOp.props ?? {})) {
      if (isClassUpdateKey(key)) continue;
      if (areValuesEqual(existing.props?.[key], value)) {
        delete nextOp.props[key];
      }
    }

    if (Object.keys(nextOp.props ?? {}).length === 0) continue;
    normalized.push(nextOp);
  }

  return normalized;
}

function clampText(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trim()}…`;
}

function buildComponentIndex(components: any): ComponentIndexEntry[] {
  if (!components || typeof components !== "object") return [];
  return Object.entries(components)
    .filter(([name]) => typeof name === "string" && name.length > 0)
    .map(([name, definition]) => {
      const fields =
        definition && typeof definition === "object"
          ? definition.fields
          : undefined;
      const fieldNames =
        fields && typeof fields === "object" ? Object.keys(fields) : [];
      const rawDescription =
        definition &&
        typeof definition === "object" &&
        typeof definition.description === "string"
          ? definition.description.trim()
          : "";
      const description = rawDescription
        ? clampText(rawDescription, 180)
        : fieldNames.length > 0
          ? `Fields: ${fieldNames.slice(0, 10).join(", ")}`
          : "No explicit fields metadata.";
      return { name, description, fieldNames };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function createComponentNameLookup(components: any): Map<string, string> {
  const lookup = new Map<string, string>();
  if (!components || typeof components !== "object") return lookup;
  for (const name of Object.keys(components)) {
    lookup.set(name.toLowerCase(), name);
  }
  return lookup;
}

function parseComponentQuery(
  query: string,
  lookup: Map<string, string>,
): { names: string[]; missing: string[] } {
  const parts = query
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
}

function pickComponentDefinitions(
  components: any,
  names: string[],
): Record<string, unknown> {
  const selected: Record<string, unknown> = {};
  if (!components || typeof components !== "object") return selected;
  for (const name of names) {
    if (!(name in components)) continue;
    selected[name] = components[name];
  }
  return selected;
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

const getComponentDefinitionsInputSchema = z.object({
  query: z
    .string()
    .describe(
      "Comma-separated component names to fetch, e.g. 'Container,Heading,Text,Button'.",
    ),
});

const getComponentDefinitionsOutputSchema = z.object({
  definitions: z
    .record(z.string(), z.unknown())
    .describe("Component definitions for all found component names."),
  found: z
    .array(z.string())
    .describe("Resolved component names that were found."),
  missing: z
    .array(z.string())
    .describe("Requested names that were not found in the component library."),
});

export const POST = async (request: Request) => {
  // 1. Request klonen, um den Body für uns UND den puckHandler nutzbar zu machen
  const clonedRequest = request.clone();
  const body = await clonedRequest.json();
  const { config, pageData } = body;

  // 2. Den Kontext für die KI vorbereiten
  // We provide categories + a compact component index; full definitions are fetched lazily via tool.
  const componentIndex = JSON.stringify(
    buildComponentIndex(config?.components || {}),
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
Expert web designer; use getComponentDefinitions (read-only) and updatePage (mutating) to build and edit pages.

--- COMMUNICATION ---
- Use only getComponentDefinitions and updatePage. Never call any other page tools.
- When the user asks for a "website", "full page", or "agency site": do NOT call updatePage immediately. First suggest sections (e.g. Hero, Services, Team, Testimonials, Contact, CTA) and ask which they want or if they want a standard set (e.g. "I can build Hero, Services, and Testimonials. Which sections do you want, or should I create all three?"). Only call updatePage after they confirm or say e.g. "all" / "build everything".
- If you are unsure about component props/field names, call getComponentDefinitions first with one comma-separated query (e.g. "Container,Heading,Text,Button"), then call updatePage.
- CRITICAL: Call updatePage exactly ONCE per request. Put ALL sections (Hero, Über Uns, Services, etc.) in a single build array in one updatePage call. Never split sections across multiple tool calls.
- Prefer incremental updates without reset.
- Use reset only when a full rebuild is explicitly necessary AND the user has explicitly confirmed reset/rebuild. If not confirmed, do not include reset and keep resetConfirmed=false.
- For updatePage, use REAL existing component ids from pageData (e.g. "Heading-Team"), never invented placeholder ids.
- Avoid unknown props: if a prop is uncertain or not listed in component fields, fetch the exact definitions via getComponentDefinitions before updatePage.
- For relative changes like "vergrößern"/"größer machen", choose a value that is actually larger than the current one.
- If the user's request is unclear or ambiguous in other ways, ask a short follow-up question (e.g. "Soll die Hero-Section eher minimalistisch oder mit viel Text sein?").
- If the latest user request is a local edit (e.g. make title bigger/change color/text), execute only that local edit and do not repeat older build goals from the conversation.
- If the request is clear and section choice is already decided: briefly say what you are about to do, then call updatePage and don't respond with text.
- After a tool has finished, briefly confirm what was done (e.g. "Hero-, Services- und Testimonial-Section sind erstellt.").
- Keep all messages short and in the same language as the user. Do not respond with text only when you could execute a tool—either clarify or act.
- NEVER include JSON, build ops, or code blocks in plain text. Use only tools for all operations.

--- DESIGN QUALITY BAR (MANDATORY FOR NEW PAGE BUILDS) ---
- Build pages that feel intentionally designed, not placeholder-like. Avoid generic one-line sections and repeated "Heading + Text" only blocks.
- Use existing layout components to create hierarchy and rhythm: prefer Container + VStack/HStack/Grid + Card/Box + Spacer over flat lists.
- Use responsive structure for repeated content:
  - Services/features/testimonials/team should use Grid with multiple columns (e.g. 1 column on mobile, 2-3 on larger screens).
  - Repeated items should be composed as Card/Box blocks, not plain text rows.
- Hero sections should include clear hierarchy (headline, supporting text, at least one CTA), not just image + single line text.
- Use concrete, business-specific copy from the user brief (e.g. massage/wellness vocabulary), not vague filler text.
- Maintain consistent spacing rhythm between sections/elements via Spacer and/or stack spacing props.
- Keep class usage focused and minimal: short, purposeful className values only when needed for visual polish. Prefer component structure and props first.
- Create clear visual separation between sections (e.g. background contrast, grouped cards, spacing blocks).
- For full-page requests, include at least: Hero, trust/about block, services grid, testimonials/social proof, and contact/CTA unless the user asks otherwise.

--- TEAM SECTION EXAMPLE (USE AS QUALITY REFERENCE) ---
- Use this component tree pattern (ids are examples; keep the same hierarchy):
  Container (id: Team-Section, zone: root:default-zone)
    VStack (id: Team-Intro, zone: Team-Section:content)
      Text/Badge (id: Team-Eyebrow, zone: Team-Intro:content)
      Heading (id: Team-Heading, zone: Team-Intro:content)
      Text (id: Team-Subcopy, zone: Team-Intro:content)
    Grid (id: Team-Grid, zone: Team-Section:content)
      GridItem (id: Team-Item-1, zone: Team-Grid:content)
        Card or Box (id: Team-Card-1, zone: Team-Item-1:content)
          Image or Avatar (id: Team-Avatar-1, zone: Team-Card-1:content)
          Heading (id: Team-Name-1, zone: Team-Card-1:content)
          Text (id: Team-Role-1, zone: Team-Card-1:content)
          Text (id: Team-Bio-1, zone: Team-Card-1:content)
      GridItem (id: Team-Item-2, zone: Team-Grid:content)
        Card or Box (id: Team-Card-2, zone: Team-Item-2:content)
          Image or Avatar (id: Team-Avatar-2, zone: Team-Card-2:content)
          Heading (id: Team-Name-2, zone: Team-Card-2:content)
          Text (id: Team-Role-2, zone: Team-Card-2:content)
          Text (id: Team-Bio-2, zone: Team-Card-2:content)
      GridItem (id: Team-Item-3, zone: Team-Grid:content)
        Card or Box (id: Team-Card-3, zone: Team-Item-3:content)
          Image or Avatar (id: Team-Avatar-3, zone: Team-Card-3:content)
          Heading (id: Team-Name-3, zone: Team-Card-3:content)
          Text (id: Team-Role-3, zone: Team-Card-3:content)
          Text (id: Team-Bio-3, zone: Team-Card-3:content)
    Grid (id: Team-Metrics, zone: Team-Section:content)
      GridItem -> Box -> Heading + Text (metric 1)
      GridItem -> Box -> Heading + Text (metric 2)
      GridItem -> Box -> Heading + Text (metric 3)
- Keep classes minimal and intentional. Prefer structure/props over long class strings.
- Copy should feel real and specific (names, roles, expertise), not placeholder lorem text.`,

      tools: {
        getComponentDefinitions: tool({
          name: "getComponentDefinitions",
          description: `Fetch exact component definitions for selected component names using a single comma-separated query.

Use this when you need authoritative field/prop names before calling updatePage.
Example query: "Container,Heading,Text,Button".
Returns partial results: known components in definitions/found and unknown names in missing.`,
          inputSchema: getComponentDefinitionsInputSchema,
          outputSchema: getComponentDefinitionsOutputSchema,
          execute: async (input) => {
            const componentMap = config?.components || {};
            const lookup = createComponentNameLookup(componentMap);
            const parsed = parseComponentQuery(input.query ?? "", lookup);
            const definitions = pickComponentDefinitions(
              componentMap,
              parsed.names,
            );
            return {
              definitions,
              found: parsed.names,
              missing: parsed.missing,
            };
          },
        }),
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

--- DESIGN COMPOSITION ---
- For complete pages, compose sections with layout components (Container, VStack/HStack, Grid, Card/Box, Spacer) instead of simple linear text blocks.
- Use Grid for repeated content (services/testimonials/team), and make it responsive with available grid column props.
- Keep className usage concise and intentional; avoid long utility chains when structure/props can solve the layout.
- Ensure each major section has meaningful content density (headline, explanatory copy, and where relevant CTA or proof points).
- For Team sections, follow the explicit component tree above (intro block + responsive member card grid + metrics grid).

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

--- COMPONENT INDEX ---
${componentIndex}

Use getComponentDefinitions(query) when you need the exact definition for selected components before updatePage.`,
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
              config,
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
