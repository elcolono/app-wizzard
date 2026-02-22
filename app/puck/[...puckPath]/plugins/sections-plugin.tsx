"use client";

import React from "react";
import { Drawer, usePuck } from "@puckeditor/core";
import { LayoutTemplate } from "lucide-react";
import { SECTION_PLUGIN_ITEMS } from "../../../../config/sections/registry";

function SectionsPanel() {
  const { config, getPermissions } = usePuck();

  return (
    <div style={{ padding: 12, overflowY: "auto" }}>
      <Drawer>
        {SECTION_PLUGIN_ITEMS.map(({ component, label }) => {
          const resolvedLabel =
            config.components[component]?.label ?? label ?? component;
          const canInsert = getPermissions({ type: component }).insert;

          return (
            <Drawer.Item
              key={component}
              name={component}
              label={resolvedLabel}
              isDragDisabled={!canInsert}
            />
          );
        })}
      </Drawer>
    </div>
  );
}

export const sectionsPlugin = {
  name: "sections",
  label: "Sections",
  icon: <LayoutTemplate size={24} />,
  render: () => <SectionsPanel />,
};
