## 1. Pipeline client: token + production target (land first — harmless to current server)

- [x] 1.1 In `kido-pipeline/src/publish/publish-client.ts`, read `KIDO_PUBLISH_TOKEN` and attach it as `Authorization: Bearer <token>` on the `POST /admin/publish` request
- [x] 1.2 Fail-fast: if the resolved `KIDO_SERVER_URL` is not a `localhost` origin and `KIDO_PUBLISH_TOKEN` is unset, throw a clear error before sending anything
- [x] 1.3 Add `KIDO_SERVER_URL` and `KIDO_PUBLISH_TOKEN` (empty/placeholder) to `kido-pipeline/.env.example` with a comment on production usage
- [x] 1.4 Update `build-payload`/`publish-week` unit tests to cover: token header present when set, and abort when targeting non-local without a token (`publish-client.test.ts`, 5 tests pass)

## 2. Server: shared-token guard on the admin surface

- [x] 2.1 Add `PUBLISH_TOKEN` to server config usage and to `kido-server/.env.example` (empty placeholder + comment)
- [x] 2.2 Create `PublishAuthGuard` (`CanActivate`) in `kido-server/src/modules/publish/` that reads `PUBLISH_TOKEN` from `ConfigService`, constant-time compares the request bearer token, and **fails closed** (rejects all when `PUBLISH_TOKEN` is unset) — mirror the existing `internal-job.guard.ts` pattern
- [x] 2.3 Apply `@UseGuards(PublishAuthGuard)` at `PublishController` scope so ingest and all `published`/`transfers` routes are covered
- [x] 2.4 Return HTTP `401` (not `403`) on missing/invalid token, writing/mutating nothing

## 3. Server tests

- [x] 3.1 Guard spec: `401` when token missing, `401` when invalid, pass-through when valid (`publish-auth.guard.spec.ts`, 5 tests pass)
- [x] 3.2 Guard spec: fails closed when `PUBLISH_TOKEN` is unset (all `/admin/*` rejected)
- [ ] 3.3 Controller/e2e: `POST /admin/publish` writes nothing on `401`; a valid token reaches the existing deterministic guard + idempotent upsert unchanged — DEFERRED (needs Nest app + Mongo bootstrap; 401 behavior already proven by the unit guard spec)

## 4. Provision & deploy  — OPERATOR ACTIONS (owner does these: needs the token, VPS access, and git push)

- [ ] 4.1 Generate the shared token (`openssl rand -hex 32`)
- [ ] 4.2 Set `PUBLISH_TOKEN` in production `/opt/kido-app/.env` on the VPS
- [ ] 4.3 Merge to `main` → GitHub Actions redeploys kido-server; confirm all replicas healthy
- [ ] 4.4 Set matching `KIDO_PUBLISH_TOKEN` in the operator's local pipeline env and document the same for other local developers

## 5. Verify production publish path  — OPERATOR ACTIONS (run against the live server after deploy)

- [ ] 5.1 `curl` `POST https://api.dodokids.vn/admin/publish` with no token → expect `401`; with the token + empty/minimal body → expect the guard/validation path (not `401`)
- [ ] 5.2 From the operator machine, run `KIDO_SERVER_URL=https://api.dodokids.vn KIDO_PUBLISH_TOKEN=… ts-node src/scripts/publish-week.ts <week> --dry-run`; confirm the guard report returns and nothing is written
- [ ] 5.3 Run the real publish for that week; confirm activities upsert with status `imported`
- [ ] 5.4 `GET https://api.dodokids.vn/admin/published?week=<week>` with the token → confirm the published content is present

## 6. Docs

- [x] 6.1 Document the production publish operator flow (env vars, dry-run-first, verify) — `kido-pipeline/PUBLISHING.md`
