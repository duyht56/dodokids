## Why

The 48-week seed corpus (1920 seeds across three subjects) passed every existing check and was still badly degraded in ways nobody could see, because every check looks at a scope smaller than the problem. `seed-review` judges one seed; `seed-week-validate` judges one 8-activity session. Neither can see a defect whose evidence is spread across a quarter or the whole programme.

What got through, measured on the generated corpus:

- **Skill diversity collapsed in the direction opposite to the design.** Math went from 22 distinct skills in Q1 to 21, then 12, then **7 in Q4** — the quarter the routine describes as "tích hợp đa kỹ năng". `math_shape_recognize`, a foundation-level recognition skill, appears 36 times in the final twelve weeks.
- **One skill swallowed a quarter.** `math_conditional_count` is 48 of 192 activities (25%) in both Q3 and Q4.
- **A single template was cloned by swapping colours.** 96 `math_conditional_count` items share one structure and 94 of them share one spoken sentence, so a child hears the same prompt 94 times across the programme. Items at weeks 26, 33, 41 and 48 are identical apart from the colour word.
- **67 seeds specified a rotation that does nothing.** Rotating a regular pentagon by 72° or a regular hexagon by 60° maps the shape onto itself, so items built to test rotation-invariant shape recognition contained no visible rotation.

Each of those is invisible at seed and week scope, and each is mechanically detectable at corpus scope.

## What Changes

- Add `kido-pipeline/src/pipeline/seed-corpus-validate.ts`, a third deterministic validation layer that runs over the whole corpus:
  - `CORPUS_SKILL_DIVERSITY` (critical) — minimum distinct skills per subject per quarter.
  - `CORPUS_SKILL_SHARE` (warning) — maximum share of a quarter one skill may take.
  - `CORPUS_TEMPLATE_CLONE` (critical) — normalises `answerSpec` by removing colour, shape and size words, keys it together with `questionCore`, and caps how often one template may recur.
  - `CORPUS_PROMPT_REUSE` (warning) — caps how often one sentence may be read aloud to the child.
  - `CORPUS_DUP_ANSWERSPEC` (warning) — two seeds identical word for word.
  - `SEED_DUP_OPTION` (critical) — two identical options inside one `single_select` item.
  - `SEED_ROTATION_NOOP` (critical) — a rotation angle that is a multiple of the shape's own rotational symmetry period.
- Wire the layer into `src/scripts/lint-seeds.ts` as a `KIỂM CẤP CORPUS` section, active only when at least 24 files are being linted, since diversity is meaningless on a single file. Critical corpus issues set a non-zero exit code.
- Thresholds are per subject and derived from the observed corpus, sitting between the healthy values and the broken ones. `tieng_anh` is exempt from the share cap because `THEME_SKILL_MATRIX` allows only 4–7 skills per theme and its routine states that concentrating on genuine constructs is preferred over inventing a third one.
- Reject `lang_onset_match` items whose sample word has no initial consonant. Two seeds paired `áo` with `ong`; both are zero-onset, so `validateOnsetExercise` counted a match and passed the item, even though matching on the *absence* of a consonant is not the skill's construct.
- Document the corpus rules in `docs/prompts/gen-math-seed.routine.md` §7b and correct two doc/code conflicts found while doing so: the difficulty distribution (the doc offered per-stage variants the validator rejects) and the phonology level table (the level must follow the quarter's micro-level, not `difficulty` alone).

## Capabilities

### New Capabilities
- `seed-corpus-validation`: deterministic validation at corpus scope — skill diversity and concentration per quarter, template and prompt reuse limits, and per-item geometric and option-set integrity checks that need no cross-seed context but were previously unchecked.

### Modified Capabilities
- `lang-phonetics`: `validateOnsetExercise` now rejects a zero-onset sample word.

## Impact

- **New**: `src/pipeline/seed-corpus-validate.ts`, `src/pipeline/seed-corpus-validate.test.ts`.
- **Modified**: `src/scripts/lint-seeds.ts` (new report section), `src/curriculum/vi-phonetics.ts` + its test (zero-onset rule).
- **Docs**: `docs/prompts/gen-math-seed.routine.md` (§7b, difficulty distribution, checklist), `docs/prompts/gen-lang-seed.routine.md` (§7b level-by-quarter table).
- **Seed data repaired under these rules**: 67 seeds with no-op rotations across weeks 15–48; 3 `compare_tap` seeds whose side counts exceeded the documented 1–6 range; 2 zero-onset phonology seeds; the 8 seeds of week 2 English, whose prompts still used the bilingual style retired on 2026-07-20.
- **Not affected**: no wire contract, seed schema, pipeline step, or runtime change. Nothing publishes.
- **Still open**: the six remaining corpus criticals are structural and cannot be patched — math Q3 and Q4 diversity, and four cloned templates. They define the regeneration scope for math weeks 25–48.
