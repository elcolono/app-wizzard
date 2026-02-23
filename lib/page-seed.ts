import type { Data } from "@puckeditor/core";

export const HEADER_PATH = "/_layout/header";
export const FOOTER_PATH = "/_layout/footer";

export const createEmptyPageData = (): Data =>
  ({
    root: {
      props: {
        pageTitle: "Untitled Page",
        primary: "#0ea5e9",
        secondary: "#64748b",
      },
    },
    content: [],
    zones: {},
  }) as Data;

export const ensureLayoutEntries = (
  allData: Record<string, Data> | null | undefined
): Record<string, Data> => {
  const nextData: Record<string, Data> = { ...(allData ?? {}) };

  if (!nextData[HEADER_PATH]) {
    nextData[HEADER_PATH] = createEmptyPageData();
  }

  if (!nextData[FOOTER_PATH]) {
    nextData[FOOTER_PATH] = createEmptyPageData();
  }

  return nextData;
};
