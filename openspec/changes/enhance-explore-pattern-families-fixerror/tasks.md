## 1. Split colour vs shape families + bigger token pool

- [x] 1.1 In `mobile/src/explore/games/patternGame.ts` replace the mixed cycle with distinct families `shape_cycle` (one colour, cycle shapes), `color_cycle` (one shape, cycle colours) and `object_cycle` (emoji); keep `quantity`/`numeric`
- [x] 1.2 Add a pattern-owned, colour-blind-safe token pool (6 shapes, 7 Okabe–Ito colours, 10 single-object emoji) — do NOT touch tap_count's `COUNTABLE_ASSETS`
- [x] 1.3 Make the presentation guardrail family-aware: a shape rule keeps ONE colour with distinct shapes, a colour rule keeps ONE shape with distinct colours, an object rule uses distinct sprites
- [x] 1.4 Map families to level grammars: L1 shape/colour AB, L2 shape/colour AAB/ABB, L3 object/colour ABC, L4 quantity, L5 numeric

## 2. New `fix_error` mode ("tìm chỗ sai")

- [x] 2.1 Add a seed-deterministic `mode` discriminator (`complete` | `fix_error`) to the generator, keeping the `complete` completion mode
- [x] 2.2 Generate a full, otherwise-correct sequence with exactly one rule-breaking token (drawn from the vocabulary/range), recording `errorIndex` + `correctToken`
- [x] 2.3 Add the INDEPENDENT `fix_error` validator: prove the sequence is currently invalid and enumerate every single-cell repair to prove exactly one rule-breaking position equal to the recorded `errorIndex`/`correctToken`
- [x] 2.4 Render `fix_error` in `PatternFinderRenderer.tsx` (`PatternFixErrorView`): tap the wrong cell → auto-correct to the right token; render the two new shapes; leave the `complete` interaction unchanged

## 3. Variety buckets + version bumps

- [x] 3.1 Update `variety.ts` `pattern_finder` buckets to the families + `fix_error` per level, raise capacity, and branch `variantKey`/`bucketKey` on mode
- [x] 3.2 Bump `generatorVersion` → `pattern-finder-v4`, `validatorVersion` → `pattern-finder-validator-v3`, config/manifest → v5 in `patternGame.ts`
- [x] 3.3 Mirror the version bumps in `kido-server/src/modules/explore/explore.registry.ts`

## 4. Prompt audio (best-effort, next batch)

- [x] 4.1 Add `pattern_next_color`, `pattern_blank_color`, `pattern_find_error` to `mobile/src/explore/promptAudio.ts` (families mapping + `patternFindErrorKeys`)
- [x] 4.2 Mirror the same keys in `kido-pipeline/src/explore/exploreAudioInventory.ts`; note they are queued for the next audio batch and NOT synthesized now

## 5. Tests + docs

- [x] 5.1 Update `mobile/scripts/verify-explore-pattern-contracts.cjs` for both modes and the new families
- [x] 5.2 Update `kido-server/src/modules/explore/explore.pattern.spec.ts` for dual-mode corpus, fix_error uniqueness, family coherence and the version bumps
- [x] 5.3 Update `docs/KIDO_EXPLORE_BRD.md` §7.7 and add one `docs/AI_CONTEXT.md` line

## 6. Verification

- [x] 6.1 `cd mobile && npx tsc --noEmit` and `npx eslint` on the changed files
- [x] 6.2 `npm run test:explore-pattern` and `npm run test:explore-variety-buckets`
- [x] 6.3 `cd kido-server && npx jest src/modules/explore/explore.pattern.spec`
- [x] 6.4 `openspec validate enhance-explore-pattern-families-fixerror --strict`
