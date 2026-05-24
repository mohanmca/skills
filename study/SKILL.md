---
name: study
description: >
  Transform source material (PDF textbooks, documentation, mbox archives, codebases, or user notes)
  into structured study curricula, interactive HTML learning decks with quizzes and progress tracking,
  or facilitator-ready workshop slide decks. Use when the user wants to learn from a document,
  build a course, create a training deck, generate chapter slides and quizzes, or produce a
  self-contained study app with retry logic, final exams, and progress persistence.
---

# Study

## Overview

Convert raw source material into pedagogical artifacts: curriculum maps, slide decks, quizzes,
final exams, and interactive learning apps. Supports three output modes depending on the user's
goal — self-paced study app, facilitator-led workshop, or curriculum planning only.

**Note:** All advanced features (SRS flashcards, Text-to-Speech, Mermaid.js diagrams, Socratic hints, and PWA export) are **ENABLED BY DEFAULT**. If you do not need them, you must explicitly disable them in your prompt.

## Input

The user may provide:

- A PDF or HTML textbook, document, or set of documents.
- Source code, docs, README files, or architecture diagrams.
- Mbox archives or conversation logs.
- Optional grade / age level (e.g., Grade 6, high school, professional).
- Optional subject or topic.
- Optional output format preference (HTML app, PPTX, or curriculum only).
- Optional slide count per module. Default: 10–15.
- Optional quiz count per module. Default: 10.
- Optional final exam question count. Default: 50.

---

## Source Material Handling (HTML / PDF)

Source material is usually provided as HTML pages or PDF documents. Treat these as the ground truth
but **do not blindly propagate errors**.

Use the provided extraction script to bootstrap the process:

```bash
python3 scripts/extract_source.py --input textbook.pdf --output-dir ./extracted
python3 scripts/extract_extended_artifacts.py --input textbook.pdf --output-dir ./extracted
```

The script produces:
- `chapters.json` — structured sections with headings, content, and asset references
- `flashcards.json` — auto-extracted active recall pairs
- `assets/` — extracted images, diagrams, and table JSON files
- `extraction-report.md` — summary of what was found
- `corrections.md` — auto-flagged typos, errors, and extraction artifacts

Dependencies: `pip install pymupdf beautifulsoup4 pdfplumber Pillow`

---

## Token Optimization: "Reference Over Generation"

To minimize context usage and ensure high-quality, consistent code, follow these rules:

1. **Schema Referencing:** Always use the TypeScript models defined in `types/study-app-schema.ts`. Do not redefine them in prompts.
2. **Component Mapping:** Use the pre-built React component library (`FlashcardView`, `MermaidDiagram`, `SpeechTrigger`, `HintAccordion`, `ConfettiOverlay`). Generate structured data (props) rather than raw JSX.
3. **Asset Indexing:** Reference shared SVGs and sounds in `assets/library/` by path. Never generate large inline SVGs if a library icon exists.
4. **CSS Tokens:** Use centralized utility classes from `study-tokens.css` and `animations.css`. These are automatically managed by `scripts/package_app.py`, which copies them from the skill library to the output `/styles/` directory. Always reference them in `index.html` as `./styles/*.css`.
5. **Delta Updates:** When revising, only provide the changed data segments (diffs) rather than re-generating the entire application.

---

## Mode A: Curriculum Extraction & Planning

Use this mode when the user needs a course structure, module sequence, or detailed table of
contents before any slides or quizzes are built.

### Workflow
1. **Inspect source material.**
2. **Determine course shape.**
3. **Draft the module sequence.**
4. **Generate the final TOC.**
5. **Cross-check** and provide summary stats.

---

## Mode B: Interactive Study Deck (HTML App)

Use this mode for self-paced, interactive learning experiences. **Advanced options are enabled by default.**

### Workflow

1. **Read the source material.**
2. **Produce a module plan** (including flashcard and diagram coverage).
3. **Extract assets** and generate `mermaid` diagrams for complex concepts.
4. **Generate slides** with built-in **Text-to-Speech (Web Speech API)** triggers.
5. **Generate quizzes** with a **Socratic Hint System** (2-3 hints per question).
6. **Generate flashcards** for long-term retention via **Spaced Repetition (SRS)**.
7. **Build the app** as a **PWA** (Progressive Web App) with local data export/import capabilities.

