# ROUTINE: Gen English Seed — 1 tuần / lần chạy

> Prompt dán vào routine `/schedule` (Claude Code cloud agent). Sinh seed môn Tiếng Anh cho 48 tuần
> (mỗi tuần **1 ngày `D3`**, mỗi ngày **8 activity** → 8 seed/tuần → 384 seed). Rule chung: 1 buổi = 8 activity (AGENTS.md / AI_CONTEXT.md §Canonical Learning Model).
> Nguồn chân lý taxonomy: [KIDO_ENGLISH_CURRICULUM.md](../KIDO_ENGLISH_CURRICULUM.md) (§4 chủ đề, §5 skill, §5.4 spiral).
> Đổi curriculum → sửa doc đó, prompt giữ nguyên.

> ⚠️ **PREREQUISITE — kiểm trước lần fire đầu, nếu thiếu thì DỪNG và báo:**
> 1. `ActivitySeed.day` phải chấp nhận `'D3'` (`kido-pipeline/src/types/seed.types.ts`). Nếu còn `'D1' | 'D4'` → chưa mở day 3, DỪNG.
> 2. Seed có field `themeCode`, `sentencePattern` (trục 1&2, §2 curriculum). Nếu type chưa có → dùng tạm trong answerSpec + ghi cờ, KHÔNG bịa field.
> 3. `audio_select` ĐÃ LAND (2026-07-14, OpenSpec `add-audio-select-activity`) → dùng đủ **14 skill**, không còn skill bị chặn. Guardrail: ≤3 options, mỗi clip ≤4 từ.

---

Bạn là **content generator + pedagogical reviewer** cho app giáo dục mầm non Kido (trẻ 4–6 tuổi, Việt Nam học tiếng Anh). Nhiệm vụ: sinh seed môn Tiếng Anh, MỖI LẦN CHẠY sinh trọn **1 tuần** rồi tự dừng. Mục tiêu năng lực: nghe hiểu + nhận ra câu trả lời cho phỏng vấn vào lớp 1 (§1 curriculum).

## 0. ĐỌC BỐI CẢNH TRƯỚC (bắt buộc, đúng repo hiện tại)
1. `docs/KIDO_ENGLISH_CURRICULUM.md` — **§2.1** (4 lớp từ vựng theo kênh kiểm được — ĐỌC TRƯỚC TIÊN, quyết định từ nào đi kênh nào), **§4** (12 chủ đề × 4 tuần), **§4.1** (theme × skill feasibility matrix), **§5** (14 skill + actionType hợp lệ), **§5.4** (spiral mẫu câu + spiral TỪ VỰNG + mastery + guardrail), **§2** (1 chủ đề = 1 sentencePattern đơn nghĩa).
2. `kido-pipeline/src/curriculum/english-skill-catalog.ts` — `THEME_SKILL_MATRIX` (**nguồn chân lý** cho skill nào dùng được với chủ đề nào; validator đọc chính file này) + construct/antiPattern từng skill.
3. `kido-pipeline/src/types/seed.types.ts` — interface `ActivitySeed` (hợp đồng field; kiểm `day` có `'D3'`, `targetLexemes` là `string[]`).
4. `docs/kido-activity-schema.ts` — payload từng actionType (single_select/multi_select/match_pair/sort_sequence/audio_select).
5. `docs/KIDO_SEED_AUTHORING.md` — quy tắc answerSpec + quy ước KHÔNG nhãn A/B/C.
6. `kido-pipeline/seeds/w*-en.json` đã có — biết tuần nào đã sinh; **chạy ledger để biết từ nào còn thiếu lượt**: `cd kido-pipeline && npx ts-node src/scripts/lint-seeds.ts 'seeds/w*-en.json'`.

## 1. XÁC ĐỊNH TUẦN CẦN LÀM
- Quét `kido-pipeline/seeds/` tìm file tiếng Anh đã có (đặt tên `w{WW}-en.json` để KHÔNG đè seed Toán `w{WW}.json`). Chọn **tuần nhỏ nhất trong 1..48 CHƯA có file tiếng Anh**. Đó là `W`.
- Nếu đã đủ 48 tuần: in "✅ Đã đủ 48 tuần tiếng Anh" và DỪNG (nhắc user tắt routine).
- `quarter` = ceil(W/12). Ngày cố định: **`D3`**. 1 ngày × **8 activity** → 8 seed/tuần.

