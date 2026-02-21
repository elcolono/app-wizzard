"use client";

import type { Data } from "@puckeditor/core";
import { ActionBar, Puck, Render, usePuck } from "@puckeditor/core";
import config from "../../../config";
import { createAiPlugin } from "@puckeditor/plugin-ai";
import "@puckeditor/plugin-ai/styles.css";
import React from "react";
import { WandSparkles } from "lucide-react";
import { rootPropsPlugin } from "./plugins/root-props-plugin";

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
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [prompt, setPrompt] = React.useState("");

  const onOpenInlineWizard = React.useCallback(() => {
    setIsWizardOpen((open) => !open);
  }, []);

  const onRunInlineWizard = React.useCallback(() => {
    if (typeof window === "undefined") return;
    const id =
      typeof selectedItem?.props?.id === "string"
        ? selectedItem.props.id
        : "unknown";
    const type = selectedItem?.type ?? "unknown";
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      window.alert("Bitte gib zuerst eine Anweisung ein.");
      return;
    }

    window.alert(
      `Inline Wizard (next step)\nComponent: ${type}\nID: ${id}\nPrompt: ${trimmedPrompt}`
    );
  }, [prompt, selectedItem]);

  const onWizardInputKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Keep editor-level shortcuts from firing while typing in the wizard.
      event.stopPropagation();
    },
    []
  );

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
    <div style={{ position: "relative" }}>
      <ActionBar label={label}>
        {parentAction}
        {parentAction ? <ActionBar.Separator /> : null}
        {actions}
      </ActionBar>
      {isWizardOpen ? (
        <div
          onMouseDown={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 280,
            padding: 10,
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            background: "#ffffff",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.12)",
            zIndex: 20,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 6,
              color: "#111827",
            }}
          >
            Inline Wizard
          </div>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={onWizardInputKeyDown}
            placeholder="z.B. Mache diesen Button primär und größer"
            rows={4}
            style={{
              width: "100%",
              resize: "vertical",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              padding: "8px 10px",
              fontSize: 12,
              outline: "none",
              marginBottom: 8,
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              type="button"
              onClick={() => setIsWizardOpen(false)}
              style={{
                height: 28,
                padding: "0 10px",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                background: "#fff",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Schließen
            </button>
            <button
              type="button"
              onClick={onRunInlineWizard}
              style={{
                height: 28,
                padding: "0 10px",
                border: "1px solid #111827",
                borderRadius: 6,
                background: "#111827",
                color: "#fff",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Ausführen
            </button>
          </div>
        </div>
      ) : null}
    </div>
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
      plugins={[rootPropsPlugin, aiPlugin]}
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
