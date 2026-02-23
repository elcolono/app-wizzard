import fs from "fs";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { Data } from "@puckeditor/core";
import { createEmptyPageData, ensureLayoutEntries } from "../../../../lib/page-seed";
import {
  buildChildPath,
  isLayoutPath,
  slugifyPageSegment,
} from "../../../../lib/page-path";

type CreatePagePayload = {
  name?: unknown;
  parentPath?: unknown;
};

type DeletePagePayload = {
  path?: unknown;
};

const errorResponse = (status: number, code: string, message: string) =>
  NextResponse.json(
    {
      status: "error",
      code,
      message,
    },
    { status }
  );

export async function POST(request: Request) {
  const payload = (await request.json()) as CreatePagePayload;

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const parentPath =
    typeof payload.parentPath === "string" ? payload.parentPath.trim() : "";

  if (!name) {
    return errorResponse(400, "INVALID_NAME", "Name ist erforderlich.");
  }

  if (!parentPath || !parentPath.startsWith("/")) {
    return errorResponse(400, "INVALID_PARENT", "Ungültiger Parent-Pfad.");
  }

  if (isLayoutPath(parentPath)) {
    return errorResponse(
      400,
      "INVALID_PARENT",
      "Layouts dürfen nicht als Parent verwendet werden."
    );
  }

  const slug = slugifyPageSegment(name);
  if (!slug) {
    return errorResponse(
      400,
      "INVALID_SLUG",
      "Aus dem Namen konnte kein gültiger Pfad erzeugt werden."
    );
  }

  const existingData = JSON.parse(
    fs.existsSync("database.json")
      ? fs.readFileSync("database.json", "utf-8")
      : "{}"
  ) as Record<string, Data>;
  const seededData = ensureLayoutEntries(existingData);

  if (parentPath !== "/" && !seededData[parentPath]) {
    return errorResponse(404, "PARENT_NOT_FOUND", "Parent-Seite nicht gefunden.");
  }

  const newPath = buildChildPath(parentPath, slug);
  if (seededData[newPath]) {
    return errorResponse(
      409,
      "PATH_EXISTS",
      "Eine Seite mit diesem Pfad existiert bereits."
    );
  }

  const nextPageData = createEmptyPageData();
  nextPageData.root = {
    ...(nextPageData.root ?? { props: {} }),
    props: {
      ...(nextPageData.root?.props ?? {}),
      pageTitle: name,
    },
  };

  const updatedData: Record<string, Data> = {
    ...seededData,
    [newPath]: nextPageData,
  };

  fs.writeFileSync("database.json", JSON.stringify(updatedData));
  revalidatePath(newPath);

  return NextResponse.json({
    status: "ok",
    path: newPath,
  });
}

const getParentPath = (pagePath: string): string => {
  if (pagePath === "/") return "/";
  const segments = pagePath.split("/").filter(Boolean);
  if (segments.length <= 1) return "/";
  return `/${segments.slice(0, -1).join("/")}`;
};

export async function DELETE(request: Request) {
  const payload = (await request.json()) as DeletePagePayload;
  const targetPath = typeof payload.path === "string" ? payload.path.trim() : "";

  if (!targetPath || !targetPath.startsWith("/")) {
    return errorResponse(400, "INVALID_PATH", "Ungültiger Seitenpfad.");
  }

  if (targetPath === "/") {
    return errorResponse(400, "INVALID_PATH", "Die Root-Seite kann nicht gelöscht werden.");
  }

  if (isLayoutPath(targetPath)) {
    return errorResponse(
      400,
      "INVALID_PATH",
      "Layout-Seiten können hier nicht gelöscht werden."
    );
  }

  const existingData = JSON.parse(
    fs.existsSync("database.json")
      ? fs.readFileSync("database.json", "utf-8")
      : "{}"
  ) as Record<string, Data>;
  const seededData = ensureLayoutEntries(existingData);

  if (!seededData[targetPath]) {
    return errorResponse(404, "NOT_FOUND", "Seite nicht gefunden.");
  }

  const hasChildren = Object.keys(seededData).some(
    (path) => path !== targetPath && path.startsWith(`${targetPath}/`)
  );

  if (hasChildren) {
    return errorResponse(
      409,
      "HAS_CHILDREN",
      "Seite hat Unterseiten und kann nicht gelöscht werden."
    );
  }

  const updatedData: Record<string, Data> = { ...seededData };
  delete updatedData[targetPath];

  fs.writeFileSync("database.json", JSON.stringify(updatedData));
  revalidatePath(targetPath);
  revalidatePath(getParentPath(targetPath));

  return NextResponse.json({
    status: "ok",
    path: targetPath,
  });
}
