# content-flow-verification Specification

## Purpose

A canonical, repeatable end-to-end verification of the content flow (kido-pipeline → kido-server → mobile): a fixed all-action-type seed set, a runbook that drives the whole flow with real generation, and documented expected behavior for the main failure modes. It exists so the team can confirm the system works end-to-end and understand how it degrades on failure, without re-deriving the procedure each time.

## ADDED Requirements

### Requirement: MVP-action-type verification seed set
The repository SHALL contain a verification seed set covering the five MVP action types (`single_select`, `multi_select`, `sort_sequence`, `match_pair`, `count_tap`) with two activities per type (10 total), packaged as two weeks of one lesson each (five activities per lesson) so that the per-week publish batch is exercised twice. `watch_video` SHALL NOT be included (deferred post-MVP; not part of the Math curriculum). Seeds SHALL use real, already-seeded curriculum skill codes mapped to each action type, dedicated week numbers outside the live curriculum range, and each seedId SHALL match the format the reject→regenerate route reconstructs (`SEED-<subject>-w<NN>-D<1|4>-<II>`) so regeneration can locate the seed.

#### Scenario: Seed set covers every MVP action type twice
- **WHEN** the verification seed file is imported
- **THEN** exactly 10 seeds are created spanning the five MVP action types with two each, across two verification weeks of one lesson (five activities) each, and none of them is `watch_video`

#### Scenario: SeedId format supports regeneration
- **WHEN** an activity generated from a verification seed is later rejected in the human gate
- **THEN** the reject route reconstructs the seedId (`SEED-<subject>-w<NN>-D<1|4>-<II>`), finds the seed, and re-enqueues it

### Requirement: End-to-end happy-path runbook
The repository SHALL contain a runbook that documents, in order, how to drive the full flow with real Vertex generation: import seeds → approve at seed review → run the pipeline → review and approve in the human gate → publish each week to kido-server (per-week, human-triggered) → fetch and render the lessons on mobile. The runbook SHALL list the required infrastructure and environment (MongoDB, Redis with running workers, GCS buckets, GCP/Vertex credentials, a running kido-server, and a mobile client pointed at that server) and SHALL record the observed state of a seed/activity at each hop (seed `pending_review`→`approved`; activity `draft`→`pending_review`→`approved`→`imported`/published; lesson visible via `/lessons`).

#### Scenario: Operator follows the runbook to publish and render
- **WHEN** an operator follows the runbook steps with the required infra available
- **THEN** each verification week's activities move seed→generated→human-approved→published to kido-server, and the resulting lessons render on mobile fetched from kido-server

#### Scenario: Per-week publish is a distinct human action per week
- **WHEN** the operator publishes week one and then week two
- **THEN** each publish is a separate human-triggered batch, and the runbook records both as independent publish reports

### Requirement: Documented error-handling behavior
The runbook SHALL document expected-versus-observed behavior for three failure scenarios: (1) a human-gate **reject** sets the activity to `rejected`, resets the seed to `pipelineStatus: pending`, and re-enqueues it for regeneration; (2) an **image or TTS generation failure** sets the seed to `pipelineStatus: error` with an error message and follows the worker retry/backoff, with a documented way to resume; (3) a lesson reaching **mobile with missing or unmappable assets** degrades safely (not-ready/skeleton, fallback, or skip) rather than crashing. Each scenario SHALL record the actual observed outcome and note any gap that had to be fixed.

#### Scenario: Reject triggers regeneration
- **WHEN** a reviewer rejects an activity in the human gate
- **THEN** the activity becomes `rejected`, its seed returns to `pipelineStatus: pending`, and the seed is re-enqueued to the generate queue, and the runbook records this observed transition

#### Scenario: Generation failure is recoverable
- **WHEN** image or TTS generation fails for an activity
- **THEN** the seed is marked `pipelineStatus: error` with a message, the failure follows the configured retry/backoff, and the runbook documents how to resume the seed

#### Scenario: Mobile degrades safely on missing assets
- **WHEN** mobile fetches a lesson whose assets are missing or whose payload cannot be mapped
- **THEN** the app shows a not-ready/skeleton, falls back, or skips the activity without crashing, and the runbook records the observed behavior
