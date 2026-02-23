import fs from "fs";
import type { Data } from "@puckeditor/core";
import {
  ensureLayoutEntries,
  FOOTER_PATH,
  HEADER_PATH,
} from "./page-seed";

export type PageSummary = {
  path: string;
  title: string;
  isLayout: boolean;
};

const getFallbackTitle = (path: string) => {
  if (path === HEADER_PATH) return "Header";
  if (path === FOOTER_PATH) return "Footer";
  if (path === "/") return "Home";
  return path.split("/").filter(Boolean).at(-1) ?? "Page";
};

export const getPageSummaries = (): PageSummary[] => {
  const allData: Record<string, Data> = ensureLayoutEntries(
    fs.existsSync("database.json")
      ? (JSON.parse(fs.readFileSync("database.json", "utf-8")) as Record<
          string,
          Data
        >)
      : {}
  );

  return Object.entries(allData)
    .map(([path, pageData]) => {
      const titleFromData =
        (pageData as any)?.root?.props?.pageTitle ??
        (pageData as any)?.root?.props?.title;
      const title =
        typeof titleFromData === "string" && titleFromData.trim()
          ? titleFromData.trim()
          : getFallbackTitle(path);
      const isLayout = path.startsWith("/_layout/");

      return { path, title, isLayout };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
};
