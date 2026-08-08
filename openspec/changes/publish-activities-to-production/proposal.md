## Why

The publish pipeline (`kido-pipeline`) runs **local-only**, but approved content now needs to reach the **production** kido-server deployed at `https://api.dodokids.vn`. The mechanics already exist (`POST /admin/publish` + `publish-week` script), and the client target is already configurable via `KIDO_SERVER_URL`. The blocker is safety: the entire `/admin/*` surface — content ingest **and** destructive management (`unpublish`, `republish`) — is currently **unauthenticated**. That is acceptable on `localhost` but exposing it on the public internet lets anyone overwrite or remove live content. Before we point a real publish at production, the ingest and admin surface must require authentication, and the operator flow (target URL, token, dry-run-first) must be defined.

## What Changes

- Add a **shared-token auth guard** to the kido-server `/admin/*` surface (publish ingest, published list/get, unpublish, republish, transfers). Requests without a valid token are rejected with `401`. **BREAKING** for any existing unauthenticated caller (only the local pipeline today).
- The pipeline publish client attaches the auth token (header) on every request to the server, sourced from a local env var (never committed).
- Define the **production publish operator flow**: point `KIDO_SERVER_URL` at `https://api.dodokids.vn`, always run `--dry-run` first (rehearses the server guard), then the real publish.
- Provision the publish token in the production server `.env` (on the VPS) and in the operator's local pipeline env.
- Update `.env.example` on both sides to document the new variables.
- No change to the deterministic content guard, idempotent upsert, or reference-only asset handling — those requirements stand.

## Capabilities

### New Capabilities

- `production-publish`: Operating the pipeline→production publish path — selecting the production target URL, attaching the publish auth token from local env, and the dry-run-before-real operator sequence. Covers configuration and safety of publishing to a live server, not the transfer mechanics themselves.

### Modified Capabilities

- `content-transfer`: The publish ingest endpoint (`POST /admin/publish`) SHALL require a valid shared publish token; unauthenticated ingest is rejected and nothing is written. (New requirement; transfer mechanics unchanged.)
- `activity-management`: The admin management + read surface (`published` list/get, `unpublish`, `republish`, `transfers`) SHALL require the same shared publish token when reachable from the public internet; unauthenticated requests are rejected.

## Impact

- **kido-server**: new auth guard applied to `PublishController` (`src/modules/publish/`); reads a `PUBLISH_TOKEN` from config; production `.env` on the VPS (`/opt/kido-app/.env`) gains `PUBLISH_TOKEN`. Returns `401` on missing/invalid token.
- **kido-pipeline**: `src/publish/publish-client.ts` sends the token header; new env vars `KIDO_SERVER_URL` (→ `https://api.dodokids.vn`) and `KIDO_PUBLISH_TOKEN`; `.env.example` updated. `publish-week.ts` operator docs updated.
- **Ops / deploy**: token added to production `.env` (already gitignored, `env_file` in compose); no code path exposes it. Publishing is a manual operator action run from the local pipeline, not part of CI/CD.
- **Security**: closes the open `/admin/*` surface before it is exposed to the internet. No new inbound ports; publish is server-to-server over existing HTTPS (443).
- **No impact**: mobile app, activity content schema, the content guard, or the `draft → pending_review → approved → imported` lifecycle (publish still sets `imported`).
