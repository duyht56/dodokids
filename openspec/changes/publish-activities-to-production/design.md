## Context

The publish transfer already works local→local: `kido-pipeline`'s `publish-week` script builds a payload and POSTs it to `POST /admin/publish` on kido-server, which runs a deterministic guard and idempotently upserts. The client target is already env-driven (`KIDO_SERVER_URL`, default `http://localhost:3001`). kido-server is now deployed to production at `https://api.dodokids.vn` behind Caddy (TLS termination, 4 replicas).

The gap is purely safety: the whole `PublishController` (`/admin/*`) has **no authentication**. On `localhost` that is fine; on the public internet it lets anyone ingest content or call the destructive `unpublish`/`republish`. kido-server already has two precedents for shared-token guards — `activation-code-admin.guard.ts` (`x-admin-key` / `ACTIVATION_CODE_ADMIN_KEY`) and `internal-job.guard.ts` (`INTERNAL_JOB_TOKEN`) — so the pattern is established.

## Goals / Non-Goals

**Goals:**
- Authenticate the entire `/admin/*` surface with a single shared token, failing closed.
- Let the pipeline publish to production by setting two env vars and running the existing script.
- Keep publishing a deliberate, manual operator action.
- No secrets in the repo; token over TLS only.

**Non-Goals:**
- Automating production publish in CI/CD (stays a human-run editorial step).
- Per-user auth, roles, or an admin login UI (single shared token is sufficient for one operator).
- Changing transfer mechanics, the content guard, asset handling, or the `imported` lifecycle.
- IP allowlisting / rate limiting (can be layered at Caddy later if needed).

## Decisions

**1. Single dedicated `PUBLISH_TOKEN`, `Authorization: Bearer <token>` header.**
A NestJS `CanActivate` guard applied at the `PublishController` level reads `config.get('PUBLISH_TOKEN')` and compares (constant-time) against the bearer token on the request. One token authorizes both ingest and management.
- *Why a dedicated token* over reusing `INTERNAL_JOB_TOKEN`/`ACTIVATION_CODE_ADMIN_KEY*`: separates concerns and blast radius — rotating the publish credential must not disturb internal jobs or activation-code admin. Reuse was considered (fewer secrets) but rejected for clean rotation.
- *Why `Authorization: Bearer`* over a custom `x-publish-token`: standard, well-understood, easy to rotate; the existing `x-admin-key` is per-feature and we prefer the conventional header for a new guard.

**2. Fail closed when `PUBLISH_TOKEN` is unset.**
If the server has no token configured, every `/admin/*` request is rejected rather than served unauthenticated. This removes the "forgot to set it in prod" foot-gun. The cost is that **local development must also set `PUBLISH_TOKEN`** (server) and `KIDO_PUBLISH_TOKEN` (pipeline). We accept this for env parity over a `localhost` bypass, which would let prod and dev drift and risk shipping an accidental bypass.

**3. Client attaches token from `KIDO_PUBLISH_TOKEN`; fail-fast to non-local targets.**
`publish-client.ts` adds the bearer header. If the target is not `localhost` and `KIDO_PUBLISH_TOKEN` is unset, the client aborts before sending — so we never fire an unauthenticated request at production and get a confusing `401`.

**4. Manual operator flow, dry-run first.**
Production publish is run from the operator's machine:
`KIDO_SERVER_URL=https://api.dodokids.vn KIDO_PUBLISH_TOKEN=… ts-node src/scripts/publish-week.ts <week> --dry-run` then without `--dry-run`. Not wired into GitHub Actions — publishing content is an editorial decision, not a deploy.

**5. Token provisioning.**
Generate once (`openssl rand -hex 32`). Put it in production `/opt/kido-app/.env` as `PUBLISH_TOKEN` (gitignored, already `env_file` in compose) and in the operator's pipeline env as `KIDO_PUBLISH_TOKEN`. Same value both sides.

## Risks / Trade-offs

- **Ordering during rollout breaks local publish** → Land the client token support first (an extra header an unauthenticated server simply ignores is harmless), then deploy the server guard. Documented in the migration plan.
- **Token leakage** → TLS-only transport (Caddy), env-only storage, `.env` gitignored. Rotation = change both sides and redeploy; no code change.
- **Local dev friction from fail-closed** → One-time `.env` addition on each side; documented in `.env.example`. Accepted over a bypass that risks env drift.
- **Guard applied too narrowly** → Apply at controller scope (not per-route) and add a guard spec asserting `401` on every `/admin/*` route, so new routes inherit protection.
- **Shared token has no per-caller revocation** → Acceptable for a single operator; revisit if more publishers appear.

## Migration Plan

1. **Client first**: add `KIDO_PUBLISH_TOKEN` support + fail-fast to `publish-client.ts`; update pipeline `.env.example`. Harmless against the current unauthenticated server.
2. **Server guard**: add `PublishAuthGuard` on `PublishController`, read `PUBLISH_TOKEN` from config, fail closed; add guard spec. Update server `.env.example`.
3. **Provision prod**: set `PUBLISH_TOKEN` in `/opt/kido-app/.env`, redeploy (existing GitHub Actions), verify `401` without token and `200` with token.
4. **Provision local**: developers add matching `PUBLISH_TOKEN` / `KIDO_PUBLISH_TOKEN`.
5. **First production publish**: operator sets prod env vars, runs `--dry-run` for a week, confirms zero rejections, then real publish; verify content via `GET /admin/published` (authenticated).

**Rollback**: revert the server-guard commit — the endpoint returns to unauthenticated behavior and existing callers keep working. No data migration involved.

## Open Questions

- Final header choice confirmed as `Authorization: Bearer` (assumed here). If ops prefers `x-publish-token` for parity with `x-admin-key`, only the guard + client header line change.
- Do we want a lightweight IP allowlist at Caddy for `/admin/*` as defense-in-depth, or is the token sufficient for now? (Currently out of scope.)
