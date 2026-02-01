// app/api/puck/[...all]/route.ts

import { puckHandler } from "@puckeditor/cloud-client";

export const POST = (request) => {
  return puckHandler(request, {
    ai: {
      context: "We are Google. You create Google landing pages.",
    },
  });
};
