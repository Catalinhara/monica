import type { Level, ThemeConfig } from "./level";

export type NoButtonBehavior = {
  enabled: boolean;
  startAfterAttempts: number;
  messages: string[];
  movementEnabled: boolean;
  movementIntensity: number;
  maxDistance: number;
};

export type FinalQuestion = {
  prompt: string;
  yesLabel: string;
  noLabel: string;
  noBehavior: NoButtonBehavior;
};

export type CelebrationConfig = {
  /** Small label above the title (e.g. Celebración). */
  eyebrow?: string;
  message: string;
  secondaryMessage?: string;
  /** Accent line, e.g. NUEVO LOGRO */
  achievementLabel?: string;
  /** Accent title, e.g. NOVIA DESBLOQUEADA */
  achievementTitle?: string;
  /** Looping background track while on the celebration screen. */
  musicSrc?: string;
  effects: Array<"particles" | "hearts" | "photos" | "lights" | "confetti" | "sound" | "vibration">;
};

export type FinalReward = {
  title: string;
  body: string;
  /** Button on the celebration screen to reveal the prize. */
  cta?: string;
  /** Single closing button on the prize screen (returns to map). */
  doneLabel?: string;
};

export type ExperienceStatus = "draft" | "preview" | "published";

export type Experience = {
  id: string;
  title: string;
  recipientName: string;
  theme: ThemeConfig;
  levels: Level[];
  finalQuestion: FinalQuestion;
  celebration: CelebrationConfig;
  finalReward?: FinalReward;
  status?: ExperienceStatus;
  version?: number;
};

export type Asset = {
  id: string;
  type: "image" | "audio" | "video";
  url: string;
  alt?: string;
  name?: string;
  mimeType?: string;
  sizeBytes?: number;
  createdAt?: string;
  experienceId?: string;
  metadata?: Record<string, unknown>;
};
