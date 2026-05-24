# Study Skill — Requirements Document

> **Scope**: Transform source material (PDF textbooks, HTML documents, or user notes) into structured study curricula, interactive HTML/React learning decks, and facilitator-ready workshop slide decks.  
> **Target audience**: Primarily 13–14 year old students from economically disadvantaged backgrounds. The experience must be colorful, encouraging, offline-capable, and device-friendly.
> **Storage constraint**: Strictly client-side only (`localStorage` + `document.cookie` fallback). No server, backend, API, or cloud storage.

---

## Table of Contents

1. [Functional Requirements](#1-functional-requirements)
2. [Source Material Handling](#2-source-material-handling)
3. [Fact-Checking & Content Hygiene](#3-fact-checking--content-hygiene)
4. [Output Modes](#4-output-modes)
5. [Interactive Study Deck Requirements](#5-interactive-study-deck-requirements)
6. [Math & Formula Rendering](#6-math--formula-rendering)
7. [Progress, Motivation & Gamification](#7-progress-motivation--gamification)
8. [Kid-Friendly Design Principles](#8-kid-friendly-design-principles)
9. [Data Models](#9-data-models)
10. [Quality Rules](#10-quality-rules)
11. [Review Checklist](#11-review-checklist)
12. [Dependencies & Tooling](#12-dependencies--tooling)
13. [Output Folder Structure](#13-output-folder-structure)
14. [Resources & Assets](#14-resources--assets)

---

## 1. Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Accept PDF or HTML as primary source material. | Must |
| FR-02 | Extract text with layout/structure preservation (headings, paragraphs, tables, images). | Must |
| FR-03 | Detect and auto-correct typos, grammar issues, and obvious factual errors from the source. | Must |
| FR-04 | Generate a human-readable `corrections.md` log for teacher audit. | Must |
| FR-05 | Produce a structured `chapters.json` consumable by slide/quiz generators. | Must |
| FR-06 | Support three output modes: Curriculum Plan, Interactive HTML Deck, Facilitator PPTX. | Must |
| FR-07 | Generate slides (~10–15 per chapter for textbooks, 2–10 for workshops). | Must |
| FR-08 | Generate chapter quizzes (~10 questions each) with explanations. | Must |
| FR-09 | Generate a final exam (~50 questions) covering all chapters. | Must |
| FR-10 | Support retry of failed questions only. | Must |
| FR-11 | Render mathematical equations (LaTeX) with offline fallback. | Must |
| FR-12 | Track progress, streaks, and achievements using client-side storage only. | Must |
| FR-13 | Work entirely offline after initial page load (except optional CDN assets). | Must |
| FR-14 | Provide a dashboard view showing overall progress and unlocked achievements. | Must |
| FR-15 | Celebrate module completion with visual effects (confetti/animations). | Should |

---

## 2. Source Material Handling

### 2.1 Supported Formats
- **PDF** — textbooks, worksheets, scanned documents (text layer required; OCR not primary).
- **HTML** — web pages, ePub chapters, exported docs.

### 2.2 Extraction Workflow
1. Run `scripts/extract_source.py --input <file> --output-dir <dir>`.
2. For PDF: extract text with layout, detect headings by font size/boldness, save embedded images, extract tables.
3. For HTML: parse DOM, strip ads/nav/footer/cookie banners, preserve semantic structure.
4. Review `extraction-report.md` and `corrections.md`.
5. Clean and correct before generating slides.

### 2.3 Noise Removal
- Remove running headers/footers (e.g., "MATHEMATICS" repeated on every page).
- Remove pure page numbers.
- Remove reprint lines.
- Remove single-character fragments (likely decorative initials).

### 2.4 Heading Merging
- Merge consecutive heading fragments on the same line (titles often alternate font sizes/weights per letter).
- Merge consecutive short heading blocks across lines if they form a coherent title (e.g., "PAIR OF" + "LINEAR EQUATIONS" + "IN TWO VARIABLES").

---

## 3. Fact-Checking & Content Hygiene

### 3.1 Auto-Detection Rules
- **Merged words**: `theend`, `wo- rd` → flag for correction.
- **Impossible numbers**: percentages > 100, negative ages.
- **Contradictions**: conflicting facts within the same document.
- **Extraction artifacts**: garbled tables, missing spaces, broken Unicode.

### 3.2 Correction Policy
```text
DO fix:    typos, grammar, obvious factual errors, broken formatting, extraction artifacts.
DO flag:   uncertain facts, outdated information, contradictions you cannot resolve.
DO NOT:    invent new facts, change the author's intended meaning, add bias.
```

### 3.3 Cross-Checking
- Verify dates, names, and numbers against general knowledge.
- Ensure quiz answers are factually correct independently of the source.
- Normalize units and verify conversions.

---

## 4. Output Modes

### Mode A — Curriculum Extraction & Planning
- Grounded in workspace/user notes.
- Workshop-style progression: fundamentals → implementation → operations → best practices.
- Full Markdown TOC with module tables and summary stats.
- Contiguous module numbering (M0–MN).

### Mode B — Interactive Study Deck (HTML/React)
- Self-paced, offline-capable learning app.
- Module-based navigation with intro → content → recap → quiz structure.
- Keyboard shortcuts: Arrow keys, Home, End, `t` for TOC.
- Self-contained HTML or lightweight React/Vite app.

### Mode C — Facilitator Workshop Slides (PPTX)
- Slide manifest driven.
- Two explicit sections: Performance Optimization & Troubleshooting/Recovery.
- Source conversation citations on scenario slides.

---

## 5. Interactive Study Deck Requirements

### 5.1 Default Behavior
- Build self-contained HTML unless user requests React/Vite.
- Pair with `{topic}_quiz.json`.
- Keep output paths relative to current task.

### 5.2 Slide Rules
- One main idea per slide.
- Maximum 5 bullet points.
- Short sentences; examples over theory.
- Include "Think about this" prompts.
- End each module with a recap + quiz.

### 5.3 Quiz Rules
- 4 options per MCQ unless requested otherwise.
- Correct answer at index `0` in JSON; shuffle at render time via deterministic seed.
- Include explanations for every answer.
- Track failed questions for retry.
- Question types: MCQ, true/false, fill-in-the-blank, matching, diagram-based.

### 5.4 Encouragement System
**Correct-answer messages (rotate randomly):**
```text
🌟 Great job!
💪 You're getting stronger!
🎯 Nailed it!
🚀 Keep going!
🎉 That's the spirit!
✨ You're a star!
```

**Wrong-answer messages (never shame):**
```text
💡 Nice try — here's why…
🌱 Every mistake helps you grow!
🔍 Let's figure this out together.
✅ Almost there! Check this out…
```

### 5.5 Final Exam
- Mix easy/medium/hard.
- Cover every module.
- Show final score, weak modules, and recommended revision.

---

## 6. Math & Formula Rendering

### 6.1 Primary Renderer
- **KaTeX** (CDN for HTML, npm package for React).
- Supports: fractions, superscripts, subscripts, square roots, Greek letters, operators, sums/integrals.

### 6.2 Fallback Renderer
- **Custom HTML5 Canvas math painter** for offline/constrained environments.
- Handles: fractions, superscripts, subscripts, square roots, basic Greek/operators.

### 6.3 Usage
Slide JSON includes a `formula` field with LaTeX:
```json
{
  "title": "Quadratic Formula",
  "formula": "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"
}
```

---

## 7. Progress, Motivation & Gamification

### 7.1 Storage
- **Primary**: `localStorage` with a unique `STORE_KEY` per topic.
- **Fallback**: `document.cookie` with 1-year expiry and `SameSite=Strict` if `localStorage` is blocked.
- **Constraint**: No server, backend, API, or cloud storage ever.

### 7.2 Tracked Metrics
```json
{
  "student_id": "local-user",
  "modules": {
    "module-001": {
      "slides_completed": 15,
      "total_slides": 15,
      "quiz_attempted": true,
      "first_attempt_score": 7,
      "total_questions": 10,
      "failed_questions": ["m1-q3"],
      "retry_completed": true,
      "recovered_questions": ["m1-q3"],
      "mastery_percentage": 90
    }
  },
  "streak_days": 3,
  "last_study_date": "2026-05-24",
  "overall_percentage": 25,
  "achievements": [
    { "id": "first-quiz", "title": "First Steps", "emoji": "👟", "unlocked": true }
  ]
}
```

### 7.3 Achievement Badges

| Badge | Emoji | Trigger |
|-------|-------|---------|
| Blast Off | 🚀 | Complete first slide |
| First Steps | 👟 | Complete first quiz |
| On Fire | 🔥 | 3-day streak |
| Star Student | ⭐ | Perfect score on any quiz |
| Comeback Kid | 🔄 | Retry and recover all failed questions in a module |
| Champion | 🏆 | Complete the final exam |

### 7.4 Dashboard
- Overall course completion percentage (big, colorful, front-and-center).
- Daily streak counter (🔥 3 days).
- Achievement grid with lock/unlock states.
- Per-module progress cards.

### 7.5 Celebrations
- CSS/Framer Motion confetti burst on module completion.
- Subtle slide transition animations (fade, scale, slide).
- Button press feedback (bounce, color shift).

---

## 8. Kid-Friendly Design Principles

### 8.1 Visual Design
- **Bright accent colors**: coral `#f43f5e`, teal `#06b6d4`, amber `#f59e0b`, emerald `#10b981`, violet `#8b5cf6`.
- **Clean backgrounds**: warm off-white (`#fff8f0`) rather than corporate grey.
- **Large touch targets**: buttons and quiz options easy to tap on low-resolution phones.
- **Generous spacing**: comfortable line height (1.6+), 16px minimum font size.

### 8.2 Interaction
- Subtle animations that do not block reading or interaction.
- Emoji usage in titles, buttons, and feedback.
- Warm, casual, inclusive language ("we", "let's").
- No shame for wrong answers — always encouraging.

### 8.3 Accessibility
- Self-contained HTML works without build tools.
- React app runs with `npm install && npm run dev`.
- Mobile-first responsive design.

---

## 9. Data Models

```ts
type Module = {
  moduleId: string;
  title: string;
  pageStart?: number;
  pageEnd?: number;
  sections: Section[];
  assets: Asset[];
};

type Slide = {
  moduleId: string;
  slideNumber: number;
  title: string;
  type: string; // intro | concept | definition | diagram_explanation | formula_explanation | worked_example | table_explanation | real_world_example | mini_activity | recap | chapter_summary | quiz
  content: string[];
  visualAssets?: string[];
  formula?: string;
  table?: TableData;
  animation?: AnimationConfig;
  speakerNotes?: string;
  checkForUnderstanding?: MiniQuestion;
};

type QuizQuestion = {
  questionId: string;
  type: "mcq" | "true_false" | "fill_blank" | "matching" | "diagram";
  difficulty: "easy" | "medium" | "hard";
  concept: string;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  sourceModule: string;
  sourceSlide?: number;
  sourceSection?: string;
};

type StudentProgress = {
  modules: Record<string, ModuleProgress>;
  streakDays?: number;
  lastStudyDate?: string;
  overall_percentage?: number;
  achievements?: Achievement[];
  finalExam?: ExamProgress;
};
```

---

## 10. Quality Rules

- Accurate — factual errors from the source have been corrected or flagged.
- Age-appropriate and easy to read.
- Visually clear and not overcrowded.
- Not copied word-for-word unnecessarily.
- Suitable for revision and self-learning.
- No long paragraphs, tiny fonts, or walls of text.
- Every quiz question has an explanation.
- Every extracted diagram has a valid file path.
- Tables are not broken.
- No more than 5 bullets per slide.

---

## 11. Review Checklist

Before finishing any study deck:

- [ ] HTML is self-contained (or React app runs with `npm install && npm run dev`).
- [ ] `STORE_KEY` is unique for that study topic.
- [ ] Every quiz question has 4 options (when MCQ), `answer: 0`, and an explanation.
- [ ] Slide order, TOC, and keyboard navigation are consistent.
- [ ] Claims in slides are supported by the provided source material.
- [ ] Factual errors and typos from the source have been corrected, not carried forward.
- [ ] `corrections.md` exists if significant changes were made.
- [ ] Every module has slides.
- [ ] Every module has a quiz.
- [ ] Every extracted diagram has a valid file path.
- [ ] Every formula is readable.
- [ ] Tables are not broken.
- [ ] Slide text is short and no slide has more than 5 bullets.
- [ ] Final exam covers all modules.
- [ ] Retry-failed-question flow works.
- [ ] Progress is saved in `localStorage` (with cookie fallback) and never sent to any server.
- [ ] UI feels colorful, encouraging, and accessible on a low-resolution phone.
- [ ] Animations are subtle and do not block reading or interaction.

---

## 12. Dependencies & Tooling

### Extraction Script
```bash
pip install pymupdf beautifulsoup4 pdfplumber Pillow
```

### React Study App
```bash
npm install react react-dom framer-motion katex
```

### Optional CDN (HTML template)
- KaTeX CSS + JS from `cdn.jsdelivr.net`

---

## 13. Output Folder Structure

```text
study-output/
  curriculum-map.md
  extraction-report.md
  corrections.md
  missing-assets.md
  assets/
    images/
    tables/
    diagrams/
    formulas/
  modules/
    module-001.json
    module-002.json
  slides/
    module-001-slides.json
    module-002-slides.json
  quizzes/
    module-001-quiz.json
    module-002-quiz.json
    final-exam.json
  app/
    index.html
    package.json
    src/
      App.jsx
      components/
      data/
      styles/
  reports/
    validation-report.md
```

---

## 14. Resources & Assets

| Path | Description |
|------|-------------|
| `scripts/extract_source.py` | PDF/HTML extractor producing structured JSON + assets |
| `scripts/build_curriculum_from_mbox.py` | Mbox archive parser & curriculum builder (inherited) |
| `scripts/build_slide_manifest.py` | Manifest + speaker notes generator for PPTX (inherited) |
| `assets/templates/study_app.html` | Self-contained HTML study deck with inline CSS/JS |
| `assets/templates/study_app_react/` | React/Vite starter with Framer Motion + KaTeX |
| `assets/templates/generate_workshop_deck.js` | Artifacts-runtime JS for PPTX generation (inherited) |
| `assets/templates/slide_manifest_template.json` | Minimal manifest schema (inherited) |
| `references/slide_storyboard.md` | Deck flow & section pacing guide (inherited) |
| `references/citation_rules.md` | Citation format constraints (inherited) |

---

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2026-05-24 | Kimi Code CLI | Initial requirements based on combined curriculum + workshop_slides skills, plus kid-friendly study app enhancements, math rendering, fact-checking, and client-side-only storage constraints. |
