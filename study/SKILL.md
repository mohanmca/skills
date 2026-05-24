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

Source material may include PDF textbooks, documentation, mailing-list archives, code repositories,
architecture diagrams, or plain notes.

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

### Extraction workflow

1. **Parse structure.**
   - For PDF: extract text with layout, preserve page numbers, detect headings, lists, tables.
   - For HTML: parse the DOM, preserve semantic structure (headings, sections, lists, tables, images),
     strip ads, navigation bars, and footers.
2. **Detect and flag potential errors.**
   - Typos, grammatical mistakes, and formatting issues.
   - Factual contradictions within the same document.
   - Outdated information (old dates, deprecated terms, obsolete statistics).
   - Impossible numbers (e.g., percentages > 100, negative ages).
   - Broken or mismatched diagram captions.
3. **Clean and correct.**
   - Fix spelling and grammar silently.
   - Correct obvious factual errors using general knowledge (e.g., "the capital of France is Berlin" → Paris).
   - If a fact is uncertain or contested, **omit it or flag it for review** — do not invent a replacement.
   - Preserve the original meaning; never introduce new concepts not supported by the source.
4. **Generate a correction log.**
   - `corrections.md`: list every significant change made, the original text, the corrected text, and
     the reason. This builds trust and allows teachers to audit.

---

## Fact-Checking & Content Hygiene

Before generating any slide or quiz:

- **Cross-check key facts** against reliable knowledge (geography, history, basic science, math).
- **Verify dates, names, and numbers** that appear in the source.
- **Watch for common PDF extraction artifacts**: merged words (`theend`), split words (`wo- rd`),
  missing spaces, garbled tables.
- **Ensure quiz answers are factually correct** independently of the source — a typo in the PDF
  should not become the "correct" answer in a quiz.
- **Normalize units** and check that conversions are accurate.

### Correction rules

```text
DO fix:    typos, grammar, obvious factual errors, broken formatting, extraction artifacts.
DO flag:   uncertain facts, outdated information, contradictions you cannot resolve.
DO NOT:    invent new facts, change the author's intended meaning, add bias.
```

---

## Mode A: Curriculum Extraction & Planning

Use this mode when the user needs a course structure, module sequence, or detailed table of
contents before any slides or quizzes are built.

### Default Behavior

- Ground the curriculum in the current workspace, user notes, and any supplied source files.
- Prefer a learning progression from fundamentals to implementation, operations, and best practices.
- Output a full TOC in Markdown unless the user asks for another format.
- Keep naming and scope aligned with the actual domain instead of reusing unrelated examples.

### Workflow

1. **Inspect source material.**
   Prioritize docs, README files, examples, package names, folders, tests, pipelines, and any
   existing slide or workshop artifacts.
2. **Determine course shape.**
   Decide whether the material supports a short workshop, a multi-module deep dive, or a broader
   curriculum.
3. **Draft the module sequence** before filling in slide titles.
   Each module should have a clear learning goal and build on the previous ones.
4. **Generate the final TOC** with per-module slide titles and summary stats.
5. **Cross-check** that every title is supported by the workspace and that totals are internally
   consistent.

For mbox-derived curriculum:

1. Run the parser:
   - `python3 scripts/build_curriculum_from_mbox.py --input-dir <mbox-dir> --output-dir <output-dir>`
2. Inspect the generated index:
   - `<output-dir>/thread_index.csv`
   - `<output-dir>/curriculum.md`
3. Review generated article drafts under:
   - `<output-dir>/articles/performance/`
   - `<output-dir>/articles/troubleshooting/`
4. Validate traceability using:
   - `<output-dir>/traceability.md`

### Grouping Rules (Mbox Mode)

- Group A: `Performance Optimization`
  - Throughput/latency tuning, state backend and memory tuning, checkpoint efficiency, scaling.
- Group B: `Troubleshooting and Recovery`
  - Runtime failures, stuck jobs, recovery/restore incidents, corruption, HA/deployment incidents.

### Curriculum Shape

Unless the workspace strongly suggests otherwise:

