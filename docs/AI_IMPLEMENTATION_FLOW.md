# Kido AI Implementation Flow

Use this checklist for every implementation task.

## 1. Classify The Task

Identify the target area first:

- Mobile UX or lesson play: `mobile/`
- Runtime API, progress, entitlement, publish ingest: `kido-server/`
- Content generation, seed review, Human Gate, publish client: `kido-pipeline/`
- Schema/curriculum/content contract: `docs/` plus affected code
- Spec/change management: `openspec/` only when the task references it

Then identify whether the task touches canonical contracts:

- `actionType`
- `skillCode`
- activity payload shape
- lesson/progress API shape
- pipeline status lifecycle

If yes, read the canonical doc before editing.

## 2. Gather Context

Use CodeGraph first when available:

```text
Ask for the target symbol/file plus the source and destination of the flow.
Examples:
- "LessonPlayerScreen ActivityContainer mapServerLesson complete-lesson"
- "PublishService buildPublishPayload /admin/publish Lesson schema"
- "seed-review runner pipeline:week status lifecycle"
```

For product/content tasks, read the smallest relevant docs:

- Schema: `docs/kido-activity-schema.ts`
- Pipeline lifecycle: `docs/KIDO_CONTENT_PIPELINE.md`
- Math taxonomy: `docs/KIDO_MATH_SKILL_CATALOG_V2.md`
- Curriculum/naming: `docs/KIDO_MATH_CURRICULUM.md`
- Seed rules: `docs/KIDO_SEED_AUTHORING.md`

## 3. Decide The Contract Boundary

Use this boundary rule:

- Server/pipeline/docs use canonical wire/CMS names.
- Mobile may normalize server data internally, but must accept canonical server
  payloads.
- Pipeline may generate authoring records, but runtime content is published to
  `kido-server`; do not edit runtime content directly in pipeline DB.

When adding or changing an activity type:

1. Update schema/contract docs.
2. Update pipeline generation/review/assets if needed.
3. Update server ingest/guard/schema if needed.
4. Update mobile `mapServerLesson`.
5. Update/add activity renderer.
6. Verify with targeted tests or builds.

## 4. Implement Conservatively

Implementation rules:

- Match existing folder structure, names, and style.
- Keep edits scoped to the task.
- Avoid unrelated refactors.
- Do not lower validation quality to make data pass.
- Preserve Human Gate and publish invariants.
- Keep child-facing UI audio-first and visual-first.
- Prefer deterministic guards/parsers over ad hoc string handling.

## 5. Standard Flows

### Mobile Lesson Flow

```text
Home/current day
  -> LessonPlayerScreen
  -> GET /lessons/today?childId=...
  -> mapServerLesson
  -> ActivityContainer
  -> typed activity renderer
  -> onCorrect/onWrong attempt tracking
  -> await durable reward event enqueue (canonical only)
  -> PATCH /progress/:childId/complete-lesson via single-flight queue
  -> replace canonical progress from returned snapshot
  -> LessonComplete
```

Mobile implementation guardrails:

- If server lesson is missing, stub, or unmappable, fall back to mock only when
  the existing flow already does so.
- Do not let an invalid payload render misleading content.
- Keep tap targets large and interactions immediate.
- Wrong feedback should encourage retry, not shame.
- Mock/demo fallback may show session stars but must not update canonical rewards.
- Do not call `completeDay`, `addXp`, `setStreak`, or `setLessonStars`
  independently for a canonical completion event.

### Pipeline Content Flow

```text
seed file
  -> import-seeds
  -> seed review
  -> approved seed
  -> generate activity draft
  -> AI review
  -> resolve assets
  -> image/audio workers
  -> pending_review
  -> Human Gate
  -> approved
  -> publish:week
  -> kido-server /admin/publish
  -> imported runtime content
```

Pipeline implementation guardrails:

- Do not auto-approve.
- Do not mark pipeline-local content as imported.
- Keep seed review separate from activity review.
- Preserve `questionCore` vs `answerSpec`.
- Keep duplicate/object diversity checks in seed review.

### Server Publish Flow

```text
kido-pipeline buildPublishPayload
  -> POST /admin/publish
  -> DTO validation
  -> deterministic guard
  -> idempotent upsert lessons/activities
  -> transfer history
  -> mobile can fetch published lessons
```

Server implementation guardrails:

- Server content is runtime/read-side after publish.
- Reject unsafe or incomplete asset/audio payloads before DB writes.
- Keep publish idempotent.
- Keep entitlement/progress rules server-authoritative.

## 6. Verification

Run the smallest relevant verification.

Mobile:

```bash
cd mobile
npm run lint
```

Server:

```bash
cd kido-server
npm test
npm run build
```

Pipeline:

```bash
cd kido-pipeline
npm test
npm run build
```

If a command is missing dependencies, env, emulator, Redis, MongoDB, GCP, or
network, report the blocker and what would verify it in a fully configured
environment.

## 7. Final Response Pattern

When done, report:

- What changed.
- Where it changed.
- What was verified.
- Any residual risk or blocked verification.

Keep the summary short and implementation-focused.
