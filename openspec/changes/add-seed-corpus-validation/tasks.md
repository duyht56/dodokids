## 1. Corpus validation layer

- [x] 1.1 Add `src/pipeline/seed-corpus-validate.ts` with per-subject thresholds derived from the observed corpus
- [x] 1.2 `CORPUS_SKILL_DIVERSITY` and `CORPUS_SKILL_SHARE` per subject per quarter
- [x] 1.3 `templateKey` — normalise `answerSpec` by stripping parentheticals, digits, and colour/shape/size vocabulary
- [x] 1.4 `CORPUS_TEMPLATE_CLONE` keyed on template plus `questionCore`, so a fixed-by-design option set with a varying prompt is not flagged
- [x] 1.5 `CORPUS_PROMPT_REUSE`, exempting `tieng_anh` whose prompts are mandated by `ENGLISH_INSTRUCTION_FRAMES`
- [x] 1.6 `CORPUS_DUP_ANSWERSPEC`
- [x] 1.7 `SEED_DUP_OPTION`, scoped to `single_select` only
- [x] 1.8 `SEED_ROTATION_NOOP` against each shape's rotational symmetry period

## 2. Wiring

- [x] 2.1 Add the `KIỂM CẤP CORPUS` section to `src/scripts/lint-seeds.ts`
- [x] 2.2 Skip the section below 24 files and say so, so linting one file does not report a false diversity failure
- [x] 2.3 Critical corpus issues set a non-zero exit code

## 3. Phonology gap

- [x] 3.1 `validateOnsetExercise` rejects a zero-onset sample word
- [x] 3.2 Test covering the `áo` / `ong` case

## 4. Tests

- [x] 4.1 `templateKey` collapses colour-swapped clones, keeps structurally different items apart, ignores parentheticals
- [x] 4.2 Diversity and share rules, including the English share exemption
- [x] 4.3 Template clone caught; fixed-option-set-with-varying-prompt not caught
- [x] 4.4 Duplicate answerSpec, prompt reuse, English prompt exemption
- [x] 4.5 Duplicate option in `single_select` caught, in `multi_select` not caught
- [x] 4.6 Rotation no-op caught at the symmetry period, not caught at half period
- [x] 4.7 `npx vitest run src/pipeline/ src/curriculum/` green

## 5. Seed repairs

- [x] 5.1 67 seeds: pentagon 72° → 36°, hexagon 60° → 30°
- [x] 5.2 3 `compare_tap` seeds brought inside the 1–6 per-side range, keeping the difficulty's minimum gap
- [x] 5.3 2 `lang_onset_match` seeds re-cut onto samples with a real consonant onset
- [x] 5.4 8 week-2 English seeds: prompts rewritten to the fixed frames, option design left untouched, metadata version corrected

## 6. Docs

- [x] 6.1 `gen-math-seed.routine.md` §7b — the four corpus rules with the numbers that motivated them
- [x] 6.2 `gen-math-seed.routine.md` — difficulty distribution corrected to the validator's 2/4/2
- [x] 6.3 `gen-math-seed.routine.md` — three new checklist lines
- [x] 6.4 `gen-lang-seed.routine.md` §7b — phonology level chosen by quarter, not by `difficulty` alone
