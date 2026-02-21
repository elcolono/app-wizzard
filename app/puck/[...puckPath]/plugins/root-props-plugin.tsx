"use client";

import React from "react";
import { AutoField, usePuck } from "@puckeditor/core";
import { Settings2 } from "lucide-react";

const toReadableLabel = (name: string) => {
  const withSpaces = name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .trim();
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
};

function RootPropsPanel() {
  const { appState, config: puckConfig, dispatch } = usePuck();
  const rootFields = puckConfig.root?.fields ?? {};
  const rootProps = appState?.data?.root?.props ?? {};

  const setRootProp = React.useCallback(
    (key: string, value: unknown) => {
      dispatch({
        type: "setData",
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
        {Object.entries(rootFields).map(([name, field]) => {
          const label =
            (field as { label?: string }).label ?? toReadableLabel(name);
          return (
            <div key={name}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: 4,
                }}
              >
                {label}
              </div>
              <AutoField
                value={(rootProps as Record<string, unknown>)[name]}
                field={{ ...field, label: undefined }}
                onChange={(value) => setRootProp(name, value)}
              />
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
  icon: <Settings2 size={16} />,
  render: () => <RootPropsPanel />,
};

