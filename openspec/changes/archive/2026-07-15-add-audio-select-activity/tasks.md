# Tasks: add-audio-select-activity

> Trạng thái: DRAFT — chưa bắt đầu. Ưu tiên xác nhận Open questions ở `design.md` với session tiếng Việt trước khi động vào `activity.types.ts` (tránh xung đột 2 nhánh cùng sửa).

## 0. Coordination (chặn trước)

- [x] 0.1 Xác nhận với session tiếng Việt: shape `AudioReference`/`audio_library`, word-key chuẩn hoá, ai sở hữu change (design.md §Open questions). Chốt 2026-07-14: word-key ASCII bỏ dấu; 1 collection + field lang; promptImage optional gen-empty; change này là nguồn.

## 1. Types & Schema (nền cho mọi thứ sau)

- [x] 1.1 kido-pipeline `src/types/activity.types.ts`: thêm `'audio_select'` vào ActionType; interface `AudioSelectPayload { promptImage?, options: AudioOptionCard[], correctAnswer }`, `AudioOptionCard { optionId, audioRef, altTextVi }`, `AudioReference { type, audioId, altTextVi, transcript? }`
- [x] 1.2 `day` mở rộng `'D1' | 'D3' | 'D4'` (2026-07-13, tách sớm để mở khoá routine tiếng Anh): `src/types/seed.types.ts` + `src/db/models/seed.model.ts` enum + `src/queue/index.ts` GenerateJobData + `src/pipeline/runner.ts` runWeek; generalize D→num trong `steps/1-generate.ts` (normalizeDay + buildLessonId: `parseInt(day.slice(1))`, tránh D3 map nhầm→4) + doc `generate.prompt.ts`. tsc + 89 test pipeline xanh. ⚠️ NGOÀI scope task này (làm ở change riêng khi build English import path): `seed-file.ts` DAYS/seedId còn toan-specific (`SEED-toan-`, validate D1/D4×8); import step chưa nhận subject tiếng_anh. `audio_select` vào ActionType vẫn ở task 1.1.
- [x] 1.3 kido-server `src/common/types/activity.types.ts` + mongoose: `audio_select` vào actionType enum (payload Mixed); collection `audio_library` (audioId, lang, transcript, audioUrl, usageCount, usedInActivities, status, timestamps) + index `{ audioId, lang }`
- [x] 1.4 `docs/kido-activity-schema.ts` mirror: ActionType, AudioSelectPayload, AudioOptionCard, AudioReference, AudioLibrary interface + section watch/compare-style comment
- [x] 1.5 Grep toàn repo mọi switch/enum theo actionType — store.ts union đã thêm audio_select. Còn lại (preview map.ts/LessonPlayerWeb, fixtures, publish guard, lint, mobile lesson/assetCache) do các task 2.x/3.x sở hữu, xử lý ở đó.
- [x] 1.6 **Canonical docs cùng change (non-negotiable)**: thêm `audio_select` vào `AGENTS.md`, `docs/AI_CONTEXT.md`, `CLAUDE.md` danh sách actionType

## 2. Pipeline — generate, validate & audio

