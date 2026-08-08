# Proposal: add-transform-based-visuals

> Part of the visual-asset-system architecture umbrella
> (`docs/KIDO_VISUAL_ASSET_SYSTEM.md`). Depends on `add-object-sprite-library`
> (canonical sprite identity + `transformPolicy`). Land it last.

## Why

Attribute-comparison activities (`math_compare_length`, `math_compare_height`)
currently generate two independent images for the same object, which can
introduce identity, pose, and style differences unrelated to the learning
construct. There is also no controlled way to show big/small, long/short, or
tall/short from a single reusable sprite, and `count_tap` still requires a
generated background scene plus a white sticker chip to hide baked-in
backgrounds. Display variation must stay under deterministic application control
and must never leak the answer.

## What Changes

- Add a semantic `displayVariant` (`normal | small | large | short | long |
  low | tall`) to single-select options. Mobile owns fixed versioned ratios;
  the LLM cannot supply arbitrary scale values.
- Add the canonical skill `math_compare_size` (domain `cmp`, `single_select`,
  `small`/`large`, uniform scale) so big/small has an explicit home. Lock the
  phase-one transform roster: `math_compare_size` (uniform), `math_compare_length`
  (horizontal), `math_compare_height` (vertical). `math_seriation_size`
  (`sort_sequence`) and `math_compare_quantity` (`compare_tap`) are out of the
  transform phase.
- Replace the domain-wide `isSidedCompare(skillCode) === 'cmp'` exemption with an
  explicit `isSidedVisualCompare(skillCode, actionType)` allowlist covering only
  `single_select` × {`math_compare_size`, `math_compare_length`,
  `math_compare_height`}, so R12 (questionImage), `displayVariant`, and
  `validateCompareTap` no longer overlap implicitly.
- Defer `math_compare_weight` and `math_compare_capacity` to post-MVP: keep them
  in the catalog for taxonomy completeness, mark them `⏸`, and add a
  lint/generator guard that rejects them (no scale, no two-independent-images).
- Make `count_tap` support scene and pastel surfaces additively; render verified
  alpha sprites directly, keeping the sticker chip only as a legacy fallback.
- Add deterministic contrast-aware pastel surfaces on mobile derived from stable
  activity identity, stable across re-mounts/devices and never an answer clue.
- Enforce that compared options share one canonical sprite identity and differ in
  exactly one asset-allowed display dimension; reject scale-as-evidence for
  weight/capacity/filled-empty constructs.

## Capabilities

### New Capabilities

- Adds the canonical skill `math_compare_size` to the math skill taxonomy.
  Per the repo non-negotiable, this change SHALL update
  `docs/KIDO_MATH_SKILL_CATALOG_V2.md` in the same change.

### Modified Capabilities

- `visual-asset-library`: assets declare and enforce transform eligibility.
- `single-select-activity`: options gain semantic display variants; transform
  comparisons isolate one dimension; the R12 exemption becomes an explicit
  allowlist.
- `count-tap-activity`: additive scene/pastel surface modes; alpha sprites drop
  the default sticker chip; web/mobile parity preserved.
- `mongoose-schemas`: surface and display-variant metadata survive persistence
  and publish.

## Impact

- **kido-pipeline**: skill catalog (`math_compare_size`, `isSidedVisualCompare`,
  weight/capacity guard), transform-policy validation, generate/review prompts,
  deterministic comparison lint, and tests.
- **kido-server**: mirrored `displayVariant`/`surface` fields and publish
  validation that preserves them.
- **mobile**: role-aware `contain` sprite rendering, deterministic pastel
  surfaces, semantic transform presets, and updated count/select renderers.
- **docs**: `docs/KIDO_MATH_SKILL_CATALOG_V2.md` (add `math_compare_size`, mark
  weight/capacity `⏸`), canonical activity schema, and asset authoring rules.
- **data**: additive; existing scene-backed count-tap and option cards without
  `displayVariant` remain valid.