- Start with foundations, terminology, and repository orientation.
- Move into core architecture, configuration, workflows, and real implementation walkthroughs.
- End with testing, operations, security, best practices, troubleshooting, or capstone material.

Default to a contiguous module sequence such as `M0` through `M11`, but adjust the count if the
material is clearly narrower or broader.

### Module Design

Each module should usually include:

- a focused module title
- 2 to 15 content slides, depending on topic depth and audience
- one final quiz slide when quizzes are part of the requested output

Early modules can be broader. Later modules should generally narrow toward practice, operations,
and synthesis instead of repeating fundamentals.

### Slide Title Guidance

Prefer short, concrete, Title Case slide names tied to one concept each.

Useful patterns include:

- `What Is <Concept>?`
- `Repository Tour: <Area>`
- `<Component> Architecture`
- `<Tool> vs Alternatives`
- `<Config or Syntax> Crash Course`
- `Real Module: <Existing Module Name>`
- `Deployment Pipeline`
- `Observability & Monitoring`
- `Security & Access Control`
- `Best Practices Checklist`
- `Anti-Patterns To Avoid`
- `Testing Workflow`
- `API Usage`
- `Examples`

Avoid filler titles such as `Introduction` when a more precise learning outcome is available.

### TOC Output

When the user asks for a full TOC, prefer this structure:

1. `## REFERENCE: <Course / Workshop Name> Full TOC (All Modules & Slides)`
2. Module sections `M0` through `MN`
3. A Markdown table per module with columns `#` and `Slide Title`
4. A final bold quiz row for each module when quizzes are included
5. `### TOC Summary Stats`

For each module header, include the content slide count and quiz count if quizzes are in scope.

### Summary Stats

When generating summary stats, include:

- total modules
- total slides
- quiz question count or quiz slide assumptions
- slide count range per module
- naming pattern used
- content density pattern across the course

Totals must match the module tables.

---

## Mode B: Interactive Study Deck (HTML App)

Use this mode when the user wants a self-paced, interactive learning experience — slides, quizzes,
progress tracking, and a final exam — delivered as a self-contained HTML application.

### Default Behavior

- Build a self-contained HTML presentation with inline CSS and JavaScript unless the user asks
  for another format (e.g., React/Vite app).
- Pair the presentation with a `{topic}_quiz.json` file when quizzes are requested.
- Keep output paths relative to the current task unless the user explicitly gives a destination.
- Reuse existing local workshop examples if they exist; otherwise follow the structure below.

### Workflow

1. **Read the source material first.**
   Source material can include notes, markdown, code paths, PRs, docs, architecture diagrams, or
   user bullets.
2. **Produce a module plan** before drafting the full deck.
   The plan should name each module, explain its scope, and note the expected quiz coverage.
3. **Extract or preserve visual assets.**
   Diagrams, charts, tables, formulas, and illustrations should be saved with metadata referencing
   the source page or section.
4. **Generate slides** for each module.
   Default: ~15 slides per chapter for textbooks, 2–10 for technical workshops.
5. **Generate quizzes** for each module.
   Default: 10 questions per module.
6. **Generate a final exam** from all modules.
   Default: 50 questions.
7. **Build the app** and verify navigation, quiz flow, and JSON structure before handing off.

### Deck Structure (HTML)

Use a single HTML file with inline CSS and JavaScript, or a lightweight React/Vite app if the user
requests it.

- Include a progress bar, header, slide container, table of contents, and previous/next navigation.
- Support keyboard navigation: next, previous, first slide, last slide, TOC toggle, and retry failed
  quiz questions.
- Persist progress with a unique `STORE_KEY` derived from the topic.
- Organize deck content as modules. Each module should usually contain:
  - an intro or objective slide
  - several content slides
  - a short recap slide
  - a quiz slide at the end of the module

Prefer a JavaScript structure similar to:

- `QUIZ_DATA` for quiz content
- `MODULE_NAMES` for module labels
- `SLIDES` for ordered slide objects
- rendering helpers such as `render`, `renderQuiz`, `go`, `toggleTOC`, `save`, and `load`

### Slide Rules

