## Context

EPIC-008 delivered the parent dashboard (`GET /parent/:childId/summary`, profile + single offline-task endpoints) and placeholder `ReportScreen` / `OfflineTasksScreen`. EPIC-009 fills in the two remaining parent features. Constraints carried over from the current codebase:

- No JWT auth — child is identified by the `:childId` path param.
- No per-lesson subject field on the BE; subject progress is derived via the existing deterministic day→subject heuristic (`SUBJECT_DAYS`) in `parent.service.ts`.
- Offline tasks today are one-per-week stored in a single `child.offlineTask` sub-document.
- No external LLM integration exists; AI report copy is generated from deterministic templates this epic (user-confirmed).

## Goals / Non-Goals

**Goals:**
- Server-side weekly report (lock gate, subject progress, templated strengths/growth with safety filter, 4-week comparison, 3 suggestions), cached per child/week.
- Per-day offline-task model (5/week) with list + per-task completion endpoints.
- Full Report and Offline Tasks mobile screens matching the design handoff, including `victory-native` chart and share-to-image.

**Non-Goals:**
- Real LLM (Claude/Gemini) report generation — deferred to the content-pipeline epic.
- Auth/JWT, push notifications, IAP/paywall changes.
- Backfilling historical per-day completion for tasks created under the old single-task model.

## Decisions

- **Templated report copy over LLM.** A rule-based generator maps highest `subjectProgress` → strength and lowest → growth area, drawing from a small phrase bank in positive/growth-mindset language. A `FORBIDDEN_WORDS` filter rejects any output containing negative/comparative judgement words and falls back to a safe phrase. *Why:* self-contained, deterministic, testable, no API key/cost; the response contract is shaped so an LLM can drop in later behind the same endpoint. *Alternative:* live Anthropic call cached per week — more useful copy but adds key management, cost, latency, and offline failure modes not warranted for this epic.
- **Reshape `OFFLINE_TASKS` to 5 tasks/week with `w{week}-d{day}` ids.** Each entry gains `day`, `title`, `safetyNote`. Completion moves from the single `child.offlineTask` sub-document to a map/array keyed by `taskId` (`child.offlineTasks`). The summary endpoint selects the current `(week, day)` task from this richer table. *Why:* STORY-009-02 requires a per-day list; a keyed store supports independent toggling and week filtering. *Alternative:* keep one task/week and fake five client-side — diverges from the spec and the design handoff.
- **Report lock derived from `completedLessons`.** `locked = !completedLessons.includes(day-5 lesson id of week)`, reusing the existing `parseLessonId` matcher so all id formats (`w1d5`, `w01-d5`, `mock-w1-d5`) work.
- **Comparison series computed on the fly** from each week's `subjectProgress` average over the last ≤4 weeks; no new persistence.
- **Report caching in-memory** keyed by `(childId, week)` with invalidation when that week's `completedLessons` set changes (cheap hash check). *Why:* avoids recompute; acceptable to lose on restart since recompute is cheap and deterministic.
- **Mobile charts via `victory-native`; share via `react-native-view-shot` + `expo-sharing`.** Capture the report card `ref` to a PNG, then hand the file URI to the native share sheet. *Why:* matches handoff; Expo-supported.
- **Service layout:** keep everything in the existing `parent` module — add `reports.ts` (generator + filter), extend `offline-tasks.ts` table, add DTOs (`update-offline-task` reshaped, plus report/list query handling), and new controller routes. Mobile adds calls to `parentApi.ts` (or a thin `reportApi.ts`).

## Risks / Trade-offs

- [Templated copy reads generic/repetitive] → Phrase bank with several variants per subject + tie-breaking by score; revisit when LLM lands.
- [Reshaping the offline-task store breaks the existing summary `offlineTask` field — BREAKING] → Update the summary mapping in the same change; old single-record data is ignored (treated as stale → pending). Documented in the parent-api delta.
- [Forbidden-language filter false-negatives] → Keep the generator's own vocabulary curated to safe words; the filter is a backstop, not the only guard.
- [`victory-native` / `react-native-view-shot` native-build weight] → Both are Expo-compatible; pin to versions matching the Expo SDK (see mobile/AGENTS.md — verify against docs.expo.dev v56).
- [In-memory cache inconsistent across instances] → Single-instance dev deployment; fine for now, swap to a shared cache when scaling.

## Migration Plan

1. Reshape `child.schema` offline-task field (`offlineTask` → `offlineTasks` keyed store); no data migration — legacy records treated as stale.
2. Ship BE endpoints + reshaped table; rebuild `dist`.
3. Ship mobile screens behind the existing Report/Offline tabs (replace placeholders).
4. Rollback: revert the change; old placeholders + single-task summary return.

## Open Questions

- Exact `dateRange` anchor (cohort start date vs. account creation) — default to week-number-relative range; confirm with content team if a real calendar anchor is needed.
