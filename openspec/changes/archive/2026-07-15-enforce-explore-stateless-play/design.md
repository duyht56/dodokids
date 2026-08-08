# Design: Explore no-history boundary

## Context

Explore is intentionally ephemeral. Cross-session recommendation and reporting require play evidence, which conflicts with the explicit requirement to retain no history. The architecture must make accidental tracking difficult rather than relying on developers to remember not to use collected data.

## Goals / Non-Goals

**Goals:** zero play-history persistence, zero behavior analytics, fresh entry every time, static parent defaults only, and automated privacy enforcement.

**Non-Goals:** adaptive levels, proficiency labels, weekly Explore report, daily accumulated duration, recent-game UX, debugging an individual child's prior exercise or experimentation metrics.

## Decisions

### D1 — Denylist data at the boundary

Explore network clients and analytics adapters reject payload fields representing child/profile, game outcome, answers, tries, hints, duration, completion, exit, seed, level reached or tracing points. The server exposes no matching ingestion route or schema.

### D2 — Memory lifecycle is tied to the mounted play route

All play state is owned below the Explore play route. Exit, navigation reset, unmount and process death destroy it. No global state hydration, AsyncStorage, secure storage, SQLite or query persistence key may contain Explore play state.

### D3 — Parent configuration is input, never evidence

A parent may choose a static starting level/support preference or break-reminder interval. These settings may be persisted as authored configuration. They are never modified from play behavior and contain no last-played or accumulated-use fields.

### D4 — Break reminder is current-run only

An optional neutral reminder uses monotonic elapsed time held in memory. It resets on exit/re-entry and cannot claim to enforce a daily quota. Daily duration limits are excluded because they require history.

### D5 — Existing parent report remains unchanged

Weekly report DTO, cache keys and UI do not add an Explore section. The absence of an Explore report is intentional and is tested even when the child plays Explore locally or uses server-generated exercises.

## Risks / Trade-offs

- Parents cannot see Explore usage or skill trends; this is the direct consequence of zero history.
- Product teams cannot measure Explore engagement; quality relies on pre-release deterministic/property/usability tests and non-user-specific service health.
- Parent time control is reminder-only per active run, not a daily enforcement mechanism.

## Rollout

1. Add forbidden-field and route/schema tests.
2. Audit persistent mobile stores and analytics adapters.
3. Add static settings and current-run reminder only if product keeps them enabled.
4. Verify reports remain unchanged and delete no user data because no Explore history is introduced.