### Interactive Features

- **SRS Flashcards:** Use the Leitner system for daily review.
- **Accessibility:** "Read Aloud" buttons on all slides.
- **Visual Reasoning:** Mermaid.js diagrams for flowcharts and timelines.
- **Socratic Hints:** "Need a hint?" button during quizzes that guides rather than tells.
- **Offline Persistence:** PWA manifest + Service Worker for 100% offline usage.

### Kid-Friendly Design Principles (Ages 13–14)

- **Colorful but readable:** Accent colors (coral, teal, amber, violet, emerald).
- **Large touch targets:** For mobile-first accessibility.
- **Animations:** Confetti on completion, subtle transitions.
- **Language:** Warm, casual, and inclusive.

### Visual Design Language (Premium UI)

To match the high-quality standards of our top study apps, every generated app MUST follow this layout:

1. **Header:** Use a gradient background (`linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)`). Include the book emoji 📚, topic title, a progress bar, and a Home button.
2. **Sidebar (Curriculum):** A permanent left sidebar (hidden on mobile) titled "📖 Your Journey" that lists all modules (M1, M2, etc.). Active modules must be highlighted.
3. **Slide Container:** Use the `.slide-premium` class with a white background, rounded corners (1.25rem), and the `popIn` animation.
4. **Animations:** Use `cubic-bezier(0.34, 1.56, 0.64, 1)` for the "pop-in" effect on slides to make them feel "alive."
5. **Footer:** A fixed bottom navigation bar with "Back", slide counter (e.g., "3 / 15"), and "Next" buttons.
6. **Inline Quiz Feedback:** NEVER use `alert()`, `confirm()`, or `prompt()`. Every quiz MUST use inline visual feedback (green for correct, red for incorrect) to maintain the student's flow.

---

## Mode C: Facilitator Workshop Slides (PPTX)

Use this mode for facilitator-led workshop decks.

---

## Data Models

```ts
type Module = {
  moduleId: string;
  title: string;
  sections: Section[];
  assets: Asset[];
};

type Slide = {
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

type QuizQuestion = {
  questionId: string;
  type: "mcq" | "true_false" | "fill_blank";
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  hints: string[]; // 2-3 progressive Socratic hints
  sourceModule: string;
};

type Flashcard = {
  id: string;
  front: string;
  back: string;
  sourceModule: string;
};

type StudentProgress = {
  modules: Record<string, ModuleProgress>;
  srsData: Record<string, FlashcardProgress>; // Flashcard ID to SRS state
  streakDays: number;
  lastStudyDate: string;
  achievements: Achievement[];
};

type FlashcardProgress = {
  interval: number;
  easeFactor: number;
  nextReviewDate: string;
};
```

---

## Quality Rules

- **Accurate:** Factual errors corrected or flagged.
- **Engaging:** Every module has slides, quizzes, flashcards, and interactive diagrams.
- **Private:** strictly client-side storage (localStorage).
- **Offline:** 100% functional without internet after load.

---

## Output Folder Structure

```text
study-output/
  curriculum-map.md
  extraction-report.md
  corrections.md
  assets/
    library/            # Shared SVGs, Sounds, CSS tokens
    images/
  modules/
  slides/
  quizzes/
  flashcards/           # flashcards.json
  app/
    index.html          # PWA enabled
    manifest.json
    service-worker.js
    package.json
    styles/             # Automatically copied CSS tokens
    src/
      components/       # Reusable React Library
      data/
    assets/
      icons/            # Automatically copied icons
  types/
    study-app-schema.ts # Centralized schema
```

---

## Resources

### Extraction
- `scripts/extract_source.py`: Core extraction.
- `scripts/extract_extended_artifacts.py`: Extracts flashcards, mermaid logic, and hints.

### Application Packaging
- `scripts/package_app.py`: Bundles for PWA and offline usage.

### UI & Assets
- `assets/templates/shared-components/`: Reusable React component library.
- `assets/library/`: Shared icons, sounds, and CSS tokens.
- `assets/templates/study_app_react/`: PWA-enabled starter template.
