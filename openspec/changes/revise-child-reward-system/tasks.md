## 1. Reward Contracts And Deterministic Helpers

- [x] 1.1 Add shared mobile/server reward types for `RewardContext`, `RewardCompletionEvent`, `RewardSyncResponse`, canonical progress snapshot, sticker summary, and structured sync errors without introducing `any`.
- [x] 1.2 Replace the 5/3 star thresholds with tested helpers for the canonical 8-activity rule (6-8 = 3 stars, 3-5 = 2, 0-2 = 1) in both mobile and server.
- [x] 1.3 Update canonical docs/types so `isStickerDay` is a presentation hint rather than the sticker-award condition, and document canonical-only durable rewards.
- [x] 1.4 Define the 48-entry typed sticker catalog (`sticker-w01` through `sticker-w48`) with world/week/name/asset keys and a catalog version.
- [x] 1.5 Add a catalog contract script that fails on missing/duplicate IDs, invalid world mapping, non-contiguous weeks, duplicate asset keys, or missing local PNG files.

## 2. Server Schema, Content Identity, And Migration

- [x] 2.1 Add deterministic `contentVersion` to the runtime Lesson schema and calculate it from canonical reward-relevant lesson/activity content during publish ingest.
- [x] 2.2 Backfill deterministic content versions for existing imported lessons and add tests proving unchanged payloads keep the same version while republished content changes it.
- [x] 2.3 Extend ChildProgress with `stickerIdsEarned`, frozen `weekRewardPlans`, `rewardRevision`, and bounded recent reward event receipts using backward-compatible defaults.
- [x] 2.4 Implement dual-read migration from legacy `stickersEarned: number[]` to stable sticker IDs with set semantics, preserving legacy fields for rollback.
- [x] 2.5 Add a migration/dry-run command that reports affected lesson/child counts, applies idempotently, and never deletes legacy reward data.
- [x] 2.6 Add schema tests for defaults, 48-plan bound, receipt bound, stable sticker uniqueness, revision guards, and legacy reads.

## 3. Frozen Week Reward Context In Lessons API

- [x] 3.1 Build deterministic week plan versions from the sorted imported required lesson IDs and their content versions.
- [x] 3.2 Freeze the child’s week reward plan on the first canonical lesson read for that week and reuse it on later reads even if additional content is published.
- [x] 3.3 Extend `GET /lessons/today` mapping/cache output with `contentVersion` and eligible reward context while returning `eligible: false` for stub content.
- [x] 3.4 Preserve content/reward identity through mobile lesson normalization and any canonical lesson disk/query cache used for offline playback.
- [x] 3.5 Add lessons service/controller tests for exactly 8 activities, stable context across cache hits, frozen plan reuse, stub ineligibility, household ownership, and version changes after republish.

## 4. Idempotent Server Reward Processing

- [x] 4.1 Extend complete-lesson DTO validation for event/content/plan identity, timestamps, canonical activity results, attempt bounds, and structured validation/conflict codes while retaining the legacy payload migration path.
- [x] 4.2 Validate household ownership, imported lesson/content version, frozen plan version, and exact activity membership before applying a reward event.
- [x] 4.3 Implement reward receipt lookup plus atomic compare-and-swap updates using `rewardRevision`, with bounded retry on concurrent child updates.
- [x] 4.4 Apply first-completion XP/streak/position effects once, keep best-star on replay, and return duplicate/replay/first-completion status without incremental side effects.
- [x] 4.5 Award the stable weekly sticker only when every lesson in the frozen required set is complete, including catch-up order, and never award from D5 alone or from star thresholds.
- [x] 4.6 Return the canonical `{ eventId, applied, eventResult, progress }` response and invalidate progress, today-lesson, and achievements caches after a successful update.
- [x] 4.7 Update `GET /progress/:childId` to return the full canonical snapshot with stable sticker IDs/revision while retaining legacy-compatible output during migration.
- [x] 4.8 Add progress tests for 6/3 star boundaries, first completion, lower/higher replay, duplicate same event, concurrent distinct events, D5-with-gap, catch-up sticker, plan/content conflict, receipt pruning, and household isolation.

## 5. Achievements API And Non-Revocable Badges

- [x] 5.1 Replace the current badge rules with `first_lesson`, `first_sticker`, `explorer_1`, `explorer_2`, `explorer_3`, and `journey_complete` based only on monotonic completion/sticker counts.
- [x] 5.2 Return all 48 sticker identities with week/world/name/earned state and temporary emoji/background compatibility fields for old mobile versions.
- [x] 5.3 Update offline achievements derivation to start from the acknowledged snapshot plus eligible pending projections and exclude mock/D5-only inference.
- [x] 5.4 Add API/derivation tests proving badge ordering, 1/12/24/36/48 boundaries, no badge relock after streak reset, four-world mapping, legacy ownership mapping, and mock ineligibility.

## 6. Mobile Durable Queue And Snapshot Reconciliation

