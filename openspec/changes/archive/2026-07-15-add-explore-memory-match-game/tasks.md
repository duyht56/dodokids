## 1. Asset Eligibility and Board Contract

- [x] 1.1 Add/verify `memoryEligible` and structured similarity metadata for approved sprite pools
- [x] 1.2 Add an audit/test that rejects background assets, duplicate canonical identities and confusing low-level variants
- [x] 1.3 Define the `memory_match` exercise/card schema and L1–L5 pair/grid configuration
- [x] 1.4 Generate, review and bundle a static text-free card-back artwork for offline play

## 2. Generator and Validator

- [x] 2.1 Implement unique asset sampling, exact pair duplication and seeded Fisher–Yates shuffle
- [x] 2.2 Implement independent pair-cardinality, eligibility, similarity, board-size and replay validator
- [x] 2.3 Register the game and add 200+ valid-board conformance tests across levels/pools/seeds

## 3. Mobile State Machine and UI

- [x] 3.1 Implement reducer/state machine for idle, one-revealed, resolving, matched and complete states
- [x] 3.2 Build responsive 4/6/8/12/16-card boards with minimum touch targets and stable order across orientation changes
- [x] 3.3 Add gentle match/mismatch audio/animation, input lock during resolution and no timer/failure/move reward
- [x] 3.4 Keep matched/revealed state in memory only and prove exit/re-entry creates a fresh board without submitting completion/exit data

## 4. Verification and Rollout

- [x] 4.1 Add rapid-tap, orientation, fresh-restart, offline and accessibility tests plus phone/tablet snapshots
- [x] 4.2 Run local-provider tests and mobile lint; canary 2–4 pairs before enabling 6–8 pairs
