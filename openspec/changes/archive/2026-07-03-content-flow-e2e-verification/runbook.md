# Runbook & Verify Checklist — content flow (pipeline → kido-server → mobile)

Operator-driven, **UI-first** verification of the whole flow using `seeds/KIDO_VERIFY_E2E.json` (10 activities = 5 MVP action types × 2, weeks 90 & 91 → two publish batches). Tick each box and note the result in **Feedback**. Where a real observation was already captured during setup it is pre-filled with ✅/⚠️.

Canonical naming = kido-server contract (`actionType`, `backgroundAsset`/`targetAsset`, …); see `docs/KIDO_MATH_CURRICULUM.md` §5.

> ⚠️ Real Vertex generation costs money. Weeks 90/91 are out of the live range on purpose.

---

## 0. Preflight (once)

- [ ] Redis running (`REDIS_URL`, here `:6888`) and MongoDB reachable.
- [ ] kido-server running (`KIDO_SERVER_URL`, `:3001`) — **restarted after the `audioFiles` schema fix** so it stores audio.
- [ ] GCS asset buckets are public-read (`allUsers:objectViewer` on `kido-assets-images` + `kido-assets-audio`) — else the publish guard rejects everything with 403. ✅ done during setup.
- [ ] Admin UI: `npm run admin:dev` → http://localhost:3000
- [ ] Workers — pick ONE way (no more 4 terminals):
  - **One command:** `npm run dev:all` (admin + all 4 workers in one terminal), OR
  - **From the UI:** dashboard → Pipeline Queues panel → **▶ Start workers**, OR
  - Manually per terminal: `npm run worker:seed-review|generate|image|audio`.
  - The panel's **workers** column shows the real attached count (red `0 ⚠️` = not running).
- [ ] Confirm the dashboard shows a **⚙️ Pipeline Queues** panel with all 4 queues "running" and weeks **W90 / W91** listed.
- [ ] **Clear stale queue jobs** if the `generate` queue shows leftover `waiting` from earlier work (this shared Redis had ~32). Otherwise the generate worker processes those first. Quick clean: `node -e "require('dotenv').config();const B=require('bull');(async()=>{const q=new B('generate',process.env.REDIS_URL);await q.empty();await q.close();console.log('generate queue emptied')})()"` (run from `kido-pipeline/`). Repeat for `image`/`audio` if needed.

---

## 1. Import seeds (UI or CLI)

- [ ] **UI:** Seed Review page (`/seeds`) → **📥 Import seed files** → Mở → **Import** `KIDO_VERIFY_E2E.json` (or ⬆️ Upload a JSON). Shows `+N mới / total` and enqueues seed review.
- [ ] CLI alternative: `npm run import-seeds -- --file seeds/KIDO_VERIFY_E2E.json`
- **Expected:** 10 seeds `status: pending_review`, `pipelineStatus: pending`; seed-review job queued (needs the seed-review worker running).
- Feedback: __________

## 2. Seed review (UI)

- [ ] Dashboard → **🌱 Seed Review** (`/seeds`). If any seed is not yet reviewed, click **Trigger review** (full audit).
- [ ] Each seed becomes **approved** (passed) or **flagged** (has issues). For every FLAGGED seed, open it and choose an action: **Use suggestion** / **Edit** / **Keep** (approve with flags).
- **Expected:** all 10 seeds reach `approved`. (During setup the AI flagged 5 real issues — missing counts, a single_select with 2 correct answers, a sort/skill mismatch — which is the gate working; they were fixed + approved.)
- Feedback: __________

## 3. Generate activities (UI — NEW)

- [ ] Dashboard → on the **W90** row click **⚙️ Gen** (enqueues all approved week-90 seeds). Repeat on **W91**.
- [ ] Watch the **Pipeline Queues** panel: `generate` waiting/active rise, then `image` + `audio` fill (generate enqueues media jobs), then drain.
- **Expected:** activities move `draft → pending_review`; images land on asset docs; audio WAVs upload + `audioFiles` persists (needs the schema fix + restarted workers).
- **Note (real):** Imagen is flaky — transient "fetch failed" auto-retries with backoff; a hard failure can leave an image NULL (during setup w90-02 lost 2 images). The queue path (worker) does **not** auto-fix review failures the way the CLI does — a failing seed lands `pipelineStatus: error`.
- Feedback (which activities completed / any NULL images):  __________

## 4. Preview per activity type (UI, mobile-like)

