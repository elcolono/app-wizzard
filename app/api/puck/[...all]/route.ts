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
      context: `You are an expert web designer. 
                CURRENT PAGE STATE: ${JSON.stringify(pageData?.content || [])}
                
                COMPONENT LIBRARY (Categories):
                ${categories}

                DETAILED COMPONENT DEFINITIONS (Fields & Tailwind Instructions):
                ${componentDefinitions}

                RULES:
                1. Always use Tailwind classes in the 'className' prop.
                2. For layout components (Box, HStack, VStack, etc.), nested components go into the 'content' prop.
                3. Respect the 'ai.instructions' provided in the component definitions.`,
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
