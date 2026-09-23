## Context

`ExplorePlayScreen` currently resolves one static level and asks the selected provider for five exercises. Both `LocalExploreProvider.createBatch` and `ExploreService.generateBatch` generate each slot independently from a fresh random seed and accept the first valid candidate. Fresh randomness is therefore present, but sampling is with replacement: neither provider knows whether two candidates represent the same pedagogical content, and tests assert validity rather than round diversity.

The privacy contract forbids persisted or transmitted play history, recent games, exercise IDs, seeds, outcomes and derived evidence. A solution cannot maintain a child-scoped curriculum cursor, use prior correctness to advance difficulty or send exclusions to the server. It must still work for bundled offline generators and future stateless server generators.

## Goals / Non-Goals

**Goals:**

- Give every exercise a deterministic, game-owned pedagogical identity.
- Avoid duplicate pedagogical variants within a round whenever the eligible pool can satisfy the requested count.
- Avoid variants from the immediately preceding round when the child presses play again on the still-mounted play route and sufficient unseen variants exist.
- Spread a round across the modes/categories enabled for the selected level instead of allowing incidental random clustering.
- Preserve bounded generation, independent validation, offline support and the no-history privacy contract.

**Non-Goals:**

- Persisting a curriculum cursor, completed-content list, recent-game record or rotation state.
- Inferring mastery, adapting difficulty from answers or automatically unlocking/advancing levels.
- Guaranteeing non-repetition after the play route unmounts or the app process restarts.
- Changing the five-interaction round size or adding lesson rewards/progress.

## Decisions

### D1 — Game-owned `variantKey`, not a generic envelope hash

Each registered game SHALL expose or validate a deterministic `variantKey` derived only from learning-relevant fields. Examples include tracing `itemId`, pattern grammar plus vocabulary identity, and memory asset-set identity rather than shuffled card positions.

A generic JSON hash was rejected because cosmetic option order, board layout or presentation metadata would make repeated learning content appear new. Using `randomSeed` was rejected because every draw already has a new seed and would not detect the observed repetition.

For server-generated exercises, `variantKey` is validated content metadata in the returned envelope. It is not a child identifier or history field.

### D2 — Shared variety planner with game-owned bucket policy

Local and server registries SHALL declare a variety policy containing variant-key derivation/validation, optional `bucketKey`, and per-level finite-capacity information where known. The shared planner fills a round using this order:

1. Prefer buckets not yet represented in the round.
2. Reject keys already selected in the current round.
3. Reject route-local recent keys while declared capacity says unseen content remains.
4. After the eligible pool is exhausted, clear only the applicable exclusion bag and continue with valid least-recently-served candidates.

This replaces five unrelated draws with bounded rejection sampling initially. A finite enumerated shuffle bag MAY be used by games such as tracing where the full pool is already available locally.

### D3 — Two bounded scopes, neither persisted

The current round owns its selected-key set. `ExplorePlayScreen` also owns a bounded replay-exclusion set in a `useRef` for as long as the route remains mounted. Completing a round updates that ref; pressing play again supplies it only to the local provider/planner. Route unmount clears it by normal memory disposal.

The exclusion set SHALL NOT use AsyncStorage, secure storage, Zustand persistence, a server request field, analytics, logs or reports. Re-entering after navigation therefore starts a genuinely fresh random run and may repeat prior content, matching the existing privacy specification.

### D4 — Stateless server games oversample without receiving history

The server SHALL guarantee distinct variant keys within each returned batch. Mobile SHALL NOT send previous keys. If immediate replay filtering leaves a server batch short, mobile MAY make a bounded additional stateless request and merge unseen valid variants locally. When the configured capacity cannot fill the exclusion window, the planner degrades to valid repeats rather than failing the game.

Sending an exclusion list or opaque replay cursor was rejected because either would transmit play evidence and weaken the stateless API boundary.

### D5 — Variety is not difficulty progression

All slots continue to use the static parent-selected starting level. The planner SHALL NOT change level from correctness, tries, completion or earlier rounds. Exposing higher levels requires a separate product decision: either a static parent-authored level/range or a game-authored multi-level round policy that is independent of behavior.

This distinction prevents a content-variety fix from silently reintroducing learning progress.

## Risks / Trade-offs

- **Small finite pools cannot produce two disjoint five-item rounds** → Declare capacity, exhaust the pool before reshuffling and allow repeats only after exhaustion.
- **A weak `variantKey` can label cosmetic changes as new** → Add per-game equivalence tests demonstrating which changes preserve or change identity.
- **Bounded rejection sampling can spend too long near exhaustion** → Cap attempts, prefer enumeration for finite pools and fall back deterministically.
- **Server replay diversity is weaker without transmitting exclusions** → Oversample/refetch within a small bound and document that guarantees end at route unmount.
- **Users may interpret variety as level advancement** → Keep static-level copy/config unchanged and test that no behavior-derived level mutation is introduced.

## Migration Plan

1. Add optional variety metadata/contracts and shared planner behind a registry capability check.
2. Implement keys and bucket policies for all currently enabled local games, then make the contract required for enabled games.
3. Add server batch uniqueness and mobile stateless merge behavior for future server games.
4. Enable route-local replay exclusion and conformance tests.
5. Roll back by disabling replay exclusion while retaining valid independent generation; no data migration is required because no state is stored.

## Open Questions

- Should a later change introduce a parent-authored maximum level or multi-level range? It is intentionally excluded here because it changes difficulty semantics rather than content variety.
