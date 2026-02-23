import {
  createComponentNameLookup,
  parseComponentQuery,
} from "../component-definitions.ts";
import type { ChatPayload, ToolResult } from "../types.ts";
import { PuckStreamManager } from "../stream/manager.ts";

const SECTION_COMPONENTS = new Set<string>([
  "Hero",
  "HeroSimpleCentered",
  "AboutSection",
  "ServicesSection",
  "TeamSectionLargeImages",
  "TeamSectionSmallImages",
  "TestimonialsSection",
  "CtaSection",
  "ContactSection",
  "FooterSection",
]);

type SectionExample = {
  defaultProps: unknown;
  summary: string;
  hasDefaultProps: boolean;
};

function listTopContentTypes(content: unknown): string[] {
  if (!Array.isArray(content)) return [];
  return content
    .map((item) =>
      item &&
      typeof item === "object" &&
      typeof (item as any).type === "string" &&
      (item as any).type.trim().length > 0
        ? (item as any).type
        : undefined,
    )
    .filter((value: string | undefined): value is string => Boolean(value));
}

function collectNestedContentTypes(
  content: unknown,
  acc = new Set<string>(),
): Set<string> {
  if (!Array.isArray(content)) return acc;
  for (const item of content) {
    if (!item || typeof item !== "object") continue;
    const type = (item as any).type;
    if (typeof type === "string" && type.trim().length > 0) {
      acc.add(type);
    }
    collectNestedContentTypes((item as any).props?.content, acc);
  }
  return acc;
}

function summarizeSectionExample(defaultProps: unknown): string {
  if (!defaultProps || typeof defaultProps !== "object") {
    return "No default props available.";
  }
  const topLevelKeys = Object.keys(defaultProps as Record<string, unknown>);
  const topLevelTypes = listTopContentTypes(
    (defaultProps as Record<string, unknown>).content,
  );
  const nestedTypes = Array.from(
    collectNestedContentTypes((defaultProps as Record<string, unknown>).content),
  ).slice(0, 12);
  const keyLabel = topLevelKeys.length > 0 ? topLevelKeys.join(", ") : "none";
  const topLabel = topLevelTypes.length > 0 ? topLevelTypes.join(", ") : "none";
  const nestedLabel = nestedTypes.length > 0 ? nestedTypes.join(", ") : "none";
  return `Default props keys: ${keyLabel}. Top-level content types: ${topLabel}. Nested component sample: ${nestedLabel}.`;
}

function pickSectionExamples(
  sectionMap: Record<string, unknown>,
  names: string[],
): Record<string, SectionExample> {
  const examples: Record<string, SectionExample> = {};
  for (const name of names) {
    if (!(name in sectionMap)) continue;
    const definition = sectionMap[name] as Record<string, unknown>;
    const defaultProps = definition?.defaultProps;
    examples[name] = {
      defaultProps: defaultProps ?? null,
      summary: summarizeSectionExample(defaultProps),
      hasDefaultProps: defaultProps !== undefined,
    };
  }
  return examples;
}

export function handleSectionExamplesTool(params: {
  id: string;
  input: any;
  payload: ChatPayload;
  manager: PuckStreamManager;
  toolResults: ToolResult[];
}) {
  const { id, input, payload, manager, toolResults } = params;
  const componentMap = payload?.config?.components || {};
  const sectionMap = Object.fromEntries(
    Object.entries(componentMap).filter(([name]) => SECTION_COMPONENTS.has(name)),
  );
  const lookup = createComponentNameLookup(sectionMap);
  const parsed = parseComponentQuery(input?.query, lookup);
  const examples = pickSectionExamples(sectionMap, parsed.names);
  const loadedCount = parsed.names.length;
  const missingCount = parsed.missing.length;
  const label =
    missingCount > 0
      ? `Loaded ${loadedCount} section examples (${missingCount} missing)`
      : `Loaded ${loadedCount} section examples`;
  const output = {
    examples,
    found: parsed.names,
    missing: parsed.missing,
  };

  toolResults.push({ id, name: "getSectionExamples", output });
  manager.sendToolStatus(id, label, false);
  manager.send({
    type: "tool-output-available",
    toolCallId: id,
    output,
  });
}
