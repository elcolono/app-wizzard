// app/api/puck/[...all]/route.ts

import { puckHandler, tool } from "@puckeditor/cloud-client";
import { z } from "zod";

// Das atomare Schema bleibt die Basis für die Kommunikation
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
    zone: z.string(),
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
  description: z.string().describe("Summary of the design"),
  build: z.array(BuildOperationSchema).describe("List of atomic operations"),
});

export const POST = (request) => {
  return puckHandler(request, {
    host: process.env.SUPABASE_URL,
    apiKey: process.env.SUPABASE_ANON_KEY,
    ai: {
      context: "You are a professional web designer.",
      tools: {
        createPage: tool({
          name: "createPage",
          // Hier liegen jetzt die "Marschbefehle" für die KI
          description: `Build a page structure using atomic operations. 
            Instructions:
            1. Always start with {'op': 'reset'} to clear the canvas.
            2. Use 'updateRoot' for global page settings.
            3. Use 'add' to create components with a unique UUID.
            4. Use 'update' to refine props (e.g., typing text) for a streaming effect.
            
            Available Components & Props (EXTRACT FROM CONFIG)`,
          inputSchema: createPageInputSchema,
          execute: async (input) => {
            return {
              build: input.build,
              status: {
                loading: false,
                label: `Generiert: ${input.description}`,
              },
            };
          },
        }),
      },
    },
  });
};