- One main idea per slide.
- Maximum 5 bullet points.
- Use short sentences.
- Prefer examples over theory.
- Use diagrams wherever useful.
- Use formulas only when needed; explain them step by step.
- Include "Think about this" prompts.
- Include small recap slides.
- Include one final summary slide per module.

Recommended slide types:

```text
intro
concept
definition
diagram_explanation
formula_explanation
worked_example
table_explanation
real_world_example
mini_activity
recap
chapter_summary
```

### Content Guidance

- Keep slides dense enough to teach something real, but do not pad them to hit arbitrary word counts.
- Use tables, code blocks, callouts, and ASCII diagrams where they materially improve comprehension.
- Favor concrete names from the source material: services, configs, classes, tables, commands,
  files, and failure modes.
- Merge weak slides instead of creating filler.
- End each module with a recap that sets up the quiz.
- For younger audiences, use simple language, real-life analogies (food, money, sports), and
  visual-first layouts.

### Kid-Friendly Design Principles (Ages 13–14)

The default study-app look and feel targets teenagers from all economic backgrounds. Design choices
should feel welcoming, not patronizing.

- **Colorful but readable:** Use bright accent colors (coral, teal, amber, violet, emerald) on
  clean backgrounds. Avoid dark, corporate grey palettes.
- **Large touch targets:** Buttons and quiz options should be easy to tap on low-resolution phones.
- **Animations:** Subtle slide transitions, button press effects, and celebration bursts on
  milestones. Never block interaction with long animations.
- **Encouragement, never shame:** Wrong answers get "Nice try — here's why…" not red X's alone.
  Right answers get "🌟 Great job!" or "💪 You're getting stronger!"
- **Celebrate progress:** Show streaks, unlock badges, and fill up progress bars. Use confetti-like
  CSS effects when a module is completed.
- **Language:** Warm, casual, and inclusive. Use "we" and "let's." Avoid jargon without explanation.
- **Icons and emojis:** Use emojis generously in titles, buttons, and feedback to add personality
  without requiring image assets.
- **Reading comfort:** Generous line height (1.6+), comfortable font sizes (16px minimum), and
  plenty of whitespace. Avoid walls of text.

### Quiz Rules

- Use 4 options per MCQ question unless the user asks for another format.
- In JSON, keep the correct answer at index `0`.
- Shuffle options at render time, not in the stored JSON.
- Make the shuffle deterministic from a stable seed such as the question ID.
- Include explanations grounded in the workshop content.
- Track failed questions so the learner can retry them.
- Support multiple question types: MCQ, true/false, fill-in-the-blank, matching, diagram-based.

### Failed Question Retry

1. Student attempts the module quiz.
2. Save wrong answers.
3. Show result.
4. Allow retake of **only** failed questions.
5. If the student gets a failed question correct in retry, mark it as recovered.
6. Keep history of:
   - first attempt score
   - failed questions
   - retry score
   - final module mastery score

**Storage is strictly client-side only.** All progress, streaks, and achievements are stored in
`localStorage` with `document.cookie` as a silent fallback for environments that block
`localStorage` (e.g., private browsing on some phones). No data is ever sent to a server,
backend, API, or cloud service. The app works entirely offline after the initial page load.

### Final Exam

- Mix easy, medium, and hard questions.
- Cover every module.
- Avoid repeating only one topic.
- Include important formulas, diagrams, definitions, and concepts.
- Show final score, weak modules, and recommended revision modules.

### Progress Tracking & Motivation

