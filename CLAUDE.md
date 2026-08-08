# Kido — Claude Code Entry

Claude Code auto-loads this file. It is intentionally thin: the canonical agent
instructions live in `AGENTS.md` (shared with other AI agents). Do not duplicate
content here — update `AGENTS.md` instead.

## Start every session by reading, in order:

1. `AGENTS.md` — repo entry rules, repo map, canonical rules, verification.
2. `docs/AI_CONTEXT.md` — project map, contracts, current implementation map.
3. `docs/AI_IMPLEMENTATION_FLOW.md` — before implementing any feature/bug fix.

## Non-negotiables (full detail in AGENTS.md / docs/AI_CONTEXT.md)

- `.codegraph/` exists: use CodeGraph (`codegraph_explore` MCP, or `codegraph
  explore "<query>"` in shell) BEFORE grep/find/read to locate or understand code.
- Server/wire contract of record: `docs/kido-activity-schema.ts`.
- Canonical `actionType`: `single_select`, `multi_select`, `sort_sequence`,
  `match_pair`, `count_tap`, `compare_tap`, `audio_select` (`watch_video` is
  post-MVP).
- Pipeline status lifecycle: `draft -> pending_review -> approved -> imported`.
  Only Human Gate sets `approved`; only publish to `kido-server` sets `imported`.
- No root `package.json`; run verification commands inside each package
  (`mobile/`, `kido-server/`, `kido-pipeline/`).
- Do not change canonical naming/curriculum/schema/skill taxonomy without
  updating the matching canonical docs in the same change.

When sources disagree, follow the Source Hierarchy in `docs/AI_CONTEXT.md`.
