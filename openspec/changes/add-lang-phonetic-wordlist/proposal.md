## Why

The `pho` (phonological awareness) domain of the `tieng_viet` subject could not be seeded from Q2 onward. `docs/KIDO_LANG_SKILL_CATALOG.md` §9.2 names the blocker as prerequisite **(A)**: *a word list with phonetic annotation — which words share a rhyme (vần), which share an onset (âm đầu), which differ only in tone (thanh)*. No such list existed anywhere in the repo, so an author had to guess, and a wrong guess fails silently: the seed reads fine on paper but the exercise has two correct answers (or none) once it is spoken aloud.

Two secondary problems compounded it:

- `docs/prompts/gen-lang-seed.routine.md` prerequisite #2 told the routine to stop after Q1 until `audio_library` had clips. That gate is wrong on both halves. Seeds are text only (`questionCore` + `answerSpec`) and reference no assets, so audio blocks **generate**, not **seed** — `docs/KIDO_LANG_CURRICULUM.md` §6.2 already corrected this and explicitly flags the earlier wording as an error. And `audio_library` is populated lazily at generate time by `getOrCreateLibraryClip`, so there is no pre-loaded clip set that could ever "become ready".
- Northern Vietnamese neutralizes three onset groups (`d`/`gi`/`r` → /z/, `ch`/`tr`, `s`/`x`). The dialect is locked to Northern (`vi-label.ts`, 2026-07-16), so an author reading spelling rather than sound will build `lang_onset_match` items with two correct answers. Nothing in the repo captured this.

## What Changes

- Add `kido-pipeline/src/curriculum/vi-phonetics.ts`: the authoring-only Vietnamese phonetic dataset and its per-skill exercise validators.
  - A syllable parser (`parseViSyllable`) splitting a `tiếng` into onset letter, **Northern onset sound**, rhyme, and tone — stripping only the five tone marks, never the `ă`/`â`/`ê`/`ô`/`ơ`/`ư`/`đ` diacritics.
  - `PHO_WORDS`: monosyllabic words whose `gloss` is a concrete meaning a 5–6 year old knows (the §9.2 criterion; explicitly **not** "drawable", since `pho` options are audio clips and `audio-select-activity` forbids `assetRef` on options). Function words are excluded.
  - `PHO_TONE_SETS`: hand-surveyed tone sets, since a machine cannot tell whether an unlisted tone variant is a real word or a particle.
  - `PHO_MULTI_SYLLABLE_WORDS`: 2–3 syllable words for `lang_syllable_count`, with a `reduplicated` flag marking the từ-láy trap named in that skill's anti-pattern.
  - Lookup helpers (`rhymeFamilies`, `onsetFamilies`, `toneSetsWithAtLeast`, `wordsBySyllableCount`) that only surface families meeting the §9.2 "≥3 words per family" bar.
  - Per-skill validators (`validateRhymeExercise`, `validateOnsetExercise`, `validateToneExercise`, `validateBlendExercise`, `validateSyllableCountExercise`) encoding the anti-patterns from `lang-skill-catalog.ts`, with an `easy`/`hard` level switch for the rules that only apply below `challenge`.
  - `auditPhoInventory()` self-check over the dataset itself.
- Add `kido-pipeline/src/curriculum/vi-phonetics.test.ts`, including a hand-verified syllable-parsing table.
- Update `docs/prompts/gen-lang-seed.routine.md`: retract the "stop after Q1" prerequisite, remove the W12 stop condition, add §7b telling the routine how to build and validate `pho` items, and correct the action-spread rule from 5/8 to 4/8 to match `seed-week-validate.ts`.
- Update `docs/KIDO_LANG_CURRICULUM.md` §6.2 and `docs/KIDO_LANG_SKILL_CATALOG.md` §9.2 to record (A) as landed and to separate it from the `audio_library` step.

## Capabilities

### New Capabilities
- `lang-phonetics`: the Vietnamese phonetic dataset for the `pho` domain — Northern-dialect syllable analysis, the curated word inventory with rhyme/onset/tone families, and the per-skill exercise validators that seed authoring must pass.

### Modified Capabilities
<!-- No existing spec covers `tieng_viet` seed authoring; the routine prompt and curriculum docs are updated in place. -->

## Impact

- **New**: `kido-pipeline/src/curriculum/vi-phonetics.ts`, `kido-pipeline/src/curriculum/vi-phonetics.test.ts`.
- **Docs**: `docs/prompts/gen-lang-seed.routine.md` (prerequisite #2, §1 stop condition, §4 action spread, new §7b, operating notes), `docs/KIDO_LANG_CURRICULUM.md` §6.2, `docs/KIDO_LANG_SKILL_CATALOG.md` §9.2.
- **Reuses**: `validateViLabel` from `vi-label.ts` — the phonetic inventory holds itself to the same bare-noun labelling rule, so a word cannot enter with a classifier attached (which would change both its syllable count and its rhyme).
- **Not affected**: no runtime, wire-contract, seed-schema, pipeline-step, or `kido-server` change. Nothing publishes. Existing seed files are untouched and the seed linter is unchanged.
- **Still open**: `audio_library` clips for the `pho` word set are produced at generate time and must be listened to for Northern accent (`KIDO_LANG_CURRICULUM.md` §6.2 warns `ttsVoice` does not encode dialect).
