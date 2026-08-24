## Context

`quantity_compare` shares the generic range-game plumbing (seeded generator + independent validator, in-memory range progression). Its level table `COMPARE_LEVELS` had drifted to a ten-level range-50 ladder while the BRD and the canonical spec both cap the compare task at range 20 for ages 4–6. Two readable features were only introduced at the top of that drifted ladder: equal cases at L4 and a grouped arrangement at L5. Capping naively at four levels would delete the grouped feature entirely.

## Goals

- Cap the ladder at four levels ending at range 20.
- Preserve both readable features (equal, grouped) inside the ≤20 ladder.
- Keep the deterministic replay contract intact: a changed seeded stream means a new `generatorVersion`.
- Touch only the `quantity_compare` rows of the shared files; leave the other range games' ten-range ladder alone.

## Decisions

- **Compare-specific level order.** Introduce `COMPARE_LEVEL_ORDER = [1,2,3,4]` in `compareGame.ts` and point `QUANTITY_COMPARE_GAME.levels` at it, rather than trimming the shared `RANGE_LEVEL_ORDER` that `tap_count`/`number_explorer` still use for their ten-range ladders.
- **Re-home, don't drop.** Equal moves from L4→L3 (`equalEnabled` true at L3) and the grouped arrangement moves from L5→L4 (`arrangements: ['scatter','grouped']` at L4). Both features stay reachable within range 20; the target ranges become 5/10/15/20.
- **Bump `generatorVersion` only.** The level ranges change the seeded exercise stream, so replay is no longer byte-identical to v3; `COMPARE_GENERATOR_VERSION` goes v3→v4 (mirrored in the kido-server registry's `quantity_compare` branch). The validator logic, fairness version and config version are unchanged, so `COMPARE_VALIDATOR_VERSION`, `COMPARE_FAIRNESS_VERSION` and the config version stay put. There is no stored history to migrate (Explore is offline/stateless), so bumping the version is sufficient.
- **Variety stays green.** `variety.ts` `quantity_compare` is trimmed to four levels with the equal bucket declared on L3–L4. Every declared bucket (`more`, `less`, and `equal` from L3) still reaches the child in ≥20% of one-exercise rounds, verified by `verify-explore-compare-contracts.cjs` and `verify-explore-variety-buckets.cjs`.

## Risks / Trade-offs

- The `createCompareLayout`/`compareColumnsFor` helpers still accept counts up to 50; those higher branches are now unreachable from gameplay but remain covered by the layout unit test and cost nothing. Left as-is to keep the change scoped to the ladder.
