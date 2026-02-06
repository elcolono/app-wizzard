// @ts-nocheck
// deno-lint-ignore-file no-explicit-any

import Ajv from "https://esm.sh/ajv@8.12.0";
import { GEMINI_API_KEY } from "../../config.ts";
import type { ComponentReference } from "../../types.ts";
import responseSchema from "./response-schema.json" assert { type: "json" };

const ajv = new Ajv({ allErrors: true, strict: false });
const validateGeminiResponse = ajv.compile(responseSchema as any);
const responseSchemaPrompt = JSON.stringify(responseSchema, null, 2);

export type GeminiCallParams = {
  instruction: string;
  currentConfig: any;
  dbSchema?: any;
  componentCatalog?: any;
  configSchemaSlice?: any;
  componentReference?: ComponentReference;
};

export async function callGeminiFlash(
  params: GeminiCallParams
): Promise<any[]> {
  const {
    instruction,
    currentConfig,
    dbSchema,
    componentCatalog,
    configSchemaSlice,
    componentReference,
  } = params;

  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  let systemPrompt =
    "You are an assistant that edits a Gluestack theming app_config using RFC 6902 JSON Patch and structured Supabase migrations. " +
    "Always return a JSON array that strictly validates against the following JSON Schema: \n" +
    responseSchemaPrompt +
    "\nAdditional domain rules:\n" +
    "Additional domain rules:\n" +
    "- Component children are objects with stable IDs, NEVER arrays. Use direct object paths.\n" +
    "- Button text styling MUST target the button-text child component (e.g., /button/children/button-text/props/className).\n" +
    "- Use 'replace' only if the path exists; otherwise use 'add'.\n" +
    "- Keep migrations conservative and idempotent (use IF NOT EXISTS where applicable).\n" +
    "- Never output raw SQL; only structured migration objects as defined by the schema.\n" +
    "- For image fields, use HTTPS placeholders (picsum.photos, placehold.co, via.placeholder.com) with deterministic seeds.\n";

  // Add component reference context if available
  if (componentReference) {
    systemPrompt += `\n\nCOMPONENT CONTEXT: The user is specifically referring to a component with the following details:
- Component ID: ${componentReference.componentId}
- Component Type: ${componentReference.componentType}
- Component Path: ${componentReference.componentPath}
- Page ID: ${componentReference.pageId}
${
  componentReference.layoutId
    ? `- Layout ID: ${componentReference.layoutId}`
    : ""
}

When processing the instruction, focus on this specific component and use the component path to target the correct element in the config.`;
  }

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: systemPrompt },
          {
            text:
              "Current app_config (JSON):\n" + JSON.stringify(currentConfig),
          },
          ...(dbSchema
            ? [
                {
                  text:
                    "Current database schema (JSON):\n" +
                    JSON.stringify(dbSchema),
                },
              ]
            : []),
          ...(componentCatalog
            ? [
                {
                  text:
                    "Relevant component catalog (JSON):\n" +
                    JSON.stringify(componentCatalog),
                },
              ]
            : []),
          ...(configSchemaSlice
            ? [
                {
                  text:
                    "Relevant app_config schema excerpt (JSON Schema):\n" +
                    JSON.stringify(configSchemaSlice),
                },
              ]
            : []),
          { text: "Instruction: \n" + instruction },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.0,
      topK: 32,
    },
  } as any;

  const resp = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
      encodeURIComponent(GEMINI_API_KEY),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error("Gemini API error: " + text);
  }

  const data = await resp.json();
  // Try to extract JSON text
  const candidate = data?.candidates?.[0];
  const partText =
    candidate?.content?.parts?.[0]?.text ??
    candidate?.content?.parts?.map((p: any) => p?.text).join("\n");
  let parsed: any = null;
  try {
    parsed = partText ? JSON.parse(partText) : null;
  } catch {
    // If model added code fences or text, try to extract JSON substring
    const match = partText?.match(/\[[\s\S]*\]$/);
    if (match) {
      parsed = JSON.parse(match[0]);
    }
  }
  if (!Array.isArray(parsed)) {
    throw new Error("AI did not return a JSON Patch array");
  }

  const valid = validateGeminiResponse(parsed);
  if (!valid) {
    const message = ajv.errorsText(validateGeminiResponse.errors, {
      separator: "; ",
    });
    throw new Error("Gemini response failed validation: " + message);
  }

  return parsed as any[];
}
