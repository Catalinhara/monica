import { NextResponse } from "next/server";
import { mkdir, writeFile, readFile, rename } from "fs/promises";
import path from "path";

/** Write JSON atomically so a crash/partial write never leaves corrupt monica.json. */
async function writeJsonAtomic(filePath: string, contents: string) {
  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });
  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, contents, "utf8");
  // Validate before replacing the live file.
  JSON.parse(contents);
  await rename(tmp, filePath);
}

type PersistBody = {
  action: "draft" | "publish" | "backup" | "autosave";
  experience: Record<string, unknown> & { id?: string; version?: number };
  label?: string;
};

type VersionIndexEntry = {
  version: number;
  savedAt: string;
  label: string;
  file: string;
  action: string;
};

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function readIndex(dir: string): Promise<VersionIndexEntry[]> {
  try {
    const raw = await readFile(path.join(dir, "index.json"), "utf8");
    return JSON.parse(raw) as VersionIndexEntry[];
  } catch {
    return [];
  }
}

function canonicalFileName(experienceId: string): string {
  if (experienceId === "exp-monica-001") return "monica.json";
  return "demo.json";
}

type LevelLike = {
  id?: string;
  content?: unknown;
};

function levelBlob(levels: LevelLike[] | undefined, id: string): string {
  const level = levels?.find((l) => l.id === id);
  return JSON.stringify(level?.content ?? []);
}

function hasRecoveredIntro(levels: LevelLike[] | undefined): boolean {
  const blob = levelBlob(levels, "level-0").toLowerCase();
  return blob.includes("cuerpazo") || blob.includes("gastrobar");
}

function hasPolishedLab(levels: LevelLike[] | undefined): boolean {
  const level = levels?.find((l) => l.id === "level-4");
  const scenes = Array.isArray(level?.content) ? level.content : [];
  const first = scenes[0] as { content?: Record<string, unknown> } | undefined;
  const content = first?.content ?? {};
  const stats = Array.isArray(content.stats) ? content.stats : [];
  const blob = JSON.stringify(stats);
  const hasPersonalStats =
    blob.includes("Resistencia al agua fría") ||
    blob.includes("Risas por tonterías") ||
    blob.includes("Compañerismo") ||
    blob.includes("Intimidad y sexo");
  const hasComunicacion = stats.some(
    (s) =>
      typeof s === "object" &&
      s &&
      "name" in s &&
      String((s as { name?: string }).name).includes("Comunicación"),
  );
  return Boolean(
    content.verdictLabel &&
      content.introTitle &&
      (hasPersonalStats || hasComunicacion) &&
      stats.length >= 7,
  );
}

/** Richer personalized lab (user paste) — never replace with older generic stats. */
function hasPersonalizedLab(levels: LevelLike[] | undefined): boolean {
  const blob = levelBlob(levels, "level-4");
  return (
    blob.includes("Resistencia al agua fría") ||
    blob.includes("Risas por tonterías") ||
    blob.includes("Intimidad y sexo")
  );
}

function hasRecoveredQuiz(levels: LevelLike[] | undefined): boolean {
  const level = levels?.find((l) => l.id === "level-2");
  const scenes = Array.isArray(level?.content) ? level.content : [];
  if (scenes.length < 10) return false;
  const blob = JSON.stringify(scenes);
  return (
    blob.includes("no tengo sueño") ||
    blob.includes("demasiado calado") ||
    blob.includes("solo una copa")
  );
}

function hasRecoveredConnection(levels: LevelLike[] | undefined): boolean {
  const blob = levelBlob(levels, "level-5");
  return (
    blob.includes("Te iubesc") ||
    blob.includes("Cómo nos entendemos") ||
    blob.includes("Mi compromiso")
  );
}

function hasRecoveredDance(levels: LevelLike[] | undefined): boolean {
  const blob = levelBlob(levels, "level-6");
  return (
    blob.includes("Dicen que la vida es un baile") ||
    blob.includes("/audio/bachata.mp3") ||
    blob.includes("/audio/salsa.mp3")
  );
}

