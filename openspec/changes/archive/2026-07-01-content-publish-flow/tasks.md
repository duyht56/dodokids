## 1. Web-replica Lesson Player (pipeline admin)

- [x] 1.1 Add a `LessonPlayerWeb` container in the pipeline admin that takes an activity JSON (typed from `activity.types`) and routes by `actionType`
- [x] 1.2 Build web replica components for all six action types: `single_select`, `multi_select`, `sort_sequence`, `match_pair`, `count_tap`, `watch_video`
- [x] 1.3 Wire the preview to load real image asset URLs and play real audio scripts from the activity's generated assets (no placeholders)
- [x] 1.4 Gate the preview: if assets/audio are not yet generated, render a not-ready state and block approval
- [x] 1.5 Verify render parity per action type against the mobile components in `mobile/src/components/activities/`

## 2. Human Gate UI (pipeline admin)

- [x] 2.1 Add the production-ready checklist beside the preview (image correct, audio matches text, activity solvable, no forbidden words, no overflow)
- [x] 2.2 Block per-activity approval until every checklist item is confirmed
- [x] 2.3 Compute and display per-week publishable state (approved vs total) across all days
- [x] 2.4 Add a single "publish week" action enabled only when all activities in the week are approved
- [x] 2.5 Confirm the gate makes no AI-review call and renders no duplicate-detection panel

## 3. Publish / transfer module (pipeline → server)

- [x] 3.1 Add a server-DB connection (or thin kido-server ingest endpoint) for the publish step — resolve the mechanism per design Open Questions
- [x] 3.2 Implement the deterministic guard: validate each document against the server activity/lesson schema
- [x] 3.3 Extend the guard to assert every referenced asset URL (image, audio) resolves HTTP 200; reject + report on failure
- [x] 3.4 Implement idempotent activity upsert into the server DB keyed by `activityId`, writing `status: 'imported'`
- [x] 3.5 Build and upsert server-shaped lesson documents keyed by `lessonId` with `lessonStatus: 'imported'` for each day
- [x] 3.6 Ensure only asset references are written (no binary re-upload); server stores the same GCS URLs
- [x] 3.7 Run the transfer in dry-run mode (guard + report, no write) and validate against an approved week

## 4. Wire week publish + backfill

- [x] 4.1 Connect the "publish week" action to the transfer module
- [x] 4.2 Surface transfer results (written vs guard-rejected) back to the admin
- [x] 4.3 Backfill-publish already-approved weeks so the server DB matches current authored content

## 5. Edit-after-import re-flow

- [x] 5.1 Ensure a pipeline hotfix to a published activity resets it back into the Human Gate for re-approval
- [x] 5.2 Confirm re-approval re-runs the transfer and overwrites the server document in place (no duplicate)

## 6. Activity management page (kido-server)

- [x] 6.1 Add the read-only published-content list (week, day, subject, action type, status, last transfer time)
- [x] 6.2 Add single-activity inspect view showing current served content + last transfer time
- [x] 6.3 Implement unpublish (runtime stops serving — no longer `imported`) without modifying content
- [x] 6.4 Implement re-publish of an intact unpublished activity
- [x] 6.5 Show transfer monitoring including guard-rejected items and their failure reason

## 7. Handoff fix verification

- [x] 7.1 Confirm published content is queryable by the runtime (`lessons.service` finds `lessonStatus: 'imported'` lessons with populated activities)
- [x] 7.2 Verify the old `approved`-only / database-name mismatch no longer blocks serving published content
- [x] 7.3 Add tests: deterministic guard (pass, broken-asset reject, schema-fail reject) and idempotent upsert (first publish, re-publish no-duplicate)