## 2. TRA CHỦ ĐỀ + MẪU CÂU CỦA TUẦN (§4 curriculum)
- Từ `W`, tra bảng §4 ra: `themeCode`, tên chủ đề, `sentencePattern` (ĐÚNG MỘT), khối ngữ pháp. Mỗi chủ đề = 4 tuần liên tiếp; xác định đây là tuần thứ mấy của chủ đề (1..4).
- **Tuần thứ 4 của chủ đề = SLOT ÔN MẪU CÂU (§5.4):** ≥1 trong 8 activity phải trộn `sentencePattern` của **chủ đề liền trước**; ghi `reviewOf` (nếu field có) hoặc chú thích trong metadata. Tuần 48 (`feelings` bài 4) = mô phỏng phỏng vấn tổng hợp mẫu câu lõi.
- **MỌI tuần từ W5 trở đi = SLOT ÔN TỪ VỰNG (§5.4, khác slot trên):** ≥1 trong 8 activity phải dùng **từ lõi của một chủ đề ĐÃ HỌC**, không phải từ của chủ đề tuần này. Đây là cơ chế DUY NHẤT cho từ đạt lượt giãn cách — không có nó thì mọi từ chỉ sống trong 4 tuần của chủ đề mình rồi biến mất. Chọn từ đang thiếu lượt (đọc ledger: `npx ts-node src/scripts/lint-seeds.ts 'seeds/w*-en.json'`).
- Tất cả 8 activity của tuần CÙNG `themeCode` + CÙNG `sentencePattern` (trừ activity ôn spiral).

## 3. CHỌN SKILL CHO 8 ACTIVITY (§4.1 matrix + §5.4)

> ⛔ **KHÔNG có template skill chung cho mọi chủ đề.** Template cũ ("xoay vòng 4–5 skillCode") chính là cơ chế đã buộc generator bịa `en_category_select`/`en_sentence_build` cho chủ đề không đỡ được construct đó.

- **Lấy skill từ ô `valid` của CHỦ ĐỀ đang làm** — tra `THEME_SKILL_MATRIX` trong `kido-pipeline/src/curriculum/english-skill-catalog.ts` (bản người đọc: curriculum §4.1). Ô khuyết = `invalid`; `asset-blocked` cũng KHÔNG dùng được.
- Số skill mỗi tuần **không có mức tối thiểu cứng** — 3 construct thật tốt hơn 5 construct bịa. Nhưng mỗi bài phải khác bài trước ở **việc trẻ phải NGHĨ**, không chỉ khác ở cách bấm.
- **Kiểm đơn điệu bằng tay trước khi ghi:** viết ra một dòng "trẻ thực sự làm gì" cho cả 8 bài rồi đọc dọc. Nếu ≥5 dòng giống nhau → tuần hỏng, làm lại. (Đây đúng là cách phát hiện bản seed tuần 1 đầu tiên hỏng: 6/8 dòng là "nghe từ chào → chọn ảnh cử chỉ".)
- **Phân hóa tuổi:** tuần thuộc chủ đề Q1–Q2 nghiêng §5.1 (4–5 tuổi: nhận từ đơn/thuộc tính). Q3–Q4 mở thêm §5.2 (câu/hội thoại/âm vị).
- **Cả 14 skill đều mở** — `audio_select` đã land nên `en_phonics_initial`/`en_rhyme`/`en_dialogue_response` seed được bình thường. Skill `+` (cần asset mới) vẫn seed được — asset lo ở bước generate/image, seed chỉ mô tả.
- Mỗi skill dùng đúng **actionType hợp lệ của nó** (tra cột actionType §5). Ghi skill đã dùng vào `metadata.chosenSkills`.

## 4. CẤU TRÚC 1 TUẦN (8 activity)
- **difficulty**: `warmup×2, core×4, challenge×2`. `activityIndex` 1..8 khó tăng dần (warmup trước, challenge cuối).
- **Đa dạng actionType:** 8 activity dùng **≥3 loại actionType khác nhau** trong bộ hợp lệ tiếng Anh (`single_select, multi_select, match_pair, sort_sequence`[, `audio_select` nếu land]); KHÔNG lặp 1 loại quá **4/8**. KHÔNG dùng `count_tap`/`compare_tap` (hình dạng của Toán — §5.2 curriculum).

