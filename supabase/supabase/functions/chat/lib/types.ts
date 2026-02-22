export type OpenAIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface ToolCallState {
  id: string;
  name?: string;
  argsText: string;
}

export type BuildMemory = {
  appliedOpsCount: number;
  created: Array<{ id: string; type: string; zone: string }>;
  updated: Array<{ id: string; changedKeys: string[] }>;
  moved: Array<{ id: string; zone: string; index: number }>;
  deleted: string[];
  notes: string[];
  humanSummary: string;
};

export type ToolResult = {
  id: string;
  name: string;
  output: unknown;
};

export type ChatPayload = {
  chatId?: string;
  messageId?: string;
  context?: string;
  messages?: any[];
  tools?: Record<string, any>;
  pageData?: { content?: any[] };
  config?: { components?: Record<string, unknown> };
};
