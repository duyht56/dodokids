## Why

Đợt 1–2 repaired the memory board and added the card flip. Two roadmap gaps
remain for **Lật thẻ tìm cặp** (`memory_match`): the asset pool is small (16), so
a run's boards repeat and feel stale, and a child who keeps mismatching gets no
help at all. This change (Đợt 3, slice 2D) expands the pool and adds a gentle
in-board hint, without changing the deterministic board logic beyond a
pool-driven generatorVersion bump.

## What Changes

- **Bigger pool**: `MEMORY_ASSETS` grows 16 → 37, every entry a single,
  background-free, instantly-recognisable object with a distinct
  `similarityGroup`, so the L1–L2 "no two look-alike cards on one easy board"
  rule still holds. A larger pool means fresher boards across a run.
- **Version bump**: because a bigger pool changes which assets a seed draws,
  `generatorVersion` goes `memory-match-v3` → `memory-match-v4` (validator logic
  unchanged). The kido-server registry mirror — which had silently drifted to
  `v2` — is realigned to `v4` / `validator-v3`.
- **Support hint**: `MemoryMatchRenderer` adds a presentation-only nudge — after
  `HINT_AFTER_MISMATCHES` mismatches in a row, Đô Đô peeks ONE still-hidden
  matching pair for `HINT_PEEK_MS`, then closes it. It is never a lose state,
  never ends the board, persists nothing, and is armed from the resolve timeout
  so it never touches the reducer's matched set (replay/scoring unaffected). It
  rests statically under reduced motion.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `explore-memory-match-game`: adds an expanded-pool requirement and an in-board support-hint requirement.

## Impact

- `mobile/src/explore/games/memoryAssets.ts` (pool), `memoryGame.ts` (version),
  `renderers/MemoryMatchRenderer.tsx` (hint), `scripts/verify-explore-memory-contracts.cjs`.
- `kido-server/src/modules/explore/explore.registry.ts` (version mirror realigned),
  `explore.memory-match.spec.ts` (hint source assertion).
- `docs/KIDO_EXPLORE_BRD.md` §7.8, `docs/AI_CONTEXT.md`.
- No audio regeneration; replay stays byte-identical within `memory-match-v4`.
