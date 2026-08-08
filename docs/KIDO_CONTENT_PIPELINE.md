# KIDO_CONTENT_PIPELINE — Authoritative Pipeline Spec

**Scope:** `kido-pipeline` — the content authoring system that turns math seeds into
production learning activities (text + image + audio) and publishes them to
`kido-server`. This is the spec the backlog (EPIC-012) references. Companion
operational overview: [`KIDO_PIPELINE.md`](./KIDO_PIPELINE.md).

**Cập nhật:** 2026-07-01 — sau change `kido-pipeline-handover` (CLI mode hội tụ về Human Gate, retire legacy local-import).

---

## 1. Canonical status lifecycle

An activity moves through **one** lifecycle, regardless of run mode:

```
draft ──▶ pending_review ──▶ approved ──▶ imported
 (generated)  (reviewed +      (Human Gate)   (published to
              media enqueued)                  kido-server)
```

Invariants (enforced by `content-pipeline-flow`):

- **`approved`** is set **only** by the Human Gate (a human confirms the production-ready checklist).
- **`imported`** means **published to `kido-server`** via the publish step — nothing marks an activity `imported` inside the pipeline DB.
- No run path auto-approves. Both the CLI runner and the workers stop at `pending_review`.

Seeds carry two independent statuses:

| Field | Values | Meaning |
|---|---|---|
| `status` | `pending_review` · `approved` · `flagged` · `edited` · `rejected` | Pedagogical seed review (Step 0) |
| `pipelineStatus` | `pending` · `processing` · `done` · `error` | Generate lifecycle (Steps 1–5) |

Generate runs only when `status === 'approved'` **and** `pipelineStatus === 'pending'`.

---

## 2. Steps

### Pre-Step 0 - GPT Math Seed Generation (`/api/pipeline/generate-seeds`)

The admin UI can create the next missing math seed file before import/review:

```text
GPT Structured Outputs -> seeds/wNN.json -> import -> seed review
```

This step writes a file artifact first, validates the seed shape, imports only
new seeds, and enqueues seed review. It never approves seeds and never enqueues
activity generation; `status === "approved"` is still required before Generate.

### Seed schema — two fields (`questionCore` + `answerSpec`)

A seed separates its two roles into distinct fields:

| Field | Role | Consumed by | Read aloud? |
|---|---|---|---|
| `questionCore` | Câu hỏi cho bé — ngắn, KHÔNG liệt kê asset, KHÔNG lộ đáp án | `audioScript.question` | ✅ |
| `answerSpec` | Spec object cụ thể + đáp án đúng | `payload` (options/items/count…) | ❌ |

`answerSpec` is **required** for the active MVP action types (`single_select`, `multi_select`, `sort_sequence`, `match_pair`, `count_tap`, `compare_tap`); `watch_video` is exempt. The seed authoring/generation source MUST emit both fields. Legacy 1-field seeds are auto-split by the seed reviewer (see `ANSWER_SPEC_MISSING` below).

Example:
```json
{ "questionCore": "Hình nào khác loại với các hình còn lại?",
  "answerSpec": "3 hình cùng màu xanh: 2 hình tròn, 1 hình tam giác. Đáp án đúng: hình tam giác." }
```

### Step 0 — Seed Review (`src/pipeline/seed-review/`)

Validate `questionCore` + `answerSpec` **before** generate, using Gemini + deterministic rules. When a seed has no `answerSpec`, the reviewer derives one from the legacy `questionCore` (populating `suggestion.answerSpec` + a cleaned `suggestion.questionCore`) and raises `ANSWER_SPEC_MISSING`; when `answerSpec` already exists it only warns and never overwrites it.

**Common rules** (`seed-review.rules.ts`):

| Rule | Severity |
|---|---|
| `ANSWER_SPEC_MISSING` (backfill answerSpec khi thiếu) | warning |
| `SEED_AGE_APPROPRIATE` | critical |
| `SEED_SKILL_MATCH` | critical |
| `SEED_OBJECT_DIVERSITY` (cross-week duplication) | warning |
| `SEED_CULTURALLY_SAFE` | critical |
| `SEED_DIFFICULTY_MATCH` | warning |

Plus per-`actionType` rule sets: `SORT_SEQUENCE_RULES`, `SELECT_RULES`, `MATCH_PAIR_RULES`, `COUNT_TAP_RULES`. Parse failure → `REVIEW_PARSE_ERROR` (critical).

Output → seed `status`: `approved` / `flagged` / `rejected`. Human acts via Telegram or Admin UI `/seeds`. **Duplicate detection lives here**, not in the Human Gate.

### Step 1 — Generate (`steps/1-generate.ts`)

Input: approved+pending seed. Gemini derives `audioScript.question` from `questionCore` (clean, no asset list / answer leak) and the `payload` from `answerSpec`. Guarded: a MVP-type seed missing `answerSpec` is rejected before generation. New activity persisted at `status: 'draft'`. `lessonId = w{NN}-d{1|4}-{subject}`.

### Step 2 — AI Review (`steps/2-review.ts`, `prompts/review.prompt.ts`)

Gemini scores the activity against **18 rules** (technical + pedagogical):

