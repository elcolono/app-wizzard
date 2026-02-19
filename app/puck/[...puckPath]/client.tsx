"use client";

import type { Data } from "@puckeditor/core";
import { ActionBar, Puck, Render, usePuck } from "@puckeditor/core";
import config from "../../../config";
import { createAiPlugin } from "@puckeditor/plugin-ai";
import "@puckeditor/plugin-ai/styles.css";
import React from "react";
import { WandSparkles } from "lucide-react";

const aiPlugin = createAiPlugin();
const HEADER_PATH = "/_layout/header";
const FOOTER_PATH = "/_layout/footer";
const STORAGE_KEY = "puck:lastPagePath";

type LayoutView = "content" | "header" | "footer";

type ClientProps = {
  path: string;
  data: Partial<Data>;
  headerData?: Data;
  footerData?: Data;
};

type InlineActionBarProps = {
  label?: string;
  children: React.ReactNode;
  parentAction?: React.ReactNode;
};

function InlineWizardActionBar({
  label,
  children,
  parentAction,
}: InlineActionBarProps) {
  const { selectedItem } = usePuck();

  const onOpenInlineWizard = React.useCallback(() => {
    if (typeof window === "undefined") return;
    const id =
      typeof selectedItem?.props?.id === "string"
        ? selectedItem.props.id
        : "unknown";
    const type = selectedItem?.type ?? "unknown";
    window.alert(`Inline Wizard (next step)\nComponent: ${type}\nID: ${id}`);
  }, [selectedItem]);

  const actions = React.useMemo(() => {
    const items = React.Children.toArray(children);
    const duplicateIndex = items.findIndex(
      (item) => {
        if (!React.isValidElement<{ label?: string }>(item)) return false;
        return item.props.label === "Duplicate";
      }
    );

    const wizardAction = (
      <ActionBar.Action
        key="inline-wizard-action"
        onClick={onOpenInlineWizard}
        label="Inline Wizard"
      >
        <WandSparkles size={16} />
      </ActionBar.Action>
    );

    if (duplicateIndex === -1) {
      return [...items, wizardAction];
    }

    return [
      ...items.slice(0, duplicateIndex + 1),
      wizardAction,
      ...items.slice(duplicateIndex + 1),
    ];
  }, [children, onOpenInlineWizard]);

  return (
    <ActionBar label={label}>
      {parentAction}
      {parentAction ? <ActionBar.Separator /> : null}
      {actions}
    </ActionBar>
  );
}

export function Client({ path, data, headerData, footerData }: ClientProps) {
  const isHeaderPath = path === HEADER_PATH;
  const isFooterPath = path === FOOTER_PATH;
  const view: LayoutView = isHeaderPath
    ? "header"
    : isFooterPath
    ? "footer"
    : "content";

  React.useEffect(() => {
    if (view !== "content") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, path);
    } catch {
      // ignore storage errors
    }
  }, [path, view]);

  const navigate = (target: LayoutView) => {
    if (target === "header") {
      window.location.href = `/puck${HEADER_PATH}`;
      return;
    }
    if (target === "footer") {
      window.location.href = `/puck${FOOTER_PATH}`;
      return;
    }
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;
    const nextPath = stored && stored.startsWith("/") ? stored : "/";
    window.location.href = `/puck${nextPath}`;
  };

  const isComponentArray = (value: unknown): value is Array<any> => {
    if (!Array.isArray(value)) return false;
    if (value.length === 0) return true;
    return value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as any).type === "string"
    );
  };

  const cloneWithPrefix = React.useCallback(
    (content: Array<any>, prefix: string): Array<any> => {
      return content.map((item, index) => {
        if (!item || typeof item !== "object" || typeof item.type !== "string") {
          return item;
        }
        const props = item.props ?? {};
        const nextProps: Record<string, any> = { ...props };
        Object.entries(props).forEach(([key, value]) => {
          if (isComponentArray(value)) {
            nextProps[key] = cloneWithPrefix(
              value,
              `${prefix}-${item.type}-${index}-${key}`
            );
          }
        });
        const baseId = item.id ?? props.id ?? `${item.type}-${index}`;
        const id = `${prefix}-${baseId}`;
        return {
          ...item,
          id,
          props: { ...nextProps, id, __layout: prefix },
        };
      });
    },
    []
  );

  const injectLayout = React.useMemo(() => {
    if (view !== "content") return data;
    const pageContent = Array.isArray(data?.content) ? data.content : [];
    const headerContent = headerData?.content
      ? cloneWithPrefix(headerData.content, "layout-header")
      : [];
    const footerContent = footerData?.content
      ? cloneWithPrefix(footerData.content, "layout-footer")
      : [];
    return {
      ...data,
      content: [...headerContent, ...pageContent, ...footerContent],
    };
  }, [cloneWithPrefix, data, footerData, headerData, view]);

  const stripLayout = React.useCallback((input: Partial<Data>) => {
    const content = Array.isArray(input?.content) ? input.content : [];
    const filtered = content.filter((item) => {
      if (!item || typeof item !== "object") return true;
      const id = (item as any).id ?? (item as any).props?.id;
      if (typeof id !== "string") return true;
      return !(
        id.startsWith("layout-header-") || id.startsWith("layout-footer-")
      );
    });
    return { ...input, content: filtered };
  }, []);

  return (
    <Puck
      plugins={[aiPlugin]}
      config={config}
      data={injectLayout}
      overrides={{
        actionBar: InlineWizardActionBar,
        headerActions: ({ children }) => (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select
              value={view}
              onChange={(event) => navigate(event.target.value as LayoutView)}
              style={{
                height: 32,
                padding: "0 10px",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                background: "white",
                fontSize: 13,
              }}
            >
              <option value="content">Content</option>
              <option value="header">Header</option>
              <option value="footer">Footer</option>
            </select>
            {children}
          </div>
        ),
      }}
      onPublish={async (data) => {
        const cleaned = view === "content" ? stripLayout(data) : data;
        await fetch("/puck/api", {
          method: "post",
          body: JSON.stringify({ data: cleaned, path }),
        });
      }}
    />
  );
}
