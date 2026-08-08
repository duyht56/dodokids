# Proposal: harden-generation-mechanics

> Part of the visual-asset-system architecture umbrella
> (`docs/KIDO_VISUAL_ASSET_SYSTEM.md`). Independent; may land at any time.

## Why

`generateStep` currently repairs mechanics violations by re-invoking the same
high-temperature activity generator exactly once. A deterministic rule such as
the `audioScript.correct` eight-word limit can still fail after that repair,
because the fix is left to a probabilistic model instead of a mechanical
correction. Failures also lack a stable, auditable trace of what was wrong and
what changed.

## What Changes

- Run deterministic repair for machine-fixable violations before any LLM call,
  then re-validate.
- Add a dedicated structured semantic-repair path at low temperature (`0..0.1`)
  with bounded attempts for violations that need language understanding.
- Never weaken a mechanics rule when repair fails; leave the seed/activity in
  error with actionable diagnostics.
- Emit stable error codes and before/after field traces for every repair attempt.
- Sync the canonical schema comment so `audioScript.correct ≤ 8 words` is
  documented, not just enforced in the validator.

## Capabilities

### Modified Capabilities

- `content-pipeline-flow`: mechanics repair becomes deterministic-first, with a
  bounded, auditable semantic-repair fallback.

## Impact

- **kido-pipeline**: `steps/1-generate.ts` repair flow, `activity-mechanics.ts`
  (deterministic fixers + error codes), and repair/trace tests.
- **docs**: `docs/kido-activity-schema.ts` and mirrors — document the
  `audioScript.correct ≤ 8 words` rule.
- **data**: none; repair changes behavior only for newly generated activities.
