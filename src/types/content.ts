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

/** One 3×3 image puzzle inside a sorting level. */
export type PuzzleItemContent = {
  prompt?: string;
  src: string;
  alt?: string;
  successMessage?: string;
};

/**
 * Sorting / puzzle level content.
 * Prefer three scenes each with their own `src`, or one scene with `puzzles`.
 */
export type SortingLevelContent = {
  prompt?: string;
  puzzles?: PuzzleItemContent[];
  src?: string;
  alt?: string;
  successMessage?: string;
  /** @deprecated List-order mode removed; ignored by the player. */
  items?: SortingItemContent[];
  gridSize?: number;
};

export type StatisticContent = {
  name: string;
  percent: number;
  description?: string;
  icon?: string;
  /** Shown when the score is below the attention threshold. */
  attentionNote?: string;
};

export type CompatibilityLevelContent = {
  title?: string;
  introTitle?: string;
  introBody?: string;
  introCta?: string;
  analyzingTitle?: string;
  analyzingLabel?: string;
  analyzingSteps?: string[];
  resultsTitle?: string;
  resultsSubtitle?: string;
  overallLabel?: string;
  attentionThreshold?: number;
  attentionLabel?: string;
  closingMessage?: string;
  /** Green verdict shown when results finish revealing. */
  verdictLabel?: string;
  stats: StatisticContent[];
};

export type PrizeMotif = "dinner" | "trip" | "dance" | "escape";

export type ChoiceOption = {
  id: string;
  label: string;
  /** @deprecated Prefer motif / imageSrc for prize cards. */
  emoji?: string;
  motif?: PrizeMotif;
  /** Public image path, e.g. `/prizes/cena.jpg`. */
  imageSrc?: string;
  reply?: string;
};

export type ChoiceLevelContent = {
  prompt: string;
  /** Short line under the prompt (e.g. prize invitation). */
  subtitle?: string;
  /** Longer text above the prize options (e.g. about the future). */
  body?: string;
  options: ChoiceOption[];
};

export type InteractiveLevelContent = {
  prompt?: string;
  afterPrompt?: string;
  /** Closing line under the final headline. */
  doneBody?: string;
  targetTaps?: number;
  introTitle?: string;
  introBody?: string;
  dances?: DanceRoundContent[];
};

export type DanceStyleName = "bachata" | "salsa";

export type DanceRoundContent = {
  style: DanceStyleName;
  title?: string;
  prompt?: string;
  afterPrompt?: string;
  /** Successful on-beat taps needed to finish the round. */
  targetSteps?: number;
  bpm?: number;
  /**
   * Optional looping track (e.g. `/audio/bachata.mp3`).
   * Until the file exists, the player uses a synth music bed.
   */
  musicSrc?: string;
};
