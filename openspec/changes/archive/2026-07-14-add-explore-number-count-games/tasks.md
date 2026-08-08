## 1. Shared Number Utilities

- [x] 1.1 Add typed range/level config, seeded shuffle, number-card identity and unique near-target distractor utilities on top of Explore foundation
- [x] 1.2 Add unit/property tests for range boundaries, target exclusion, uniqueness and deterministic replay

## 2. Khám phá số Local Logic

- [x] 2.1 Define `number_explorer` exercise schema and L1–L5 mode/range configuration
- [x] 2.2 Implement hear-select and match-sample generators/validators with stable audio templates
- [x] 2.3 Implement before/after and missing-number generators/validators with unique-answer proof
- [x] 2.4 Implement seeded 3–5 card ordering generator/validator
- [x] 2.5 Register the game and add a 200+ exercise conformance corpus across modes/levels/boundaries

## 3. Chạm và đếm Local Logic

- [x] 3.1 Define `tap_count` schema, L1–L5 config and countable target/distractor asset eligibility
- [x] 3.2 Implement seeded normalized placement with separation/touch-target bounds and deterministic grid/group fallback
- [x] 3.3 Implement independent count/layout/asset validator including L5 target-only counting
- [x] 3.4 Register the game and add 200+ exercise conformance tests across counts/assets/viewport classes

## 4. Mobile Game Renderers

- [x] 4.1 Build number-card select, missing-number and order interactions using existing presentational primitives where compatible
- [x] 4.2 Build tap-and-count renderer that prevents double-count, highlights counted targets and presents number answers
- [x] 4.3 Add responsive phone/tablet layout snapshots for dense counts, grouped counts and L5 distractor objects
- [x] 4.4 Wire both renderers to in-memory Explore hints/audio callbacks without persistence, analytics or lesson side effects

## 5. Verification and Rollout

- [x] 5.1 Add provider-to-renderer fixtures, deterministic tests and audio-gated offline-capability tests for representative exercises at every level
- [x] 5.2 Run mobile tests/lint; canary L1–L3 online with local generation before enabling L4–L5 or the separately gated offline flag by public config
