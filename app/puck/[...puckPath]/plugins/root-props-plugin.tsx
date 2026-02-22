"use client";

import React from "react";
import { AutoField, FieldLabel, usePuck } from "@puckeditor/core";
import { Hash, List, Settings2, Type } from "lucide-react";

const toReadableLabel = (name: string) => {
  const withSpaces = name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .trim();
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
};

const getFieldIcon = (fieldType: string) => {
  if (fieldType === "number") return <Hash size={16} />;
  if (fieldType === "select" || fieldType === "radio") {
    return <List size={16} />;
  }
  return <Type size={16} />;
};

function RootPropsPanel() {
  const { appState, config: puckConfig, dispatch } = usePuck();
  const rootFields = puckConfig.root?.fields ?? {};
  const rootProps = appState?.data?.root?.props ?? {};

  const setRootProp = React.useCallback(
    (key: string, value: unknown) => {
      dispatch({
        type: "setData",
        recordHistory: true,
        data: (previous) => ({
          ...previous,
          root: {
            ...(previous.root ?? {}),
            props: {
              ...((previous.root as { props?: Record<string, unknown> } | undefined)
                ?.props ?? {}),
              [key]: value,
            },
          },
        }),
      });
    },
    [dispatch]
  );

  return (
    <div style={{ padding: 12, overflowY: "auto" }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#111827",
          marginBottom: 10,
        }}
      >
        Page Settings
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {Object.entries(rootFields).map(([name, field], index) => {
          const label =
            (field as { label?: string }).label ?? toReadableLabel(name);
          const fieldType = (field as { type?: string }).type ?? "text";
          const labelIcon =
            (field as { labelIcon?: React.ReactNode }).labelIcon ??
            getFieldIcon(fieldType);
          return (
            <div
              key={name}
              style={{
                marginBottom: 10,
                paddingTop: index === 0 ? 0 : 10,
                paddingLeft: 12,
                paddingRight: 12,
                marginLeft: -12,
                marginRight: -12,
                borderTop: index === 0 ? "none" : "1px solid #e5e7eb",
              }}
            >
              <FieldLabel label={label} icon={labelIcon}>
                <AutoField
                  value={(rootProps as Record<string, unknown>)[name]}
                  field={{ ...field, label: undefined }}
                  onChange={(value) => setRootProp(name, value)}
                />
              </FieldLabel>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const rootPropsPlugin = {
  name: "page",
  label: "Page",
  icon: <Settings2 size={24} />,
  render: () => <RootPropsPanel />,
};