- [x] 6.1 Implement a persisted, typed `rewardSyncStore` keyed by child with pending events, retry metadata, queue schema version, and reveal-consumed state; hydrate old installs to an empty safe default.
- [x] 6.2 Implement an awaited enqueue path that durably writes the completion event before result navigation and uses cryptographically random event IDs.
- [x] 6.3 Implement a per-child single-flight ordered queue drain with bounded backoff, app/session recovery hooks, transient versus terminal error handling, and no parallel duplicate posts.
- [x] 6.4 Implement atomic canonical snapshot reconciliation and deterministic re-projection of only the still-pending later events.
- [x] 6.5 Stop the canonical completion path from calling `completeDay`, `addXp`, local streak increment, and `setLessonStars` as independent mutations; retain compatibility actions only for unrelated/legacy consumers until cleanup.
- [x] 6.6 Trigger queue drain at safe bootstrap/reconnect/completion points without blocking navigation or duplicating anonymous-session bootstrap.
- [x] 6.7 Add contract tests for restart persistence, enqueue-before-navigation, single-flight drain, response-loss retry, terminal conflict retention/surface, newer multi-device snapshot, and replay with zero completion rewards.

## 7. Lesson Player And Two-Phase Result UX

- [x] 7.1 Update LessonPlayer to build actual 8-result events from attempt tracking, enqueue only eligible canonical lessons, and treat mock/demo completion as non-persistent practice.
- [x] 7.2 Replace Lesson Complete route params with event/current-star/sticker/streak data needed by the result state machine and remove child-facing XP params/copy.
- [x] 7.3 Implement the stars-first state followed by an optional bundled sticker reveal with name/week and “Cất vào bộ sưu tập” acknowledgement.
- [x] 7.4 Persist reveal consumption before leaving the sticker phase so restart, duplicate response, replay, or later sync cannot replay the same reveal.
- [x] 7.5 Keep D1-D4, replay, duplicate, and demo flows free of sticker reveal; preserve encouraging 1-star copy and streak milestone behavior without showing XP.
- [x] 7.6 Add mobile contract/component tests for 1/2/3-star rendering, no XP text, phase ordering, once-only reveal, offline local asset render, demo no-progress copy, and phone/tablet layouts.

## 8. Four-World Collection UI And Assets

- [x] 8.1 Add the fixed local asset directory/map for worlds 1-4 and weeks 1-48 with temporary placeholders only where final reviewed art is not yet supplied.
- [ ] 8.2 Obtain or create all 48 distinct final sticker PNGs, preserve the fixed filenames, and complete recognizability/style review before marking the asset task done.
- [x] 8.3 Update StickerGrid to render catalog images and locked silhouettes instead of treating emoji/background metadata as canonical.
- [x] 8.4 Group the Achievements collection into four 12-sticker world sections with earned counts and 4-column phone / 6-column tablet grids.
- [x] 8.5 Update the badge grid labels/art for the six cumulative milestones and remove star/current-streak-dependent badge states.
- [x] 8.6 Refresh/rederive Achievements on screen focus and whenever acknowledged snapshot or pending projections change, including when the tab remains mounted.
- [x] 8.7 Add asset/catalog/UI tests for all 48 cells, world boundaries, locked/earned rendering, focus refresh, legacy mapping, and responsive layouts.

## 9. Compatibility, Documentation, And Rollout

- [x] 9.1 Keep server request/response compatibility for the current mobile during the migration window and document the server-first then mobile rollout order.
- [x] 9.2 Update `docs/AI_CONTEXT.md`, canonical schema comments, runtime API docs, and reward runbook with event/snapshot ownership and mock ineligibility.
- [x] 9.3 Document migration dry-run, monitoring signals (queue age, duplicate rate, version conflicts, CAS retries), rollback steps, and the later legacy-field removal boundary.
- [x] 9.4 Record final four-world names/art approval separately from stable IDs and file paths so art changes do not alter reward identity.
- [x] 9.5 Define a beta review checklist for the 6/3 thresholds using aggregate first-try distributions and child/parent qualitative feedback without changing thresholds in this change.

## 10. Verification And Acceptance

- [x] 10.1 Run OpenSpec validation for `revise-child-reward-system` and resolve every structural/spec error.
- [x] 10.2 Run the smallest relevant server unit suites plus full `npm test` and `npm run build`; report any unrelated existing failures separately.
- [x] 10.3 Run mobile lint and all reward/catalog/state contract scripts with no regressions in navigation, anonymous sessions, lesson playback, or asset verification.
- [ ] 10.4 Execute on-device online acceptance: first completion, lower/higher replay, full-week reveal, catch-up reveal, collection refresh, badges, and no XP UI.
- [ ] 10.5 Execute on-device offline/reconnect acceptance: cached canonical lesson, app restart with pending event, response-loss retry, duplicate delivery, mock fallback, and snapshot reconciliation without lost sticker.
- [ ] 10.6 Execute a two-client/concurrency acceptance against a configured server to prove one first-completion award and deterministic final snapshot.
- [ ] 10.7 Verify all 48 final sticker assets visually on phone/tablet and confirm each week/world maps to the intended image/name.
