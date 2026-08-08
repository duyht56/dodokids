# Design: add-audio-select-activity

## Bối cảnh

`audio_select` là actionType đầu tiên mà **đáp án là âm thanh**. Mọi actionType trước đều "đề audio → đáp án ảnh". Thiết kế phải trả lời 3 câu hỏi: (1) clip audio của option lấy từ đâu và tái dùng thế nào; (2) làm sao không biến bài thành bài kiểm tra trí nhớ ngắn hạn; (3) discriminant/payload khác các loại chọn hiện có ở chỗ nào.

## D1 — Payload: đáp án là `audioRef`, không phải `assetRef`

`OptionCard` hiện có `assetRef: AssetReference` (ảnh). `audio_select` cần `AudioOptionCard` với `audioRef: AudioReference`. KHÔNG tái dùng `OptionCard` để tránh nhập nhằng ảnh/âm.

```ts
interface AudioSelectPayload {
  promptImage?: AssetReference    // scaffold thị giác TÙY CHỌN (thường bỏ trống — audio-first)
  options: AudioOptionCard[]      // 2..3
  correctAnswer: string           // optionId của đáp án đúng
}
interface AudioOptionCard {
  optionId: string                // "opt_1" | "opt_2" | "opt_3" (KHÔNG A/B/C — trùng ký hiệu pattern)
  audioRef: AudioReference
  altTextVi: string               // mô tả ngắn tiếng Việt — review/preview + accessibility, KHÔNG đọc cho bé
}
```

- **Không có `questionImage` bắt buộc.** Đề bài đọc cho bé nằm ở `audioScript.question` (đã có). `promptImage` chỉ là scaffold tùy chọn (vd tranh minh hoạ ngữ cảnh hội thoại).
- **`correctAnswer` là 1 optionId** (giống single_select). Không mở multi cho MVP — nghe-chọn-nhiều audio vượt tải trí nhớ trẻ 4–6.
- **optionId dùng số** (`opt_1..opt_3`) theo đúng quy ước "không nhãn A/B/C" của `KIDO_SEED_AUTHORING.md`.

## D2 — `AudioReference` + `audio_library` (mirror asset infra)

Thiết kế đối xứng hoàn toàn với `AssetReference`/`assets_library` — pattern đã chứng minh hiệu quả (memory "Static Primitive Pack").

```ts
interface AudioReference {
  type: 'library' | 'activity'
  audioId: string        // library: word-key ("cat", "con-ca"); activity: "ACT-...-opt_2"
  altTextVi: string
  transcript?: string    // EN/VI text sinh clip — sống Generate→Audio, strip trước publish
}
```

- `type: 'library'` → tra `audio_library` theo **word-key chuẩn hoá** (lowercase, bỏ dấu, gạch nối: `con-ca`, `cat`). Tái dùng, `usageCount++`. Đây là mặc định cho **từ thật**.
- `type: 'activity'` → clip đặc thù: chuỗi âm vị không phải từ (`/b/`), câu trả lời hội thoại nhiều từ (`"Yes, I do."`). Không vào library vì không tái dùng across bài.
- **`audio_library`** (collection mới, mirror `assets_library`): `{ audioId (word-key), lang: 'vi'|'en', transcript, audioUrl, usageCount, usedInActivities[], status, createdAt, approvedAt }`. TTS/ElevenLabs sinh 1 lần/word, mọi activity trỏ tới.

**Vì sao bắt buộc, không phải tối ưu:** "cat" xuất hiện ~hàng chục activity/48 tuần. Không có library → mỗi activity gen clip riêng → tốn phí ElevenLabs × N và **phát âm lệch nhau giữa các bài** (trẻ nghe "cat" mỗi tuần một khác).

## D3 — Guardrail bộ nhớ làm việc (chống đo nhầm)

Khi đề + đáp án đều là audio, nếu không ràng buộc thì bài đo **trí nhớ nghe** chứ không đo ngôn ngữ. Ba ràng buộc cứng, validator enforce:

1. **≤ 3 options** (2 cho warmup, 3 cho core/challenge). Không bao giờ 4.
2. **Mỗi clip ≤ 4 từ** (đo qua `altTextVi`/`transcript` word-count). Âm vị/từ đơn ~1–2 từ; câu trả lời hội thoại ~2–4 từ.
3. **Phát lại KHÔNG giới hạn** — mỗi thẻ có nút play riêng, bé nghe lại bao nhiêu lần tùy ý. UI KHÔNG auto-advance khi đang nghe.

## D4 — Mobile: thẻ có nút play, không ép nghe hết

`AudioSelectActivity`: 2–3 thẻ xếp `row_2`/`row_3`. Mỗi thẻ:
- Nút play (▶) lớn ≥ 44pt phát `audioRef`; đang phát → animation sóng; tap lại = phát lại.
- Vùng chọn thẻ (tap để trả lời) tách biệt nút play (như compare_tap tách vùng sprite/chọn) để không nhầm "nghe" với "chọn".
- Tái dùng expo-audio `createAudioPlayer` (memory "expo-audio SDK56") — phát `audioUrl` từ bucket.
- Sai → phản hồi wrong không phán xét, reset ~900ms, giữ để bé nghe lại và chọn lại (no-stress).

## D5 — Pipeline: audio step sinh clip option theo `subject`

`steps/4-audio.ts` hiện chỉ TTS `'vi'` cho 5 slot audioScript. Với `audio_select` thêm:
- Sinh clip cho **mỗi option**: `library` → check `audio_library` trước, thiếu thì gen + upsert; `activity` → gen trực tiếp.
- **Lang theo subject**: `tieng_anh` → EN (ElevenLabs, rate 0.75); `tieng_viet` → VI (TTS hiện có). Đề `audioScript.question` vẫn là giọng dẫn Đô Đô tiếng Việt.
- Mechanics validator (`activity-mechanics.ts`) thêm R-rule: cấm `options` rỗng/>3, mỗi option có `audioRef`, `correctAnswer` khớp 1 optionId, mỗi `altTextVi` ≤4 từ, KHÔNG có field ảnh của loại chọn (`assetRef`).

## Open questions — ĐÃ CHỐT (2026-07-14, xác nhận với chủ track tiếng Việt)

1. **Word-key chuẩn hoá** → **ASCII bỏ dấu + gạch nối** (`con-ca`, `cat`). Lowercase, strip diacritics, tránh lỗi filesystem/bucket UTF-8 trên Windows.
2. **Tách `audio_library` theo `lang`** → **1 collection + field `lang`**, key = `{lang}:{word}`, index `{ audioId, lang }`. Mirror `assets_library`.
3. **`promptImage`** → **giữ optional**, generate mặc định bỏ trống; chỉ bật cho `en_dialogue_response` nếu cần ngữ cảnh.
4. **Sở hữu change** → **change này là nguồn** (không có nhánh VN riêng đang sửa `activity.types.ts`). Triển khai trực tiếp.
