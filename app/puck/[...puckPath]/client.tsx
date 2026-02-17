"use client";

import type { Data } from "@puckeditor/core";
import { Puck } from "@puckeditor/core";
import config from "../../../config";
import { createAiPlugin } from "@puckeditor/plugin-ai";
import "@puckeditor/plugin-ai/styles.css";
import { layoutPlugin } from "../../../config/plugins/layouts";

const aiPlugin = createAiPlugin();
const layoutsPlugin = layoutPlugin();

export function Client({ path, data }: { path: string; data: Partial<Data> }) {
  return (
    <Puck
      plugins={[aiPlugin, layoutsPlugin]}
      config={config}
      data={data}
      onPublish={async (data) => {
        await fetch("/puck/api", {
          method: "post",
          body: JSON.stringify({ data, path }),
        });
      }}
    />
  );
}