## 5. HỢP ĐỒNG MỖI SEED (đúng `ActivitySeed` + field tiếng Anh)
```json
{
  "seedId": "SEED-tieng_anh-w{WW}-D3-{II}",   // WW & II 2 chữ số: w05, 01..08
  "week": 5, "day": "D3", "quarter": 1,
  "subject": "tieng_anh",
  "themeCode": "<từ §4, vd colors>",
  "sentencePattern": "<từ §4, vd It's ___.>",
  "skillCode": "<en_*, canonical §5, phải nằm trong ô `valid` của chủ đề — xem §4.1 matrix>",
  "actionType": "<hợp lệ của skill>",
  "difficulty": "warmup",
  "activityIndex": 1,
  "questionCore": "<câu Đô Đô ĐỌC cho bé — VI dẫn, xem §6>",
  "targetLexemes": ["<từ tiếng Anh ĐƯỢC ĐỌC — vd red>", "<...>"],
  "answerSpec": "<spec dựng payload — KHÔNG đọc cho bé>",
  "reviewOf": ["<themeCode chủ đề trước, chỉ ở activity ôn spiral>"]
}
```
> `targetLexemes` **ĐÃ CÓ** trong `ActivitySeed` (mảng) — khai tường minh, ĐỪNG dùng fallback.
> `themeCode`/`sentencePattern`/`reviewOf` CHƯA có trong type: đưa vào **đầu `answerSpec`** dạng `[theme=colors|pattern=It's ___|target=red]` (validator đọc `[theme=...]` từ đây) và ghi cờ `metadata.pendingFields=true`. KHÔNG bịa field ngoài hợp đồng.

## 6. ĐỀ BÀI 100% TIẾNG ANH (BẮT BUỘC — đổi 2026-07-20, curriculum §8)

> ⛔ **Hướng B song ngữ ĐÃ BỎ.** Không còn "Đô Đô dẫn tiếng Việt + chèn từ EN" (`"Bé tìm giúp Đô Đô màu red nào!"`). Lý do: bé không bao giờ nghe câu tiếng Anh trọn vẹn, và pipeline đọc cả câu bằng MỘT giọng nên từ EN chèn giữa câu Việt bị phát âm sai ("red" → "rét") — splicing chưa từng tồn tại.

- **questionCore** = câu lệnh **TIẾNG ANH**, lấy ĐÚNG từ bộ khung cố định (curriculum §8, code: `ENGLISH_INSTRUCTION_FRAMES`). Thay `{target}`/`{attrs}`/`{noun}` bằng từ của bài; **KHÔNG chế câu mới**, KHÔNG có "Bé"/"Đô Đô".
  - Ví dụ (`colors`): `en_word_recognition` + `single_select` → `"Touch the red one."`; `en_category_select` + `multi_select` → `"Touch all the red ones."`
- **Ngôn ngữ 5 slot audioScript** (bước generate dựng, seed chỉ cấp questionCore): `question`/`correct`/`hint1` = **tiếng Anh**; `hint2`/`explain` = **tiếng Việt**.
- **MỖI CLIP CHỈ MỘT NGÔN NGỮ.** `hint2`/`explain` KHÔNG được chứa từ tiếng Anh nào (kể cả từ đích) — neo nghĩa bằng mô tả **hình ảnh** ("hình màu đỏ"), KHÔNG dịch từ.
- **targetLexemes** = mảng từ/cụm tiếng Anh ĐƯỢC ĐỌC trong bài. Từ thật → trỏ `audio_library` type 'library' ở bước audio. Quy tắc kê lexeme ở §8.
- **answerSpec** = object cụ thể + đáp án đúng. **QUY TẮC NHÃN:** ghi đáp án đúng bằng **NỘI DUNG**, KHÔNG dùng nhãn "A/B/C". Grammar theo actionType:
  - `single_select`: `options: <mô tả vật/thuộc tính>, <…>; đúng = <nội dung đáp án đúng>; layout = grid_2x2|grid_2x1|row_3`
  - `multi_select`: `options: <…>; đúng = {<nội dung các đáp án đúng>}; minCorrect = k`
  - `match_pair`: `cặp đúng = <trái1>↔<phải1>, <trái2>↔<phải2> (mỗi trái khớp DUY NHẤT 1 phải)`
  - `sort_sequence`: `items (đúng thứ tự) = 1.<..> → 2.<..> → 3.<..>; direction = horizontal`
  - `audio_select` (chỉ khi land): `options (clip): <từ/âm 1>, <từ/âm 2>[, <…3>]; đúng = <nội dung clip đúng>; mỗi clip ≤4 từ` (≤3 options — guardrail §5.4)

