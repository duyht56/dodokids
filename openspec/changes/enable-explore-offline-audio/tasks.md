> Reuse note: the "static, versioned audio registry", the bundled number pack
> 0–50, and local playback that this change's design called for already landed
> via `add-explore-prompt-audio` — `exploreAudioRegistry.generated.ts` (pipeline
> export), the `promptAudio` key scheme, and `playExplorePromptAudio`. This change
> now adds the capability MODEL on top and enables the audio-dependent modes.

## 1. Capability Model

- [x] 1.1 `mobile/src/explore/exploreAudioCapability.ts` — typed states
      (`available` | `missing` | `unsupported-version`) derived from the bundled
      pack, plus `hasExploreAudioKeys`, `hearSelectAudioKeys` and
      `isHearSelectAudioAvailable(maxNumber)` (the per-mode required-dependency
      contract for number `hear_select`). Fail-closed: an empty/unknown pack is
      never `available`.
- [ ] 1.2 Have the number generator filter `hear_select` via
      `isHearSelectAudioAvailable`, and fold the capability into the
      generation/replay version so selection stays deterministic per profile.
- [~] 1.3 Static contract added
      (`scripts/verify-explore-offline-audio-contracts.cjs`,
      `npm run test:explore-offline-audio`). Behavioral proof (empty pack →
      `missing` → `hear_select` disabled; supported pack → `available` → enabled,
      other modes unaffected) is deferred until the toolchain is installed.

## 2. Visual Offline Gameplay

- [ ] 2.1 Filter `number_explorer` mode selection so visual modes generate offline while `hear_select` is unavailable without audio
- [ ] 2.2 Make `tap_count` visual/icon instructions playable offline with replay controls disabled when prompt audio is missing
- [ ] 2.3 Update bundled/server catalog manifests so game offline state and mode audio state are reported independently
- [ ] 2.4 Add airplane-mode provider-to-renderer tests for every visual number/count level without audio

## 3. Approved Vietnamese Audio Pack

- [ ] 3.1 Finalize and document the v1 key inventory, voice/source approval, license metadata and size budget
- [ ] 3.2 Produce and review consistent Vietnamese number-name clips for 0–50
- [ ] 3.3 Produce and review the finite instruction and object-label clips required by enabled number/count modes
- [ ] 3.4 Normalize/compress the approved clips and add them as bundled mobile assets
- [ ] 3.5 Generate a versioned Metro-compatible static registry with coverage and missing-key validation

## 4. Local Playback

- [ ] 4.1 Implement typed local audio-key resolution without network or visible-answer fallback
- [ ] 4.2 Replace the Explore `speakCount()` placeholder path with `expo-audio` bundled playback
- [ ] 4.3 Add preload, replay, interruption handling and unmount cleanup scoped to the Explore screen
- [ ] 4.4 Connect number/count audio buttons to capability-aware playback and accessible disabled states

## 5. Verification and Rollout

- [ ] 5.1 Add manifest tests covering all required keys, pack versions and absent/corrupt asset behavior
- [ ] 5.2 Add deterministic generator tests for visual-only and audio-enabled capability profiles
- [ ] 5.3 Verify replay, rapid navigation and cleanup on Android and iOS in airplane mode
- [ ] 5.4 Enable offline audio-dependent modes only after automated and physical checks pass; retain a public-config rollback switch
- [ ] 5.5 Confirm Explore still writes no attempts, history, analytics, lesson progress or playback persistence
