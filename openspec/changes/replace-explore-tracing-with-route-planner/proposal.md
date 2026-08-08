## Why

The current Vietnamese tracing paths are not visually reliable enough to keep `tracing_workshop` in the child-facing Explore catalog. We should preserve that completed engine and content for later correction, while replacing its visible catalog slot with an offline spatial-planning game that can generate fresh, validated puzzles locally.

## What Changes

- Add a new public Explore game, `route_planner`, titled **Dẫn đường cho Đô Đô**.
- Present a grid board with Đô Đô, a destination, static obstacles and level-dependent objectives; the child composes an arrow-command sequence and explicitly runs it.
- Generate every board locally from a versioned seed and independently validate bounds, reachability, objective order and the configured command limit before presentation.
- Provide five progressive levels from short unobstructed routes through turns, obstacles, a required star, a key/door constraint and multiple ordered objectives. After reaching Level 5, continue generating fresh Level-5 boards until exit.
- Keep run state, commands, attempts, reached level and replay exclusions only in mounted route memory. Every later entry starts again at Level 1.
- Make the game fully playable offline using bundled generator, validator, config and visual primitives. Instruction audio is optional and MUST NOT become a required remote dependency.
- Add non-child-specific catalog visibility control so `tracing_workshop` is hidden from the catalog and blocked from ordinary direct navigation while its code, route, path pack, tests and capability spec remain intact for future re-enablement.
- Keep mobile bundled metadata and `kido-server` public catalog metadata aligned for the new game and the temporary Tracing visibility flag.

## Capabilities

### New Capabilities

- `explore-route-planner-game`: Defines the offline grid generator, command-sequencing interaction, independent solvability validation, five-level progression and non-punitive feedback for Dẫn đường cho Đô Đô.

### Modified Capabilities

- `explore-catalog`: Adds explicit catalog visibility semantics so a retained game can be hidden without deleting its implementation, and makes `route_planner` the visible replacement for Tracing.
- `explore-session-runtime`: Allows a registered local game to generate one validated puzzle at a time in a continuous, transient L1-L5 run that remains at L5 until exit.

## Impact

- `mobile/src/types/explore.ts`: add the new game code and catalog visibility contract.
- `mobile/src/explore`: add route-planner generator, validator, variety identity, local registration and bundled dependency manifest.
- `mobile/src/explore/rendererRegistry.tsx` and a new renderer: implement the command queue, board execution, hints and completion states.
- `mobile/src/screens/child/ExploreCatalogScreen.tsx` and `ExplorePlayScreen.tsx`: filter hidden games, guard direct entry and own the transient progressive route-planner run.
- `mobile/src/explore/thumbnails.ts` and local Explore art: add a fixed thumbnail mapping for `route_planner` while retaining the Tracing asset.
- `kido-server/src/modules/explore`: mirror game codes, public catalog visibility, levels, versions and the local/offline manifest; no server exercise generation or play-history endpoint is added.
- `openspec/specs`: add the route-planner capability and update catalog/session behavior. The existing `explore-tracing-workshop` requirements remain unchanged because Tracing is disabled, not removed or redefined.
- No lesson, reward, achievement, subscription, report, analytics or persistent child-progress behavior changes.