function hasPrizeChoice(levels: LevelLike[] | undefined): boolean {
  const blob = levelBlob(levels, "level-7");
  return (
    blob.includes("elige un premio") ||
    blob.includes('"motif"') ||
    blob.includes("/prizes/")
  );
}

function noMessageCount(experience: PersistBody["experience"]): number {
  const fq = experience.finalQuestion as
    | { noBehavior?: { messages?: unknown[] } }
    | undefined;
  return Array.isArray(fq?.noBehavior?.messages)
    ? fq.noBehavior.messages.length
    : 0;
}

function hasExpandedNoMessages(experience: PersistBody["experience"]): boolean {
  const fq = experience.finalQuestion as
    | { noBehavior?: { messages?: string[] } }
    | undefined;
  const messages = fq?.noBehavior?.messages ?? [];
  return (
    messages.length >= 10 ||
    messages.some((m) => String(m).includes("mantenimiento"))
  );
}

/**
 * Never let a stale browser draft wipe recovered Monica content on disk.
 */
function protectMonicaExperience(
  incoming: PersistBody["experience"],
  existingRaw: string | null,
): PersistBody["experience"] {
  if (!existingRaw) return incoming;
  let existing: PersistBody["experience"];
  try {
    existing = JSON.parse(existingRaw) as PersistBody["experience"];
  } catch {
    return incoming;
  }

  const next = { ...incoming } as PersistBody["experience"] & {
    levels?: LevelLike[];
    version?: number;
  };
  const existingLevels = (existing as { levels?: LevelLike[] }).levels ?? [];
  let nextLevels = [...(next.levels ?? [])];

  if (hasRecoveredIntro(existingLevels) && !hasRecoveredIntro(nextLevels)) {
    const kept = existingLevels.find((l) => l.id === "level-0");
    if (kept) {
      nextLevels = nextLevels.map((l) => (l.id === "level-0" ? kept : l));
    }
  }

  if (hasRecoveredQuiz(existingLevels) && !hasRecoveredQuiz(nextLevels)) {
    const kept = existingLevels.find((l) => l.id === "level-2");
    if (kept) {
      nextLevels = nextLevels.map((l) => (l.id === "level-2" ? kept : l));
    }
  }

  if (
    hasRecoveredConnection(existingLevels) &&
    !hasRecoveredConnection(nextLevels)
  ) {
    const kept = existingLevels.find((l) => l.id === "level-5");
    if (kept) {
      nextLevels = nextLevels.map((l) => (l.id === "level-5" ? kept : l));
    }
  }

  if (hasRecoveredDance(existingLevels) && !hasRecoveredDance(nextLevels)) {
    const kept = existingLevels.find((l) => l.id === "level-6");
    if (kept) {
      nextLevels = nextLevels.map((l) => (l.id === "level-6" ? kept : l));
    }
  }

  if (hasPrizeChoice(existingLevels) && !hasPrizeChoice(nextLevels)) {
    const kept = existingLevels.find((l) => l.id === "level-7");
    if (kept) {
      nextLevels = nextLevels.map((l) => (l.id === "level-7" ? kept : l));
    }
  }

  // Prefer the personalized lab paste over older generic polished stats.
  if (
    hasPersonalizedLab(existingLevels) &&
    !hasPersonalizedLab(nextLevels)
  ) {
    const kept = existingLevels.find((l) => l.id === "level-4");
    if (kept) {
      nextLevels = nextLevels.map((l) => (l.id === "level-4" ? kept : l));
    }
  } else if (hasPolishedLab(existingLevels) && !hasPolishedLab(nextLevels)) {
    const kept = existingLevels.find((l) => l.id === "level-4");
    if (kept) {
      nextLevels = nextLevels.map((l) => (l.id === "level-4" ? kept : l));
    }
  }

  next.levels = nextLevels;

  if (
    hasExpandedNoMessages(existing) &&
    !hasExpandedNoMessages(next) &&
    noMessageCount(existing) > noMessageCount(next)
  ) {
    const existingFq = existing.finalQuestion as
      | { noBehavior?: Record<string, unknown> }
      | undefined;
    const nextFq = (next.finalQuestion ?? {}) as {
      noBehavior?: Record<string, unknown>;
    };
    next.finalQuestion = {
      ...nextFq,
      noBehavior: {
        ...nextFq.noBehavior,
        ...existingFq?.noBehavior,
        messages: existingFq?.noBehavior?.messages,
      },
    };
  }

  const existingCelebration = existing.celebration as
    | Record<string, unknown>
    | undefined;
  const nextCelebration = next.celebration as Record<string, unknown> | undefined;
  if (
    existingCelebration?.musicSrc &&
    !nextCelebration?.musicSrc
  ) {
    next.celebration = {
      ...(nextCelebration ?? {}),
      ...existingCelebration,
    };
  }

  next.version = Math.max(
    Number(next.version ?? 1),
    Number((existing as { version?: number }).version ?? 1),
  );

  return next;
}

