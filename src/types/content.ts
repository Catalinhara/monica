/** Content shapes used by Phase 3 level mechanics (stored in Scene.content). */

export type TextSceneContent = {
  text?: string;
  cta?: string;
  src?: string;
  alt?: string;
};

export type MemoryItemContent = {
  title: string;
  description?: string;
  text?: string;
  src?: string;
  alt?: string;
};

export type QuizOption = {
  id: string;
  label: string;
};

export type QuizQuestionContent = {
  question: string;
  options: QuizOption[];
  /** Optional — wrong answers still continue (fun over gating). */
  correctOptionId?: string;
  feedbackCorrect?: string;
  feedbackWrong?: string;
  feedback?: string;
};

export type SortingItemContent = {
  id: string;
  label: string;
  correctOrder: number;
  description?: string;
};

export type SortingLevelContent = {
  prompt?: string;
  items: SortingItemContent[];
};

export type StatisticContent = {
  name: string;
  percent: number;
  description?: string;
  icon?: string;
};

export type CompatibilityLevelContent = {
  title?: string;
  analyzingLabel?: string;
  stats: StatisticContent[];
};

export type ChoiceOption = {
  id: string;
  label: string;
  emoji?: string;
  reply?: string;
};

export type ChoiceLevelContent = {
  prompt: string;
  options: ChoiceOption[];
};

export type InteractiveLevelContent = {
  prompt: string;
  afterPrompt?: string;
  targetTaps?: number;
};
