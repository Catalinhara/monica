import type { ReactNode } from "react";
import type { Level } from "@/types";

export type ValidationResult = {
  valid: boolean;
  errors?: string[];
};

export interface LevelRenderer {
  render(level: Level): ReactNode;
  validate(level: Level): ValidationResult;
  getProgress(level: Level): number;
}
