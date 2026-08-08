## 1. Schema & Types

- [x] 1.1 Add `answerSpec?: string` to `ActivitySeed` in `src/types/seed.types.ts`
- [x] 1.2 Change `SeedReviewResult.suggestion` to `{ questionCore?: string; answerSpec?: string; note?: string } | null` in `src/types/seed.types.ts`
- [x] 1.3 Add `answerSpec` field (optional at DB layer per design D5) to `seedSchema` and `answerSpec` to the `suggestion` subdoc in `src/db/models/seed.model.ts`

## 2. Generate split & guard

- [x] 2.1 In `src/prompts/generate.prompt.ts`, feed both `questionCore` and `answerSpec` in `buildGeneratePrompt`, labeling their roles
- [x] 2.2 Add rules to `GENERATE_SYSTEM_PROMPT`: `audioScript.question` derives from `questionCore` only (short, mascot Đô Đô, no asset listing, no answer leak); `payload` objects/options/count derive from `answerSpec`
- [x] 2.3 In `src/pipeline/steps/1-generate.ts`, add a guard that throws for MVP action types when `answerSpec` is missing/empty (parallel to the existing `status === 'approved'` guard)

## 3. Seed reviewer — backfill & rules

- [x] 3.1 Add `ANSWER_SPEC_MISSING` (warning) to `src/pipeline/seed-review/seed-review.rules.ts` and re-scope `SELECT_QUESTION_UNAMBIGUOUS` wording to `questionCore` clarity only
- [x] 3.2 In `src/pipeline/seed-review/seed-review.prompts.ts`, include both fields in the seed JSON; instruct the reviewer: when `answerSpec` absent → derive `suggestion.answerSpec` from legacy `questionCore` + cleaned `suggestion.questionCore` + raise `ANSWER_SPEC_MISSING`; when present → `suggestion.answerSpec = null`, warn only; scope clarity vs verifiability checks per field
- [x] 3.3 In `src/pipeline/seed-review/seed-review.types.ts`, update `parseSeedReviewResult`/`buildSeedReviewResult` to read/emit `suggestion.answerSpec`
- [x] 3.4 In `src/pipeline/seed-review/seed-review.service.ts`, make `extractUsedObjects` tokenize `answerSpec` with fallback to `questionCore`
- [x] 3.5 In `handleSeedReviewAction` (`use_suggestion`), write whichever of `questionCore`/`answerSpec` the suggestion provides, then re-enqueue review; extend `edit` to accept an edited `answerSpec`

## 4. UI & notification touchpoints

- [x] 4.1 In `app/seeds/[seedId]/page.tsx`, render an `answerSpec` card beside `questionCore` and surface `suggestion.answerSpec`
- [x] 4.2 In `app/components/SeedReviewCard.tsx` and `SeedReviewActions.tsx`, show/allow editing both fields for "Sửa tay" and apply both for "Dùng đề xuất"
- [x] 4.3 In `app/api/pipeline/seed-review/action/route.ts`, accept and pass an edited `answerSpec` through to `handleSeedReviewAction`
- [x] 4.4 In `app/api/telegram/webhook/route.ts` and `src/pipeline/seed-review/seed-review.telegram.ts`, display both fields and add the edit path for `answerSpec`

## 5. Seeds, fixtures & tests

- [x] 5.1 Update seed-generation source — nguồn là AI prompt (Gemini/Claude tạo file seed); tạo prompt authoring 2-field ở `docs/KIDO_SEED_AUTHORING.md` + format ở `docs/KIDO_CONTENT_PIPELINE.md`
- [x] 5.2 Convert `seeds/KIDO_VERIFY_E2E.json` and `seeds/test-fixtures.json` to the 2-field format
- [x] 5.3 Update `src/pipeline/steps/generate.guard.test.ts` for the new `answerSpec` guard
- [x] 5.4 Update `src/scripts/test-seed-review.ts` and seed-review parser/status tests for the two-field suggestion and `ANSWER_SPEC_MISSING`
- [x] 5.5 Add/adjust a test asserting the reviewer auto-splits a legacy mixed seed and does not overwrite an existing `answerSpec`

## 6. Migration & verification

- [ ] 6.1 Drop existing seeds and re-import in the new format
- [ ] 6.2 Run a seed-review pass; confirm legacy/mixed seeds get `ANSWER_SPEC_MISSING` + auto-split suggestion, and applying "Dùng đề xuất" writes both fields
- [ ] 6.3 Generate one activity end-to-end from a split seed; confirm `audioScript.question` is clean (no asset list / answer leak) and `payload` options come from `answerSpec`