| Code | Rule |
|---|---|
| R01 | `audioScript.hint1` ≤ 10 từ |
| R02 | `audioScript.hint2` ≤ 15 từ |
| R03 | `audioScript.explain` ≤ 20 từ |
| R04 | `audioScript.correct` ≤ 8 từ |
| R05 | `correctAnswer` tồn tại trong `options[].optionId` (single_select) |
| R06 | Số `isCorrect: true` khớp `actionType` (single: 1, multi: ≥2) |
| R07 | `altText` bằng tiếng Việt |
| R08 | `assetRef.assetId` đúng format `LIB-…` / `ACT-…` |
| R09 | Không từ cấm: "quy luật", "ma trận", "thuộc tính", "phần tử", "tập hợp" |
| R10 | `audioScript.question` dùng ngôi "Bé" và có "Đô Đô" |
| R11 | `payload` dùng `assetRef` chuẩn (không dùng question/value/answer) |
| R12 | single/multi có `questionImage` và `options[].assetRef` |
| R13 | `count_tap` có `backgroundAsset` (nền scene) và `targetAsset` (1 vật đơn lẻ), cả hai dạng assetRef; không dùng `sceneImage` |
| R14 | mỗi `optionId` unique |
| R15 | `options.length` ∈ [2,4] (single_select) |
| R16 | `sort_sequence`: `correctPosition` unique, 1-based liên tục |
| R17 | `match_pair`: #leftItems = #rightItems = #correctPairs |
| R18 | `count_tap`: `answerOptions` đúng 4 số, chứa `targetCount` |
| R19 | Mỗi assetRef có `imageDesc` (EN) tả đặc điểm nhận dạng cụ thể, không generic; vật đơn lẻ không nhắc nền/vật khác |
| R20 | LIB asset: `imageDesc` chứa object + color khớp assetId |

Pass → continue. Fail → Telegram alert; runner auto-fix retry when `score ≥ 60`, else seed `pipelineStatus: error`.

### Step 3 — Assets (`steps/3-assets.ts`)

Match `assets_library` (reuse) or create `activity_assets` for each `assetRef`.

### Step 4 — Media (async workers)

- **Image** (`4-image.ts` / `image.worker`): Imagen → GCS; asset `status: pending_review`, `imageUrl` set.
- **Audio** (`4-audio.ts` / `audio.worker`): TTS → GCS for 5 fields (`question, correct, hint1, hint2, explain`); writes `audioFiles.<field>`.

### Step 5 — Ready for Human Gate

After assets + media, the activity is set to **`pending_review`**. (There is no longer a pipeline-local "import" step — that was retired; see §6.)

### Human Gate → Publish

- **Human Gate** (`app/review/activity/{id}`, `LessonPlayerWeb` + production checklist): human approves → `status: approved`. Spec: `content-human-gate`.
- **Publish** (`src/publish/`, `POST /api/publish/{week}` → `{KIDO_SERVER_URL}/admin/publish`): deterministic guard (schema + asset-URL 200) + idempotent upsert into `kido` DB → `status: imported`. Spec: `content-transfer`.

---

## 3. Run modes (must produce the same end-state)

| Mode | Command | Flow |
|---|---|---|
| **Workers** | `docker compose up` (or `worker:*`) | generate → review → assets → enqueue media → `pending_review` |
| **CLI sync** | `npm run pipeline:week -- --week N [--day D1]` | same steps synchronously in one process → `pending_review` |

Both converge on `pending_review`; neither auto-approves or imports. (`content-pipeline-flow`.)

### Queues (`src/queue/index.ts`)

`generate` · `image` · `audio` · `seed-review` (Bull over Redis). Workers: `generate.worker` (steps 1–3 + enqueue media), `image.worker`, `audio.worker`, `seed-review.worker`.

---

## 4. Publish handoff to kido-server

`buildPublishPayload` resolves `assetRef → imageUrl`, groups activities into
server-shaped lessons, and POSTs to `{KIDO_SERVER_URL}/admin/publish`. The server
runs the deterministic guard, then upserts activities/lessons with `imported`
status. Edit-after-import re-flows through the pipeline (hotfix → gate → re-publish);
`kido-server` content is read-only. See `openspec/specs/content-transfer`.

---

## 5. Ops runbook (quick)

```bash
npm run import-seeds            # JSON → Mongo (status: pending_review)
npm run trigger:seed-review     # seed review without Redis (--direct)
npm run pipeline:week -- --week 1   # CLI sync → pending_review
npm run publish:week -- 1       # publish approved week → kido-server
npx ts-node src/scripts/check-seed-review-status.ts
```

Monitor: `db.seeds.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])`,
`pipeline_logs`, Admin UI `/seeds`, `/review/w{week}/d1`, `/published`.

---

## 6. Known gaps & intentional deviations

1. **Backlog per-step HTTP endpoints** (`POST /api/pipeline/generate|review|assets|generate-image|generate-audio|import`, `PATCH /fix-activity`) are **intentionally not implemented** — the pipeline is queue/CLI-driven. Only seed-review, review-actions, publish, telegram, and (deprecated) import have HTTP routes.
2. **Legacy local-import retired** (this change): `5-import.ts` removed; `POST /api/import/[week]` returns 410; `/import/w{week}` page redirects to the publish flow.
3. **Legacy activities** already `approved`/`imported` from the old CLI auto-approve path were never human-reviewed — re-verify them through the Human Gate before publishing. No automatic migration is performed.
4. **`LessonPlayerWeb`** (option-B web replica) may drift from the mobile player — review fidelity per action type.
5. **No GET job-progress endpoint** for seed review — track via `pipeline_logs` / `/seeds`.
