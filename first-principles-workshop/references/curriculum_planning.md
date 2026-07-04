# Curriculum Planning

Use this reference before drafting slides. Ground the curriculum in the supplied material, current workspace, and user notes.

## Workflow

1. Inspect the available source material.
   - Prioritize docs, README files, examples, package names, folders, tests, pipelines, diagrams, and existing workshop artifacts.
   - Only mention tools, products, modules, services, acronyms, file paths, or production systems that are present in the source or provided by the user.
   - If the source assumes prerequisite knowledge, add a small foundations bridge before the source-specific content. For example, if the material assumes networking, briefly teach clients, servers, DNS, ports, protocols, latency, routing, load balancers, and failure boundaries as needed.
2. Decide the course shape.
   - Choose a short workshop, multi-module deep dive, or broader curriculum based on source depth.
   - Prefer a progression from foundations to implementation, operations, best practices, troubleshooting, and synthesis.
3. Draft the module sequence before filling in slides.
   - Each module must have a focused learning goal and build on previous modules.
   - Default to contiguous numbering such as `M0` through `MN`, adjusted to fit the source.
4. Produce a slide-level TOC.
   - Use short, concrete, Title Case slide names tied to one concept each.
   - Restart slide numbering inside each module.
   - Include a final quiz row for every module when quizzes are in scope.
5. Cross-check totals.
   - Confirm every title is supported by the source.
   - Confirm module counts, slide counts, quiz counts, and summary stats are internally consistent.

## Default Module Shape

Use 12-15 teaching slides per module unless the user explicitly requests a different density.

Each module should usually contain:

- objective and prerequisite bridge
- missing-basics foundation when the source assumes context
- first-principles foundation
- vocabulary and mental model
- architecture or system shape
- component responsibilities
- sequence, lifecycle, or workflow
- failure modes and tradeoffs
- applied walkthrough
- recap
- quiz

## Slide Title Patterns

Useful title patterns:

- `What Is <Concept>?`
- `<Concept> From First Principles`
- `Repository Tour: <Area>`
- `<Component> Architecture`
- `<Tool> vs Alternatives`
- `<Config or Syntax> Crash Course`
- `Real Module: <Existing Module Name>`
- `Request Lifecycle`
- `Deployment Pipeline`
- `Observability & Monitoring`
- `Security & Access Control`
- `Best Practices Checklist`
- `Anti-Patterns To Avoid`
- `Testing Workflow`

Avoid filler titles such as `Introduction` when a precise learning outcome is available.

## TOC Output

When creating a full workshop TOC, prefer:

```markdown
## REFERENCE: <Workshop Name> Full TOC (All Modules & Slides)

### M0 - <Module Title> (<content slide count> slides + quiz)

| # | Slide Title |
|---|-------------|
| 1 | <Concrete Title> |
| 2 | <Concrete Title> |
| **Quiz** | **M0 Knowledge Check** |

### TOC Summary Stats

- Total modules:
- Total teaching slides:
- Quiz question count:
- Slide count range per module:
- Naming pattern:
- Content density pattern:
```

Totals must match the module tables.

## ADQ Mode

If the user asks for ADQ or an architecture deep-dive workshop:

- Focus on systems, boundaries, data flow, deployment shape, and external dependencies.
- Mention important traits, classes, topics, queues, tables, and config files only when grounded in the source.
- Prefer architecture and operational reasoning over method-by-method walkthroughs.
- Use architecture, component, and sequence diagrams wherever the source supports them.

## Review Checklist

Before drafting final slides:

- Confirm the curriculum reflects the actual source domain.
- Confirm missing prerequisite context is taught enough for learners to follow the source-specific material.
- Confirm inferred background context is generic and not presented as a source-specific fact.
- Confirm module numbering is contiguous.
- Confirm each module has enough content to justify its existence.
- Confirm slide numbering restarts within each module.
- Confirm every module ends with a quiz row when quizzes are requested.
- Confirm summary stats are consistent with the TOC.
