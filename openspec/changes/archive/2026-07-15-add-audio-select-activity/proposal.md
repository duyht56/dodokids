# Proposal: add-audio-select-activity

## Why

Hai môn ngôn ngữ cần một kiểu tương tác mà **đáp án là ÂM THANH**, không phải ảnh — thứ bộ 6 actionType hiện tại không diễn đạt được:

- **Tiếng Việt** (`docs/KIDO_LANG_SKILL_CATALOG.md`): domain âm vị `pho` (nhận diện âm đầu/vần/tiếng) đang bị chặn, ghi rõ trong Source Hierarchy là "blocked on an `audio_select` actionType that does not exist yet". Trẻ đã bỏ mặt chữ (chưa biết đọc) nên lựa chọn phải phát ra tiếng để bé nghe rồi chọn.
- **Tiếng Anh** (`docs/KIDO_ENGLISH_CURRICULUM.md` §5.2, §7): 3 skill `en_phonics_initial`, `en_rhyme`, `en_dialogue_response` cần nghe câu hỏi → chọn **clip** trả lời/từ đúng.

Tất cả các actionType hiện có giả định "đề audio, đáp án ảnh". Với âm vị và hội thoại, bản thân **các lựa chọn là clip âm thanh** — `OptionCard.assetRef` chỉ trỏ ảnh, không biểu diễn được. Làm ngay bây giờ vì cả hai môn ngôn ngữ mới ở giai đoạn khung/curriculum, chưa seed — blast radius nhỏ nhất trước khi content nhân rộng, và quyết định 2026-07-10 đã chốt mở `audio_select` làm actionType thứ 7 (memory "Lang curriculum decisions") nhưng chưa có change hiện thực hóa.

## What Changes

- **BREAKING (MVP freeze)**: thêm action type thứ 7 `audio_select` — mở rộng bộ 6 (single_select, multi_select, sort_sequence, match_pair, count_tap, compare_tap). Subject-agnostic: dùng cho `tieng_viet` (domain `pho`) và `tieng_anh` (phonics/rhyme/dialogue). KHÔNG dùng trong `toan`.
- **Payload mới** `AudioSelectPayload`: `{ promptImage?: AssetReference (visual scaffold TÙY CHỌN, thường không có), options: AudioOptionCard[] (2..3), correctAnswer: optionId }`. Mỗi `AudioOptionCard = { optionId, audioRef: AudioReference, altTextVi }`. Đề bài đọc cho bé vẫn qua `audioScript.question`; điểm khác biệt là **đáp án là clip âm thanh**, không phải thẻ ảnh.
- **`AudioReference` + `audio_library` (hạ tầng mới)**: con trỏ tới clip audio, mirror `AssetReference`/`assets_library`. `type: 'library'` (tra `audio_library` theo word-key, tái dùng, `usageCount++`) | `type: 'activity'` (clip đặc thù activity, vd chuỗi âm vị không phải từ thật). Lý do: từ như "cat"/"con cá" xuất hiện hàng chục activity — gen lại mỗi lần vừa tốn phí vừa lệch phát âm giữa các bài.
- **Guardrail bộ nhớ làm việc (BẮT BUỘC)**: khi cả đề lẫn đáp án đều là audio, trẻ phải giữ nhiều clip trong đầu → dễ đo trí nhớ thay vì đo ngôn ngữ. Ràng buộc: **≤ 3 options**, mỗi clip **≤ 4 từ**, **phát lại KHÔNG giới hạn** (mỗi thẻ 1 nút play riêng).
- **Mobile**: component `AudioSelectActivity` mới — 2–3 thẻ, mỗi thẻ có nút play phát `audioRef`, bé nghe từng thẻ rồi tap chọn thẻ trả lời; không ép nghe hết.
- **Pipeline**: generate prompt + mechanics validator + review rule + normalize + audio step nhận `audio_select`; audio step sinh clip cho từng option (VI qua TTS hiện có, EN qua ElevenLabs); seed lint chấp nhận actionType mới.
- **Server**: `activity.types`, mongoose schema (payload Mixed — thêm discriminator value + collection `audio_library`), publish guard resolve `audioRef` URL.
- **Ngoài scope**: `listen_repeat` (có mic, hậu-MVP); `watch_video` vẫn hoãn; nội dung/seed của từng môn (làm ở change riêng của mỗi curriculum); TTS EN→ElevenLabs worker (nêu ở đây như phụ thuộc, hiện thực ở change tiếng Anh).

## Capabilities

### New Capabilities

- `audio-select-activity`: kiểu tương tác nghe-chọn-âm-thanh — đề qua `audioScript.question`, 2–3 thẻ đáp án mỗi thẻ là clip audio (nút play riêng, phát lại không giới hạn), chọn thẻ khớp đề. Kèm `audio_library` tái dùng clip theo word-key.

### Modified Capabilities

- `content-pipeline-flow`: pipeline generate/review/audio chấp nhận `audio_select` — validator (cấm questionImage bắt buộc, bắt buộc ≥2/≤3 options có audioRef, mỗi altTextVi ≤4 từ, đúng 1 correctAnswer), audio step resolve clip cho mỗi option + đề.
- `mongoose-schemas`: `actionType` enum thêm `audio_select`; payload scenario mới; collection `audio_library` (mirror `assets_library`).
- `activity-container`: container map `audio_select` → component `AudioSelectActivity`.

## Impact

- **kido-pipeline**: `src/types/activity.types.ts` (ActionType + AudioSelectPayload + AudioReference + AudioOptionCard), `src/prompts/generate.prompt.ts`, `src/prompts/review.prompt.ts`, `src/pipeline/activity-mechanics.ts` (R-rule mới), `src/pipeline/normalize-payload.ts`, `src/pipeline/steps/4-audio.ts` (sinh clip option + lang theo subject), `src/scripts/lint-seeds.ts`, tests.
- **kido-server**: `src/common/types/activity.types.ts`, mongoose schema/enum + `audio_library` collection, `src/modules/publish/publish.guard` (resolve audioRef URL).
- **mobile**: `src/components/activities/AudioSelectActivity.tsx` (mới), container map, `src/types/lesson.ts` (payload type + mapper), tái dùng expo-audio player (memory "expo-audio SDK56").
- **docs**: `docs/kido-activity-schema.ts` (mirror: ActionType, AudioSelectPayload, AudioReference, AudioLibrary), `AGENTS.md` + `docs/AI_CONTEXT.md` + `CLAUDE.md` (thêm `audio_select` vào danh sách canonical — non-negotiable "cùng một change"), `KIDO_ENGLISH_CURRICULUM.md` + `KIDO_LANG_SKILL_CATALOG.md` (gỡ cờ ⚠/blocked khi land).
- **seed types**: `src/types/seed.types.ts` — `day` mở rộng `'D3'` (tiếng Anh day 3), `audio_select` vào ActionType.
- **Memory/quy ước**: cập nhật "Lang curriculum decisions" + "English curriculum v1" — `audio_select` từ "chờ land" → "đã có contract"; MEMORY.md index.

## Coordination note

`audio_select` do quyết định track tiếng Việt (2026-07-10) khởi xướng. Change này subject-agnostic để phục vụ cả hai; **shape payload + `AudioReference`/`audio_library` cần được session tiếng Việt xác nhận** trước khi merge (xem `design.md` §Open questions). Tên `audio_select` là canonical — KHÔNG dùng `listen_select` (là "CMS Type cũ" đã khai tử ở §5.1 `KIDO_MATH_CURRICULUM.md`).
