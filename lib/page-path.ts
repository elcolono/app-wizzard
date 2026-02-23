import { FOOTER_PATH, HEADER_PATH } from "./page-seed";

export const isLayoutPath = (path: string): boolean => {
  return (
    path.startsWith("/_layout/") || path === HEADER_PATH || path === FOOTER_PATH
  );
};

export const slugifyPageSegment = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

export const buildChildPath = (parentPath: string, slug: string): string => {
  const normalizedParent =
    parentPath === "/" ? "" : parentPath.replace(/\/+$/, "");
  return `${normalizedParent}/${slug}`;
};
