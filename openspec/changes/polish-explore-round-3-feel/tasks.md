# Tasks — Đợt 3 slice 1: game feel (animation + audio), presentation only

## 1. Lật thẻ tìm cặp (`memory_match`) — card flip
- [x] 1.1 Real flip animation (rotateY 0↔180 with backface handling, or scaleX 1→0→1 with the face swapped at the mid-point if RN backface is unreliable) on turn-up and on a mismatched pair turning back down; matched cards settle without a stray flip
- [x] 1.2 Native driver; reduced-motion → instant swap, timings preserved so play feels identical (mirror the existing board-motion reduce-motion gate)
- [x] 1.3 Presentation only: no change to `memoryGame.ts` generator/validator/params or the `memoryState` reducer (replay byte-identical)
- [x] 1.4 Spec delta `specs/explore-memory-match-game/spec.md`; update `explore.memory-match.spec.ts` + `verify-explore-memory-contracts.cjs` renderer-source assertions

## 2. Ngôi nhà tách gộp (`number_bond`) — compose/decompose motion + voice
- [x] 2.1 Leaves slide into the "Bé thêm" box on add and slide out on remove; gentle merge/settle on "Gộp lại"/check; native driver + reduced-motion instant path
- [x] 2.2 Speak `numberBondFeedbackKeys` + number keys best-effort on add/remove via `onSpeakFeedback` (missing clip never blocks); no duplicate on-screen instruction text
- [x] 2.3 Presentation only: no change to `numberBondGame.ts` generator/validator/params/run policy
- [x] 2.4 Spec delta `specs/explore-number-bond-game/spec.md`; update `explore.number-bond-arithmetic.spec.ts` + contract-script source checks

## 3. Máy cộng trừ (`arithmetic`) — machine animation + ticked number line
- [x] 3.1 "Máy" animation: operand groups feed into a machine/box → result out (add = merge in; subtract = some leave), on `SemanticAnimationView`/`addGroup`/`removeGroup`
- [x] 3.2 Ticked number line for add/subtract (evenly spaced ticks + labels) reusing `NumberLine.hopProgress`
- [x] 3.3 Native driver + reduced-motion static end state; `supportLevel` visuals unchanged; no new seeded fields (versions unchanged, replay byte-identical)
- [x] 3.4 Spec delta `specs/explore-arithmetic-game/spec.md`; update `explore.number-bond-arithmetic.spec.ts` renderer assertions

## 4. Verification
- [x] 4.1 `cd mobile && npx tsc --noEmit` clean; eslint clean on changed files
- [x] 4.2 `npm run test:explore-memory`, `test:explore-arithmetic`, `test:explore-prompt-audio`, `test:explore-variety-buckets` green
- [x] 4.3 `cd kido-server && npx jest src/modules/explore` green
- [x] 4.4 `openspec validate polish-explore-round-3-feel --strict`
- [x] 4.5 Verify on the iOS Simulator: flip, leaf slide + spoken count, machine + number line; reduced-motion path
