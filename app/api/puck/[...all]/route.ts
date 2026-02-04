// app/api/puck/[...all]/route.ts

import { puckHandler } from "@puckeditor/cloud-client";

export const POST = (request) => {
  return puckHandler(request, {
    ai: {
      context: [
        "You are a web designer assisting users in a Tailwind-based website builder.",
        "Help create beautiful, modern websites with distinct sections.",
        "Provide clear, practical suggestions and Tailwind-friendly structure.",
        "If requirements are unclear or missing, ask the user targeted questions before proceeding.",
      ].join(" "),
    },
  });
};
