## 1. Generate hear_select on every level

- [x] 1.1 Add `hear_select` to `NUMBER_LEVELS[3..10].modes` in `mobile/src/explore/games/numberGame.ts` (union with each level's existing modes), keeping the audio-aware `resolveAvailableModes` filter so the mode is emitted only when the bundled pack covers the level's range
- [x] 1.2 Confirm the audio-missing seeded stream is unchanged for L3–L10 (the filter removes `hear_select`, leaving the prior mode list in the same order) and only the audio-available stream gains the mode
- [x] 1.3 Bump the number `generatorVersion` `number-explorer-v3` → `number-explorer-v4` in the two exercise envelopes, the validator version gate, and the `NUMBER_EXPLORER_GAME` config

## 2. Declare buckets and capacity for the richer mode set

- [x] 2.1 Extend `VARIETY_CONFIGS.number_explorer.bucketKeysByLevel` for L3–L10 to include `hear_select` alongside the existing modes
- [x] 2.2 Update `capacityByLevel` for L3–L10 to the reachable variant count for the enlarged mode set (≈ reachable modes × range max) so round planning still balances
- [x] 2.3 Keep the P0 mode/bucket coverage invariant green: every level's declared buckets cover every mode generatable under BOTH audio profiles

## 3. Mirror the version bump and lock the behavior

- [x] 3.1 Bump the server metadata mirror of the number `generatorVersion` to `number-explorer-v4` in `kido-server/src/modules/explore/explore.registry.ts`
- [x] 3.2 Add an assertion in `kido-server/src/modules/explore/explore.number-count.spec.ts` that `hear_select` is reachable on every level under the bundled pack
- [x] 3.3 Update the `verify-explore-number-contracts.cjs` header comment to document the every-level `hear_select` invariant

## 4. Docs

- [x] 4.1 Update `docs/KIDO_EXPLORE_BRD.md` §7.2 to state `hear_select` is offered at every level with the pack (visual fallback otherwise)
- [x] 4.2 Add one `docs/AI_CONTEXT.md` line recording the change and the `generatorVersion` bump

## 5. Verification

- [x] 5.1 `cd mobile && npx tsc --noEmit` and `npx eslint` on the changed files
- [x] 5.2 `npm run test:explore-number` and `npm run test:explore-variety-buckets` (both audio profiles, one-exercise-round reach)
- [x] 5.3 `cd kido-server && npx jest src/modules/explore/explore.number-count.spec.ts`
- [x] 5.4 `openspec validate enable-explore-number-hear-select-all-levels --strict`
