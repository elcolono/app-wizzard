// app/api/puck/[...all]/route.ts

import { puckHandler, tool } from "@puckeditor/cloud-client";
import { z } from "zod";

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
        "Initial component props matching the selected component type. Do not nest children here; use separate add ops with zone instead."
      ),
    index: z
      .number()
      .describe("Zero-based position of the component inside the target zone."),
    zone: z
      .string()
      .describe(
        "Target zone in parentId:slot format, e.g. root:default-zone or hero-container-1:content"
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

const createPageInputSchema = z.object({
  description: z
    .string()
    .describe("A brief description of what is being built."),
  build: z
    .array(BuildOperationSchema)
    .default([])
    .describe("The sequence of atomic operations to execute."),
});

const createPageOutputSchema = z.object({
  build: z
    .array(BuildOperationSchema)
    .describe("The resolved build operations that were applied."),
  status: z.object({
    loading: z.boolean().describe("Whether the page is still being processed."),
    label: z.string().describe("Human-friendly status text."),
  }),
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
        `,
      tools: {
        createPage: tool({
          name: "createPage",
          description: `Build or modify the page using atomic operations.
            - Build ops must use op: "reset" | "updateRoot" | "add" | "update" | "move" | "delete"
            - For "add" and "update", ALL component fields go inside props (not top-level)
            - "add" requires: type, id, index, zone, props
            - Do NOT nest components inside props.content; children must be separate "add" ops with proper zone
            - "zone" format: parentId:slot (e.g. root:default-zone or Container-uuid:content)
            - Example add op:
              {"op":"add","type":"Heading","id":"uuid","index":0,"zone":"root:default-zone","props":{"title":"...","size":"2xl","textAlignment":"text-center"}}
            - Examples from a real run:
              {"op":"reset"}
              {"op":"updateRoot","props":{"primary":"Hero & Testimonial Dev-Agentur Landing Page"}}
              {"op":"add","type":"Container","id":"Container-200b452a-7555-41a1-8e1a-2872554bce4a","index":0,"zone":"root:default-zone","props":{"content":[]}}
              {"op":"add","type":"VStack","id":"VStack-dfd1ad5a-8376-457c-a01a-a3d7190ca317","index":0,"zone":"Container-200b452a-7555-41a1-8e1a-2872554bce4a:content","props":{"content":[]}}
              {"op":"add","type":"Heading","id":"Heading-aacd19a0-67a7-432e-a970-c5a7dc67daab","index":0,"zone":"VStack-dfd1ad5a-8376-457c-a01a-a3d7190ca317:content","props":{}}
              {"op":"update","id":"Heading-aacd19a0-67a7-432e-a970-c5a7dc67daab","props":{"title":"Wir entwickeln Ihre digitale Zukunft.","size":"5xl","textAlignment":"text-center","bold":true}}
              {"op":"add","type":"Text","id":"Text-81f14cc7-1eed-48c0-a87a-409d7e30fa04","index":1,"zone":"VStack-dfd1ad5a-8376-457c-a01a-a3d7190ca317:content","props":{}}
              {"op":"update","id":"Text-81f14cc7-1eed-48c0-a87a-409d7e30fa04","props":{"text":"Individuelle Softwareentwicklung, die begeistert – von erfahrenen Profis für Ihr Business.","size":"xl","className":"text-gray-600 text-center mb-8"}}
              {"op":"add","type":"Button","id":"Button-9a851b93-3742-4edf-b535-efa15cf395a3","index":2,"zone":"VStack-dfd1ad5a-8376-457c-a01a-a3d7190ca317:content","props":{"content":[]}}
              {"op":"add","type":"ButtonText","id":"ButtonText-1e2324d1-d7a6-4cd8-a562-25d5c416597b","index":0,"zone":"Button-9a851b93-3742-4edf-b535-efa15cf395a3:content","props":{}}
              {"op":"update","id":"ButtonText-1e2324d1-d7a6-4cd8-a562-25d5c416597b","props":{"text":"Jetzt Projekt anfragen","className":"font-semibold"}}
              {"op":"update","id":"Button-9a851b93-3742-4edf-b535-efa15cf395a3","props":{"variant":"solid","action":"primary","size":"lg","className":"mx-auto"}}
            - COMPONENT LIBRARY: ${categories}
            - COMPONENT DEFINITIONS: ${componentDefinitions}`,
          inputSchema: createPageInputSchema,
          outputSchema: createPageOutputSchema,
          execute: async (input) => {
            const label = input.description
              ? `Applying design: ${input.description}`
              : "Applying design";
            return {
              build: input.build,
              status: {
                loading: false,
                label,
              },
            };
          },
        }),
      },
    },
  });
};
