import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

/** Always return the on-disk monica.json (bypasses client bundle cache). */
export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "content",
      "experiences",
      "monica.json",
    );
    const raw = await readFile(filePath, "utf8");
    const experience = JSON.parse(raw);
    return NextResponse.json({ ok: true, experience });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "read failed",
      },
      { status: 500 },
    );
  }
}
