# Chunking, Resume, and Retry

Use this reference when source material is large, the user wants multi-step generation, a run crashed, or the user asks to retry/enrich a previous workshop. Chunk the work into small tasks even when the context window is large; this keeps progress recoverable and verifiable.

## Mandatory Task Queue Workflow

Always run large workshop generation through this pipeline:

```text
User goal
  -> Planner
  -> Task queue / dependency graph
  -> Worker handles one small task
  -> Store result externally
  -> Summarize and pass only relevant state to next task
  -> Verifier
  -> Final assembler
```

Operating rules:

- Create a planner artifact before drafting slides.
- Convert the plan into a task queue with stable IDs, dependencies, inputs, outputs, and verifier criteria.
- Execute one small task at a time, such as `inventory-source`, `extract-chunk-003`, `draft-module-m04`, `verify-quiz-m04`, or `assemble-html`.
- Store every completed task result in `intermediate/` before starting the next task.
- Pass only the relevant state summary to the next task; do not keep reloading every prior artifact unless verification requires it.
- Run a verifier step after each module and before final assembly.
- Update `workshop-state.json` after every completed task so work can resume from the next pending task.
- Prefer completion of the current task over starting many partially completed tasks.

## Checkpoint Files

Maintain `workshop-state.json` in the output directory:

```json
{
  "version": 1,
  "status": "in_progress",
  "source_fingerprint": "short stable description or hash",
  "current_stage": "module-drafting",
  "last_completed_task": "draft-module-m01",
  "completed": ["source-inventory", "concept-map", "module-plan", "module-01"],
  "pending": ["module-02", "module-03", "html-build", "validation"],
  "task_queue": [
    {
      "id": "draft-module-m02",
      "status": "pending",
      "depends_on": ["module-plan", "concept-map"],
      "input": ["intermediate/module-plan.md", "intermediate/concept-map.md"],
      "output": "intermediate/module-02.md",
      "verifier": "12-15 slides, why on every slide, quiz present, diagrams checked"
    }
  ],
  "artifacts": {
    "source_inventory": "intermediate/source-inventory.md",
    "concept_map": "intermediate/concept-map.md",
    "module_plan": "intermediate/module-plan.md"
  },
  "handoff_summary": "Only module 02 remains before final assembly. Architecture terms are defined in concept-map section 3.",
  "notes": []
}
```

Update the state after each durable artifact is written. If a task fails, leave its status as `blocked` or `failed`, record the reason in `notes`, and keep completed task outputs intact.

## Chunking Workflow

1. Split source by natural boundaries first: chapters, files, sections, packages, transcripts, or document headings.
2. Assign stable chunk IDs such as `chunk-001`, `chunk-002`.
3. For each chunk, extract:
   - core concepts
   - facts and constraints
   - architecture clues
   - component responsibilities
   - sequences or lifecycles
   - examples, failures, and tradeoffs
   - quiz-worthy misconceptions
4. Write chunk notes under `intermediate/chunks/chunk-XXX.md`.
5. Merge chunk notes into `concept-map.md` and `module-plan.md`.

Keep a source trace for important claims. Use simple references such as file path, section name, page number, heading, or chunk ID.

## Multi-Agent Use

Use subagents when the material is too large for one pass or when independent quality checks are valuable. Good subagent tasks:

- Extract concepts from one source chunk.
- Draft one module from an approved module plan.
- Review generated slides for factual drift against source notes.
- Review diagrams for missing architecture/component/sequence coverage.
- Review quiz distractors for plausibility.

Do not ask subagents to invent the whole course without the source chunk or module plan. Merge their work into the same intermediate artifact structure.

When using subagents, give each worker exactly one small task and the minimal source artifacts needed for that task. Store the worker result externally, summarize it, then pass only the summary and necessary artifact path to the next worker or verifier.

## Resume After Crash

When resuming:

1. Read `workshop-state.json`.
2. Inspect existing files listed in `artifacts` and `completed`.
3. Validate that the requested source still matches the previous source fingerprint.
4. Continue from the first pending stage.
5. If an artifact is partial or malformed, regenerate that artifact and update the state.

Do not restart from scratch unless the state is missing, corrupt, or the user explicitly asks to redo.

## Retry and Enrichment

When the user says "retry", "retry it", "redo", "enrich", or "enhance older version":

1. Copy the current `index.html`, `workshop-state.json`, and `intermediate/` into `versions/vNN/`.
2. Re-read source and intermediate artifacts.
3. Create a new version that improves substance, not just styling.
4. Preserve correct existing content and improve weak areas.

Required enrichment pass:

- Strengthen first-principles explanations before implementation details.
- Add missing "why" statements.
- Replace generic memory hooks with more memorable analogies, contrasts, rules of thumb, or failure stories.
- Add or improve architecture diagrams for system-level ideas.
- Add or improve component diagrams for decomposition.
- Add or improve sequence diagrams for workflows.
- Improve quiz distractors so wrong answers represent real misconceptions.
- Improve explanations for both correct and wrong answers.
- Tighten print CSS to reduce paper waste.
- Run validation again and record fixes in `workshop-state.json`.

## Completion Criteria

Mark `status` as `complete` only after:

- final HTML exists
- all modules have 12-15 slides
- every module quiz exists
- final exam exists
- print mode exists
- validation passes or remaining warnings are explicitly documented
