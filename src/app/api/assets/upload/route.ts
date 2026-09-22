import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeWebReadableStream } from "node:stream/web";
import { NextResponse } from "next/server";
import type { Asset } from "@/types";
import {
  buildUploadFileName,
  validateExperienceId,
  validateMediaFile,
  validationErrorMessage,
} from "@/lib/asset-validation";

export const runtime = "nodejs";

async function saveUploadToDisk(file: File, absolutePath: string) {
  await pipeline(
    Readable.fromWeb(file.stream() as NodeWebReadableStream),
    createWriteStream(absolutePath),
  );
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const experienceIdRaw = form.get("experienceId");
    const altRaw = form.get("alt");

    const experienceId =
      typeof experienceIdRaw === "string" ? experienceIdRaw.trim() : "";
    if (!validateExperienceId(experienceId)) {
      return NextResponse.json(
        { error: validationErrorMessage("invalid_experience_id") },
        { status: 400 },
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: validationErrorMessage("missing_file") },
        { status: 400 },
      );
    }

    const validation = validateMediaFile({
      type: file.type,
      size: file.size,
      name: file.name,
    });
    if (!validation.ok) {
      return NextResponse.json(
        { error: validationErrorMessage(validation.error) },
        { status: 400 },
      );
    }

    const fileName = buildUploadFileName(file.name, validation.mime);
    const relativeDir = path.join("assets", "uploads", experienceId);
    const absoluteDir = path.join(process.cwd(), "public", relativeDir);
    await mkdir(absoluteDir, { recursive: true });

    const absolutePath = path.join(absoluteDir, fileName);
    await saveUploadToDisk(file, absolutePath);

    const url = `/assets/uploads/${experienceId}/${fileName}`;
    const alt =
      typeof altRaw === "string" && altRaw.trim() ? altRaw.trim() : undefined;

    const asset: Asset = {
      id: randomUUID(),
      type: validation.kind,
      url,
      name: file.name,
      alt,
      mimeType: validation.mime,
      sizeBytes: file.size,
      createdAt: new Date().toISOString(),
      experienceId,
    };

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    console.error("Asset upload failed", error);
    return NextResponse.json(
      { error: "No se pudo guardar el archivo en el servidor." },
      { status: 500 },
    );
  }
}
