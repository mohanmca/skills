# Workshop Contract

Use this contract when creating the final workshop artifact.

## HTML Package

Default to a single self-contained `index.html` unless the user asks for a multi-file app. The workshop must work locally without a server.

Use a polished light theme by default. Do not copy branding, names, copy, or visual identity from unrelated example sites. Use collected layout ideas only as generic interface behavior.

Required controls:

- Previous and next slide buttons.
- Table of contents button.
- Module quiz button.
- Final exam button.
- Print or Export PDF button that calls `window.print()`.
- Help button or keyboard shortcut overlay.
- Keyboard navigation for ArrowLeft, ArrowRight, Space, Home, End, `T`, `N`, `F`, `?` or `/`, and Escape.
- Visible page number, current module, slide progress, and progress bar.
- Speaker notes drawer, even if the notes are brief.

Required browser behavior:

- Persist progress with a unique `STORE_KEY` derived from the topic.
- Module quiz answer options are shuffled each time a quiz attempt starts.
- Final exam draws from all module quiz banks and shuffles answer options.
- Failed questions are tracked and can be retried.
- Quiz feedback is inline, with explanation after the learner answers.
- Side-click navigation and touch swipe navigation are recommended when they do not interfere with scrolling or controls.
- No `alert()`, `confirm()`, or `prompt()`.

## Data Shape

Prefer embedding workshop data as JSON in:

```html
<script id="workshop-data" type="application/json">
{
  "title": "Workshop title",
  "audience": "Target audience",
  "modules": [
    {
      "id": "m01",
      "title": "Module title",
      "objective": "What learners can do after the module",
      "slides": [
        {
          "title": "Slide title",
          "why": "Why this matters",
          "principle": "First-principles explanation",
          "content": ["Concise teaching point", "Another point"],
          "memoryHook": "Sticky reminder or analogy",
          "diagramSvg": "<svg role=\"img\" aria-label=\"...\">...</svg>"
        }
      ],
      "quiz": {
        "questions": [
          {
            "prompt": "Question text",
            "options": ["Correct answer", "Plausible distractor", "Another distractor", "Fourth distractor"],
            "answer": 0,
            "explanation": "Why the correct answer is correct",
            "whyWrong": "Common misconception corrected",
            "sourceModule": "m01"
          }
        ]
      }
    }
  ]
}
</script>
```

## Module Rules

- Each module must contain 12-15 teaching slides, excluding quiz screens.
- Each module must have its own quiz.
- Each module needs a progression:
  1. First-principles foundation.
  2. Vocabulary and mental model.
  3. Architecture or shape of the system.
  4. Component responsibilities.
  5. Sequence or lifecycle where applicable.
  6. Failure modes and tradeoffs.
  7. Applied examples and checks for understanding.

## Slide Rules

Every slide must include:

- a specific title
- a "why" statement
- a first-principles teaching point
- concise content
- a memory hook

When the source assumes a large background system, add basic context before deep source-specific material. Examples include networking, distributed systems, storage, security, databases, queues, orchestration, compilers, build pipelines, operating systems, and runtime platforms. Keep these explanations accurate and generic unless the source explicitly names a concrete implementation.

Add inline SVG diagrams when the slide explains structure, flow, responsibility, state, lifecycle, failure recovery, or tradeoffs. Use:

- Architecture diagram for whole-system context.
- Component diagram for responsibilities and boundaries.
- Sequence diagram for request, event, workflow, lifecycle, or failure-recovery order.

SVG requirements:

- Use text labels inside the SVG.
- Include `role="img"` and an `aria-label`.
- Keep diagrams simple enough to print clearly.
- Avoid external image dependencies unless source assets are required.

## Quiz Rules

Every module quiz should include 6-10 questions unless the user asks otherwise. Mix conceptual, applied, troubleshooting, and "why" questions.

Each question should have:

- 4 options by default
- the correct option stored at index `0` with `answer: 0`
- plausible distractors
- explanation for the correct answer
- misconception correction for wrong answers
- source module id

Shuffle options at render time, not in the stored JSON. If reproducible review is more important than variety, use a stable seed based on the question ID; otherwise randomize answer order on each attempt as the default workshop behavior.

The final exam should consolidate across all modules. Default to 30-50 questions when enough source material exists; otherwise include all quiz questions.

When a separate quiz artifact is useful, write `{topic}_quiz.json` with the same canonical question data. Keep the HTML and JSON synchronized.

## Print Rules

The print view should optimize for learning handouts, not full-screen presentation pages.

Required print behavior:

- Hide app navigation, buttons, progress bars, and quiz controls.
- Print compact slide cards with page breaks that avoid cutting a slide in half.
- Use a handout grid where practical, commonly two slides per landscape page.
- Keep diagrams legible in grayscale.
- Include module titles and slide numbers.
- Avoid large blank hero areas and decorative backgrounds.

## Quality Checklist

Before finishing:

- Run the validator script.
- Confirm every module has 12-15 slides.
- Confirm each slide has a why, principle, memory hook, and diagram where appropriate.
- Confirm prerequisite basics are present when source material assumes unstated context.
- Confirm module quizzes exist, store the correct answer at index `0`, and shuffle answer order at render time.
- Confirm final exam uses questions from all modules.
- Confirm failed-question retry works.
- Confirm keyboard navigation, TOC, help overlay, notes drawer, fullscreen toggle, page numbers, and progress persistence work.
- Confirm print CSS exists and hides interactive controls.
- Confirm output can be resumed or enriched from intermediate artifacts.
