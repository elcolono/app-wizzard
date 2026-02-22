"use client";

import React from "react";
import { Drawer, usePuck } from "@puckeditor/core";
import { LayoutTemplate } from "lucide-react";
import {
  SECTION_PLUGIN_ITEMS,
  SectionPreviewDefinition,
} from "../../../../config/sections/registry";

function PreviewLine({
  width = "100%",
  height = 5,
  opacity = 1,
  radius = 3,
}: {
  width?: string;
  height?: number;
  opacity?: number;
  radius?: number;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: "rgba(17,24,39,0.18)",
        opacity,
      }}
    />
  );
}

function PreviewButton({
  width = "30%",
  height = 7,
  opacity = 0.9,
}: {
  width?: string;
  height?: number;
  opacity?: number;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 999,
        background: "rgba(17,24,39,0.2)",
        opacity,
      }}
    />
  );
}

function PreviewField({
  height = 8,
  opacity = 0.6,
}: {
  height?: number;
  opacity?: number;
}) {
  return (
    <div
      style={{
        width: "100%",
        height,
        borderRadius: 4,
        border: "1px solid rgba(17,24,39,0.2)",
        background: "rgba(17,24,39,0.05)",
        opacity,
      }}
    />
  );
}

function PreviewCard({
  children,
  height,
  width = "100%",
  opacity = 1,
}: {
  children?: React.ReactNode;
  height?: number;
  width?: string;
  opacity?: number;
}) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius: 6,
        border: "1px solid rgba(17,24,39,0.14)",
        background: "rgba(17,24,39,0.06)",
        opacity,
        padding: children ? 5 : 0,
        display: "grid",
        gap: 4,
      }}
    >
      {children}
    </div>
  );
}

function SectionPreview({ preview }: { preview: SectionPreviewDefinition }) {
  if (preview.layout === "hero") {
    return (
      <div style={{ display: "grid", gap: 5 }}>
        <PreviewLine width="24%" height={4} opacity={0.75} />
        <PreviewLine width="72%" height={7} />
        <PreviewLine width="90%" height={5} opacity={0.78} />
        <div style={{ display: "flex", gap: 5 }}>
          <PreviewButton width="22%" />
          <PreviewButton width="22%" opacity={0.72} />
        </div>
      </div>
    );
  }

  if (preview.layout === "aboutSplit") {
    return (
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}
      >
        <div style={{ display: "grid", gap: 4 }}>
          <PreviewLine width="55%" height={6} />
          <PreviewLine width="94%" />
          <PreviewLine width="88%" opacity={0.75} />
        </div>
        <PreviewCard>
          <PreviewLine width="70%" height={5} />
          <PreviewLine width="92%" />
          <PreviewLine width="80%" opacity={0.74} />
        </PreviewCard>
      </div>
    );
  }

  if (preview.layout === "servicesGrid") {
    return (
      <div style={{ display: "grid", gap: 5 }}>
        <PreviewLine width="42%" height={6} />
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 4 }}
        >
          <PreviewCard>
            <PreviewLine width="78%" height={5} />
            <PreviewLine width="90%" />
          </PreviewCard>
          <PreviewCard>
            <PreviewLine width="72%" height={5} />
            <PreviewLine width="88%" />
          </PreviewCard>
          <PreviewCard>
            <PreviewLine width="70%" height={5} />
            <PreviewLine width="84%" />
          </PreviewCard>
        </div>
      </div>
    );
  }

  if (preview.layout === "testimonialsGrid") {
    return (
      <div style={{ display: "grid", gap: 5 }}>
        <PreviewLine width="50%" height={6} />
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 4 }}
        >
          <PreviewCard>
            <PreviewLine width="92%" />
            <PreviewLine width="80%" />
            <PreviewLine width="56%" height={4} opacity={0.72} />
          </PreviewCard>
          <PreviewCard>
            <PreviewLine width="90%" />
            <PreviewLine width="78%" />
            <PreviewLine width="52%" height={4} opacity={0.72} />
          </PreviewCard>
          <PreviewCard>
            <PreviewLine width="88%" />
            <PreviewLine width="74%" />
            <PreviewLine width="50%" height={4} opacity={0.72} />
          </PreviewCard>
        </div>
      </div>
    );
  }

  if (preview.layout === "ctaBox") {
    return (
      <PreviewCard>
        <div style={{ display: "grid", gap: 5 }}>
          <PreviewLine width="68%" height={6} />
          <PreviewLine width="86%" />
          <div style={{ display: "flex", gap: 5 }}>
            <PreviewButton width="24%" />
            <PreviewButton width="24%" opacity={0.72} />
          </div>
        </div>
      </PreviewCard>
    );
  }

  if (preview.layout === "contactSplit") {
    return (
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}
      >
        <div style={{ display: "grid", gap: 4 }}>
          <PreviewLine width="56%" height={6} />
          <PreviewLine width="90%" />
          <PreviewLine width="72%" opacity={0.72} />
        </div>
        <PreviewCard>
          <PreviewField />
          <PreviewField />
          <PreviewField height={12} />
          <PreviewButton width="45%" />
        </PreviewCard>
      </div>
    );
  }

  if (preview.layout === "footerSplit") {
    return (
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}
      >
        <div style={{ display: "grid", gap: 4 }}>
          <PreviewLine width="52%" height={5} />
          <PreviewLine width="86%" height={4} opacity={0.72} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
          <PreviewButton width="22%" height={6} opacity={0.72} />
          <PreviewButton width="22%" height={6} opacity={0.64} />
          <PreviewButton width="22%" height={6} opacity={0.56} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 4 }}>
      <PreviewLine width="60%" height={6} />
      <PreviewLine width="88%" />
    </div>
  );
}

function SectionsPanel() {
  const { config, getPermissions } = usePuck();

  return (
    <div style={{ padding: 12, overflowY: "auto" }}>
      <Drawer>
        {SECTION_PLUGIN_ITEMS.map(({ id, component, label, variant, preview }) => {
          const resolvedLabel =
            config.components[component]?.label ?? label ?? component;
          const canInsert = getPermissions({ type: component }).insert;
          const title =
            variant && variant.length > 0
              ? `${resolvedLabel} (${variant})`
              : resolvedLabel;

          return (
            <Drawer.Item
              key={id}
              name={component}
              label={title}
              isDragDisabled={!canInsert}
            >
              {({ children }) => (
                <div
                  style={{
                    display: "grid",
                    gap: 6,
                    border: "1px solid rgba(17,24,39,0.12)",
                    borderRadius: 10,
                    padding: 7,
                    background:
                      "linear-gradient(180deg, rgba(17,24,39,0.03), rgba(17,24,39,0.08))",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      lineHeight: 1.2,
                      color: "rgba(17,24,39,0.94)",
                    }}
                  >
                    {children}
                  </div>
                  <div
                    style={{
                      border: "1px solid rgba(17,24,39,0.14)",
                      borderRadius: 7,
                      padding: 6,
                      background: "rgba(255,255,255,0.72)",
                      pointerEvents: "none",
                    }}
                  >
                    <SectionPreview preview={preview} />
                  </div>
                </div>
              )}
            </Drawer.Item>
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
