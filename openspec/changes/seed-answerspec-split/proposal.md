## Why

A seed's `questionCore` currently mixes two roles in one string — the child-facing question AND the answer/asset specification (e.g. `"Tìm hình khác loại: 2 hình tròn và 1 hình tam giác cùng màu xanh"`). This breaks two things: the generator has no clean short question to read aloud (it leaks the answer and lists assets in the TTS), and the seed reviewer's "Dùng đề xuất" overwrites `questionCore` with a cleaned question — silently destroying the embedded answer spec and leaving the generator blind.

## What Changes

- Split the single `questionCore` field into two role-separated fields:
  - `questionCore` — the short child-facing question only (read aloud via `audioScript.question`), no answer leak, no asset listing.
  - `answerSpec` (new) — the concrete objects + correct answer, consumed only by generate/payload, never read aloud.
- **BREAKING** — seed JSON schema and the persisted Seed document gain a required `answerSpec` field for the 5 MVP action types (`watch_video` exempt). Existing seeds are dropped and re-imported in the new 2-field format.
- Generate step splits inputs by role: `questionCore` → `audioScript.question`; `answerSpec` → `payload` options/items/count. Generation is guarded to refuse a seed missing `answerSpec`.
- Seed reviewer becomes the auto-backfill / auto-split tool: when `answerSpec` is absent it derives it from the legacy `questionCore` (populating `suggestion.answerSpec` + a cleaned `suggestion.questionCore`) and raises an `ANSWER_SPEC_MISSING` warning; when `answerSpec` is present it only warns and never overwrites it.
- Reviewer suggestions and the human "Dùng đề xuất" / "Sửa tay" actions operate on both fields; applying a suggestion writes only the fields the suggestion provides.
- Review rules re-scoped per field: `questionCore` checked for clarity / no-spoiler, `answerSpec` checked for answer verifiability, plausible distractors, count range, no cross-match, etc.

## Capabilities

### New Capabilities
- `seed-answer-spec`: the two-field seed content model (`questionCore` + `answerSpec`), the generate-time split of those fields into audio vs payload, the generate guard that requires `answerSpec`, and the seed-reviewer behavior that auto-backfills `answerSpec` when missing and warns-without-overwrite when present.

### Modified Capabilities
<!-- No existing spec captures seed-review / questionCore semantics; nothing to modify. -->

## Impact

- **Types/schema**: `src/types/seed.types.ts` (`ActivitySeed.answerSpec`, `suggestion.answerSpec`), `src/db/models/seed.model.ts`.
- **Generate**: `src/prompts/generate.prompt.ts`, guard in `src/pipeline/steps/1-generate.ts`.
- **Seed reviewer**: `src/pipeline/seed-review/seed-review.prompts.ts`, `.rules.ts`, `.types.ts`, `.service.ts` (incl. `extractUsedObjects` object source + `handleSeedReviewAction` two-field apply), `.telegram.ts`.
- **UI**: `app/seeds/[seedId]/page.tsx`, `app/components/SeedReviewCard.tsx`, `SeedReviewActions.tsx`.
- **Routes**: `app/api/pipeline/seed-review/action/route.ts`, `app/api/telegram/webhook/route.ts`.
- **Seeds/tests**: `seeds/*.json` fixtures, seed-generation source, `src/scripts/test-seed-review.ts`, `src/pipeline/steps/generate.guard.test.ts`, seed-review parser/status tests.
- **Not affected**: asset/image/audio steps read from the activity `payload`, not `questionCore`.
