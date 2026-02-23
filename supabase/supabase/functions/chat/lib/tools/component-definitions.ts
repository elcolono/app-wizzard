import {
  createComponentNameLookup,
  parseComponentQuery,
  pickComponentDefinitions,
} from "../component-definitions.ts";
import type { ChatPayload, ToolResult } from "../types.ts";
import { PuckStreamManager } from "../stream/manager.ts";

const SECTION_COMPONENTS = new Set<string>([
  "Hero",
  "HeroSimpleCentered",
  "AboutSection",
  "ServicesSection",
  "TeamSection",
  "TeamSectionSmallImages",
  "TestimonialsSection",
  "CtaSection",
  "ContactSection",
  "FooterSection",
]);

export function handleComponentDefinitionsTool(params: {
  id: string;
  input: any;
  payload: ChatPayload;
  manager: PuckStreamManager;
  toolResults: ToolResult[];
}) {
  const { id, input, payload, manager, toolResults } = params;
  const componentMap = payload?.config?.components || {};
  const lookup = createComponentNameLookup(componentMap);
  const parsed = parseComponentQuery(input?.query, lookup);
  const sectionMissing = parsed.names.filter((name) =>
    SECTION_COMPONENTS.has(name),
  );
  const names = parsed.names.filter((name) => !SECTION_COMPONENTS.has(name));
  const definitions = pickComponentDefinitions(componentMap, names);
  const missing = [...parsed.missing, ...sectionMissing];
  const loadedCount = names.length;
  const missingCount = missing.length;
  const label =
    missingCount > 0
      ? `Loaded ${loadedCount} component definitions (${missingCount} missing)`
      : `Loaded ${loadedCount} component definitions`;
  const output = {
    definitions,
    found: names,
    missing,
  };

  toolResults.push({ id, name: "getComponentDefinitions", output });
  manager.sendToolStatus(id, label, false);
  manager.send({
    type: "tool-output-available",
    toolCallId: id,
    output,
  });
}