Track per module:

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
      "failed_questions": ["module-001-q003", "module-001-q008"],
      "retry_completed": true,
      "recovered_questions": ["module-001-q003"],
      "mastery_percentage": 90
    }
  }
}
```

Track overall motivation metrics:

```json
{
  "streak_days": 3,
  "last_study_date": "2026-05-24",
  "total_modules_completed": 2,
  "total_modules": 8,
  "achievements": [
    { "id": "first-quiz", "title": "First Steps", "emoji": "👟", "unlocked": true },
    { "id": "perfect-score", "title": "Perfect Score", "emoji": "⭐", "unlocked": false }
  ],
  "overall_percentage": 25
}
```

Show progress bars for:
- chapter / module completion
- slide completion
- quiz completion
- final exam
- **overall course completion** (big, colorful, front-and-center on the dashboard)

Display a **daily streak counter** (🔥 5 days) and encourage the learner to keep it alive.

Unlock **achievement badges** for milestones:

| Badge | Trigger |
|-------|---------|
| 🚀 Blast Off | Complete first slide |
| 👟 First Steps | Complete first quiz |
| 🔥 On Fire | 3-day streak |
| ⭐ Star Student | Perfect score on any quiz |
| 🔄 Comeback Kid | Retry and recover all failed questions in a module |
| 🏆 Champion | Complete the final exam |

Encouragement messages (rotate randomly on correct answers):

```text
🌟 Great job!
💪 You're getting stronger!
🎯 Nailed it!
🚀 Keep going!
🎉 That's the spirit!
✨ You're a star!
```

Encouragement messages on wrong answers (never shame):

```text
💡 Nice try — here's why…
🌱 Every mistake helps you grow!
🔍 Let's figure this out together.
✅ Almost there! Check this out…
```

### ADQ Mode

If the user asks for ADQ or an architecture deep-dive style study deck:

- Focus on systems, boundaries, data flow, deployment shape, and external dependencies.
- Mention important traits, classes, topics, queues, tables, and config files.
- Prefer architecture and operational reasoning over method-by-method walkthroughs.
- Use diagrams and production-flavored examples wherever the source material supports them.

### Review Checklist

Before finishing:

- Confirm the HTML is self-contained (or the React app runs with `npm install && npm run dev`).
- Confirm the `STORE_KEY` is unique for that study topic.
- Confirm every quiz question has 4 options (when MCQ), `answer: 0`, and an explanation.
- Confirm the slide order, TOC, and keyboard navigation are consistent.
- Confirm claims in the slides are supported by the provided source material.
- Confirm **factual errors and typos from the source have been corrected**, not carried forward.
- Confirm a `corrections.md` exists if significant changes were made.
- Confirm every module has slides.
- Confirm every module has a quiz.
- Confirm every extracted diagram has a valid file path.
- Confirm every formula is readable.
- Confirm tables are not broken.
- Confirm slide text is short and no slide has more than 5 bullets.
- Confirm the final exam covers all modules.
- Confirm retry-failed-question flow works.
- Confirm progress is saved in `localStorage` (with cookie fallback) and never sent to any server.
- Confirm the app makes no network requests except for optional CDN assets (e.g., KaTeX).
- Confirm the UI feels **colorful, encouraging, and accessible** on a low-resolution phone.
- Confirm animations are subtle and do not block reading or interaction.

### Output Naming

Use topic-based names unless the user specifies otherwise.

- HTML: `{topic_name}_study.html` or `{topic_name}_workshop.html`
- Quiz JSON: `{topic_name}_quiz.json`
- App folder: `{topic_name}-study-app/`

If the user requests revisions to an existing study deck, preserve the current naming and update
only what is necessary.

---

## Mode C: Facilitator Workshop Slides (PPTX)

Use this mode when the user wants a facilitator-led workshop deck derived from curriculum and
article artifacts, especially from mbox-derived curriculum content.

### Workflow

1. Build a slide manifest from curriculum outputs:
   - `python3 scripts/build_slide_manifest.py --curriculum <curriculum.md> --traceability <traceability.md> --output-dir <dir>`
2. Review and adjust storyline using:
   - `references/slide_storyboard.md`
3. Use `assets/templates/generate_workshop_deck.js` with the artifacts runtime to create the final
   `.pptx`.
4. Validate every case-study slide includes source references from the traceability file.

### Slide Requirements

- Preserve two explicit sections:
  - Performance Optimization
  - Troubleshooting and Recovery
- Keep short, workshop-friendly slide text.
- Use scenario + playbook framing instead of abstract theory.
- Include source conversation citations on scenario slides.

### Deliverables

- `slide_manifest.json`: ordered slide plan with section/topic/reference fields
- `speaker_notes.md`: facilitator notes mapped to slide numbers
- `workshop_deck.pptx`: final exported presentation

---

## Data Models

Use these TypeScript-style models as reference when generating JSON artifacts:

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
  type: string;
  content: string[];
  visualAssets: string[];
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
  finalExam?: ExamProgress;
};
```

