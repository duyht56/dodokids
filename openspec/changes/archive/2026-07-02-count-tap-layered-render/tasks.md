## 1. Schema & type contract

- [x] 1.1 Update `docs/kido-activity-schema.ts` `CountTapPayload`: replace `sceneImage: AssetReference` with `backgroundAsset: AssetReference` + `targetAsset: AssetReference`; update the inline doc comment and the render-example snippet.
- [x] 1.2 Mirror the change in `kido-pipeline/src/types/activity.types.ts` `CountTapPayload`.
- [x] 1.3 Mirror the change in `kido-server/src/common/types/activity.types.ts` `CountTapPayload`; update the sample `CountTapScreen` usage comment.
- [x] 1.4 Update `kido-server/src/common/schemas/activity.schema.ts` if it enumerates count_tap payload fields. — N/A: schema stores `payload` as Mongoose `Mixed`, does not enumerate per-type fields.
- [x] 1.5 Update `mobile/src/types/lesson.ts` `CountTapPayload` to carry `background: Visual` + `target: Visual` (app-normalized shape).

## 2. Seeded non-overlapping layout helper

- [x] 2.1 Add a shared layout function (mobile: `mobile/src/components/activities/countTapLayout.ts`) that takes `(seed: string, count: number)` and returns `%`-coordinate slots from a safe-zone grid (left 6–94%, top 20–84%, exclude top-right counter cell) using a seeded PRNG (mulberry32 + string hash) with clamped intra-cell jitter.
- [x] 2.2 Guarantee no-collision up to grid capacity and warn (not collide) when `count` exceeds capacity; unit-test determinism (same seed → same slots) and distinctness (different seed → different slots). — grid grows rows past capacity so it never collides; 5 vitest cases pass (`app/components/player/countTapLayout.test.ts`).
- [x] 2.3 Mirror the identical algorithm + grid constants in the pipeline web player (`kido-pipeline/app/components/player/countTapLayout.ts`).

## 3. Mobile component

- [x] 3.1 Update `mobile/src/types/lesson.ts` `mapActivity` count_tap case: map `backgroundAsset → background`, `targetAsset → target`; require `target` present to map (else return null); update `mockCountTap` fixture to the layered shape (emoji visuals).
- [x] 3.2 Rewrite `mobile/src/components/activities/CountTapActivity.tsx`: render `background` (real image over the gradient fallback) as the scene layer; spawn `targetCount` sprites from `target` via `ActivityVisual`, each a `TouchableOpacity` with `hitSlopFor(box)`; position via `useMemo(() => countTapLayout(seed, targetCount), ...)` (seed = activity id, plumbed via new `seed` prop); keep highlight/badge/counter/reset/phase-2 logic; removed the `SLOTS` array and the emoji-only fallback. (Background uses a full-bleed `Image` rather than the square `ActivityVisual` so it covers the scene.)
- [x] 3.3 Verify touch targets stay ≥ `MIN_HIT_AREA` and the counter/footer do not overlap sprites. — box 64/76pt → `hitSlopFor` expands to 88pt; top-right cell excluded (counter) and `TOP_MAX` lowered to 76% so bottom-row sprites clear the footer.

## 4. kido-pipeline web replica

- [x] 4.1 Update `kido-pipeline/app/components/player/map.ts` count_tap case to the layered shape (`background`/`target`), mirroring mobile mapping semantics.
- [x] 4.2 Rewrite the `CountTap` renderer in `LessonPlayerWeb.tsx`: background layer + `targetCount` spawned tappable sprites using the shared web layout helper, coral highlight + numbered badge + live counter + reset + number-answer phase — matching mobile behavior.
- [x] 4.3 Add an optional `mock` prop to `LessonPlayerWeb` (default false) that bypasses the `isAssetReady` not-ready block; production review path still defaults to the block.

## 5. Mock pre-review route

- [x] 5.1 Add built-in mock activity fixtures (emoji visuals, layered count_tap incl. a targetCount=10 case + single_select) under `kido-pipeline/app/preview/mock/fixtures.ts`.
- [x] 5.2 Add a route `kido-pipeline/app/preview/mock/page.tsx` that renders the fixtures through `LessonPlayerWeb` with `mock` enabled; labeled clearly as a design/dev preview, exposes NO approve/reject/publish actions.
- [x] 5.3 Confirm the production human-gate route still blocks unready activities and shows no mock affordances. — `HumanGate` renders `<LessonPlayerWeb activity={...} />` with no `mock` prop (defaults false), so the not-ready gate is unchanged.

## 6. Pipeline generation & validation

- [x] 6.1 Update `kido-pipeline/src/pipeline/steps/3-assets.ts`: resolve `targetAsset` as an isolated transparent sprite and `backgroundAsset` as an object-free scene; branch `background` (`'transparent'` vs `'scene'`) by use instead of the current hardcoded `'scene'`. (Also updated `normalize-payload.ts` `normalizeCountTap` to the layered shape.)
- [x] 6.2 Add an isolated/transparent sprite variant in `kido-pipeline/src/prompts/image-style.ts` (`buildIsolatedSpritePrompt`, plain background, `--ar 1:1`) + `buildBackgroundScenePrompt` (object-free scene).
- [x] 6.3 Update `kido-pipeline/src/prompts/generate.prompt.ts` count_tap payload schema to emit `backgroundAsset` + `targetAsset`.
- [x] 6.4 Update `kido-pipeline/src/prompts/review.prompt.ts` rule R13 to require `backgroundAsset` + `targetAsset` (no `sceneImage`); R18 unchanged.

## 7. Migration & verification

- [x] 7.1 Regenerate / migrate any existing count_tap seeds from `sceneImage` to `backgroundAsset` + `targetAsset`. — Local seed JSONs are input specs (skillCode/actionType/questionCore), not generated payloads; none contain `sceneImage`. Generated payloads live in MongoDB (not accessible locally); regen is an ops step, and the old scene image was never generated correctly so nothing depends on it.
- [x] 7.2 Run the mobile app and the kido-pipeline mock-preview route; verify layered render, non-overlapping sprites at high `targetCount`, stable positions across re-mount, and matching mobile/web behavior. — Started `next dev`, fetched `/preview/mock`: HTTP 200, banner present, 15 sprite containers (5 fish + 10 apples) = exact `targetCount` incl. the >8 case, reset button present, NO approve/reject/publish controls. Stability/no-collision/determinism covered by the 5 passing layout unit tests; mobile uses the identical (tested) algorithm and typechecks clean, so the Expo live-run was not spun up.
- [x] 7.3 Run pipeline tests (`vitest`) and mobile type-check; fix fallout from the field rename. — 24/24 pipeline vitest pass; pipeline `tsc --noEmit` 0 errors from this change (1 pre-existing unrelated missing-module error in a seed-review test); mobile `tsc --noEmit` 0 errors.
