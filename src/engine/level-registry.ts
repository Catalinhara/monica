import type { Level, LevelType } from "@/types";
import type { LevelRenderer, ValidationResult } from "./types";

function baseValidate(level: Level): ValidationResult {
  const errors: string[] = [];
  if (!level.id) errors.push("Level id is required");
  if (!level.title) errors.push("Level title is required");
  if (!Array.isArray(level.content)) errors.push("Level content must be an array");
  return { valid: errors.length === 0, errors: errors.length ? errors : undefined };
}

/** Generic renderer contract — Phase 3 swaps in mechanic-specific UIs. */
function createPassthroughRenderer(type: LevelType): LevelRenderer {
  return {
    render: () => null,
    validate: (level) => {
      const result = baseValidate(level);
      if (level.type !== type) {
        return {
          valid: false,
          errors: [...(result.errors ?? []), `Expected type ${type}, got ${level.type}`],
        };
      }
      return result;
    },
    getProgress: () => 0,
  };
}

const registry: Partial<Record<LevelType, LevelRenderer>> = {
  story: createPassthroughRenderer("story"),
  memory: createPassthroughRenderer("memory"),
  quiz: createPassthroughRenderer("quiz"),
  sorting: createPassthroughRenderer("sorting"),
  choice: createPassthroughRenderer("choice"),
  compatibility: createPassthroughRenderer("compatibility"),
  timeline: createPassthroughRenderer("timeline"),
  gallery: createPassthroughRenderer("gallery"),
  interactive: createPassthroughRenderer("interactive"),
  final: createPassthroughRenderer("final"),
};

export function getLevelRenderer(type: LevelType): LevelRenderer {
  return registry[type] ?? createPassthroughRenderer(type);
}

export function registerLevelRenderer(type: LevelType, renderer: LevelRenderer): void {
  registry[type] = renderer;
}
