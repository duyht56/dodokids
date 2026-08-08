# Tasks: add-transform-based-visuals

## 1. Skill taxonomy and validation gate

- [x] 1.1 Add canonical skill `math_compare_size` (domain `cmp`, `single_select`,
  displayVariant `small`/`large`, uniform scale) to `skill-catalog.ts`.
- [x] 1.2 Update `docs/KIDO_MATH_SKILL_CATALOG_V2.md` in the SAME change: add
  `math_compare_size`; mark `math_compare_weight`/`math_compare_capacity` `⏸`
  post-MVP (repo non-negotiable: taxonomy + doc move together).
- [x] 1.3 Replace `isSidedCompare(skillCode)` with
  `isSidedVisualCompare(skillCode, actionType)` — true only for `single_select`
  × {`math_compare_size`, `math_compare_length`, `math_compare_height`}. Update
  both `activity-mechanics.ts` callers.
- [x] 1.4 Add a lint/generator guard (with a stable error code) that rejects
  `math_compare_weight`/`math_compare_capacity` seeds until a valid renderer
  exists — no scale, no two-independent-images.

## 2. Transform presets and comparison lint

- [x] 2.1 Add the semantic `displayVariant` type
  (`normal|small|large|short|long|low|tall`) across pipeline/docs/server/mobile;
  reject arbitrary LLM-provided scale values.
- [x] 2.2 Declare `transformPolicy` allowed families per asset and reject a
  display variant the referenced asset does not allow.
- [x] 2.3 Add deterministic comparison lint: compared options share one canonical
  sprite identity, share surface/alignment, and differ only in one asset-allowed
  display dimension meeting a preschool perception threshold.
- [x] 2.4 Reject scale/stretch as evidence for weight, capacity, filled/empty, or
  other state-dependent constructs.
- [x] 2.5 Update generate/review prompts so comparisons reuse one identity with an
  allowed preset instead of inventing incompatible `LIB-*` slugs.

## 3. Count-tap surface modes

- [x] 3.1 Add the additive `surface` contract (`scene` | `pastel`) to the
  count-tap payload across pipeline/docs/server/mobile.
- [x] 3.2 Implement versioned deterministic pastel selection with contrast
  exclusion and shared surface groups; persist the resolved token in the
  published payload for audit/replay.
- [x] 3.3 Update count-tap mobile and web preview for additive pastel mode and
  legacy scene mode; preserve web/mobile parity.
- [x] 3.4 Render verified alpha sprites with `contain` and no sticker chip; keep
  the chip only for legacy/non-alpha assets.

## 4. Mobile and web rendering

- [x] 4.1 Make `ActivityVisual` role-aware: transparent sprites use `contain`,
  scenes retain `cover`, SVG behavior unchanged.
- [x] 4.2 Implement semantic transform presets with fixed ratios, shared
  alignment/baseline, and `transformPolicy` enforcement.
- [x] 4.3 Update single-select comparison rendering so multiple options may share
  one sprite with different allowed presets.
- [x] 4.4 Persist `surface`/`displayVariant` through publish payload, server
  ingest, lesson reads, and mobile mapping.

## 5. Verification

- [x] 5.1 Add visual/layout tests on phone/tablet dimensions: hit targets, crop
  behavior, stable pastel backgrounds, and no answer clues.
- [x] 5.2 Verify big/small correctness, stretch-safe long/tall rendering, and
  count-tap exact counts in Human Gate and mobile.
- [x] 5.3 Confirm published lessons preserve `surface`/`displayVariant` and alpha
  asset URLs unchanged.
