"use client";

import type { Data } from "@puckeditor/core";
import { Puck, Render } from "@puckeditor/core";
import config from "../../../config";
import { createAiPlugin } from "@puckeditor/plugin-ai";
import "@puckeditor/plugin-ai/styles.css";
import { layoutPlugin } from "../../../config/plugins/layouts";

const aiPlugin = createAiPlugin();
const layoutsPlugin = layoutPlugin();

type ClientProps = {
  path: string;
  data: Partial<Data>;
  headerData?: Data;
  footerData?: Data;
};

export function Client({ path, data, headerData, footerData }: ClientProps) {
  const previewOverride = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", height: "100%" }}>
      {headerData?.content?.length ? (
        <div style={{ pointerEvents: "none" }}>
          <Render config={config} data={headerData} />
        </div>
      ) : null}
      <div style={{ flex: 1 }}>{children}</div>
      {footerData?.content?.length ? (
        <div style={{ pointerEvents: "none" }}>
          <Render config={config} data={footerData} />
        </div>
      ) : null}
    </div>
  );

  return (
    <Puck
      plugins={[aiPlugin, layoutsPlugin]}
      config={config}
      data={data}
      overrides={{ preview: previewOverride }}
      onPublish={async (data) => {
        await fetch("/puck/api", {
          method: "post",
          body: JSON.stringify({ data, path }),
        });
      }}
    />
  );
}
