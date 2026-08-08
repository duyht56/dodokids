## Context

Tracing is a new gesture/vector subsystem. It needs ordered strokes, geometric tolerance and minimal diagnostics while complying with data minimization and the explicit non-literacy boundary.

## Goals / Non-Goals

**Goals:** reviewed path pack, robust tracing on supported devices, progressive cues/tolerance and recoverable guidance.

**Non-Goals:** handwriting recognition, OCR, reading/phonics assessment, pressure/biometric profiling or storing full raw traces for analytics.

## Decisions

### D1 — Versioned path schema in normalized coordinates

Each item has identity/category/glyph, ordered strokes, SVG path, start point, direction samples, allowed corridor, pen-lift rules and display bounds. Paths normalize to viewBox and pass static checks (finite coordinates, bounds, length, self-intersection policy, required diacritic order).

### D2 — Corridor/progress evaluator, not pixel similarity

Gesture points are resampled and projected to current stroke path. Evaluator tracks monotonic progress, distance from path and direction; tolerance depends on level/device scale. It never accepts jump-to-end and never resets completed strokes because of a local deviation.

### D3 — Guidance escalates locally

First miss highlights nearest continuation; repeated difficulty widens corridor/enables magnetism or replays direction animation. No “failed” terminal state. Hint count records support level, not a literacy score.

### D4 — Raw stroke stays ephemeral

Mobile holds points only in the current mounted exercise. It does not write a resume buffer and does not send completion, tries, hints, duration, progress/error category or raw coordinates. Exit/unmount clears the buffer and re-entry starts a fresh path run.

### D5 — Pedagogical labels are constrained

Letter/number items are categorized as fine-motor/form familiarity. Audio and UI copy cannot ask child to identify sound/name or claim reading competence; Explore produces no report. Vietnamese glyph order completes base letter before diacritics.

## Risks / Trade-offs

- [Evaluator too strict/loose] → calibrated level tolerances, representative device tests and versioned thresholds.
- [Gesture performance] → resampling/throttling on UI thread-safe path, bounded point buffers and profiling.
- [Glyph inaccuracies] → one-time human review and path-pack versioning; no silent overwrite.
- [Privacy] → no stroke/outcome persistence at all and explicit storage/network contract tests.

## Migration Plan

1. Define schema/validator and create reviewed pilot pack (basic strokes/shapes/digits).
2. Ship internal renderer/evaluator and calibrate devices.
3. Add Latin/Vietnamese glyph pack after review.
4. Enable categories/levels independently; rollback by path-pack/game config.

## Open Questions

- Font/handwriting style for the canonical glyph pack requires product/content sign-off before production paths are authored.