/**
 * Persist experience snapshots to disk.
 * - autosave: updates monica.json + latest* (no new archive file)
 * - draft/publish/backup: also appends an immutable version file
 * Monica archives are never deleted.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PersistBody;
    if (!body?.experience || typeof body.experience !== "object") {
      return NextResponse.json(
        { ok: false, error: "Missing experience" },
        { status: 400 },
      );
    }

    const action = body.action ?? "draft";
    const experienceId =
      typeof body.experience.id === "string"
        ? body.experience.id
        : "exp-monica-001";

    const root = path.join(process.cwd(), "content", "experiences");
    const versionsDir = path.join(root, "versions", experienceId);
    await mkdir(versionsDir, { recursive: true });
    const canonical = canonicalFileName(experienceId);
    const canonicalPath = path.join(root, canonical);

    let existingRaw: string | null = null;
    try {
      existingRaw = await readFile(canonicalPath, "utf8");
    } catch {
      existingRaw = null;
    }

    const experience =
      experienceId === "exp-monica-001"
        ? protectMonicaExperience(body.experience, existingRaw)
        : body.experience;

    const version = Number(experience.version ?? 1);
    const savedAt = new Date().toISOString();
    const label =
      body.label ??
      (action === "publish"
        ? `Published v${version}`
        : action === "backup"
          ? `Backup v${version}`
          : action === "autosave"
            ? `Autosave v${version}`
            : `Draft v${version}`);

    const pretty = JSON.stringify(experience, null, 2) + "\n";

    // Always refresh the live canonical file + latest pointers (atomic).
    await writeJsonAtomic(canonicalPath, pretty);
    await writeJsonAtomic(path.join(versionsDir, "latest.json"), pretty);
    await writeJsonAtomic(
      path.join(
        versionsDir,
        `latest-${action === "backup" ? "backup" : action === "publish" ? "publish" : "draft"}.json`,
      ),
      pretty,
    );

    let fileName: string | undefined;
    let versionPath: string | undefined;
    const shouldArchive = action !== "autosave";

    if (shouldArchive) {
      fileName = `${action}-v${version}-${stamp()}.json`;
      versionPath = path.join(versionsDir, fileName);
      await writeJsonAtomic(versionPath, pretty);

      const entry: VersionIndexEntry = {
        version,
        savedAt,
        label,
        file: fileName,
        action,
      };
      const previous = await readIndex(versionsDir);
      const index =
        experienceId === "exp-monica-001"
          ? [entry, ...previous]
          : [entry, ...previous].slice(0, 100);
      await writeJsonAtomic(
        path.join(versionsDir, "index.json"),
        JSON.stringify(index, null, 2) + "\n",
      );
    }

    return NextResponse.json({
      ok: true,
      file: fileName ?? `latest (${canonical})`,
      path: versionPath ?? path.join(root, canonical),
      canonical,
      archived: shouldArchive,
      indexCount: shouldArchive
        ? (await readIndex(versionsDir)).length
        : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "persist failed",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id") ?? "exp-monica-001";
    const root = path.join(
      process.cwd(),
      "content",
      "experiences",
      "versions",
      id,
    );
    const index = await readIndex(root);
    return NextResponse.json({ ok: true, id, index });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "list failed",
      },
      { status: 500 },
    );
  }
}
