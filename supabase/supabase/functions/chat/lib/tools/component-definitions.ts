import {
  createComponentNameLookup,
  parseComponentQuery,
  pickComponentDefinitions,
} from "../component-definitions.ts";
import type { ChatPayload, ToolResult } from "../types.ts";
import { PuckStreamManager } from "../stream/manager.ts";

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
  const definitions = pickComponentDefinitions(componentMap, parsed.names);
  const loadedCount = parsed.names.length;
  const missingCount = parsed.missing.length;
  const label =
    missingCount > 0
      ? `Loaded ${loadedCount} component definitions (${missingCount} missing)`
      : `Loaded ${loadedCount} component definitions`;
  const output = {
    definitions,
    found: parsed.names,
    missing: parsed.missing,
  };

  toolResults.push({ id, name: "getComponentDefinitions", output });
  manager.sendToolStatus(id, label, false);
  manager.send({
    type: "tool-output-available",
    toolCallId: id,
    output,
  });
}
