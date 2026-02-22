import { getToolDoneLabel } from "../config.ts";
import { summarizeAppliedBuild } from "../build-memory.ts";
import { PuckStreamManager } from "../stream/manager.ts";
import type { ToolResult } from "../types.ts";

export function handleUpdatePageTool(params: {
  id: string;
  input: any;
  manager: PuckStreamManager;
  toolResults: ToolResult[];
}) {
  const { id, input, manager, toolResults } = params;

  const memory = summarizeAppliedBuild(
    Array.isArray(input?.build) ? input.build : [],
    typeof input?.description === "string" ? input.description : "",
  );

  if (input?.build && Array.isArray(input.build) && input.build.length) {
    const lastOp = input.build[input.build.length - 1];
    manager.processBuildOp(lastOp, id);
  }

  if (memory.humanSummary) {
    manager.sendToolStatus(id, memory.humanSummary, false);
  } else if (input?.description) {
    manager.sendToolStatus(id, input.description, false);
  } else {
    manager.sendToolStatus(id, getToolDoneLabel("updatePage"), false);
  }

  const output = {
    status: { loading: false, label: getToolDoneLabel("updatePage") },
    memory,
  };
  toolResults.push({ id, name: "updatePage", output });
  manager.send({
    type: "tool-output-available",
    toolCallId: id,
    output,
  });
}
