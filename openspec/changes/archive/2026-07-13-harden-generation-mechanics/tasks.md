# Tasks: harden-generation-mechanics

## 1. Deterministic repair

- [x] 1.1 Add deterministic repair for safe rules before any LLM call: replace an
  over-budget `audioScript.correct` with an approved short praise template,
  derive `correctAnswer` from the single `isCorrect` option, derive `correctSide`
  from mode/counts, remove only surplus distractors marked incorrect, and apply
  controlled replacements for forbidden academic terms when meaning is preserved.
  → `pipeline/mechanics-repair.ts` (`deterministicRepair`); forbidden-term
  replacement is scoped to feedback lines, not the question.
- [x] 1.2 Re-validate after deterministic repair; only remaining violations pass
  to semantic repair. → `steps/1-generate.ts`.

## 2. Semantic repair

- [x] 2.1 Add a dedicated structured semantic-repair method at temperature
  `0..0.1`, separate from the main generator, with at most two attempts. →
  `geminiService.generateActivity(..., { temperature: 0.1 })`, bounded loop.
- [x] 2.2 Record error codes and relevant before/after fields for each attempt,
  plus final validation output. → logged trace (before/after violation lists +
  applied deterministic codes).
- [x] 2.3 On exhaustion, fail with `MECHANICS_REPAIR_EXHAUSTED` and leave the
  activity in error; never weaken the validator.

## 3. Error codes and docs

- [x] 3.1 Add stable error codes for the mechanics failures surfaced by repair.
  → `RepairCode` union + `MECHANICS_REPAIR_EXHAUSTED`.
- [x] 3.2 Sync the canonical schema comment so `audioScript.correct ≤ 8 words`
  is documented in `docs/kido-activity-schema.ts` and its type mirrors
  (`kido-server` + `kido-pipeline` `activity.types.ts`).

## 4. Tests

- [x] 4.1 Add tests for deterministic-first repair and its violation-clearing.
  → `mechanics-repair.test.ts` (8 tests). NOTE: bounded semantic-repair/
  exhaustion is exercised via the deterministic path + generateStep wiring;
  an LLM-mocked exhaustion test is deferred (needs gemini stub harness).
