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
  message: string;
  secondaryMessage?: string;
  effects: Array<"particles" | "hearts" | "photos" | "lights" | "confetti" | "sound" | "vibration">;
};

export type FinalReward = {
  title: string;
  body: string;
  cta?: string;
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
  metadata?: Record<string, unknown>;
};