## 7. CONSTRUCT VALIDITY (chất lượng cốt lõi)
Với **mỗi** seed, áp guardrail §5.4 curriculum (bản tiếng Anh của Logic Signature Test):
- **Đo đúng năng lực, không đo cái khác:** item chỉ hợp lệ nếu trẻ giải đúng nhờ **nghe hiểu tiếng Anh**, không nhờ đoán từ ảnh/loại trừ vô nghĩa.
  - `en_word_recognition`/`en_attribute`: distractor phải **cùng loại, khác thuộc tính đích** (tìm "red" → distractor là màu khác, KHÔNG phải con vật) — nếu distractor vô quan, bé chọn đúng mà chẳng cần nghe.
  - `en_category_select` (multi): các đáp án đúng phải **đủ và chỉ** thuộc category đích; có ≥1 distractor cùng khung cảnh khác category.
  - `en_listen_sentence`: chỉ giải được khi nghe **cả câu** (sentencePattern), không đoán từ 1 từ khoá; distractor khác nhau ở đúng thành phần câu đang dạy.
  - `en_story_sequence`: **bỏ audio mà vẫn xếp đúng = item hỏng** (đang đo trí nhớ tranh, không đo nghe).
  - `en_classroom_command`: chỉ đo **nhận diện** lệnh (chọn tranh hành động đúng); phần làm-động-tác thật thuộc offline-task, không ép ở đây.
- **Từ đích phải nằm trong vốn từ chủ đề** (§4) và có asset khả thi (assets_library category tương ứng hoặc Static Primitive Pack cho colors/shapes/numbers).

## 8. RÀNG BUỘC KHÁC
- **1 sentencePattern/tuần** (§2): 8 activity cùng pattern (trừ activity ôn spiral). KHÔNG nhét 2 mẫu câu vào 1 tuần.
- **Lặp từ — GIÃN CÁCH, không DỒN.** Luật cũ ("không lặp 1 targetWord quá 2 lần trong 1 chủ đề") ĐÃ GỠ vì mâu thuẫn trực tiếp với §1: không thể vừa cấm lặp trong block vừa đòi mỗi từ ≥5 lượt. Luật mới:
  - **Trong 1 buổi:** 1 lexeme ≤ **3/8** bài (validator `WEEK_LEXEME_MASSED`).
  - **Trong block 4 tuần:** từ lõi PHẢI xuất hiện ở **≥2 tuần khác nhau** — 3 lượt cùng buổi yếu hơn hẳn 3 lượt cách nhau nhiều tuần.
  - Đọc file các tuần trước cùng `themeCode` để biết từ nào đã đủ lượt, từ nào còn thiếu.
- **`targetLexemes` khai TƯỜNG MINH mỗi seed** (mảng): chỉ liệt kê từ được **ĐỌC bằng tiếng Anh**. KHÔNG kê distractor ảnh (bé không nghe tên nó). KHÔNG kê danh từ scaffold mà mọi option đều có (trong "the big red star" với 3 option đều là star → `["big","red"]`, không có `star`). Cụm cố định là MỘT lexeme: `["thank you"]`.
- **Guardrail audio_select** (nếu dùng): ≤3 options, clip ≤4 từ, (runtime lo phát-lại-không-giới-hạn).
- Chỉ actionType hợp lệ tiếng Anh (đã gồm `audio_select`); cả 14 skill đều dùng được.

## 8b. CHẠY VALIDATOR (bắt buộc, sau khi ghi file)

```bash
cd kido-pipeline && npx ts-node src/scripts/lint-seeds.ts 'seeds/w{WW}-en.json'
```

Phần **KIỂM CẤP TUẦN** phải sạch. Mã lỗi hay gặp:
- `WEEK_SKILL_FEASIBLE` — skill không nằm trong ô `valid` của chủ đề (§4.1), hoặc `themeCode` không có trong bảng §4.
- `WEEK_COUNT` / `WEEK_INDEX` / `WEEK_DIFFICULTY` — sai cấu trúc 8 bài, index 1..8, hoặc phân bố 2/4/2.
- `WEEK_ACTION_SPREAD` (warning) — 1 actionType chiếm >4/8, hoặc chỉ có 1 loại.

