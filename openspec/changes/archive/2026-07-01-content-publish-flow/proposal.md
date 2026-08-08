## Why

Today `kido-pipeline` generates learning content into the `kido_pipeline` database, while the `kido-server` runtime serves children by querying `lessonStatus: 'imported'` from the `kido` database — but the handoff between them is implicit and broken: the pipeline import step writes activities with `status: 'approved'` (not `imported`), produces no server-shaped lesson documents, and points at a different database name. There is no single, trustworthy step that publishes only human-approved, production-ready content into the runtime. This change makes that handoff explicit: a WYSIWYG human gate in the pipeline admin (rendering an activity exactly as the mobile Lesson Player shows it) followed by a mechanical, idempotent copy into the server database.

## What Changes

- **WYSIWYG Human Gate** (pipeline admin): the review page renders each candidate activity through a **web replica of the mobile Lesson Player** (option B — a faithful web rebuild, no react-native-web), using the **real** generated assets and audio (after the image/audio step), so the reviewer evaluates exactly what a child will experience. A production-ready checklist sits beside the preview. Approval is batched per week (matching the existing week-import model). **No AI review #2** and **no duplicate-detection panel** — Seed Review already covers content-quality and cross-week duplication upstream.
- **Mechanical transfer** (pipeline → server): on week approval, approved activities + their lessons are copied into the `kido-server` database via **idempotent upsert keyed by `activityId` / `lessonId`**. Only asset **references** move (images/audio stay in their public GCS buckets). A **deterministic guard** runs before each write — validate the document against the server schema and assert every asset URL resolves (HTTP 200) — so a malformed or broken-asset document can never reach the runtime. This replaces the implicit cross-DB read and fixes the `approved` vs `imported` / database-name mismatch.
- **Activity management page** (kido-server): a read-only view of published content with **rollback / unpublish / re-publish** controls and transfer monitoring. It does **not** edit activity content.
- **Edit-after-import policy**: the pipeline is the **single source of truth**. Any fix to a live activity is made in the pipeline (hotfix), re-flows through the WYSIWYG Human Gate, and is **re-copied** (idempotent upsert) to overwrite the server copy. The server never edits activity content directly — preventing drift between the two systems.

## Capabilities

### New Capabilities
- `content-human-gate`: Pipeline-admin WYSIWYG approval gate — web-replica Lesson Player preview with real assets/audio, production-ready checklist, and per-week batch approval that marks content ready to publish.
- `content-transfer`: Mechanical, idempotent pipeline→server publish step — schema + asset-URL deterministic guard, reference-only asset handling, server-shaped lesson/activity upsert, and the edit-after-import re-flow path. No AI review, no duplicate check.
- `activity-management`: kido-server page to monitor, roll back, and unpublish published activities (content read-only).

### Modified Capabilities
<!-- No spec-level requirement changes to existing capabilities. The transfer fulfils the existing lessons-api/activity-api 'imported' contract rather than altering it. -->

## Impact

- **Pipeline** (`kido-pipeline`): new/reworked admin review route rendering the web-replica player (`app/review/...`, new `LessonPlayerWeb` components); a publish/transfer module (server-DB connection + idempotent upsert + deterministic guard); week-approval wiring. Seed Review and steps 1–5 stay unchanged.
- **Server** (`kido-server`): new `activity-management` module/page (read + rollback/unpublish); confirm `activities`/`lessons` `imported` contract matches what the transfer writes.
- **Data**: explicit, documented status lifecycle across both systems; resolves the current `approved`-vs-`imported` and `kido` / `kido_pipeline` database mismatch via a real copy step. Content lives in the pipeline DB (authoring SoT) and is projected into the server DB (published).
- **Assets**: unchanged — images/audio remain in public GCS buckets; only references are transferred.
- **No new external dependencies**; no changes to mobile, Seed Review, or the generation/AI-review/asset steps.
