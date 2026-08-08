## Context

The Explore runtime already supports versioned local generators and validators, route-local variety exclusion, offline dependency manifests and transient play state. Its public catalog currently renders disabled games as “Sắp ra mắt”, treats Tracing as a dedicated navigation exception and has no separate “installed but hidden” flag. `tracing_workshop` is substantially implemented, so replacement must not rename or repurpose its game code.

The approved wireframe establishes a planning interaction: the child composes up to eight absolute arrow commands, then explicitly runs Đô Đô step by step. See `proposal.md` and the three delta specs for the behavior contract.

## Goals / Non-Goals

**Goals:**

- Add a deterministic, solvable and varied route-planning game using the existing local Explore provider architecture.
- Make hiding and later re-enabling an installed game an explicit fail-closed catalog operation.
- Keep board execution visually clear and responsive on small phones.
- Preserve mobile/server catalog parity without creating a server gameplay path.

**Non-Goals:**

- Deleting, correcting or migrating the Tracing vector pack.
- Persisting route-planner levels, commands, attempts or completion.
- Adaptive difficulty inferred from child behavior.
- A free-form maze drawing interaction, relative turn commands or loop/function programming.
- Runtime LLM generation, downloaded puzzle content or remote-required audio.
- Lesson rewards, stars, XP, achievements, reporting or subscription effects.

## Decisions

### D1 — Add `route_planner`; do not repurpose `tracing_workshop`

The new game receives its own game code, exercise type, config versions, thumbnail and renderer. Tracing remains registered and testable but is not a child-facing catalog entry while hidden.

This is preferred over renaming Tracing because existing path-pack, route, variety and server catalog contracts depend on its stable identity. It also makes rollback and future Tracing re-enablement explicit.

### D2 — Introduce fail-closed `catalogVisible`

`ExploreGameConfig` gains a non-child-specific `catalogVisible` flag. Existing definitions default to `true` during migration. The effective value for an installed game is:

```text
bundled catalogVisible AND applied server catalogVisible
```

The catalog filters effective-hidden games before rendering. Both generic game entry and the dedicated Tracing route guard the same effective configuration. `enabled` continues to represent whether a visible game may start; `forceStop` remains the emergency stop.

Using a dedicated flag is preferred over treating hidden games as disabled, because disabled cards currently remain visible as “Sắp ra mắt”. Logical AND is preferred over server override so stale server metadata cannot re-expose the known-bad Vietnamese glyph pack. Re-enabling Tracing requires a reviewed app bundle and matching server config.

### D3 — Model puzzles as explicit grid contracts

The exercise parameters will contain only deterministic puzzle data needed by the renderer and validator:

```ts
type RouteDirection = 'up' | 'down' | 'left' | 'right';
type RouteObjective =
  | { kind: 'star'; cell: GridCell }
  | { kind: 'key'; cell: GridCell; doorCell: GridCell }
  | { kind: 'checkpoint'; cell: GridCell; order: number };

interface RoutePlannerParams {
  level: 1 | 2 | 3 | 4 | 5;
  rows: number;
  columns: number;
  start: GridCell;
  destination: GridCell;
  blocked: GridCell[];
  objectives: RouteObjective[];
  commandLimit: 8;
  presentation: { themeId: string };
}
```

The hidden answer stores the validated completion contract, not one canonical command sequence. This lets any legal route succeed and avoids rejecting creative equivalent solutions.

### D4 — Generate from a valid route, then prove solvability independently

For each level, the generator will:

1. Select a versioned level grammar and grid size.
2. Construct a legal route of the required length and turns.
3. Place level objectives along that route in declared order.
4. Add obstacles and optional dead ends without occupying required cells.
5. Materialize the exercise envelope.

The validator will not trust the construction route. It will search the state space `(cell, collected-objective-state, key-state)` to prove that at least one solution reaches home within eight commands. It also checks bounds, cell uniqueness, level grammar, objective order and version parity.

Construct-then-validate is preferred over arbitrary obstacle randomization, which produces too many unsolvable boards, and over a fixed authored corpus, which limits offline variety.

### D5 — Use semantic topology for variety identity

`variantKey` will be derived from level plus normalized start, destination, blocked cells and ordered objectives. `bucketKey` will identify the level grammar, such as `direct`, `obstacles`, `star`, `key_door` or `ordered_objectives`. Theme colors, animation and command-button order are excluded.

