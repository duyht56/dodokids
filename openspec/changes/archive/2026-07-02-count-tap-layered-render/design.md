## Context

`count_tap` is one of six activity types shared across three codebases: the mobile app (`mobile/`), the kido-server contract (`kido-server/`), and the content pipeline + admin (`kido-pipeline/`). The canonical schema lives in `docs/kido-activity-schema.ts` and is mirrored in `kido-server/src/common/types/activity.types.ts` and `kido-pipeline/src/types/activity.types.ts`.

Current state:
- Mobile `CountTapActivity.tsx` renders only `payload.scene.emoji` and lays sprites on a fixed 8-entry `SLOTS` array indexed with `i % SLOTS.length` (collides when `targetCount > 8`).
- `mapActivity` (mobile `lesson.ts` and pipeline `player/map.ts`) maps `sceneImage → scene: Visual`, where `visualFrom` extracts `imageUrl`/`altText` but no emoji — so real lessons lose the object identity.
- Pipeline `3-assets.ts` builds the scene prompt as `"Scene for <activityId>"` with no `targetObject`/`targetCount` — the single-scene image contract was never satisfiable.
- The kido-pipeline admin already has a WYSIWYG web replica (`app/components/player/LessonPlayerWeb.tsx`) that is the "activity screen similar to mobile" and refuses to render until real assets exist (`content-human-gate`).

Constraints: mobile positions must not depend on measured pixel layout (keep `%`-based coordinates, no `onLayout` dependency); child touch targets must stay ≥ `MIN_HIT_AREA` (88pt); the production human-gate's "real assets only, never placeholders" rule must remain intact.

## Goals / Non-Goals

**Goals:**
- Replace `sceneImage` with `backgroundAsset` + `targetAsset` across all three type mirrors and both renderers (mobile + web replica), rendering identically.
- Spawn `targetCount` independent tappable sprites with a seeded, non-overlapping, safe-zone layout.
- Provide a mock-data pre-review route in the kido-pipeline admin so the redesign can be reviewed before asset generation, without weakening the production gate.
- Update pipeline generation/validation (asset step + generate/review prompts) to the two-asset shape.

**Non-Goals:**
- No change to `targetObject`, `targetCount`, `answerOptions`, or the phase-2 number-answer flow.
- No change to the other five activity types.
- No AI/duplicate detection changes; no change to human-gate approval semantics.
- Not building a general mock-authoring UI — the mock set is built-in fixtures for count_tap (and the shared player), not user-editable content.

## Decisions

### D1 — Layered assets over a single baked scene
Two `AssetReference`s: `backgroundAsset` (object-free scene, `background: 'scene'`) + `targetAsset` (single isolated object, `background: 'transparent'`). The app clones `targetAsset` `targetCount` times.
- **Why**: A flat scene image has no tap regions and can't guarantee object count. Isolated sprites reuse the exact asset style already produced for `single_select`/`multi_select`, so content cost drops (one reusable background library + already-existing object icons).
- **Alternative rejected**: Keep `sceneImage` and overlay invisible tap hotspots at authored coordinates — reintroduces per-activity coordinate authoring (the very thing the seeded layout removes) and still can't guarantee the baked image shows the right count.
- **Field naming**: keep `targetCount`/`answerOptions` (used across 3 codebases + `isCountTap` guard + review rule R18). Only `sceneImage` is replaced. We do NOT adopt Gemini's `correctCount`/`options` renames — pure churn.

