## 1. Contracts and Privacy Boundary

- [x] 1.1 Define game codes, `runtimeMode`, `offlineCapable`, versioned generator/validator and dependency-manifest types without changing the canonical lesson schema
- [x] 1.2 Add architecture tests forbidding Explore session/attempt/history/progress schemas and outcome analytics calls
- [x] 1.3 Document that config/assets may persist but all child play state is memory-only and discarded on exit

## 2. Stateless Server Support

- [x] 2.1 Add Explore registry and versioned public config/feature flags without child-scoped play persistence
- [x] 2.2 Implement stateless catalog/config and bounded exercise-batch endpoints for `server` games
- [x] 2.3 Add independent generation validation, public asset/audio manifests and neutral structured errors
- [x] 2.4 Add tests proving requests create no session/attempt IDs and accept/emit no outcomes, tries, hints, duration or progress

## 3. Mobile Catalog and Play Shell

- [x] 3.1 Redesign child bottom navigation to `Bài học · Khám phá · Đô Đô · Thành tích · Phụ huynh`, mapping center Đô Đô to Home/Adventure Map and preserving existing destinations
- [x] 3.2 Add typed Explore catalog and play routes that bypass paywall and contain no resume/session identifier
- [x] 3.3 Render explicit offline-ready and online-required states from each game's dependency manifest
- [x] 3.4 Build the shared 5–8 interaction in-memory shell, renderer registry, exit action and neutral completion actions
- [x] 3.5 Ensure back, exit, unmount and process restart discard all run state; never write Explore state to persistent stores

## 4. Hybrid Exercise Providers

- [x] 4.1 Implement local seeded provider/validator using only bundled or installed approved dependencies
- [x] 4.2 Implement server provider that fetches stateless validated batches and never submits child outcomes
- [x] 4.3 Add runtime registration checks that reject `offlineCapable=true` when any generator, validator, asset/vector or audio dependency is remote-only
- [x] 4.4 Add bounded retry and neutral unavailable handling for both providers

## 5. Verification and Rollout

- [x] 5.1 Add local and server canary games to verify deterministic generation without production play persistence
- [x] 5.2 Add mobile tests for fresh restart after exit, no “Chơi tiếp”, no persistent-store writes, offline matrix and zero lesson side effects
- [x] 5.3 Add server tests for statelessness, disabled games, invalid asset/audio/config and absence of child-scoped play records
- [x] 5.4 Run `kido-server` tests/build and `mobile` lint; document runtime-mode rollout and rollback
