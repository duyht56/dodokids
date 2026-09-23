## Why

Every Khám Phá (Explore) game renders a Vietnamese question (`promptVi`) as text
only. For non-reading children age 4–6 the instruction is the primary channel,
yet no game reads its question aloud. `enable-explore-offline-audio` starts the
spoken layer but only for `number_explorer`, and leaves open
"which approved voice/recording source" produces the pack.

The Explore prompts are not free-form: they are a finite set of fixed phrases
(e.g. `'Con hãy tìm số giống mẫu.'`, `'Con hãy xếp các số từ bé đến lớn.'`,
`RoutePlanner PROMPTS[level]`) plus a small number of parametric templates with
enumerable slots (`Con hãy chọn số ${answer}`,
`Số nào đứng ${trước|sau} số ${reference}?`).
That makes the whole prompt space coverable by a finite, composable clip
inventory rather than per-prompt recordings — and kido-pipeline already has the
generator for it: `tts.service.synthesize(text, 'vi', { wrap:false })` plus a
reusable `audio_library` (word-key + `lang`, with a pending→approved review
lifecycle).

This change makes Explore read its questions aloud by generating that finite
inventory in kido-pipeline, bundling it into the app, and stitching the child's
prompt at runtime — fully offline, best-effort, and without touching kido-server
or Explore's stateless model.

## What Changes

- Define a composable Explore prompt-audio contract: every game's child-facing
  prompt maps to an ordered list of stable audio keys — fixed-phrase clips plus
  slot clips (numbers, object labels, directions) — resolvable from a bundled
  static registry. Number-name slots reuse the `enable-explore-offline-audio`
  0–50 pack rather than being regenerated.
- Generate the finite inventory in kido-pipeline via `tts.service` into the
  reusable `audio_library` (Northern Vietnamese voice per `vi-label.ts` /
  curriculum §6.2), gated by the existing `audio_library` approval lifecycle so
  nothing bundles until `approved`.
- Add a deterministic export from kido-pipeline: a versioned Explore audio pack
  plus the generated Metro-static registry the mobile app consumes. This is a new
  pipeline output target (a bundled app pack), distinct from publishing runtime
  content to kido-server.
- Stitch prompt audio at runtime in mobile: resolve the current prompt's key list
  and play the segments in order, offline, best-effort, over the shared Explore
  playback foundation. A missing/failed key falls back to the existing on-screen
  `promptVi`; audio never gates generation, validation, availability or
  completion.
- Add a composition-coverage guarantee: every prompt template a game can emit
  maps to a resolvable key list, and every key resolves to an approved bundled
  clip — asserted by tests on both sides.

## Capabilities

### New Capabilities
- `explore-prompt-audio`: The mobile runtime contract for spoken Explore prompts —
  the composable key model, runtime stitching, offline/bundled resolution,
  best-effort playback, settings honoring and zero-history guarantees.
- `explore-audio-pipeline`: The kido-pipeline contract for generating, reviewing
  and exporting the finite Explore audio inventory (fixed phrases + slot clips)
  via `tts.service`/`audio_library` into a versioned bundled pack + static
  registry.

## Impact

- Mobile Explore: a prompt→key mapping alongside each game's prompt generator, a
  bundled audio pack under `mobile/src/assets/audio/explore/`, a stitching
  resolver, and prompt-audio playback wired through the shared foundation
  (coordinates with `add-explore-sound-effects` and `enable-explore-offline-audio`).
- kido-pipeline: an Explore audio-inventory generation routine over `tts.service`
  + `audio_library`, a review pass on those clips, and a versioned pack/registry
  export step for the mobile bundle. No new kido-server publish path.
- App bundle size (a finite inventory) and release verification for airplane-mode
  playback and inventory completeness.
- No kido-server, schema, curriculum, progress or reward change. No Explore play
  history or analytics (`docs/EXPLORE_ZERO_HISTORY.md`, `explore-stateless-privacy`).
- Answers the open "approved voice / recording source" question in
  `enable-explore-offline-audio` (kido-pipeline TTS, Northern VI, `audio_library`
  review); does not modify that change's specs.
