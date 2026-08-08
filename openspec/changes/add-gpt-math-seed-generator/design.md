# Design: add-gpt-math-seed-generator

## Context

The current flow already separates seed review from activity review:

```text
seed JSON -> import -> seed review -> approved seed -> generate Activity -> Human Gate -> publish
```

The missing managed step is seed JSON creation. The existing routine prompt already defines the week structure, skill spiral, `questionCore`/`answerSpec` split, Primitive Pack rules, and object-diversity constraints. The new implementation wraps that prompt in code, adds repo context, asks GPT for schema-constrained JSON, writes the file, then reuses the existing import/review path.

## Goals / Non-Goals

Goals:
- Generate exactly one next-missing math week per run.
- Preserve `seeds/wNN.json` as the audit artifact.
- Validate the file before writing: 16 seeds, D1/D4, activityIndex 1..8, correct seed IDs, `answerSpec`, active action types, and catalog-matching `domainCode`.
- Import and enqueue seed review automatically after the file is written.

Non-goals:
- No DB-only seed generation.
- No auto-approval of seeds.
- No automatic activity generation after seed review.
- No changes to mobile, server, or runtime activity schemas.

## Decisions

D1 - Use structured outputs on OpenAI-compatible clients.
The default OpenAI path uses Responses API `text.format`; when `OPENAI_BASE_URL` is set for an OpenAI-compatible router, the generator uses Chat Completions `response_format: { type: "json_schema" }`. Deterministic validation still runs afterward because cross-field checks such as seed ID/week/day/index consistency and catalog `domainCode` matching are repo-specific.

D2 - File first, import second.
The generator writes `kido-pipeline/seeds/wNN.json` only after validation passes, then imports that same in-memory payload. If import fails, the artifact remains for inspection/retry. If the file already exists, generation fails instead of overwriting.

D3 - Next missing week only.
V1 scans `seeds/w01.json` through `w48.json` and picks the smallest missing week. Selected week/range regeneration is deferred to avoid overwrite policy and quality-review ambiguity.

D4 - Shared import helper.
CLI import and UI import both call the same helper, which parses payloads, backfills `domainCode`, inserts only new seeds, initializes statuses, and enqueues seed review when requested.

D5 - Stop at seed review enqueue.
The new flow intentionally stops after seed-review enqueue. Existing generate controls continue to require approved seeds; Human Gate remains the only path to activity approval.

## Failure Handling

- Missing `OPENAI_API_KEY` -> API returns an error before any file is written.
- All 48 files exist -> API returns conflict/no-op.
- GPT response violates schema or deterministic checks -> no file is written.
- File exists between scan and write -> no overwrite; error returned.
- Import inserts zero seeds because they already exist -> response reports skipped count; no seed-review job is created.

## Rollback

Remove the new service, route, panel, and dependency. Existing `seeds/*.json`, seed import, seed review, generate, Human Gate, and publish flows remain compatible because generated files use the current seed schema.