- [ ] Dashboard → **W90 → Review →** (`/review/w90/d1`), open each activity. The **web Lesson Player** renders it like mobile per type: single_select, multi_select, sort_sequence, match_pair, count_tap (layered background + tappable sprites).
- [ ] (Optional) `/preview/mock` renders all types from built-in mock data with no real assets.
- **Expected:** each type is interactive and matches its mobile component; count_tap shows the background + N tappable object sprites; audio ▶ plays.
- Feedback (per type OK? screenshots welcome): __________

## 5. Human gate approve (UI)

- [ ] In `/review/w90/d1`, confirm the checklist per activity and **Approve**. An activity whose image/audio isn't ready shows **not-ready** and can't be approved (expected for any NULL-image activity, e.g. w90-02).
- **Expected:** approved activities → `status: approved`.
- Feedback: __________

## 6. Publish to kido-server (UI, per week = human-triggered batch)

- [ ] In the review/publish screen, **Publish week 90** (dry-run first if offered, then publish). Then repeat **Publish week 91** — two separate batches.
- **Expected:** report `N/N written, 0 rejected`; lessons `w90-d1-toan` / `w91-d1-toan` become `imported` on kido-server. The server guard re-checks every asset URL is HTTP 200 (this is why buckets must be public).
- **Verify server:** `GET http://localhost:3001/admin/published` lists the weeks; open one activity and confirm it has non-empty `audioFiles` (proves the server schema fix works after restart).
- Feedback (written/rejected counts, audioFiles present?): __________

## 7. Render on mobile (from kido-server)

- [ ] Point the mobile app at kido-server and open a verification lesson. `lessonId = w90-d1-toan` / `w91-d1-toan`. `GET /lessons/:id` is entitlement-gated (403) — use a test child positioned at the verification week, or temporarily bypass the gate for testing.
- **Expected:** each mappable activity renders with real images + audio; count_tap shows background + tappable sprites.
- Feedback (device/emulator, per-type render): __________

---

## Error scenarios

### A. Reject → re-generate (UI)
- [ ] In the human gate, **Reject** one approved activity (give a reason).
- **Expected:** activity → `rejected`; its seed → `pipelineStatus: pending`; re-enqueued to `generate` (needs `worker:generate`). Watch the queue panel pick it up and regenerate → back to `pending_review`.
- **Watch:** the reject route reconstructs the seedId (`SEED-toan-w90-D1-0X`). If it can't find the seed, regeneration silently no-ops — report this (fix candidate: resolve by `activityId`).
- Feedback: __________

### B. Generation failure → pause / retry / resume (UI — NEW)
- [ ] Click **⏸ Pause all** on the Pipeline Queues panel mid-run → active jobs finish, no new ones start (verify counts hold). Click **▶ Resume all** → processing continues.
- [ ] (Optional real failure) A seed that hits a hard Imagen/TTS failure lands `pipelineStatus: error` with a message; re-**⚙️ Gen** that week to requeue and complete it.
- **Expected:** pause halts intake; resume continues; errored seeds are re-runnable from the UI.
- Feedback: __________

### C. Mobile: missing / unmappable assets
- [ ] Use w90-02 (2 NULL images) — publish it (or inspect via `/admin/published`) and open on mobile, or feed a deliberately malformed payload.
- **Expected:** `mapServerLesson` drops unmappable activities / the app shows a skeleton/not-ready or skips — **no crash**.
- Feedback: __________

---

## Observed-state summary (fill in)

| Hop | Expected | Observed |
|-----|----------|----------|
| Import | 10 seeds pending_review | __ |
| Seed review | all 10 approved | __ |
| Generate | activities pending_review, assets+audio | __ |
| Preview | all 5 types render like mobile | __ |
| Human gate | approved (NULL-image ones blocked) | __ |
| Publish w90 / w91 | 2 batches, imported, audioFiles present | __ |
| Mobile | renders with images + audio | __ |
| Reject→regen | rejected → requeued → pending_review | __ |
| Pause/resume | intake halts / resumes | __ |
| Missing asset | no crash, graceful | __ |

## Cleanup

- [ ] Unpublish weeks 90/91 from kido-server (`/admin/published` controls or `POST /admin/published/:activityId/unpublish`).
- [ ] Optionally delete verification data: `db.seeds.deleteMany({week:{$in:[90,91]}})`, `db.activities.deleteMany({'meta.week':{$in:[90,91]}})`.
- [ ] Keep `seeds/KIDO_VERIFY_E2E.json` + this runbook for re-runs.
