/**
 * This file implements a *magic* catch-all route that renders the Puck editor.
 *
 * This route exposes /puck/[...puckPath], but is disabled by middleware.ts. The middleware
 * then rewrites all URL requests ending in `/edit` to this route, allowing you to visit any
 * page in your application and add /edit to the end to spin up a Puck editor.
 *
 * This approach enables public pages to be statically rendered whilst the /puck route can
 * remain dynamic.
 *
 * NB this route is public, and you will need to add authentication
 */

import "@puckeditor/core/puck.css";
import { Client } from "./client";
import { Metadata } from "next";
import { getPage } from "../../../lib/get-page";
import type { Data } from "@puckeditor/core";
import {
  createEmptyPageData,
  FOOTER_PATH,
  HEADER_PATH,
} from "../../../lib/page-seed";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ puckPath: string[] }>;
}): Promise<Metadata> {
  const { puckPath = [] } = await params;
  const path = `/${puckPath.join("/")}`;

  return {
    title: "Puck: " + path,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ puckPath: string[] }>;
}) {
  const { puckPath = [] } = await params;
  const path = `/${puckPath.join("/")}`;
  const data = getPage(path) ?? createEmptyPageData();

  const isLayoutPage = path === HEADER_PATH || path === FOOTER_PATH;
  const headerData: Data | null = isLayoutPage
    ? null
    : getPage(HEADER_PATH) ?? createEmptyPageData();
  const footerData: Data | null = isLayoutPage
    ? null
    : getPage(FOOTER_PATH) ?? createEmptyPageData();

  return (
    <Client
      path={path}
      data={data}
      headerData={headerData ?? undefined}
      footerData={footerData ?? undefined}
    />
  );
}

export const dynamic = "force-dynamic";