The existing route-local exclusion list can prevent immediate repetition without transmitting or persisting history.

### D6 — Keep a dedicated continuous run controller in `ExplorePlayScreen`

Route Planner generates one exercise at a time. Its mounted controller owns:

```text
level → active puzzle → command queue → execution state → support count
                           ↓ success
                 next level, capped at L5
```

Blocked or incomplete execution returns to planning on the same puzzle. Success generates a new puzzle at `min(level + 1, 5)`. Exit/unmount clears all state. This follows the existing continuous range-game pattern without forcing a five-item pre-generated batch or inventing persistence.

### D7 — Renderer uses an explicit state machine

The renderer will use four states:

```text
planning → running → planning with guidance
                   → completed
```

Planning allows append, undo and clear. Running disables editing and applies commands sequentially with cancellable timers/animation handles. Blocked, incomplete and missing-objective outcomes report the first actionable issue and return control. Completion is emitted once. Unmount cancels execution so late callbacks cannot mutate a new screen.

### D8 — Offline visuals are required; audio is optional

Generator, validator, config, grid primitives and required mascot/objective visuals are bundled. Generated envelopes use no required `audioRefs`. If the shared static Explore audio registry contains approved route-planner prompts, the renderer may auto-play and replay them; missing clips or playback errors never affect availability or correctness.

This avoids repeating the Tracing failure mode where a remote audio declaration blocked otherwise local gameplay.

### D9 — Mobile and server advertise the same installed capability

Mobile and server will share the same public game code, L1–L5 list, generator/validator/config versions, offline flag, dependency manifest and catalog visibility semantics. The server exposes Route Planner as a local-runtime catalog entry but does not generate its exercises. Parity tests compare the server definition with the mobile contract fixture.

### D10 — Verify geometry, responsiveness and privacy separately

Pure tests will cover generation determinism, level grammar, solver validation, command execution and semantic variety. Renderer tests will cover queue editing, disabled running controls, neutral failure and single completion. Responsive assertions cover 320, 360, 390 and tablet widths with eight visible command slots and 48-point controls. Privacy tests ensure command sequences, seeds, reached levels and outcomes never reach storage, API payloads, analytics or reports.

## Risks / Trade-offs

- [Random generation repeatedly creates invalid boards] → Construct from a legal route, validate independently, cap retries and fail with the neutral unavailable state.
- [Multiple solutions make a fixed answer incorrect] → Validate the child's executed state against objectives/destination rather than comparing with one command array.
- [Eight commands limit puzzle complexity] → Increase constraint depth through objectives and branches, not longer queues; reject any board whose shortest solution exceeds eight.
- [Small screens make eight slots or grid cells too dense] → Bound the grid to reviewed sizes, keep primary targets at least 48 points and verify 320-point layouts.
- [Stale server config re-exposes Tracing] → Compute visibility as bundled AND server and guard direct routes as well as catalog rendering.
- [Execution animation updates after exit] → Use cancellable timers/animation state and release them on unmount or puzzle replacement.
- [Optional audio again becomes an availability gate] → Keep audio out of required dependencies and test airplane-mode play with audio absent.
- [L5 variants repeat visibly] → Normalize semantic topology, exclude recent mounted-run variants and provide sufficient capacity per grammar.

## Migration Plan

1. Add `catalogVisible` with a compatibility default of `true`; update catalog merge/filter and direct-entry guards.
2. Set Tracing catalog visibility to `false` in bundled mobile and server metadata while keeping all Tracing implementation and tests.
3. Add Route Planner types, level grammars, generator, solver validator, variety policy and local dependency manifest.
4. Add renderer and continuous run integration behind `route_planner` visibility initially set to `false` during development.
5. Add the fixed local thumbnail key `route-planner.png`, child-facing copy and optional bundled prompt mapping.
6. Pass mobile/server contract tests, generator fuzz tests, privacy checks and representative device verification.
7. Enable Route Planner in both bundled and server catalog definitions.

Rollback is configuration-first: set Route Planner `catalogVisible` or `enabled` to false. Tracing remains hidden unless a later reviewed path-pack change explicitly enables it in both the bundle and server configuration.
