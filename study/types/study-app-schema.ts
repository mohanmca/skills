export type Module = {
  moduleId: string;
  title: string;
  sections: Section[];
  assets: Asset[];
};

export type Section = {
  title: string;
  content: string[];
};

export type Asset = {
  id: string;
  type: 'image' | 'table' | 'diagram';
  path: string;
};

export type Slide = {
  moduleId: string;
  slideNumber: number;
  title: string;
  type: string;
  content: string[];
  visualAssets?: string[];
  mermaid?: string; // Mermaid.js syntax for dynamic diagrams
  formula?: string;
  speakerNotes?: string;
};

export type QuizQuestion = {
  questionId: string;
  type: "mcq" | "true_false" | "fill_blank";
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  hints: string[]; // 2-3 progressive Socratic hints
  sourceModule: string;
  concept?: string;
};

export type Flashcard = {
  id: string;
  front: string;
  back: string;
  sourceModule: string;
};

export type StudentProgress = {
  modules: Record<string, ModuleProgress>;
  srsData: Record<string, FlashcardProgress>; // Flashcard ID to SRS state
  streakDays: number;
  lastStudyDate: string;
  achievements: Achievement[];
};

export type ModuleProgress = {
  slidesCompleted: number;
  totalSlides: number;
  quizAttempted: boolean;
  masteryPercentage: number;
};

export type FlashcardProgress = {
  interval: number;
  easeFactor: number;
  nextReviewDate: string;
};

export type Achievement = {
  id: string;
  title: string;
  emoji: string;
  unlocked: boolean;
};