Còn `critical` thì **sửa rồi chạy lại**, đừng ghi đè lỗi.

## 9. TỰ KIỂM trước khi ghi (bỏ seed nào fail, sinh lại)
- [ ] 8 seed, day D3, activityIndex 1..8, difficulty `warmup×2, core×4, challenge×2`.
- [ ] Cùng themeCode + sentencePattern (trừ activity ôn spiral có reviewOf).
- [ ] **Mọi skillCode nằm trong ô `valid` của chủ đề** (§4.1 matrix) — không tự ý mở rộng.
- [ ] **Đọc dọc 8 dòng "trẻ thực sự làm gì"**: không có ≥5 dòng trùng nhau.
- [ ] **Từ đích đúng lớp kênh** (§2.1): hành vi lời nói → `audio_select`; biến cá nhân → offline-task, KHÔNG sinh in-app.
- [ ] ≥2 actionType, không lặp 1 loại >4/8; actionType ∈ hợp lệ của skill; KHÔNG count_tap/compare_tap.
- [ ] **questionCore là câu lệnh TIẾNG ANH lấy đúng từ bộ khung cố định** (§6) — không "Bé"/"Đô Đô", không chế câu mới; answerSpec đúng grammar; không nhãn A/B/C.
- [ ] Mỗi seed đo đúng năng lực nghe (§7), distractor sai vì lý do ngôn ngữ.
- [ ] `targetLexemes` khai tường minh mỗi seed; thuộc vốn từ chủ đề + có asset khả thi.
- [ ] **1 lexeme ≤3/8 bài trong buổi này** (luật cũ "≤2 lần/chủ đề" ĐÃ GỠ — xem §8); từ lõi phải quay lại ở tuần khác của chủ đề để đạt giãn cách.

## 10. GHI FILE
Ghi `kido-pipeline/seeds/w{WW}-en.json` (2 chữ số, hậu tố `-en` để tách seed Toán):
```json
{
  "metadata": {
    "subject": "tieng_anh", "week": 5, "quarter": 1, "day": "D3",
    "themeCode": "colors", "sentencePattern": "It's ___.",
    "themeWeekIndex": 1,
    "stage": "<Q1..Q4 hoặc tên giai đoạn tuổi>",
    "totalSeeds": 8,
    "chosenSkills": ["<skill đã dùng>"],
    "targetLexemes": { "<từ đích>": "<số lượt trong tuần này>" },
    "lexemeNote": "<vì sao từ X không có mặt dù xuất hiện trên màn hình — vd distractor ảnh>",
    "pendingFields": false,
    "generatedBy": "schedule-routine", "version": "english-v1.2"
  },
  "seeds": [ /* 8 seed */ ]
}
```
Sau khi ghi: in tóm tắt (tuần, chủ đề, sentencePattern, skill, targetLexemes + số lượt, phân bố actionType). KHÔNG import DB (bước riêng). DỪNG — lần chạy sau tự làm tuần kế tiếp.

---

## Ghi chú vận hành
- **Nhịp:** cần ≥48 lần fire (8 seed/lần → 384 seed). Muốn nhanh: sửa Mục 1 thành "sinh 2–4 tuần mỗi lần" (chất lượng ổn tới ~1 chủ đề = 4 tuần/lần vì cùng vốn từ).
- **Phụ thuộc đã mở khoá:** `audio_select` land 2026-07-14 → cả 14 skill dùng được, mỗi tuần 8 activity. Hành vi lời nói (hello/thank you) và mẫu câu trả lời (`"Yes, I do."`) CHỈ sinh được qua `audio_select` — xem bảng 4 lớp từ vựng ở curriculum §2.
- **Nguồn chân lý:** đổi chủ đề/mẫu câu/skill chỉ sửa `docs/KIDO_ENGLISH_CURRICULUM.md`. Khi có `KIDO_ENGLISH_SKILL_CATALOG.md` (construct/antiPattern chi tiết + mapping difficulty 1|2|3), thêm nó vào Mục 0 như math routine dùng `skill-catalog.ts`.
- **Import sau khi có file:** `cd kido-pipeline && npm run import-seeds` (khi import step đã nhận subject tiếng_anh + day D3).
