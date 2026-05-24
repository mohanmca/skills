# Study Skill — Future Enhancements & Roadmap

This document outlines planned enhancements for the Study Skill to deepen engagement, improve accessibility, and ensure long-term retention for our primary audience (13–14 year old students). All enhancements strictly adhere to the existing offline-first, client-side-only architecture.

---

## Table of Contents

1. [Active Recall & Spaced Repetition (SRS)](#1-active-recall--spaced-repetition-srs)
2. [Multi-modal Accessibility (Text-to-Speech)](#2-multi-modal-accessibility-text-to-speech)
3. [Visual Reasoning (Mermaid.js Integration)](#3-visual-reasoning-mermaidjs-integration)
4. [Socratic "Hint" System](#4-socratic-hint-system)
5. [Local-First Portability (PWA & Export)](#5-local-first-portability-pwa--export)
6. [Updated Data Models](#6-updated-data-models)

---

## 1. Active Recall & Spaced Repetition (SRS)

**Goal:** Transition the application from a "one-time read" to a long-term retention tool by introducing flashcards with spaced repetition mechanics.

### Requirements
- **Flashcard Generation:** The extraction process must produce a `flashcards.json` artifact alongside slides and quizzes.
- **SRS Algorithm:** Implement a simplified Leitner system or SM-2 algorithm entirely in JavaScript.
- **UI Integration:** Add a "Daily Review" mode to the dashboard that presents due flashcards.
- **Storage:** Persist flashcard intervals, ease factors, and next review dates in `localStorage`.

---

## 2. Multi-modal Accessibility (Text-to-Speech)

**Goal:** Support students with varying reading levels, learning disabilities, or visual impairments.

### Requirements
- **Web Speech API:** Utilize the native browser `SpeechSynthesis` API to remain completely offline and require no external backend.
- **UI Integration:** Add a recognizable "Listen / Read Aloud" button on all content slides and quiz questions.
- **Pacing & Highlighting:** (Optional) Highlight sentences as they are read, and provide basic playback controls (play/pause/speed).

---

## 3. Visual Reasoning (Mermaid.js Integration)

**Goal:** Provide dynamic, crisp, and interactive diagrams that scale perfectly on any device, reducing reliance on extracted bitmap images.

### Requirements
- **Generation:** Update the slide generation prompt to produce valid `mermaid` syntax for flowcharts, timelines, and concept maps.
- **Rendering:** Integrate the `mermaid.js` library into the HTML/React templates.
- **UI Integration:** Render the syntax into zoomable, interactive SVGs within the slide container.

---

## 4. Socratic "Hint" System

**Goal:** Encourage critical thinking and problem-solving rather than rote memorization when a student struggles with a quiz question.

### Requirements
- **Hint Generation:** Require the generation of 2–3 progressive hints for every `QuizQuestion`.
  - *Hint 1:* A gentle nudge toward the concept.
  - *Hint 2:* A more direct clue or elimination of an incorrect option.
  - *Hint 3:* A near-giveaway focusing on the core logic.
- **UI Integration:** Add a "Need a hint?" button during quizzes. Using a hint slightly reduces the mastery score gained for that question to balance gamification.

---

## 5. Local-First Portability (PWA & Export)

**Goal:** Protect student progress against accidental browser cache clears and provide a native-app feel.

### Requirements
- **PWA Manifest:** Generate a `manifest.json` and basic Service Worker for the HTML/React templates to allow "Install to Home Screen".
- **Data Export:** Add a "Backup My Progress" button in the settings/dashboard that downloads a small JSON file containing their `localStorage` state.
- **Data Import:** Add a "Restore Progress" feature to parse and apply an uploaded JSON backup.

---

## 6. Updated Data Models

To support these enhancements, the core data models will be expanded:

```ts
// Added to Slide model
type Slide = {
  // ... existing fields ...
  mermaid?: string; // Valid mermaid syntax for diagram generation
};

// Added to QuizQuestion model
type QuizQuestion = {
  // ... existing fields ...
  hints: string[]; // 2-3 progressive hints
};

// New Flashcard Model
type Flashcard = {
  id: string;
  front: string; // Question or concept
  back: string;  // Answer or definition
  sourceModule: string;
};

// Added to StudentProgress model
type StudentProgress = {
  // ... existing fields ...
  srsData: Record<string, FlashcardProgress>; // Flashcard ID to SRS state
};

type FlashcardProgress = {
  interval: number;
  easeFactor: number;
  nextReviewDate: string; // ISO 8601 string
};
```