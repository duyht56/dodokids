## 1. Revised Run Contract

- [x] 1.1 Keep the game-owned ten-slot run and progress denominator
- [x] 1.2 Make slots 1–5 exactly whole 5 and slots 6–10 exactly whole 10
- [x] 1.3 Author and validate one positive prefilled part per slot with at least four anchors per block
- [x] 1.4 Keep unrelated Explore games on their existing run policies

## 2. Generator and Validator

- [x] 2.1 Emit `split_group` only for all ten normal-run slots
- [x] 2.2 Add `prefilledPart` and derive the positive complement in the visual model
- [x] 2.3 Validate fixed total, anchor, complement, model operands and deterministic replay
- [x] 2.4 Include the visible prefilled part in pedagogical variety identity
- [x] 2.5 Bump number-bond generator, validator, config and manifest to v4

## 3. Scaffolded Renderer

- [x] 3.1 Initialize the first room with the system-authored part and lock it
- [x] 3.2 Make the second room the only editable destination
- [x] 3.3 Make the complete `Bé thêm` room the increment control, starting at 0
- [x] 3.4 Reset only an overfilled checked answer to 0 while preserving the prefilled room
- [x] 3.5 Reveal `N gồm A và B`, require recombination and complete exactly once
- [x] 3.6 Redesign the board with `Có sẵn` / `Bé thêm` hierarchy and non-overlapping controls
- [x] 3.7 Remove all numeric complement and remaining-count hints before checking
- [x] 3.8 Hold relationship and recombined explanations until explicit `Gộp lại` / `Tiếp tục` actions
- [x] 3.9 Remove add/subtract/reset buttons and keep one full-width `Kiểm tra` button

## 4. Verification and Documentation

- [x] 4.1 Add conformance tests for exact 5/10 totals and authored anchors
- [x] 4.2 Add reducer tests for locked prefill, bounded room taps, overfill reset and recombination
- [x] 4.3 Update the Explore BRD and main number-bond capability
- [x] 4.4 Run mobile TypeScript, targeted lint, focused number-bond tests and server build
- [x] 4.7 Test too-low, too-high, correct-check and explicit-continue reducer paths
- [ ] 4.5 Manually complete all ten interactions on a phone and inspect whole-10 wrapping/audio
- [ ] 4.6 Record device evidence before archive
