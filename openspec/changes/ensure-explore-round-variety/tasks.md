## 1. Variety Contracts and Planner

- [x] 1.1 Add validated pedagogical `variantKey` metadata and variety-policy types to mobile/server Explore contracts without adding any child, outcome or history field
- [x] 1.2 Implement the shared bounded round planner for bucket coverage, current-round uniqueness, route-local exclusions and deterministic exhaustion fallback
- [x] 1.3 Add registry conformance that rejects enabled games with missing/invalid variant identity, bucket policy or declared finite capacity
- [x] 1.4 Add planner unit tests for five-item uniqueness, stratification, exclusion, small-pool exhaustion and bounded attempts

## 2. Enabled Game Variety Policies

- [x] 2.1 Define and test variant/bucket identity for number explorer, tap count and quantity compare while ignoring presentation-only option/layout changes
- [x] 2.2 Define and test variant/bucket identity for memory match and pattern finder using learning content rather than card positions or cosmetic token order
- [x] 2.3 Define and test variant/bucket identity for number bond and arithmetic machine using normalized mode, operands and result
- [x] 2.4 Define and test tracing identity/capacity from path `itemId` and category, including digit/letter category coverage where enabled
- [x] 2.5 Bump affected generator/validator/config versions and keep deterministic replay validation compatible with the new metadata

## 3. Local and Server Batch Generation

- [x] 3.1 Route `LocalExploreProvider.createBatch` through the variety planner and accept only bounded route-local exclusion keys
- [x] 3.2 Update server registry/service generation to enforce distinct validated variant keys within each returned batch when capacity permits
- [x] 3.3 Update `ServerExploreProvider` to filter replay collisions locally and perform only bounded additional stateless requests when necessary
- [x] 3.4 Add local/server provider tests proving clean generation requests contain only `gameCode`, `level` and `count`

## 4. Play Route Lifecycle and Privacy

- [x] 4.1 Keep the immediately preceding round's bounded variant-key set in `ExplorePlayScreen` memory for the replay button and pass it to the next batch plan
- [x] 4.2 Clear all exclusion state on route unmount/process restart and prove no AsyncStorage, persisted store, cache, analytics, report or server payload receives it
- [x] 4.3 Preserve the static parent-selected level across replay and add tests proving answers, tries and completion never change level or lesson progress
- [x] 4.4 Update completion copy from “play again from the beginning” if needed so a new varied round is not described as replaying identical content

## 5. Conformance and Rollout

- [x] 5.1 Add every enabled game to a shared matrix test for key equivalence, key difference, within-round uniqueness, bucket coverage and replay exclusion
- [x] 5.2 Run Explore privacy/stateless suites, all game generator suites, server tests/build and mobile TypeScript/lint
- [ ] 5.3 Manually play two consecutive rounds of every enabled game at representative levels and record expected exhaustion behavior for small pools
