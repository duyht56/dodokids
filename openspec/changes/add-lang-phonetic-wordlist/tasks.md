## 1. Dataset & parser

- [x] 1.1 Add `parseViSyllable` / `viSyllables` / `viSyllableCount` to `src/curriculum/vi-phonetics.ts`, stripping only the five tone marks and treating `qu` as a single onset
- [x] 1.2 Add `VI_ONSET_SOUND_BY_LETTER` mapping onset spelling to the Northern phoneme, with the `d`/`gi`/`r`, `ch`/`tr`, `s`/`x` merges documented
- [x] 1.3 Add `PHO_WORDS` (monosyllabic, concrete `gloss`, no function words, Northern variants only)
- [x] 1.4 Add `PHO_TONE_SETS` (hand-surveyed) and `PHO_MULTI_SYLLABLE_WORDS` (with `reduplicated` flags)
- [x] 1.5 Add lookup helpers `rhymeFamily`/`onsetFamily`/`rhymeFamilies`/`onsetFamilies`/`toneSetsWithAtLeast`/`wordsBySyllableCount`

## 2. Per-skill validators

- [x] 2.1 `validateRhymeExercise` — exactly one same-rhyme option, no option sharing the sample's onset, near-rhyme pairs blocked at `easy`
- [x] 2.2 `validateOnsetExercise` — compares by `onsetSound`; flags cross-noise with rhyme; warns when a correct answer differs in spelling but matches in sound; `l`/`n` blocked at `easy`
- [x] 2.3 `validateToneExercise` — same onset + rhyme, distinct tones, `hỏi`/`ngã` blocked at `easy`, every variant must have a surveyed gloss
- [x] 2.4 `validateBlendExercise` — answer present and unique across onset+rhyme+tone
- [x] 2.5 `validateSyllableCountExercise` — returns the count, blocks reduplicated words at `easy`
- [x] 2.6 `auditPhoInventory` — duplicates, syllable counts, `validateViLabel` conformance, tone-set integrity, family coverage floors

## 2b. Adversarial linguistics review (fixes applied)

- [x] 2b.1 Drop the `lá`/`là`/`lạ` tone set and remove `là` — the copula is a function word, the same ground on which `ma/má/mà/mạ` was rejected
- [x] 2b.2 Remove `con` (animate classifier), `mai` (Southern Tết flower), `càng`, `gan`, `tơ`; re-gloss `cắn`, `bơ`, `cọ`, `dưa` to the sense a Northern child holds first
- [x] 2b.3 Add the `ve`/`vẽ` tone set so `ngã` is covered and the `hỏi`/`ngã` guard is reachable
- [x] 2b.4 Extend near-rhyme detection with a nucleus axis (`splitRhyme` + `NEAR_NUCLEUS_GROUPS`), catching `ăn`/`ân`, `ăt`/`ât`, `ôi`/`uôi`, `o`/`ơ`, `ay`/`ai`
- [x] 2b.5 Move advisory onset notes out of the validator into `onsetSpellingNotes` so "empty means valid" holds
- [x] 2b.6 Correct the `hỏi`/`ngã` rationale — Hanoi preserves the contrast; the merger is Southern/Central
- [x] 2b.7 Resolve the `qu` inconsistency: onset sound `/k/`, medial glide returned to the rhyme as `oa`, so `quả` rhymes with `hoa` and not with `cá`
- [x] 2b.8 Flag `đu đủ` reduplicated, drop the abstract `lấp lánh`, replace `máy vi tính`
- [x] 2b.9 Relocate `xếp` and `mất` out of rhyme-header blocks they do not belong to

## 3. Tests

- [x] 3.1 Hand-verified parsing table covering zero onset, `ngh`/`gh`/`gi`/`qu`, and diacritic-vs-tone confusion
- [x] 3.2 Northern merge assertions and the `l`/`n` non-merge
- [x] 3.3 Inventory tests: audit clean, coverage floors, no function words, no Southern variants
- [x] 3.4 Validator tests for every skill, both `easy` and `hard`
- [x] 3.5 Near-rhyme nucleus-axis tests and the six-tone coverage test
- [x] 3.6 `npx vitest run src/curriculum/` green (138 tests)

## 4. Docs

- [x] 4.1 `gen-lang-seed.routine.md`: retract prerequisite #2, drop the W12 stop condition, add `vi-phonetics.ts` to §0
- [x] 4.2 `gen-lang-seed.routine.md`: add §7b (Northern merge table, helper/validator workflow, hard rules)
- [x] 4.3 `gen-lang-seed.routine.md`: correct action spread 5/8 → 4/8 to match `seed-week-validate.ts`
- [x] 4.4 `KIDO_LANG_CURRICULUM.md` §6.2: split step 4 into the word list (done) and `audio_library` (generate-time)
- [x] 4.5 `KIDO_LANG_SKILL_CATALOG.md` §9.2: mark (A) landed
