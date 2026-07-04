---
name: first-principles-workshop
description: Build first-principles workshop slide courses from source material, documentation, PDFs, notes, codebases, or large multi-part inputs. Use when Codex needs to create or revise an HTML workshop with 12-15 slides per module, module quizzes, randomized answer order, a consolidated final exam, SVG architecture/component/sequence diagrams, keyboard navigation, printable PDF handout mode, intermediate artifacts, chunk-by-chunk generation, crash recovery, or retry-based enrichment of an older version.
---

# First Principles Workshop

## Overview

Create a workshop package that teaches from first principles, not just a summary deck. The default output is a light-theme, self-contained HTML slide app with keyboard navigation, page numbers, per-module quizzes, a consolidated final exam, inline SVG diagrams, memory hooks, progress persistence, and print CSS for PDF handouts.

Read `references/curriculum_planning.md` before planning modules or a slide-level TOC. Read `references/workshop_contract.md` before creating the final HTML. Read `references/chunking_resume_retry.md` when the source is large, generation must happen in multiple passes, a previous run crashed, or the user says "retry", "resume", "continue", "enrich", or "enhance older version".

## Default Output

Create a directory such as `workshop-output/` unless the user gives a target path:

```text
workshop-output/
  {topic}_workshop.html
  {topic}_quiz.json
  workshop-state.json
  intermediate/
    source-inventory.md
    concept-map.md
    module-plan.md
    full-toc.md
    module-01.md
    module-02.md
  versions/
```

Use `assets/workshop-template.html` as a starter when the user asks for HTML output or does not specify a format. Keep the final workshop runnable by opening the HTML file directly; avoid external dependencies unless the user asks for a framework. Never include references to inspiration sites or unrelated prior workshops in generated workshop content.

## Workflow

1. Inventory the source material.
   - Identify audience, prerequisites, target duration, source files, missing context, and the main systems or concepts.
   - If the source is too large, chunk it and follow `references/chunking_resume_retry.md`.

2. Build a first-principles concept map.
   - Start from fundamentals, constraints, invariants, vocabulary, mental models, and "why this exists".
   - Preserve evidence references to the source material where possible.
   - Add essential prerequisite context when the source assumes it, especially for large systems such as networks, distributed systems, storage, security, databases, queues, build pipelines, or runtime platforms. Keep this background generic and label it as foundational context when it is inferred rather than source-specific.

3. Plan modules.
   - Use 12-15 teaching slides per module.
   - Give each module a clear learning objective, prerequisite bridge, quiz, and expected hands-on or discussion moment when appropriate.
   - Produce a slide-level TOC before drafting the deck. Use contiguous module numbering such as `M0` through `MN`, slide numbering that restarts per module, and summary stats that match the table.

4. Draft slides.
   - Every slide must include a clear "why".
   - Every teaching section must include at least one memory hook: analogy, contrast pair, mnemonic, rule of thumb, or failure story.
   - Add architecture diagrams for systems, component diagrams for decomposition, and sequence diagrams for flows wherever the material supports them.
   - Use inline SVG for diagrams. Prefer simple, labeled diagrams over decorative art.

5. Build quizzes.
   - Add a quiz for every module.
   - Include explanations for correct answers and common wrong answers.
   - Store the correct answer at index `0` in the data and shuffle answer order in the browser on every attempt.
   - Add a final exam button that consolidates questions across all module quizzes.
   - Track failed questions and provide a retry-missed flow.

6. Generate the HTML workshop.
   - Use a polished light theme by default.
   - Support keyboard navigation: ArrowLeft/ArrowRight, Space, Home, End, `T` for table of contents, `N` for speaker notes, `F` for fullscreen, `?` or `/` for help, and Escape to close overlays.
   - Add visible page numbers, module/slide progress, a progress bar, and buttons for previous, next, TOC, quiz, print, and final exam.
   - Persist progress with a unique `STORE_KEY` derived from the topic.
   - Include speaker notes support even if notes are initially brief.
   - Add print CSS that hides navigation and prints compact handout pages with minimal wasted paper.

7. Validate and revise.
   - Run `python3 scripts/validate_workshop.py <path-to-index.html>`.
   - Fix failures before reporting completion.
   - If browser tooling is available, open the HTML and verify navigation, quiz randomization, final exam, diagrams, and print preview behavior.

## Retry Behavior

When the user asks to retry, redo the workshop from source and intermediate artifacts rather than making a cosmetic patch. Preserve the older version under `versions/`, then enrich the new version with:

- clearer first-principles sequencing
- stronger "why" explanations
- more useful memory hooks
- improved architecture/component/sequence diagrams
- better distractors and explanations in quizzes
- tighter print layout and less paper waste
- repaired gaps found by validation

Do not merely regenerate the same material. Treat retry as "redo and make the older version better".

## Resources

- `assets/workshop-template.html`: self-contained starter for the HTML workshop app.
- `references/curriculum_planning.md`: module sequencing, TOC, grounding, ADQ mode, and summary stats guidance.
- `references/workshop_contract.md`: required output structure, slide requirements, quiz schema, diagrams, and print expectations.
- `references/chunking_resume_retry.md`: checkpointing, chunk-by-chunk generation, crash recovery, multi-agent use, and retry enrichment.
- `scripts/validate_workshop.py`: lightweight validator for generated HTML workshop packages.
