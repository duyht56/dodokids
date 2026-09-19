## 1. Wire the BRD §7.6 modes into the generator

- [x] 1.1 Add `tens_ones` to `ArithmeticMode`; keep `count_on`/`make_10`/`three_operand`
- [x] 1.2 Re-align `ARITHMETIC_LEVELS` to the BRD ladder and add L6 (Advanced range 50); `ARITHMETIC_LEVEL_ORDER = [1..6]`, modes per level = its declared buckets
- [x] 1.3 Per-mode deterministic generation: `count_on` orders `[larger, smaller]` on a number line; `make_10` = `[first, 10-first]` on a ten-frame; `three_operand` = three operands each ≤ 6 summing within range on a number line; `tens_ones` = add or subtract within 50 on the tens–ones representation
- [x] 1.4 `make_10` answers the missing part (`operands[1]`), every other mode answers the model result; options + typical-errors derive the answer from `model.operationKind`
- [x] 1.5 Prompt + audio per mode: `count_on` says "đếm tiếp" (`arithmeticCountOnKeys`), `three_operand` reuses the add clips (`arithmeticThreeOperandKeys`), `tens_ones` reuses `arithmeticKeys`, `make_10` keeps `make_10_q`
- [x] 1.6 Bump `generatorVersion`/`validatorVersion`/config/manifest/dependency versions v3 → v4 in the envelope and `ARITHMETIC_MACHINE_GAME`

## 2. Independent validator, level-driven gating

- [x] 2.1 `MODE_EXPECTATIONS` drives the mode ↔ operationKind ↔ representation check; derived `gates.{threeOperands,advanced50}` are validated against level + mode (a forged flag is rejected)
- [x] 2.2 Reject a zero operand, a `make_10` whose answer is the whole ten, a collapsed `three_operand` and a re-represented `tens_ones`; keep the byte-identical seed replay as the ultimate independent guard
- [x] 2.3 Remove the unused `ArithmeticCapabilities`/`gate` machinery and the capabilities parameter; reachability is purely level-driven

## 3. Renderer + primitives (reuse, no new engine)

- [x] 3.1 `ArithmeticRenderer` equation panel reads the operation kind (so `tens_ones` subtraction shows `−`) and shows `first + ? = 10` for `make_10`
- [x] 3.2 `VisualMathScene` make_10 ten-frame fills the first part so the empty cells are the scaffold (the total is never shown); every other mode reuses the existing machine / number line / `TensOnes` scenes with `supportLevel` intact

## 4. Round-variety buckets

- [x] 4.1 `variety.ts` `arithmetic_machine` buckets per level = the level's modes; capacity ≈ distinct (mode × operands) variants per level
- [x] 4.2 Preserve operand order in the variant key for `subtract`, `count_on` and `tens_ones`

## 5. Prompt audio (best-effort, not regenerated)

- [x] 5.1 Add the `dem_tiep` ("đếm tiếp") word and the `arithmeticCountOnKeys` / `arithmeticThreeOperandKeys` builders to `mobile/src/explore/promptAudio.ts`
- [x] 5.2 Mirror the `dem_tiep` word in `kido-pipeline/src/explore/exploreAudioInventory.ts`

## 6. Mirrors, tests and docs

- [x] 6.1 `kido-server/src/modules/explore/explore.registry.ts` — mirror the arithmetic versions v3 → v4 and the L6 level list
- [x] 6.2 Rewrite `mobile/scripts/verify-explore-arithmetic-contracts.cjs` for the L1→L6 ladder and all modes (per-mode prompt/answer/options, every declared mode emitted and reaching the child, validator independence, promotion to L6)
- [x] 6.3 Update `explore.number-bond-arithmetic.spec.ts` for L1→L6 conformance, strategy-mode shape checks, promotion cap at L6, registration levels `[1..6]`
- [x] 6.4 `docs/KIDO_EXPLORE_BRD.md` §7.6 update note and one `docs/AI_CONTEXT.md` line

## 7. Verify

- [x] 7.1 `cd mobile && npx tsc --noEmit`; `npx eslint <changed files>` clean
- [x] 7.2 `npm run test:explore-arithmetic` and `npm run test:explore-variety-buckets` pass
- [x] 7.3 `cd kido-server && npx jest src/modules/explore` (full suite) passes
- [x] 7.4 `openspec validate add-explore-arithmetic-brd-modes --strict` passes
