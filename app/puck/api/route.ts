import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import fs from "fs";
import type { Data } from "@puckeditor/core";
import { ensureLayoutEntries } from "../../../lib/page-seed";

export async function POST(request: Request) {
  const payload = await request.json();

  const existingData = JSON.parse(
    fs.existsSync("database.json")
      ? fs.readFileSync("database.json", "utf-8")
      : "{}"
  );
  const seededData = ensureLayoutEntries(existingData as Record<string, Data>);

  const updatedData = {
    ...seededData,
    [payload.path]: payload.data,
  };

  fs.writeFileSync("database.json", JSON.stringify(updatedData));

  // Purge Next.js cache
  revalidatePath(payload.path);

  return NextResponse.json({ status: "ok" });
}
