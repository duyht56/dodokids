## 1. Inventory (mobile + pipeline mirror)

- [x] 1.1 Add the nine Route Planner failure-guidance phrases plus
      `route_fb_check_arrow` to `PROMPT_PHRASES` in
      `mobile/src/explore/promptAudio.ts`, transcribed verbatim from the
      sentences `RoutePlannerRenderer` displays
- [x] 1.2 Mirror the same ten entries into
      `kido-pipeline/src/explore/exploreAudioInventory.ts`
- [x] 1.3 Add `routeFeedbackKeys(kind, checkArrowStep?)`, reusing the shared
      number-name slot clip and `nhe` for the escalated support line

## 2. Runtime wiring (mobile)

- [x] 2.1 Add `onSpeakFeedback?: (refs) => void` to `ExploreRendererProps`
- [x] 2.2 Handle it in `ExplorePlayScreen` through the existing stitcher, so
      spoken feedback supersedes any prompt still playing
- [x] 2.3 Refactor `guidanceFor` to return `{ text, audioRefs }` from one
      `FEEDBACK_TEXT` definition, so wording and voice cannot diverge
- [x] 2.4 Speak the guidance after the retry chime (`SPEAK_AFTER_CUE_MS`), with
      the timer tracked in `timersRef` so leaving the screen cancels it

## 3. Guardrails

- [x] 3.1 Extend `mobile/scripts/verify-explore-prompt-audio-contracts.cjs`:
      assert each `route_fb_*` transcript is verbatim-identical to the renderer's
      guidance text, and that the wiring is present
- [x] 3.2 Add a mobile↔pipeline inventory mirror check to the same script
      (skips cleanly when kido-pipeline is not checked out)
- [x] 3.3 Confirm both checks FAIL when deliberately broken, not just pass

## 4. Clip production (Human Gate — needs GCP creds + MongoDB)

- [ ] 4.1 `cd kido-pipeline && npm run explore-audio:generate` — synthesizes the
      ten new clips into `audio_library` at `pending_review`
- [ ] 4.2 `npm run explore-audio:review` and LISTEN to all ten
- [ ] 4.3 `npm run explore-audio:approve -- --all` (Human Gate; never automatic)
- [ ] 4.4 `npm run explore-audio:export -- ../mobile` — ships the approved pack
      and regenerates the registry; silence trimming runs as part of export

## 5. Verification

- [x] 5.1 `cd mobile && npm run test:explore-prompt-audio && npm run
      test:explore-sound && npm run test:explore-offline-audio &&
      npx tsc --noEmit && npx eslint src/`
- [x] 5.2 `cd kido-pipeline && npx vitest run src/explore`
- [x] 5.3 On-device smoke: failed run still shows the correct sentence, and the
      escalated run still shows "Xem lại mũi tên thứ N nhé." with the step chip
      highlighted (verified on iOS Simulator before the clips existed)
- [ ] 5.4 After 4.4: hear all ten lines in the app, check the seam on the
      escalated line, and confirm the chime and the voice do not overlap
- [ ] 5.5 Confirm no Explore history/analytics/reward side effects and no
      kido-server publish path is touched
