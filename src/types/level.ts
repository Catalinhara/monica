import type { QuizAboutHerConfig } from "./content";

export type LevelType =
  | "story"
  | "memory"
  | "quiz"
  | "sorting"
  | "choice"
  | "compatibility"
  | "timeline"
  | "gallery"
  | "interactive"
  | "final";

export type LevelStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "completed";

export type AnimationPreset =
  | "fade"
  | "fade-scale"
  | "slide-up"
  | "slide-left"
  | "blur-reveal"
  | "photo-reveal"
  | "cinematic-zoom"
  | "floating"
  | "parallax"
  | "particles"
  | "heart-burst"
  | "confetti"
  | "glow"
  | "typewriter";

export type AnimationConfig = {
  preset: AnimationPreset;
  duration: number;
  delay: number;
  easing: string;
  intensity?: number;
};

export type SceneType =
  | "text"
  | "image"
  | "video"
  | "statistic"
  | "question"
  | "animation"
  | "choice";

export type Scene = {
  id: string;
  type: SceneType;
  content: unknown;
  animation?: AnimationConfig;
  duration?: number;
};

export type RewardType =
  | "memory"
  | "badge"
  | "quote"
  | "photo"
  | "story"
  | "animation";

export type Reward = {
  type: RewardType;
  content: string;
};

export type CompletionRule = {
  type: "all-scenes" | "correct-answers" | "manual" | "interaction-count";
  threshold?: number;
};

export type ThemeConfig = {
  id: string;
  name: string;
  colors: {
    background: string;
    foreground: string;
    accent: string;
    muted: string;
  };
  typography?: {
    display?: string;
    body?: string;
  };
};

export type Level = {
  id: string;
  order: number;
  title: string;
  subtitle?: string;
  type: LevelType;
  intro?: Scene;
  content: Scene[];
  completion: CompletionRule;
  reward?: Reward;
  theme?: Partial<ThemeConfig>;
  active?: boolean;
  /** Quiz-only: post-results “about her” Q&A with check/X scoring. */
  aboutHer?: QuizAboutHerConfig;
};

export type LevelProgress = {
  levelId: string;
  status: LevelStatus;
  score?: number;
  attempts?: number;
  completedAt?: string;
  /** Prize / choice selected in a choice level (e.g. El futuro). */
  selectedOptionId?: string;
  selectedOptionLabel?: string;
};
