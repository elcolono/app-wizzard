"use client";

import type { Data } from "@puckeditor/core";
import { Puck, Render, blocksPlugin, outlinePlugin } from "@puckeditor/core";
import config from "../../../config";
import { createAiPlugin } from "@puckeditor/plugin-ai";
import "@puckeditor/plugin-ai/styles.css";
import React from "react";
import { useRouter } from "next/navigation";
import type { PageSummary } from "../../../lib/get-page-summaries";
import { rootPropsPlugin } from "./plugins/root-props-plugin";
import { sectionsPlugin } from "./plugins/sections-plugin";
import { InlineWizardActionBar } from "./components/inline-wizard-action-bar";
import { PageSwitcherHeader } from "./components/page-switcher-header";

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
  pageSummaries: PageSummary[];
};

export function Client({
  path,
  data,
  headerData,
  footerData,
  pageSummaries,
}: ClientProps) {
  const router = useRouter();
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

  const navigateToPath = React.useCallback((nextPath: string) => {
    if (!nextPath.startsWith("/")) return;
    try {
      if (!nextPath.startsWith("/_layout/")) {
        window.localStorage.setItem(STORAGE_KEY, nextPath);
      }
    } catch {
      // ignore storage errors
    }
    router.push(`/puck${nextPath}`);
  }, [router]);

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

  const pageTitle = React.useMemo(() => {
    if (view === "header") return "Header";
    if (view === "footer") return "Footer";
    const rootTitle = (data as any)?.root?.props?.pageTitle;
    if (typeof rootTitle === "string" && rootTitle.trim()) {
      return rootTitle.trim();
    }
    return "Page";
  }, [data, view]);

  const pages = React.useMemo(
    () => pageSummaries.filter((page) => !page.isLayout),
    [pageSummaries]
  );
  const layouts = React.useMemo(
    () => pageSummaries.filter((page) => page.isLayout),
    [pageSummaries]
  );

  return (
    <Puck
      plugins={[
        sectionsPlugin,
        blocksPlugin(),
        outlinePlugin(),
        rootPropsPlugin,
        aiPlugin,
      ]}
      config={config}
      data={injectLayout}
      headerTitle={pageTitle}
      headerPath={path}
      overrides={{
        header: ({ children }) => (
          <PageSwitcherHeader
            path={path}
            pageTitle={pageTitle}
            pages={pages}
            layouts={layouts}
            onNavigate={navigateToPath}
          >
            {children}
          </PageSwitcherHeader>
        ),
        actionBar: InlineWizardActionBar,
        headerActions: ({ children }) => <>{children}</>,
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