### D2 — Seeded safe-zone grid layout
A helper computes sprite positions in `%` space: usable band `left 6–94%`, `top 20–84%` (reserves counter badge top-right and the ~34px footer). A `cols × rows` grid (default 5×4 = 20 cells, minus the top-right cell under the counter) is shuffled with a seeded PRNG (mulberry32 seeded from a hash of the activity id); the first `targetCount` cells are taken; each gets clamped intra-cell jitter (±~25% of cell size) so sprites feel scattered but never cross into a neighbor cell.
- **Why seeded**: deterministic per activity → stable across re-mount / `locked` toggles (no flicker), but different activities differ (child can't memorize positions). `Math.random()` fails the stability requirement; a static array fails the no-collision requirement.
- **Shared logic**: put the layout function in a small shared-shape helper in each codebase (mobile `activities/touch.ts` or a new `countTapLayout.ts`; web mirrors it in `player/`). Cell capacity ≥ realistic max `targetCount` (preschool counts ≤ ~10–12); if `targetCount` exceeds capacity, log a warning rather than silently collide.

### D3 — Mock pre-review as a separate route, not a gate relaxation
Add a dev route (e.g. `app/preview/mock/page.tsx`) that feeds built-in mock activities (emoji visuals) straight into `LessonPlayerWeb`, bypassing `isAssetReady`. The production review route and `content-human-gate` semantics are untouched.
- **Why**: `content-human-gate` explicitly forbids placeholder rendering at the approval gate. Reusing that route for mocks would violate the spec. A separate, clearly-labeled, approve-action-free route satisfies "pre-review with mock data" without eroding the production guarantee.
- **Implementation note**: `LessonPlayerWeb` currently hard-blocks when `!isAssetReady`. Add an optional `mock`/`allowUnready` prop (default false) so the mock route can render emoji visuals; the block stays the default for the gate.

### D4 — Pipeline generation of the two assets
`3-assets.ts` resolves `targetAsset` as an isolated transparent sprite (reuse `resolveLibraryAsset` path where possible for reuse/usageCount) and `backgroundAsset` as an object-free scene. `image-style.ts` gains an isolated/transparent variant (no scene clutter, `--ar 1:1`, plain background for the auto background-removal step). Generate prompt (`generate.prompt.ts`) emits `backgroundAsset`+`targetAsset`; review rules R13/R18 updated to validate the two-asset shape.
- **Why**: The current `background: 'scene'` hardcode in `resolveLibraryAsset` is wrong for object sprites; branch by role/use.

## Risks / Trade-offs

- **[Background removal quality]** Auto white-background removal on `targetAsset` may leave halos → Mitigation: generate on plain flat background per existing `image-style` conventions and keep sprites small (44–52pt) where halos are least visible; reviewer catches bad cutouts in the (real-asset) gate.
- **[Layout capacity]** Very high `targetCount` could exceed grid cells → Mitigation: 5×4 grid comfortably exceeds preschool counting range; warn-on-overflow instead of collide; grid dimensions are a single constant to bump.
- **[Data migration]** Existing `sceneImage` seeds break → Mitigation: the old scene image was never generated correctly, so no production content should depend on it; regenerate affected week seeds. Mapping requires `targetAsset` present, so a stale payload degrades to not-mapped rather than a wrong render.
- **[Two renderers drift]** Mobile and web layout could diverge → Mitigation: keep the seeded-layout algorithm identical (same grid constants + PRNG) and cover it with the "web replica matches mobile" scenario.

## Migration Plan

1. Update the three type mirrors + `activity.schema.ts` (`sceneImage` → `backgroundAsset` + `targetAsset`).
2. Implement the seeded layout helper + mobile component; update mobile `mapActivity` + mock fixture.
3. Update web `map.ts` + `CountTap` renderer; add the mock-preview route and the `LessonPlayerWeb` `mock` prop.
4. Update pipeline `3-assets.ts`, `image-style.ts`, generate/review prompts.
5. Regenerate any existing count_tap seeds to the new shape.
6. Rollback: revert the type field + renderers together (they are consistent); mock route is additive and can be dropped independently.

## Open Questions

- Grid dimensions / max supported `targetCount` — default 5×4 unless a lesson needs more.
- Whether `backgroundAsset` should be a curated `assets_library` set (reused scenes) vs per-activity generation — leaning library for reuse; confirm during apply.
