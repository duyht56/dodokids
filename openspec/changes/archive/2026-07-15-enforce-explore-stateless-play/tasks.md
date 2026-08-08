## 1. Privacy Contracts

- [x] 1.1 Define forbidden Explore play-history fields and permitted non-child config/asset/service-health data
- [x] 1.2 Add compile-time/runtime guards that reject outcome, answer, tries, hints, duration, completion, exit, seed, level-reached and tracing payloads at network/analytics boundaries
- [x] 1.3 Add server route/schema tests proving no Explore session, attempt, evidence, aggregate or report persistence exists

## 2. Mobile State Lifecycle

- [x] 2.1 Keep all Explore play state below the mounted play route and outside hydrated/global persistent stores
- [x] 2.2 Clear current exercise, run index, hint state and game-specific state on exit, unmount and navigation reset
- [x] 2.3 Add cold-start and exit/re-entry tests proving every game starts fresh and no “Chơi tiếp” metadata exists
- [x] 2.4 Add a network/analytics spy test proving a completed run emits no child play event

## 3. Static Parent Controls

- [x] 3.1 If retained, persist only parent-authored starting-level/support and break-reminder configuration with no derived evidence fields
- [x] 3.2 Implement neutral current-run break reminder using an in-memory timer that resets on exit
- [x] 3.3 Explicitly omit daily accumulated limits and history-based adaptation because they require play-history retention

## 4. Report and Analytics Exclusion

- [x] 4.1 Keep weekly report API and screen unchanged with no Explore section, totals, skill rows or hint trends
- [x] 4.2 Exclude Explore product/learning/guardrail events from generic analytics while retaining non-user-specific server health logging
- [x] 4.3 Add regression tests for report DTO/cache stability and absence of Explore behavior metrics

## 5. Verification

- [x] 5.1 Run mobile storage/network/privacy tests and lint
- [x] 5.2 Run server route/schema/report tests and build
- [x] 5.3 Document the zero-history rule and review checklist for every future Explore game
