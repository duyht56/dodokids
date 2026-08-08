## Context

Seeds are the source of truth for the Kido content pipeline: each `ActivitySeed` carries a `questionCore` string that the generate step turns into an `Activity` (a kid-facing `audioScript.question` plus an image `payload`). Today `questionCore` conflates two roles — the question to read aloud and the concrete answer/asset spec — e.g. `"Tìm hình khác loại: 2 hình tròn và 1 hình tam giác cùng màu xanh"`. Two subsystems disagree about that string:

- `generate.prompt.ts` has no rule preventing the generator from reading the whole thing aloud, so the TTS question is long and leaks the answer.
- The seed reviewer treats `questionCore` as read-aloud text, flags `SELECT_QUESTION_UNAMBIGUOUS`, and its "Dùng đề xuất" replaces `questionCore` with a cleaned question — destroying the embedded answer spec and blinding the generator.

Constraints: mid-MVP with five frozen action types (`watch_video` deferred — see the math-curriculum-freeze note); human-in-the-loop review must stay; seeds are imported as JSON and persisted in MongoDB via Mongoose. Asset/image/audio steps already read from the activity `payload`, not `questionCore`, so they are out of the blast radius.

## Goals / Non-Goals

**Goals:**
- Give each seed a clean read-aloud `questionCore` and a separate `answerSpec` blueprint, so generation is deterministic about which text becomes audio vs payload.
- Make the seed reviewer double as the migration/split tool: auto-derive `answerSpec` when absent, never overwrite it when present.
- Guarantee the "Dùng đề xuất" trap is gone — applying a suggestion can no longer wipe the answer spec.
- Guard generation so a MVP seed without `answerSpec` fails loudly instead of producing a blind activity.

**Non-Goals:**
- No change to asset/image/audio generation or the activity `payload` schema.
- No change to the human gate (activity-level review) or publish flow.
- `watch_video` handling is untouched (deferred, exempt from `answerSpec`).
- Not turning `answerSpec` into structured JSON — it stays a natural-language blueprint the LLM parses (same style as today's `questionCore`).

## Decisions

**D1 — Add `answerSpec` as a sibling string field, keep `questionCore` name.**
`ActivitySeed` gains `answerSpec?: string`; `questionCore` keeps its name but its semantics narrow to "read-aloud question only". Rationale: minimizes churn versus renaming `questionCore` everywhere; the field that changes meaning is the one gaining a sibling, and existing consumers of `questionCore` (audio) stay correct. Alternative considered: rename to `questionText` + `answerSpec` — rejected as pure churn across 15 files.

**D2 — `answerSpec` is a natural-language blueprint, not structured JSON.**
It mirrors the current `questionCore` authoring style (`"2 hình tròn, 1 tam giác; đúng = tam giác"`). Rationale: the generator is already an LLM that parses free text; structured JSON would force a per-action-type schema and a bigger authoring/reviewer change. Alternative: typed `answerSpec` per action type — deferred as a possible post-MVP hardening.

**D3 — Reviewer is the backfill engine, gated by presence.**
Behavior is a two-branch rule keyed on whether `answerSpec` exists:
- absent → derive `suggestion.answerSpec` from legacy `questionCore` + cleaned `suggestion.questionCore`, raise `ANSWER_SPEC_MISSING` (warning).
- present → `suggestion.answerSpec = null`; only warn about spec quality, never overwrite.
Rationale: keeps human-in-loop (reviewer proposes, human applies), and makes legacy 1-field seeds self-healing on their first review pass. Alternative: auto-apply on import — rejected; it bypasses the gate.

**D4 — `suggestion` gains `answerSpec`; apply writes present fields only.**
`SeedReviewResult.suggestion` becomes `{ questionCore?, answerSpec?, note? }`. `handleSeedReviewAction('use_suggestion')` writes each field only when the suggestion supplies it, then re-enqueues review. Rationale: a clarity-only fix must not touch a good `answerSpec`; a backfill must write both.

**D5 — Generate guard mirrors the existing status guard.**
`1-generate.ts` already throws unless `status === 'approved'`; add a parallel throw when a MVP action type has no `answerSpec`. Rationale: fail fast at the same choke point, one obvious place to reason about seed completeness.

**D6 — `extractUsedObjects` sources from `answerSpec`, falls back to `questionCore`.**
Object-diversity detection currently tokenizes `questionCore`; after the split the objects live in `answerSpec`. Fallback keeps legacy seeds working until backfilled.

**D7 — New warning rule `ANSWER_SPEC_MISSING`; re-scope `SELECT_QUESTION_UNAMBIGUOUS`.**
Add the rule to `seed-review.rules.ts`; reword the reviewer prompts so question-clarity checks apply to `questionCore` and answer-verifiability checks apply to `answerSpec`, and the mere separation is never itself a defect.

## Risks / Trade-offs

- **[Free-text `answerSpec` under-specifies and the generator guesses wrong]** → Reviewer answer-verifiability rules and the human gate (WYSIWYG activity preview) still catch bad payloads before publish; typed spec remains a post-MVP option (D2).
- **[Legacy seeds in DB lack `answerSpec` and silently fail generation]** → D5 guard fails loudly, and D3 backfill provides the fix path; primary migration is a clean drop & re-import.
- **[Mongoose requiring `answerSpec` rejects legacy imports]** → Keep the schema field optional at the DB layer and enforce presence in the generate guard (D5), so backfill can run on imported legacy seeds.
- **[UI/Telegram edit paths only know `questionCore`]** → Extend the `[seedId]` page, review card/actions, action route, and telegram webhook to carry both fields; tasks enumerate each touchpoint.
- **[Reviewer overwrites a good `answerSpec`]** → D3 present-branch forbids it and a spec scenario asserts `suggestion.answerSpec` is null when one exists.

## Migration Plan

1. Land schema/type changes (`answerSpec` optional at DB layer).
2. Land generate split + guard, reviewer backfill, suggestion two-field apply, UI/route/telegram edits.
3. Update seed-generation source and `seeds/*.json` fixtures + tests to the 2-field format.
4. Drop existing seeds and re-import in the new format; run a seed-review pass. Any seed still on the legacy shape is auto-split by the reviewer (D3) or blocked by the guard (D5).
5. Rollback: revert the change set; legacy 1-field seeds remain readable because `questionCore` semantics are backward-compatible (audio still derives from it) and `answerSpec` is additive/optional.

## Open Questions (resolved 2026-07-03)

- ~~Should `answerSpec` become typed-per-action-type JSON?~~ **Resolved: stays free-text** (natural-language blueprint, per D2). Typed JSON not pursued.
- ~~Where does the seed-generation source live and who updates it?~~ **Resolved: the source is an AI prompt** — the author asks Gemini/Claude to produce the seed JSON. The "update" is a documented authoring prompt (`docs/KIDO_SEED_AUTHORING.md`) that instructs the model to emit the 2-field format; no in-repo generator script exists.
