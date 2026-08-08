# Kido Explore Runtime Boundary

Explore uses the contract in `docs/kido-explore-contract.ts` and is separate
from the canonical lesson activity schema.

## Data that may persist

- Versioned public game configuration and feature flags.
- Approved asset, vector-path and audio manifests.
- Parent-authored static defaults that contain no play evidence.
- Non-user-specific service-health logs.

## Data that must remain in memory

- Current exercise and interaction index.
- Random seed and generated parameters for the active run.
- Answers, tries, hints, temporary support level and completion state.
- Memory-card state and tracing coordinates.

Back, exit, route unmount and process restart discard all in-memory play data.
Explore has no resume flow, attempt endpoint, progress record, behavior
analytics or parent report. Server-runtime games fetch stateless exercise
batches and mobile never submits their outcomes.

## Offline declaration

`offlineCapable` is valid only when every generator, validator, configuration,
asset/vector and audio dependency is `bundled` or `installed`. A remote-only
dependency makes the game online-required even if its arithmetic rule is
deterministic.

## Rollout and rollback

1. Keep production game definitions disabled until their own OpenSpec change
   supplies a validated generator, validator and complete dependency manifest.
2. Verify the hidden `local_canary` without network access and the hidden
   `server_canary` through `POST /explore/exercises` before enabling a game.
3. For a local game, registration must accept `offlineCapable=true`; for a
   server game, verify catalog, manifests and a bounded five-exercise batch.
4. Enable one game/level at a time through public configuration. The catalog
   must show offline-ready versus online-required state before play starts.

Rollback is configuration-only: set `enabled=false` to prevent new runs or
`forceStop=true` to stop new server exercise issuance. Because Explore stores
no play history, rollback requires no child-data migration, session cleanup or
report repair.

Verification commands:

```text
cd kido-server && npm test && npm run build
cd mobile && npm run lint
```

The Explore-specific mobile files must also pass `tsc --noEmit`; existing
unrelated lint debt should be reported separately rather than suppressed by
the Explore change.
