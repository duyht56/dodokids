## 0. Preconditions

- [ ] 0.1 Read `mobile/AGENTS.md` + pinned Expo SDK 56 `expo-audio` docs before
      native audio code
- [ ] 0.2 Reconcile scope with `enable-explore-offline-audio` (reuse number pack +
      playback foundation) and `add-explore-sound-effects` (shared playback,
      separate voice channel); confirm no kido-server publish is involved
- [ ] 0.3 Confirm the Northern (Bắc) Vietnamese voice rule (`vi-label.ts` /
      curriculum §6.2) applies to the Explore inventory

## 1. Prompt → Key Mapping (mobile)

- [x] 1.1 Enumerate every game's prompt grammar: cataloged all 9 generators —
      fixed phrases + parametric templates with slot domains (numbers 0–50, the 5
      `COUNTABLE_ASSETS` object labels, before/after, more/less, add/subtract,
      totals). Reachability caveats recorded (hear_select, arithmetic make_10,
      number-bond plates are defined but not currently generated).
- [x] 1.2 Define the stable key scheme in `mobile/src/explore/promptAudio.ts`
      (aligns with existing `explore-audio:vi:...:v1`): `phrase:<id>`,
      `number:name:<n>`, `label:<assetId>`, `word:<id>`.
- [x] 1.3 Provide pure per-prompt key builders (`tapCountKeys`, `compareKeys`,
      `arithmeticKeys`, `numberBondKeys`, `patternKeys`, `routePlannerKeys`,
      `numberBeforeAfterKeys`, …) that return the ordered key list; number-name
      keys reuse the `enable-explore-offline-audio` 0–50 pack. Generators do not
      yet call these (see §1a).
- [~] 1.4 Composition coverage: static contract test added
      (`scripts/verify-explore-prompt-audio-contracts.cjs`,
      `npm run test:explore-prompt-audio`) asserting the key scheme, the full
      inventory and one builder per game. Behavioral coverage (every generated
      exercise → fully populated key list) is deferred until the toolchain is
      installed (no `node_modules` here → no transpile-based test).

## 1a. Generator emission + playback (mobile)

- [x] 1a.1 All 8 child-visible generators set `audioRefs` from the matching
      `promptAudio` builder where they build `promptVi` (numberGame select/order,
      countGame, numberBondGame, patternGame, compareGame, arithmeticGame,
      routePlannerGame, memoryGame). Tracing keeps its existing category key.
- [x] 1a.1a Fixed two validators (`validateNumberExercise`,
      `validateCompareExercise`) that hard-required `audioRefs.length === 0` — that
      invariant would have rejected every prompt-audio exercise and broken
      generation. Dropped the guard (requiring audio would make it a required
      dependency, which the Explore contract forbids).
- [x] 1a.2 Central mount playback: `ExplorePlayScreen` plays the current
      exercise's `audioRefs` via `playExplorePromptAudio` when the exercise
      changes and calls `stopExplorePromptAudio` on unmount. Removed Route
      Planner's local playback so it does not double-play.
- [x] 1a.3 Replay control: the 🔊 `AudioPlaceholder` in the 5 renderers that have
      it (Number Explorer, Tap Count, Number Bond, Pattern Finder, Quantity
      Compare) is now an interactive replay button wired to `onReplayPrompt`
      (memoized `handleReplayPrompt` → `playExplorePromptAudio(current.audioRefs)`),
      with an accessible "Nghe lại câu hỏi" label. Route Planner / Arithmetic /
      Memory have no 🔊 affordance and still speak on mount only — adding a button
      there is a separate small UI task.

Note: the runtime sequence player landed early with this increment —
`playExplorePromptAudio` / `stopExplorePromptAudio` in `explore/audio.ts`
(ordered, best-effort, cancellable), and the pipeline generation manifest is
exported as data (`EXPLORE_PROMPT_AUDIO_INVENTORY`).

## 2. Inventory Generation (kido-pipeline)

