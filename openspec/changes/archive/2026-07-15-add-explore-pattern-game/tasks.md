## 1. Grammar and Token Model

- [x] 1.1 Define versioned pattern grammar AST, token identity/display schema and level attribute allowlists
- [x] 1.2 Implement materializers for AB, AAB, ABB and ABC grammars
- [x] 1.3 Implement quantity increase/decrease and numeric step-1/step-2 grammars

## 2. Generator and Validator

- [x] 2.1 Implement seeded token selection, repetition and context-safe hidden-index selection
- [x] 2.2 Implement candidate enumeration proving exactly one valid missing token
- [x] 2.3 Add presentation validation preventing incidental background/position/size clues
- [x] 2.4 Register the game and add 200+ uniqueness/replay conformance tests across grammars and levels

## 3. Mobile Renderer

- [x] 3.1 Build responsive pattern row, missing slot and approved primitive token components
- [x] 3.2 Implement tap-to-complete and config-gated drag-to-slot adapters producing the same token answer
- [x] 3.3 Add fixed audio, hint progression and accessible/non-color-only token descriptions

## 4. Verification and Rollout

- [x] 4.1 Add ambiguous/zero-answer/distractor/hidden-position regression tests and UI snapshots
- [x] 4.2 Add offline/fresh-restart/no-persistence tests and run mobile lint; enable grammar families independently for canary rollout
