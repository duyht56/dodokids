## Why

The seed layer is complete: 1920 seeds across 48 weeks and three subjects, green through all three deterministic validation layers. Nothing downstream of it has ever run. A readiness survey of the seven pipeline stages found 99 issues, and six of them share a property that makes them urgent rather than merely important: **they are only detectable after the content is generated, and fixing them afterwards means generating it all again.** A full pass is roughly 4,500 images and 9,900 TTS clips, serialised into days of wall clock and unbudgeted cloud spend.

Four of the six come from the same root cause. There are two execution paths that generate lesson audio, and they do different things:

- The CLI path (`src/pipeline/steps/4-audio.ts`) splits English and Vietnamese per audio slot as the curriculum requires, and generates the option clips that `audio_select` activities need.
- The queue path (`src/queue/workers/audio.worker.ts`) — the one that actually runs a real corpus — hardcodes `'vi'` for every clip and never generates option clips at all.

Run as it stands, that ships 384 English activities narrated in Vietnamese and 190 listening activities with no playable answers. Both defects are invisible until someone listens.

The other two:

- `toWordKey` folds Vietnamese to ASCII, so `bàn` and `bạn` produce the same clip key and therefore share one audio file. Tone is phonemic in Vietnamese: **all 14 curated tone sets collapse under this key**, which makes every tone-discrimination activity unanswerable. The damage is not limited to tone — `cày` and `cây` collide too.
- The Northern-accent lock added in a previous round went only into the bare-word prefix. Every narration clip — five per activity, 9,600 in total — goes through the other prefix and remains unpinned, so the accent drifts between Northern and Southern from sentence to sentence.

Alongside those, publish does not fail closed. A failed image leaves `imageUrl: null` and a failed TTS call writes an empty string; the server guard collects a URL only when it is a non-empty string, so both are skipped rather than flagged. The result publishes cleanly and renders as large Vietnamese alt-text — which, for a select activity, spells out the answer — or plays in total silence in a subject taught entirely by ear.

## What Changes

- Add `src/services/lesson-audio.ts` as the single source of truth for which clips an activity needs, in which language, and under which key scheme. Both execution paths now read from it instead of each carrying their own copy of the rules.
- `audio.worker.ts` honours a per-job language and gains a branch for `audio_select` option clips, writing them into the option's `audioRef` rather than into `audioFiles`. `generate.worker.ts` enqueues those jobs and stamps the language at enqueue time, where the subject is known.
- Add `toDiacriticSafeWordKey`, which appends an encoding of exactly the diacritics `toWordKey` discards. `toWordKey` itself is deliberately unchanged: the 184-clip Explore pack is keyed by it, is already approved, and has **zero collisions**, so changing it would force a re-export for no benefit. Lesson clips opt in through a new `keyMode` on `getOrCreateLibraryClip`.
- Add the region directive to the narration prefix so all 9,600 clips share one accent.
- Add `src/publish/media-complete.ts` and call it from `buildPublishPayload`, before grouping, so a week with any missing image, empty narration slot, or unvoiced answer option is refused with a message naming the activities. It runs on dry-run too, since knowing whether a week can publish is what dry-run is for.
- Upload option-clip URLs at publish. They live in the payload, not in `audioFiles`, so the existing upload loop never saw them and they would have reached the server as local staging URLs.
- Stop `normalizePayload` bailing out when there is no question image. The 808 audio-prompt language activities deliberately have none — the mechanics rule explicitly exempts them — so the early return skipped option normalisation, answer derivation and layout sanitising for all of them.
- Count all five days in `checkWeekComplete`. It checked only days 1 and 4, with a comment explaining that those were the math days; that was true when only math had seeds and has been false since the language subjects landed. A week could publish with three of its five lessons missing.
- Copy `assets/` into the runtime image so mascot conditioning is not silently disabled, and give the staging directory and Redis real volumes. The mascot reference is read at generation time, so its absence is not a re-photograph, it is a regeneration.
- Add the missing `isCompareTap` type guard to the canonical schema; the other six action types all had one.

## Capabilities

### New Capabilities
- `lesson-media-integrity`: one shared audio plan across both execution paths, a diacritic-preserving clip key for lesson audio, and a publish gate that refuses a week whose media is incomplete.

## Impact

- **New**: `src/services/lesson-audio.ts` (+ test), `src/publish/media-complete.ts` (+ test).
- **Modified**: `src/services/word-key.ts`, `audio-library.service.ts`, `tts.service.ts`; `src/pipeline/steps/4-audio.ts`, `normalize-payload.ts` (+ test), `helpers.ts`; `src/queue/index.ts`, `workers/{audio,generate}.worker.ts`; `src/publish/{build-payload,upload-local-assets}.ts`; `Dockerfile`, `docker-compose.yml`; `docs/kido-activity-schema.ts`.
- **Deliberately unchanged**: `toWordKey`, so the approved Explore audio pack keeps its keys and needs no re-export.
- **Not affected**: no seed data, no wire contract change, no mobile change. Nothing publishes.
- **Verified**: kido-pipeline 449 passing (57 new), the two failures being the pre-existing ones that need cloud credentials; kido-server 50 suites / 502 tests green; TypeScript clean apart from three pre-existing errors in one unrelated test file.
- **Still open**: the remaining survey findings, chiefly the image budget (the Vietnamese corpus needs roughly 1,257 distinct objects against a design budget of 200–300), the Human Gate's 1,920 approvals, and every credential.