---

## Quality Rules

The generated learning content must be:

- **Accurate** — factual errors from the source have been corrected or flagged.
- Faithful to the source material's intended meaning.
- Age-appropriate and easy to read.
- Visually clear and not overcrowded.
- Not copied word-for-word unnecessarily.
- Suitable for revision and self-learning.

Each slide should have:

```text
title
simple explanation
visual support where useful
small example
optional mini question
```

Avoid:

- Long paragraphs.
- Too much text per slide.
- Tiny fonts.
- Too many formulas at once.
- Copy-paste of source pages.
- Missing diagram references.
- Unexplained tables.
- Questions without explanations.
- Carrying forward typos, extraction artifacts, or factual errors from PDF/HTML sources.

---

## Output Folder Structure

When generating a full study system, create:

```text
study-output/
  curriculum-map.md
  extraction-report.md
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

## Resources

### Curriculum & Mbox
- `scripts/build_curriculum_from_mbox.py`
  - End-to-end parser, classifier, curriculum builder, article writer.
- `references/taxonomy.md`
  - Topic tags, scoring dimensions, and module mapping.
- `references/article_style_guide.md`
  - Required structure for knowledge article quality.
- `references/traceability_matrix.md`
  - Source conversation mapping for generated content.
- `assets/templates/`
  - Reusable templates for curriculum pages and article pages.

### Slide Manifest & PPTX
- `scripts/build_slide_manifest.py`
  - Builds a structured manifest and speaker notes from curriculum + traceability files.
- `references/slide_storyboard.md`
  - Recommended deck flow and section pacing.
- `references/citation_rules.md`
  - Citation format and evidence quality constraints.
- `assets/templates/generate_workshop_deck.js`
  - Starter artifacts-runtime JavaScript for deck generation.
- `assets/templates/slide_manifest_template.json`
  - Minimal schema for custom manifest editing.

### Math & Formula Rendering

Both the HTML and React study-app templates support mathematical equations:

- **Primary renderer:** KaTeX (fast, self-contained, supports standard LaTeX math).
- **Fallback renderer:** Custom HTML5 Canvas math painter for offline or constrained environments.

#### Supported constructs

- Fractions: `\frac{a}{b}`
- Superscripts / exponents: `x^2`, `a^{n+1}`
- Subscripts: `x_i`, `a_{n-1}`
- Square roots: `\sqrt{x}`, `\sqrt[n]{x}`
- Greek letters: `\alpha`, `\beta`, `\pi`, `\Sigma`, …
- Operators: `+`, `-`, `\times`, `\div`, `\pm`, `=`, `<`, `>`
- Grouping: `(`, `)`, `[`, `]`
- Sums & integrals: `\sum`, `\int` (basic rendering)

#### HTML template usage

Include `slide.formula` as a LaTeX string in the slide JSON:

```json
{
  "title": "Quadratic Formula",
  "formula": "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"
}
```

The template auto-detects `.formula` blocks and renders them via KaTeX. If KaTeX fails to load (offline), the canvas painter draws the expression instead.

#### React template usage

Install KaTeX alongside the app:

```bash
npm install katex
```

Import KaTeX CSS in `main.jsx`:

```jsx
import 'katex/dist/katex.min.css';
```

The `SlideViewer` component automatically passes `slide.formula` through KaTeX. A `<CanvasMath>` fallback component is available for environments where KaTeX cannot be bundled.

### Study App Templates
- `assets/templates/study_app.html`
  - Starter self-contained HTML study deck with inline CSS/JS, progress bar, TOC, quiz engine, KaTeX + canvas math rendering.
- `assets/templates/study_app_react/`
  - Starter React/Vite project for multi-module study apps with Framer Motion and KaTeX support.
