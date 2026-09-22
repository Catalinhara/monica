import { unlink } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isSafeUploadUrl } from "@/lib/asset-validation";

export const runtime = "nodejs";

type DeleteBody = {
  url?: string;
};

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Asset id requerido." }, { status: 400 });
    }

    const body = (await request.json().catch(() => ({}))) as DeleteBody;
    const url = body.url;
    if (!url || !isSafeUploadUrl(url)) {
      return NextResponse.json(
        { error: "URL de asset inválida o fuera de uploads." },
        { status: 400 },
      );
    }

    const relative = url.replace(/^\//, "").replace(/\//g, path.sep);
    const absolutePath = path.resolve(process.cwd(), "public", relative);
    const uploadsRoot = path.resolve(
      process.cwd(),
      "public",
      "assets",
      "uploads",
    );

    if (
      absolutePath !== uploadsRoot &&
      !absolutePath.startsWith(uploadsRoot + path.sep)
    ) {
      return NextResponse.json({ error: "Ruta no permitida." }, { status: 400 });
    }

    try {
      await unlink(absolutePath);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "ENOENT") throw error;
    }

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error("Asset delete failed", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el archivo." },
      { status: 500 },
    );
  }
}
