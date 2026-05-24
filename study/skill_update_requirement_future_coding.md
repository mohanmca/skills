# Study Skill — Coding, Scripting & Asset Optimization

This document defines the technical architecture and reusable asset requirements to implement the roadmap in `requirement_future.md` while minimizing future token consumption.

---

## 1. Reusable UI Component Library (React)

To reduce token usage, the skill will reference a set of pre-built, high-quality components. Future generation tasks will only need to pass data (props) rather than full JSX structures.

### Required Components
- **`<FlashcardView />`:** Handles flip animations, SRS rating buttons (Hard, Good, Easy), and state management.
- **`<MermaidDiagram />`:** A wrapper for `mermaid.js` that handles initialization, theme switching (light/dark), and SVG pan/zoom.
- **`<SpeechTrigger />`:** A standardized "Listen" button with state for "speaking" vs "idle," handling browser API availability checks.
- **`<HintAccordion />`:** Manages the progressive reveal of the 3-step hint system.
- **`<ConfettiOverlay />`:** A reusable Framer Motion component for module completion celebrations.

---

## 2. Shared CSS Utility & Theme Library

Instead of generating inline styles or per-slide CSS, the skill will use a centralized CSS manifest.

### Requirements
- **`study-tokens.css`:** Defines the "Kid-Friendly" color palette (Coral, Teal, etc.), spacing scales, and typography rules.
- **`animations.css`:** Pre-defined `@keyframes` for slide transitions (fade, slide-in) and achievement bursts.
- **`layout-templates.css`:** Flexbox/Grid classes for the standard slide types (Definition, Two-Column, Recap).

---

## 3. Automation & Extraction Scripts

Update `scripts/` to handle the new artifact types autonomously.

### `scripts/extract_extended_artifacts.py`
- **Flashcard Extraction:** Uses NLP to identify "Concept: Definition" pairs and "Key Fact" sentences from the `chapters.json`.
- **Mermaid Logic Generation:** Translates structural data (e.g., "A depends on B") into valid Mermaid graph syntax.
- **Hint Synthesis:** Automatically generates "Simplified definitions" or "Opposite examples" to serve as hints for quiz questions.

### `scripts/package_app.py`
- Inlines all CSS/JS for the HTML output.
- Generates the `manifest.json` and `service-worker.js` for PWA support.
- Bundles `katex` and `mermaid` into a local `vendor/` folder for 100% offline usage.

---

## 4. Token Optimization Strategy

To keep future requests small, the skill will follow these "Reference Over Generation" rules:

| Strategy | Implementation |
|----------|----------------|
| **Schema Referencing** | Use `import { Slide } from '../types'` instead of redefining the type in every prompt. |
| **Component Mapping** | Generate `{ type: 'diagram', data: 'A -> B' }` and let the app choose `<MermaidDiagram data={data} />`. |
| **Asset Indexing** | Reference local assets like `assets/icons/star.svg` instead of generating SVGs via code. |
| **Delta Updates** | When revising a deck, only provide the `diff` for the JSON data, not the full HTML/React source. |

---

## 5. Shared Asset Library

A new `assets/library/` directory will contain non-textual elements used across all apps:

- **Icons:** A curated set of SVG icons for achievements (🚀, 🏆, 🔥, ⭐).
- **Sounds:** Short, high-quality (low KB) audio files for "Correct" (ding) and "Completion" (ta-da).
- **Placeholders:** Stylized CSS patterns for slide backgrounds to keep visual interest without large images.

---

## 6. Updated Folder Structure

```text
/Users/mohannarayanaswamy/.codex/skills/study/
├── assets/
│   ├── library/            # Shared SVGs, Sounds, CSS
│   └── templates/
│       └── shared-components/  # Pre-built React components
├── scripts/
│   ├── extract_extended_artifacts.py
│   └── package_app.py
└── types/
    └── study-app-schema.ts # Centralized TypeScript definitions
```
