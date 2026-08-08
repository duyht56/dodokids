## Why

The `count_tap` activity is broken on both the mobile app and the kido-pipeline review screen, and the breakage is invisible today because only hand-written mock data (which carries emoji) ever renders correctly. Two concrete defects:

1. **Wrong object shown.** `CountTapActivity.tsx` renders only `payload.scene.emoji` (falling back to 🍃). Real server lessons resolve `sceneImage` to an `imageUrl` with no `emoji`, so every production `count_tap` shows a leaf regardless of `targetObject`, and the generated scene image is never displayed. The pipeline never even generates a correct scene image — `3-assets.ts` builds the prompt as `"Scene for <activityId>"` with no `targetObject`/`targetCount`, so the single-baked-scene contract was never achievable.
2. **Overlapping tap targets.** Object positions come from a hardcoded 8-slot `SLOTS` array indexed by `i % SLOTS.length`; when `targetCount > 8`, two objects land on the identical coordinate and cannot be tapped independently.

The single-baked-`sceneImage` design cannot support per-object tapping (a flat image has no tappable object regions) and cannot guarantee the image contains exactly `targetCount` objects. We move to a layered render (static background + N independently-spawned transparent object sprites), which is cheaper to produce, reusable, and makes tap-to-count actually work.

Reviewers also need to validate this interaction **before** real assets are generated. Mock (emoji) data lets the kido-pipeline admin preview the redesigned count_tap layout and interaction as a dev/design pre-review, distinct from the production human-gate (which still requires real assets).

## What Changes

- **BREAKING** `count_tap` payload: replace `sceneImage: AssetReference` with `backgroundAsset: AssetReference` (static scene, no countable objects) + `targetAsset: AssetReference` (single isolated transparent object sprite). `targetObject`, `targetCount`, `answerOptions` unchanged.
- Mobile `CountTapActivity.tsx`: render `backgroundAsset` as the scene layer via the shared `ActivityVisual`, spawn `targetCount` independent `targetAsset` sprites as tappable components, and drop the emoji-only path.
- Replace the fixed `SLOTS` array with a **seeded, non-overlapping grid layout**: a safe-zone grid (avoiding the counter badge and footer bar) with per-cell jitter, deterministically seeded from the activity id so positions are stable across re-mounts but differ per activity, and never collide for any `targetCount` up to the grid capacity.
- kido-pipeline web replica (`LessonPlayerWeb.tsx` + `player/map.ts`): update the `count_tap` mapping and `CountTap` renderer to the same layered, spawned, seeded-layout behavior so the reviewer sees what the child sees.
- Pipeline asset generation (`3-assets.ts`) + generate/review prompt contracts: emit/validate the two-asset shape; generate `targetAsset` as an isolated transparent-background sprite and `backgroundAsset` as an object-free scene.
- Add a **mock-data pre-review** path in the kido-pipeline admin: a route/mode that renders count_tap (and the shared player) from built-in mock activities with emoji visuals, so the interaction/layout can be reviewed with no generated assets — without weakening the production human-gate's "real assets only" rule.

## Capabilities

### New Capabilities
- `activity-mock-preview`: A dev/design-facing preview in the kido-pipeline admin that renders activities from built-in mock data (emoji visuals, no generated assets) so the redesigned interaction and layout can be pre-reviewed before asset generation. Explicitly separate from the production approval gate — mock previews are never approvable.

### Modified Capabilities
- `count-tap-activity`: The scene/object model changes from a single baked `sceneImage` to a layered `backgroundAsset` + `targetCount` spawned `targetAsset` sprites, with a seeded non-overlapping layout replacing fixed slots. Applies to both the mobile component and the kido-pipeline web replica.

## Impact

- **Schema/types**: `docs/kido-activity-schema.ts`, `kido-server/src/common/types/activity.types.ts`, `kido-pipeline/src/types/activity.types.ts` (`CountTapPayload`), `kido-server/src/common/schemas/activity.schema.ts` if it enumerates payload fields.
- **Mobile**: `mobile/src/components/activities/CountTapActivity.tsx`, `mobile/src/types/lesson.ts` (`mapActivity` count_tap case + `CountTapPayload`), `mobile/src/components/activities/touch.ts` (possible seeded-layout helper).
- **kido-pipeline admin**: `app/components/player/LessonPlayerWeb.tsx`, `app/components/player/map.ts`, plus a new mock-preview route under `app/`.
- **kido-pipeline generation**: `src/pipeline/steps/3-assets.ts`, `src/prompts/generate.prompt.ts`, `src/prompts/review.prompt.ts` (R13/R18 count_tap rules), `src/prompts/image-style.ts` (isolated/transparent sprite variant).
- **Breaking data contract**: any existing `count_tap` seeds/activities using `sceneImage` must be regenerated; given the scene image was never generated correctly, no production content is expected to depend on the old field.
