# Kido — Seed Authoring Prompt (nguồn sinh seed bằng AI)

Nguồn sinh seed hiện tại **không phải script** — người biên soạn nhờ **Gemini/Claude** tạo file seed JSON, rồi import qua `/api/pipeline/import-seeds` (hoặc `npm run import-seeds`).

Sau khi chẻ `questionCore` → `questionCore` + `answerSpec` (change `seed-answerspec-split`), file seed **phải có đủ 2 field**. Dán nguyên khối prompt dưới đây cho model khi nhờ tạo seed.

---

## PROMPT (copy nguyên khối)

> Bạn là người biên soạn học liệu toán mầm non 4–6 tuổi cho app Kido (Việt Nam). Hãy tạo seed dưới dạng **JSON hợp lệ** theo đúng schema và quy tắc sau.
>
> ### Cấu trúc file
> ```json
> { "seeds": [ { /* seed */ }, ... ] }
> ```
>
> ### Mỗi seed gồm các field
> | Field | Kiểu | Ghi chú |
> |---|---|---|
> | `seedId` | string | Format `SEED-<subject>-w<NN>-D<d>-<II>` (vd `SEED-toan-w01-D1-06`, `SEED-tieng_viet-w01-D2-03`). `NN` = tuần 2 chữ số, `II` = activityIndex 2 chữ số |
> | `week` | number | Tuần |
> | `day` | `"D1"` \| `"D2"` \| `"D3"` \| `"D4"` \| `"D5"` | **Theo môn:** `toan` → D1/D4 · `tieng_anh` → D3 · `tieng_viet` → **D2/D5**. Không trộn. |
> | `quarter` | 1–4 | |
> | `subject` | `"toan"` \| `"tieng_viet"` \| `"tieng_anh"` | |
> | `skillCode` | string | Dùng đúng skillCode canonical (danh sách bên dưới) |
> | `actionType` | `single_select` \| `multi_select` \| `sort_sequence` \| `match_pair` \| `count_tap` \| `compare_tap` \| `audio_select` | 7 loại (không dùng `watch_video`); `audio_select` CHỈ cho `tieng_viet`/`tieng_anh` |
> | `difficulty` | `"warmup"` \| `"core"` \| `"challenge"` | |
> | `activityIndex` | number | Vị trí trong lesson |
> | `questionCore` | string | **Câu hỏi ĐỌC CHO BÉ** |
> | `answerSpec` | string | **Spec đáp án/asset** — bắt buộc |
>
> ### Quy tắc TÁCH questionCore vs answerSpec (QUAN TRỌNG NHẤT)
> - `questionCore` = câu hỏi đọc lên cho bé (TTS). **NGẮN, rõ. TUYỆT ĐỐI KHÔNG** liệt kê số lượng/tên hình/vật, **KHÔNG** lộ đáp án.
> - `answerSpec` = mô tả **object cụ thể + đáp án đúng** (free-text tiếng Việt) để dựng đáp án/hình ảnh. **KHÔNG đọc cho bé.**
> - Ví dụ ĐÚNG:
>   ```json
>   { "questionCore": "Hình nào khác loại với các hình còn lại?",
>     "answerSpec": "3 hình cùng màu xanh: 2 hình tròn, 1 hình tam giác. Đáp án đúng: hình tam giác." }
>   ```
> - Ví dụ SAI (đừng làm): `"questionCore": "Tìm hình khác loại: 2 hình tròn và 1 hình tam giác cùng màu xanh"` ← trộn asset vào câu hỏi.
>
> ### Cách viết answerSpec theo từng actionType
> - `single_select`: liệt kê các lựa chọn + ghi rõ "Đáp án đúng: …".
> - `multi_select`: liệt kê nhóm + ghi rõ tập đáp án đúng (và loại cái nào).
> - `sort_sequence`: liệt kê các bước **theo đúng thứ tự** bằng `→`.
> - `match_pair`: liệt kê các cặp đúng `A ↔ B`.
> - `count_tap`: mô tả vật cần đếm + "Đáp án đúng: <số>". Số đếm phải nằm trong phạm vi tuần (W1–4: 3–10; W5–8: 6–12; W9–12: 10–15; W13–24: 12–20; W25+: 15–20).
> - `compare_tap` (CHỈ `math_compare_quantity`): CÙNG 1 vật 2 bên, khác số lượng. Format: `"vật = <vật đơn lẻ>; trái = <n>, phải = <m>; hỏi = nhiều hơn|ít hơn; đúng = trái|phải"`. Ví dụ: `"vật = quả táo đỏ; trái = 5, phải = 2; hỏi = nhiều hơn; đúng = trái"`. Mỗi bên 1..6, hai số KHÁC nhau; chênh lệch: warmup ≥3, core ≥2, challenge ≥1. `đúng` phải khớp `hỏi` (nhiều hơn → bên lớn).
> - `audio_select` (CHỈ `tieng_viet`/`tieng_anh`): đáp án là CLIP ÂM THANH. Format: `"clip1 = <từ/âm>; clip2 = <từ/âm>[; clip3 = <từ/âm>]; đúng = <clip khớp câu hỏi>"`. Ví dụ: `"clip1 = con cá; clip2 = con gà; đúng = con cá"`. 2..3 clip, mỗi clip ≤4 từ. Đề đọc cho bé ở `questionCore` (vd "Bé nghe và chọn con cá nhé"). KHÔNG mô tả ảnh — đáp án là tiếng, không phải hình.
>
> ### skillCode canonical (chọn đúng, không bịa)
>
> **Môn `toan` (D1/D4):**
> `math_count_1_20`, `math_count_1_20_adv`, `math_arithmetic_1_50`, `math_conditional_count`,
> `math_classify_1attr`, `math_classify_2attr`, `math_classify_2d`,
> `math_compare_quantity`, `math_compare_diff`,
> `math_pattern_ab`, `math_pattern_abc`, `math_pattern_adv`,
> `math_sequence_order`, `math_sequence_jump`,
> `math_matrix_2x2_basic`, `math_matrix_2x2_adv`, `math_matrix_logic`,
> `math_logic_causality`, `math_logic_elimination`,
> `math_geometry_base`, `math_geometry_flat`,
> `math_spatial_basic`, `math_spatial_2d`, `math_spatial_3d`,
> `math_measurement_base`, `math_tangram_transform`,
> `math_word_problems`, `math_verbal_math`.
>
> **Môn `tieng_viet` (D2/D5) — 31 skill sẵn contract.** Chi tiết construct/anti-pattern:
> `docs/KIDO_LANG_SKILL_CATALOG.md`. Tuần nào mở skill nào: `docs/KIDO_LANG_CURRICULUM.md`.
> *(2026-09-19 audit bám đề thi vào lớp 1: +`lang_initial_sound`, +`lang_listen_word_count`;
> HẠ `lang_syllable_count` & `lang_word_to_picture._noun` & `lang_action_word` mức dễ khỏi `core`.)*
> - *Âm vị* (`pho`): `lang_initial_sound` **(mới — nghe âm đầu → chọn ẢNH, không cần audio)**, `lang_syllable_count` *(chỉ warmup)*, `lang_rhyme_match`🔊, `lang_onset_match`🔊, `lang_tone_discriminate`🔊, `lang_oral_blend`🔊
> - *Từ vựng* (`voc`): `lang_word_to_picture` *(`_noun` chỉ warmup)*, `lang_picture_to_word`🔊, `lang_action_word` *(mức dễ chỉ warmup)*
> - *Ngữ nghĩa* (`sem`): `lang_antonym`🔊 (audio_select — KHÔNG vẽ đối cực bằng ảnh), `lang_category_member`, `lang_odd_word_out`, `lang_word_association`, `lang_part_whole`, `lang_verbal_analogy`
> - *Nghe hiểu* (`lis`): `lang_listen_word_count` **(mới — nghe → đếm số lần một TỪ, thẻ số)**, `lang_follow_instruction`, `lang_listen_detail`, `lang_listen_inference`, `lang_riddle`
> - *Tự sự* (`nar`): `lang_story_sequence`, `lang_story_causality`, `lang_story_character`
> - *Cú pháp* (`syn`): `lang_classifier`, `lang_position_word`, `lang_word_order`, `lang_question_word`
> - *Suy luận bằng lời* (`inf`): `lang_elimination`, `lang_if_then`, `lang_absurdity`, `lang_verbal_classification`
>
> 🔊 = dùng `actionType: audio_select`.
> **KHÔNG seed** (chưa dựng được): `lang_word_match` (match_pair chưa mang audio),
> `lang_phoneme_delete`, `lang_synonym`, `lang_story_retell` (post-MVP).
>
> **Môn `tieng_anh` (D3):** xem `docs/KIDO_ENGLISH_CURRICULUM.md` §5.
>
> ### Riêng môn `tieng_viet` (BẮT BUỘC)
> - **`domainCode`: BỎ TRỐNG.** Môn ngôn ngữ có hệ domain riêng, không thuộc union 13 domain
>   Toán. Đừng khai — đừng bịa ra `"pho"`/`"voc"` vào field này.
> - **Mute Test:** tắt tiếng đi, bé KHÔNG được đoán ra đáp án chỉ bằng nhìn ảnh. Distractor
>   phải chỉ khác nhau ở **nội dung ngôn ngữ**, KHÔNG khác màu/cỡ/hình/phong cách vẽ.
> - **Toddler Test (chống bài quá dễ):** *"bé 3 tuổi có làm đúng không?"* Nếu CÓ → viết lại.
>   Trẻ 5–6 có 2000+ từ — mèo/chó/thỏ, to/nhỏ, chạy/ngủ là tuổi lên 3. Cần ≥1 nguồn khó:
>   từ ít gặp (phễu, cân) · phân biệt tinh cùng nhóm hẹp (bò/bê/trâu/nghé) · cụm nhiều thành
>   phần ("con mèo đang ngủ trên ghế") · thuộc tính tinh (nông–sâu, rỗng–đầy) · ≥2 điều kiện
>   hoặc có phủ định. `warmup` ≠ dễ như tuổi lên 3. Miễn cho skill âm vị.
> - **Nhớ nghĩa từ / quy ước đời sống là ĐÚNG bản chất môn này** — khác môn Toán. Bài
>   "trời mưa → mặc áo mưa" HỢP LỆ ở `lang_story_causality` (nhưng CẤM ở `math_logic_causality`).
> - **KHÔNG hiện chữ tiếng Việt** trên UI của trẻ ở bất kỳ activity nào (không dạy mặt chữ).
> - `audio_select`: đáp án là clip; từ/âm mẫu đặt trong `questionCore`, KHÔNG mô tả ảnh.
>
> ### Yêu cầu chung
> - Nội dung phù hợp nhận thức 4–6 tuổi VN (riêng `toan`/`tieng_viet`: **5–6**), an toàn văn hoá, không bạo lực.
> - Object đa dạng trong cùng tuần (tránh lặp 1 object quá 2 lần).
> - Trả về **CHỈ JSON** (không markdown, không giải thích).

---

## Lưu ý vận hành

- Seed cũ chỉ có `questionCore` (thiếu `answerSpec`) vẫn import được: **seed reviewer tự tách** và đề xuất `answerSpec` (flag `ANSWER_SPEC_MISSING`) — bấm "Dùng đề xuất" để backfill. Nhưng nên tạo seed đủ 2 field ngay từ đầu.
- Generate **chặn** MVP seed thiếu `answerSpec` — phải qua reviewer backfill trước.
- Chi tiết pipeline: [KIDO_CONTENT_PIPELINE.md](KIDO_CONTENT_PIPELINE.md).
