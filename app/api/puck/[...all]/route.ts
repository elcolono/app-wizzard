// app/api/puck/[...all]/route.ts

import { puckHandler, tool } from "@puckeditor/cloud-client";
import { z } from "zod";

const createPageInputSchema = z.object({
  description: z
    .string()
    .describe("Detailed description of the page or section to create."),
});

export const POST = (request) => {
  return puckHandler(request, {
    host: process.env.SUPABASE_URL,
    apiKey: process.env.SUPABASE_ANON_KEY,
    ai: {
      context: [
        "You are a web designer assisting users in a Tailwind-based website builder.",
        "Help create beautiful, modern websites with distinct sections.",
        "Provide clear, practical suggestions and Tailwind-friendly structure.",
        "If requirements are unclear or missing, ask the user targeted questions before proceeding.",
      ].join(" "),
      tools: {
        createPage: tool({
          name: "createPage",
          description:
            "Create a page or section based on the provided description.",
          inputSchema: createPageInputSchema,
          execute: async (input: z.infer<typeof createPageInputSchema>) => {
            console.log("createPage tool called with input:", input);
            return {
              status: {
                loading: false,
                label: `Created page: ${input.description}`,
              },
            };
          },
        }),
      },
    },
  });
};