> Written but NOT runnable here: kido-pipeline `node_modules` are not installed and
> generation needs MongoDB + Gemini TTS. Verified structurally only.

- [x] 2.1 `kido-pipeline/src/explore/exploreAudioInventory.ts` — the finite
      inventory (fixed-phrase + slot transcripts + numbers 0–50 + labels), a
      documented mirror of the mobile `promptAudio.ts` inventory, with the same
      key scheme and a pack version (`explore-audio-vi-v1`).
- [x] 2.2 `generateExploreAudio.ts` synthesizes each entry via the existing
      `getOrCreateLibraryClip` (which calls `tts.service` `wrap:false` and
      get-or-creates by word-key + `lang`, so shared transcripts collapse to one
      clip). CLI: `npm run explore-audio:generate`.
- [x] 2.3 New clips land at `pending_review`; **explicit audio Human Gate added**
      (`exploreAudioApproval.ts` + CLI `review` / `approve` / `reject`) — the base
      pipeline has no approval flow for `audio_library` clips, and Explore audio is
      spoken to children, so `review` lists each clip with a local path to LISTEN
      and a human runs `approve` (never auto-approved). `export` ships only
      `approved` clips.
- [x] 2.3a Extracted `toWordKey` to a pure `src/services/word-key.ts` so
      `export` / `review` / `approve` don't transitively construct the TTS client
      (GCP) at import; the CLI also lazy-loads `generate`. Verified: CLI prints
      usage with no GCP error, modules import cleanly.
- [x] 2.4 vitest: `exploreAudioInventory.test.ts` (inventory data) +
      `exploreAudioApproval.test.ts` (id mapping) — **7 tests pass**, and
      `tsc --noEmit` is clean (0 errors project-wide). A mock-based test of the
      DB-touching generate/approve/export paths is still worth adding.

## 3. Bundled Pack Export (kido-pipeline → app)

- [x] 3.1 `exportExploreAudioPack.ts` writes each approved clip's bytes (from
      local staging or its URL) into `mobile/src/assets/audio/explore/`. CLI:
      `npm run explore-audio:export -- <mobileRoot>` (defaults to sibling `mobile/`).
- [x] 3.2 Generates the Metro-static registry
      `mobile/src/explore/exploreAudioRegistry.generated.ts` (static `require(...)`
      per key + pack version). Committed as an empty stub; `explore/audio.ts` now
      spreads `EXPLORE_AUDIO_REGISTRY` into its clip map, closing the loop
      (empty → silent until export runs).
- [x] 3.3 Export is fail-closed: any key that is absent, not `approved`, or has no
      audio aborts the export with a listed reason — no mute prompt ships.

## 4. Runtime Stitching (mobile)

- [ ] 4.1 Add a resolver that plays a key list in order, offline, best-effort,
      over the shared playback foundation; missing/failed key → silent, on-screen
      `promptVi` remains
- [ ] 4.2 Play the prompt on exercise mount and expose a replay control; honor
      `audioEnabled`/`volume`; keep the voice channel separate from SFX
- [ ] 4.3 Wire prompt playback for each enabled game via its `promptAudioKeys`
      mapping (replace the empty `audioRefs` path)
- [ ] 4.4 Do not voice `hear_select` answer options (instruction/question only);
      leave that mode's audio gating to `enable-explore-offline-audio`

## 5. Verification & Rollout

- [ ] 5.1 Composition-coverage + registry-resolution tests pass on both sides
- [ ] 5.2 Airplane-mode playback of stitched prompts on Android and iOS; replay
      and rapid-navigation cleanup
- [ ] 5.3 Confirm no Explore history/analytics/reward/lesson side effects and no
      kido-server publish path is touched
      (`docs/EXPLORE_ZERO_HISTORY.md`, `explore-stateless-privacy`)
- [ ] 5.4 `cd mobile && npm run lint`; `cd kido-pipeline && npm test` (or
      `npm run build`)
- [ ] 5.5 Roll out behind the exported pack: not exporting leaves prompts as
      on-screen text with all games fully playable
