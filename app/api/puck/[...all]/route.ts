// app/api/puck/[...all]/route.ts

import { puckHandler, tool } from "@puckeditor/cloud-client";
import { z } from "zod";

// Das atomare Schema für die Operationen (Bleibt gleich)
const BuildOperationSchema = z.discriminatedUnion("op", [
  z.object({ op: z.literal("reset") }),
  z.object({
    op: z.literal("updateRoot"),
    props: z.record(z.string(), z.any()),
  }),
  z.object({
    op: z.literal("add"),
    type: z.string(),
    id: z.string(),
    props: z.record(z.string(), z.any()).default({}),
    index: z.number(),
    zone: z.string().optional(),
  }),
  z.object({
    op: z.literal("update"),
    id: z.string(),
    props: z.record(z.string(), z.any()),
  }),
  z.object({
    op: z.literal("move"),
    id: z.string(),
    index: z.number(),
    zone: z.string(),
  }),
  z.object({ op: z.literal("delete"), id: z.string() }),
]);

const createPageInputSchema = z.object({
  description: z
    .string()
    .describe("A brief description of what is being built."),
  build: z
    .array(BuildOperationSchema)
    .describe("The sequence of atomic operations to execute."),
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
    2
  );
  const categories = JSON.stringify(config?.categories || {}, null, 2);

  return puckHandler(request, {
    host: process.env.SUPABASE_URL,
    apiKey: process.env.SUPABASE_ANON_KEY,
    ai: {
      context: `You are an expert web designer. You are helping a user to build a website.

          COMMUNICATION:
          - If the user's request is unclear or ambiguous, ask a short follow-up question instead of guessing (e.g. "Soll die Hero-Section eher minimalistisch oder mit viel Text sein?").
          - If the request is clear, proceed: briefly say what you are about to do, then use the appropriate tool (e.g. createPage).
          - After a tool has finished, briefly confirm what was done (e.g. "Hero- und Testimonial-Section sind erstellt.").
          - Keep all messages short and in the same language as the user. Do not respond with text only when you could execute a tool—either clarify or act.

          STRICT RULES FOR GENERATION:
          1. IDs: Every 'id' must be a unique UUID (e.g., '550e8400-e29b-41d4-a716-446655440000'). Never use 'container-1'.
          2. SLOTS/ZONES: To nest a component inside another, the 'zone' property MUST match the slot field name. 
             - For Box, HStack, VStack, and Container, the slot name is 'content'. 
             - Example: If a Heading is inside a Box, its 'zone' is 'content' and its parent 'id' must match the Box's id.
          3. PROPS ARE MANDATORY: Never add a component with empty props. 
             - For 'Heading', set 'title' and 'size'.
             - For 'Text', set 'text'.
             - Use 'className' for Tailwind: Add padding (p-8, py-20), alignment, and colors (bg-primary, text-white).
          4. LAYOUT FLOW: 
             - Start with a 'Container' or 'Box' for the section wrapper.
             - Use 'VStack' for vertical spacing within the hero.

          COMPONENT LIBRARY: ${categories}
          DEFINITIONS: ${componentDefinitions}`,
      tools: {
        createPage: tool({
          name: "createPage",
          description: `Build or modify the page using atomic operations.
            - Use 'reset' for a blank canvas.
            - Use 'add' to insert components.
            - IDs must be unique UUIDs.
            - Nested layout: components inside 'Box' or 'Stack' belong in 'props.content'.`,
          inputSchema: createPageInputSchema,
          execute: async (input) => {
            return {
              build: input.build,
              status: {
                loading: false,
                label: `Applying design: ${input.description}`,
              },
            };
          },
        }),
      },
    },
  });
};
