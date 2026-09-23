## Context

Đợt 1 left a shared play layer with: rotating round planner, `ExploreMascot`,
natural run end, windowed promotion, global 🔊 and a clean `ExploreRendererProps`.
Three new games and a spoken feedback layer must slot into that without
breaking the stateless / offline / best-effort-audio rules, and nine agents must
be able to build in the same working tree concurrently.

## Goals / Non-Goals

**Goals:**

- New games are complete citizens: contract code, bundled config, variety
  policy, renderer, thumbnail slot, server mirror, conformance script, server
  spec, capability spec — and playable offline today with stub-free logic.
- Every new sentence is in ONE inventory so the pipeline generates, reviews and
  exports the whole batch once (`explore-audio-vi-v2`).
- Support escalation is visible in the board, not only in a text hint.

**Non-Goals:**

- Thumbnail art for the new games (vector icon fallback until delivered).
- Đợt 3 items: level redesigns, detour-required route boards, tracing Lite,
  tier-2 games, listening games (pending BRD §4.2 decision).
- Server-side generation for the new games (they are local-only, like all
  production Explore games).

## Decisions

- **Game modules own their variety policy and keys.** Each new module exports
  `*_VARIETY`, `*VariantKey`, `*BucketKey`; `variety.ts` only delegates. Agents
  therefore never touch the shared planner, and the policy lives next to the
  generator it describes.
- **Lead scaffolds, agents deepen.** The lead registered the three games with
  working baseline generators/validators/renderers so `tsc`, the variety
  contract and the server conformance matrix were green BEFORE the game agents
  started; agents replace internals but keep the exported names.
- **Audio batch = inventory diff.** `promptAudio.PROMPT_PHRASES` and the pipeline
  mirror are the single source; `audio-batch-v2.md` in this change lists the
  keys still missing from the bundle. `generate` is get-or-create by transcript,
  so re-running it for the whole inventory only synthesizes the new sentences.
  The mobile capability model accepts packs v1 and v2 so the app keeps working
  with the current bundle until the export lands.
- **Feedback voice is spoken by the play screen, not by renderers**, after the
  SFX, through the same stitcher as prompts (so a new prompt supersedes praise
  that is still playing). Praise rotates on the run's correct count; the hint
  is spoken at the moment support escalates, otherwise the gentle retry line.
- **`supportLevel` = the screen's existing hint level** (1 after two misses, 2
  after four). Renderers translate it into visuals: anchors (dots/ten-frame,
  counts, pulsing next slot) at 1; reduced choices or an auto-played
  explanation at 2. Level 2 may never mark the answer itself.
- **Demotion is in-memory and range-only.** After three misses in a row a
  range run steps down one level (`demoteRangeProgress`) and presents a fresh
  exercise with "Mình thử bài dễ hơn nhé"; nothing outside the mounted run
  changes.
- **`stack_tower` and `odd_one_out` are progressive five-board runs** from the
  parent's starting level. (`advanceRangeProgress`/`demoteRangeProgress` take a
  game's own `levels`, so a range game can run its own ladder.)
- **No wrong state in one of the two games.** Placing a block out of order is
  physical feedback (the tower leans and the block slides back), never
  `onAnswer(false)`; only odd-one-out reports a miss because its construct is a
  single choice.
- **Catalog speaks the name before navigating** only when the clip is bundled
  (650 ms lead); otherwise it navigates immediately — the feature degrades to
  today's behaviour rather than adding a silent delay.

## Risks / Trade-offs

- New-game prompts are best-effort. Until the v2 pack is exported the renderers
  MUST show the task visually (the child cannot rely on the audio), and a
  missing clip never blocks play.
- Eleven games make the catalog long on a phone; the four groups keep it
  scannable, but a "more" affordance may be needed at 15+ games.
- Thumbnails are vector icons for two games until art is delivered —
  visibly less rich than the PNG cards.
- Server specs now run the conformance matrix over eleven games; runtime is
  still seconds.
