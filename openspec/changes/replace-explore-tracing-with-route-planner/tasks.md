## 1. Catalog Visibility and Stable Game Identities

- [x] 1.1 Add `catalogVisible` to mobile/server Explore game config types with a compatibility default of `true`
- [x] 1.2 Implement one effective-visibility helper using bundled visibility AND compatible server visibility
- [x] 1.3 Filter effective-hidden games from the child catalog while preserving existing disabled/force-stop behavior for visible games
- [x] 1.4 Guard generic Explore entry and the dedicated Tracing route against hidden or incompatible game configuration
- [x] 1.5 Set `tracing_workshop` catalog visibility false in bundled mobile and server definitions without deleting its route, pack, renderer, tests or thumbnail
- [x] 1.6 Add catalog tests for offline hiding, stale-server fail-closed behavior and direct-route blocking

## 2. Route-Planner Puzzle Contract and Engine

- [x] 2.1 Define typed grid cells, directions, objectives, puzzle parameters, completion answer and L1-L5 grammar configs with command limit 8
- [x] 2.2 Implement pure command execution for bounds, obstacles, star collection, key/door state, ordered checkpoints and destination completion
- [x] 2.3 Implement deterministic construct-from-route generation for every level grammar
- [x] 2.4 Implement an independent bounded solver over cell/objective/key state and reject puzzles with no solution within eight commands
- [x] 2.5 Implement the route-planner exercise generator and envelope validator with strict version, level, geometry and objective checks
- [x] 2.6 Add deterministic replay, equivalent-solution, invalid-board and generated-board fuzz/property tests across all five levels

## 3. Registration, Offline Manifest and Variety

- [x] 3.1 Add `route_planner` to mobile/server public game-code unions and child-facing catalog copy without reusing the Tracing identity
- [x] 3.2 Register the local generator/validator and L1-L5 game config in `LocalExploreProvider`
- [x] 3.3 Declare bundled generator, validator, config and visual dependencies with `offlineCapable: true` and no required remote audio
- [x] 3.4 Add semantic `variantKey` normalization for board topology and grammar-based `bucketKey`/capacity policies
- [x] 3.5 Mirror generator, validator, config, levels, catalog visibility and dependency versions in the server catalog definition
- [x] 3.6 Add mobile/server catalog parity, local-provider availability and immediate non-repeat tests

## 4. Child-Facing Board and Command Interaction

- [x] 4.1 Add `RoutePlannerRenderer` and register its exercise type in the Explore renderer registry
- [x] 4.2 Render the responsive grid, Đô Đô, destination, obstacles, objectives and collected/locked states from puzzle parameters
- [x] 4.3 Implement the eight-slot command queue with absolute arrow append, undo, clear and explicit run actions
- [x] 4.4 Execute commands step by step, disable editing while running and cancel all timers/animations on puzzle replacement or unmount
- [x] 4.5 Implement neutral blocked, incomplete, missing-objective and successful completion states without timers, penalties or lose UI
- [x] 4.6 Add escalating support that identifies the first actionable failed step without revealing the complete route
- [x] 4.7 Add accessibility labels, non-color-only state cues and minimum 48-point primary controls
- [x] 4.8 Add renderer/state tests for queue capacity, editing, collision, objectives, single completion and cleanup

## 5. Continuous Transient Run

- [x] 5.1 Add a typed continuous-run policy/guard for `route_planner` without changing finite authored run behavior
- [x] 5.2 Load exactly one validated puzzle at a time and advance success through L1→L5 with L5 clamped indefinitely
- [x] 5.3 Keep blocked or incomplete attempts on the same board while successful completion generates a fresh non-repeated board
- [x] 5.4 Reset level, seed, command queue, support state and replay exclusions on route exit/re-entry or process restart
- [x] 5.5 Add tests proving no route-planner command, seed, outcome, reached level or hint data reaches storage, APIs, analytics, reports or reward services

## 6. Catalog Art and Optional Audio

- [x] 6.1 Add the fixed local thumbnail mapping and replacement instructions for `mobile/src/assets/images/explore/route-planner.png`
- [x] 6.2 Add concise child-facing visual prompts for each objective grammar and the approved wireframe interaction
- [x] 6.3 Connect approved bundled instruction/replay audio when available and keep missing or failed audio non-blocking
- [x] 6.4 Add airplane-mode tests proving catalog entry, generation, command execution and replay remain available without audio or server access

## 7. Verification and Documentation

- [x] 7.1 Run focused mobile typecheck/lint plus Explore catalog, variety, privacy, generator and renderer test suites
- [x] 7.2 Run relevant server Explore tests and build, including mobile/server catalog parity
- [ ] 7.3 Verify 320, 360, 390 and tablet layouts with eight visible command slots, readable board cells and no horizontal scroll — automated layout math covered by `explore.route-planner-layout.spec.ts`; live on-device visual check still pending (cannot run headless)
- [ ] 7.4 Manually verify L1-L5 success, alternative valid routes, obstacle failure, objective-order failure, repeated L5 play and exit/re-entry reset — behaviors covered by engine/renderer/layout specs; live on-device tap-through still pending (cannot run headless)
- [x] 7.5 Update `docs/KIDO_EXPLORE_BRD.md` and `docs/AI_CONTEXT.md` with the visible catalog replacement, offline contract and retained hidden Tracing status
- [x] 7.6 Run strict OpenSpec validation for `replace-explore-tracing-with-route-planner`