- [x] 2.1 `generate.prompt.ts`: block payload `audio_select` (2–3 options, mỗi option audioRef + altTextVi ≤4 từ, correctAnswer 1 optionId, KHÔNG questionImage bắt buộc); hướng dẫn khi nào `library` vs `activity`
- [x] 2.2 `activity-mechanics.ts`: R-rule audio_select (2..3 options, mỗi option có audioRef, correctAnswer khớp đúng 1 optionId, altTextVi ≤4 từ, cấm assetRef/questionImage/correctAnswers) + 9 unit tests
- [x] 2.3 `normalize-payload.ts`: normalizeAudioSelect (giữ transcript, suy correctAnswer, alias field) + 3 tests
- [x] 2.4 `review.prompt.ts`: rule R22 mới + cập nhật LƯU Ý PHÂN CÔNG (audio_select chỉ tieng_viet/tieng_anh)
- [x] 2.5 `steps/4-audio.ts`: sinh clip mỗi option (library → get-or-create `audio_library`; activity → gen trực tiếp); lang theo subject (EN voice / VI TTS); đề `question` giữ giọng dẫn VI. TTS prereq đã sửa: `synthesize(text, lang, {wrap})` honor lang (voice EN qua `ttsVoiceEn`, KHÔNG prefix VI khi EN) + wrap:false cho clip từ đơn. (ElevenLabs vẫn deferred sang change tiếng Anh — hiện dùng voice EN của Gemini TTS.)
- [x] 2.6 `audio_library` service (`services/audio-library.service.ts` + `db/models/audio-library.model.ts`): get-or-create theo word-key ASCII + lang, upsert usageCount/usedInActivities
- [x] 2.7 `lint-seeds.ts`: `audio_select` vào MVP_ACTIONS + guard AUDIO_SUBJECT (chỉ tieng_viet/tieng_anh); `docs/KIDO_SEED_AUTHORING.md` answerSpec format cho audio_select
- [x] 2.8 Publish: build-payload strip `transcript`; asset-url.checker thu `audioUrl` → guard bắt broken audio clip; spec test audio_select (pass + broken audioRef) xanh

## 3. Mobile

- [x] 3.1 `mobile/src/types/lesson.ts`: AudioSelectPayload, union member (+ compare_tap đã bổ sung), isAudioSelect guard, mapper từ server payload (audioRef → audioUrl), mockAudioSelect; assetCache prefetch+hydrate option clips
- [x] 3.2 `AudioSelectActivity.tsx`: 2–3 thẻ, mỗi thẻ nút play (▶ ≥44pt, pulse khi phát) + vùng chọn tách biệt; speak(audioUrl) qua expo-audio; phát lại không giới hạn; sai reset ~900ms no-stress
- [x] 3.3 `ActivityContainer.tsx`: import + route `audio_select` → AudioSelectActivity
- [x] 3.4 Preview web: AudioSelect component trong LessonPlayerWeb.tsx + case Renderer + map.ts (mapActivity + activityAssetUrls audioUrl) + mock fixture (thẻ play HTML audio)

## 4. Docs & curriculum

- [x] 4.1 `docs/KIDO_ENGLISH_CURRICULUM.md`: gỡ cờ ⚠ khỏi 3 skill (→ ✓); §7 "phụ thuộc chờ" → "đã land, ref change này"; §8 TTS note cập nhật đã vá tiền đề
- [x] 4.2 `docs/KIDO_LANG_SKILL_CATALOG.md`: gỡ blocked khỏi domain `pho` (status/§8/legend/bảng §9); Source Hierarchy AI_CONTEXT.md "blocked on audio_select" → "unblocked"
- [x] 4.3 Memory "Lang curriculum decisions" + "English curriculum v1" cập nhật đã land; thêm memory mới "audio-select-landed"; MEMORY.md index

## 5. Verify

- [x] 5.1 Test xanh: kido-pipeline vitest **156 passed** (26 files), kido-server jest **58 passed** (8 suites, gồm publish guard audio_select); tsc pipeline/server/mobile exit 0 (chỉ còn lỗi pre-existing không liên quan: regen-image route, iap.service.spec)
- [ ] 5.2 ⚠️ CHỜ INFRA: chạy 1 seed audio_select end-to-end (cần TTS/ElevenLabs + bucket — tốn phí) — CHƯA chạy được ở đây
- [~] 5.3 CHỜ VISUAL: **preview web ĐÃ verify** (2026-07-14, `/preview/mock`): card audio_select render đúng (2 nút play ▶ + caption + nút Chọn tách biệt), chọn đúng → ✓, khoá sau khi trả lời, console sạch. **Mobile CHƯA** (cần device/simulator — không drive được ở đây).
- [ ] 5.4 ⚠️ CHỜ HUMAN GATE: review activity audio_select đầu tiên + publish — CHƯA (cần activity thật + Human Gate)
