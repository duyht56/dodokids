# Kido Agent Instructions

This file is the first context file for AI coding agents working in this repo.
Use it to get oriented quickly, then follow the linked docs for product and
implementation details.

## Fast Start

1. If `.codegraph/` exists, use CodeGraph before grep/read when locating or
   understanding code. Prefer the `codegraph_explore` MCP tool when available.
   A missing `codegraph` CLI in `PATH` is not grounds for fallback while the
   MCP tool is available; check MCP availability first, and use grep/read only
   when both MCP and CLI are unavailable or fail.
2. Read `docs/AI_CONTEXT.md` for the project map, source hierarchy, current
   architecture, canonical contracts, and verification commands.
3. Read `docs/AI_IMPLEMENTATION_FLOW.md` before implementing a feature or bug
   fix.
4. For product/curriculum/content tasks, use the canonical docs listed in
   `docs/AI_CONTEXT.md`.
5. Keep edits scoped. Prefer existing patterns in the target module and avoid
   unrelated refactors.

## Repo Map

- `mobile/` - Expo React Native child/parent app.
- `kido-server/` - NestJS runtime API and publish ingest target.
- `kido-pipeline/` - Next.js admin, seed review, generation workers, Human Gate,
  and publish client.
- `docs/` - canonical product, curriculum, schema, pipeline, backlog, and AI
  context docs.
- `openspec/` - archived and active OpenSpec changes. Use when a task references
  a specific change/spec.

## Canonical Rules

- The server/wire contract is `docs/kido-activity-schema.ts`.
- Use canonical `actionType`: `single_select`, `multi_select`, `sort_sequence`,
  `match_pair`, `count_tap`, `compare_tap`, `audio_select` (nghe-chọn-âm-thanh,
  chỉ `tieng_viet`/`tieng_anh`); `watch_video` is post-MVP unless a task
  explicitly says otherwise.
- Mobile may normalize server lessons through `mapServerLesson`; that shape is
  internal to mobile and is not the CMS/server contract.
- One lesson = one learning day = exactly 8 activities (`activityIndex` 1..8,
  difficulty ascending). Seed routines emit 8 seeds per day/subject.
- Pipeline activity status lifecycle is:
  `draft -> pending_review -> approved -> imported`.
- Only Human Gate sets `approved`; only publish to `kido-server` sets
  `imported`.
- Do not change canonical naming, curriculum, schema, or skill taxonomy without
  updating the matching canonical docs.

## Implementation Defaults

- Use CodeGraph first for code context and blast radius.
- Verify with the smallest relevant command after edits:
  - Mobile: `cd mobile && npm run lint`
  - Server: `cd kido-server && npm test` or `npm run build`
  - Pipeline: `cd kido-pipeline && npm test` or `npm run build`
- If a verification command is unavailable or fails because dependencies/env are
  missing, report the exact blocker.
- Do not edit generated assets, local secrets, or unrelated dirty files.
