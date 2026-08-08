# Explore Zero-History Rule

Khám phá (Explore) is intentionally **stateless and history-free**. This is a
product decision, encoded as a testable contract by the
`enforce-explore-stateless-play` change and the `explore-stateless-privacy`
capability spec.

Every future Explore game MUST follow this document. The privacy contract is the
single source of truth: [`mobile/src/explore/privacy.ts`](../mobile/src/explore/privacy.ts).

## The rule

The system **SHALL NOT** persist or transmit any child Explore play history or
derived evidence, anywhere — app storage, server database, logs, analytics,
reports or caches. Forbidden data includes:

- child/profile identity tied to play
- game selection as history, exercise, answer, outcome/result
- tries, hints, hint level
- duration, elapsed/accumulated/daily time
- completion, exit, abandonment
- random seed, reached level
- tracing points / stroke data
- any score, star, XP, streak, proficiency, mastery, skill trend
- resume / recent-game / session / attempt / aggregate / adaptation records

Every run starts **fresh**: play state exists only while the play route is
mounted, and exit / unmount / process death / re-entry always begins a new run
from its initial state. There is no "Chơi tiếp" (resume) affordance.

## What IS allowed

- **Stateless generation requests** — only `{ gameCode, level, count }` may leave
  the device (`buildExploreGenerationRequest` / `assertStatelessRequest`). The
  server generates a batch and persists nothing.
- **Static, parent-authored configuration** — starting level, reduced support,
  break-reminder interval (`ExploreParentConfig`). These are *input*, never
  evidence: no last-played / accumulated / reached-level fields, and never
  updated automatically from behavior.
- **Current-run break reminder** — elapsed time held in memory for the active run
  only (`useBreakReminder`); resets on exit. No daily/accumulated limit.
- **Non-user-specific server health metrics** — e.g. the `/health` endpoint.

## What is explicitly omitted (and why)

| Excluded | Reason |
| --- | --- |
| Adaptive levels / proficiency labels | Require play-history retention |
| Weekly Explore report / skill rows / hint trends | Require play evidence |
| Daily accumulated duration limit | Requires cross-run time history |
| Recent-game / resume UX | Requires stored run state |
| Explore product/learning/guardrail analytics | Bypasses the no-history rule |

## Review checklist for every new Explore game

Before merging any Explore game or renderer, confirm:

- [ ] No `AsyncStorage`, secure storage, SQLite, or persisted store (zustand
      `persist`, React Query cache key) holds Explore **play** state.
- [ ] All run state (current exercise, run index, tries, hint state,
      game-specific state) lives below the mounted play route and is cleared on
      unmount.
- [ ] No network call sends anything except the allowlisted generation request;
      no outcome/answer/tries/hint/duration/seed/level-reached payload is sent.
- [ ] No analytics / event / tracking call fires for a completed or abandoned
      run.
- [ ] No server route, DTO field, schema, or Mongoose model ingests or stores
      Explore play evidence.
- [ ] The weekly parent report DTO, cache keys and UI gain **no** Explore
      section, totals, skill rows or hint trends.
- [ ] Any parent configuration added uses only the evidence-free
      `ExploreParentConfig` shape (validated by `assertConfigHasNoEvidence`).
- [ ] If configuration is persisted, it lives **outside** any Explore-named play
      module and contains no derived fields.

The regression suite that enforces this lives in
`kido-server/src/modules/explore/explore.architecture.spec.ts` and
`kido-server/src/modules/explore/explore.stateless-privacy.spec.ts`.
