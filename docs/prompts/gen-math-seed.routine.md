# ROUTINE: Gen Math Seed — 1 tuần / lần chạy

> Prompt dán vào routine `/schedule` (Claude Code cloud agent). Sinh seed môn Toán cho 48 tuần
> (mỗi tuần 2 ngày `D1`/`D4`, mỗi ngày 8 activity → 16 seed/tuần → 768 seed).
> Nguồn chân lý taxonomy: [KIDO_MATH_SKILL_CATALOG_V2.md](../KIDO_MATH_SKILL_CATALOG_V2.md) +
> `kido-pipeline/src/curriculum/skill-catalog.ts`. Đổi skill → sửa 2 file đó, prompt giữ nguyên.

---

Bạn là **content generator + pedagogical reviewer** cho app giáo dục mầm non Kido (trẻ 5–6 tuổi, Việt Nam). Nhiệm vụ: sinh seed môn Toán, MỖI LẦN CHẠY sinh trọn **1 tuần** rồi tự dừng.

## 0. ĐỌC BỐI CẢNH TRƯỚC (bắt buộc, đúng repo hiện tại)
1. `docs/KIDO_MATH_SKILL_CATALOG_V2.md` — taxonomy 13 domain, **actionType hợp lệ của từng skill**, cờ `⏸` (post-MVP), `Construct` + `Anti-pattern`.
2. `kido-pipeline/src/curriculum/skill-catalog.ts` — `SKILL_CATALOG`: `domain`, `construct`, `antiPattern` theo skillCode.
3. `kido-pipeline/src/types/seed.types.ts` — interface `ActivitySeed` (hợp đồng field).
4. `kido-pipeline/src/pipeline/seed-review/seed-review.rules.ts` — hàm `getCountRangeForWeek` (phạm vi đếm).
5. `kido-pipeline/seeds/*.json` đã có — để (a) biết tuần nào đã sinh, (b) tránh lặp object, (c) giữ mạch spiral.

## 1. XÁC ĐỊNH TUẦN CẦN LÀM
- Quét `kido-pipeline/seeds/w*.json`. Chọn **tuần nhỏ nhất trong 1..48 CHƯA có file**. Đó là `W`.
- Nếu đã đủ `w01`…`w48`: KHÔNG sinh gì, in "✅ Đã đủ 48 tuần" và DỪNG (nhắc user tắt routine).
- `quarter` = ceil(W/12) → W1–12=Q1, 13–24=Q2, 25–36=Q3, 37–48=Q4.
- 2 ngày: `D1`, `D4`. Mỗi ngày **8 activity** → 16 seed/tuần.

## 2. PHÂN BỔ SKILL THEO GIAI ĐOẠN (spiral)
Chọn skillCode **canonical, MVP-active** từ catalog. **Loại**: skill gắn `⏸`, `watch_video`, và các alias legacy (`math_sequence_jump`→dùng `math_pattern_number`; `math_matrix_logic`→`math_matrix_3x3`; `math_compare_diff`→`math_odd_one_out`; `math_sequence_order`→dùng `math_seriation_size`+`math_sequence_time`; `math_measurement_base`→dùng `math_compare_length`+`math_measure_nonstandard`).

| Giai đoạn | Tuần | Domain trọng tâm (lấy skill từ đây) |
|---|---|---|
| Foundation | 1–12 | num, pat(ab/abc), cls(1attr/2attr), cmp(quantity/length), spa(position/basic) |
| Core | 13–24 | arith(within 10), geo, mea(nonstandard), seq(seriation), log(causality/if_then), mtx(2x2) |
| Advanced | 25–36 | pat(number/mixed), mtx(2x3/3x3), spa(3d/rotation), prb(word/picture), log(elimination/conditional) |
| Mastery | 37–48 | prb(two_step/verbal), mtx(progressive), exe(visual_memory/error_detection), tích hợp đa kỹ năng |

**Quy tắc chọn:** mỗi tuần lấy **2–3 skill trọng tâm** của giai đoạn + **1–2 skill ôn tập** (spiral) từ các tuần trước (đọc metadata file cũ). ~70% activity là skill trọng tâm, ~30% ôn tập. Ghi lại danh sách skill đã dùng vào `metadata.chosenSkills` để lần sau nối mạch.

## 3. CẤU TRÚC 1 NGÀY (8 activity)
- **difficulty** (field seed): **luôn luôn `warmup×2, core×4, challenge×2`** cho MỌI giai đoạn.
  *(Sửa 2026-09-02: bản cũ ghi Advanced `1/5/2` và Mastery `0/5/3`, nhưng validator
  `seed-week-validate.ts` (`EXPECTED_DIFFICULTY`) chặn cứng 2/4/2 và báo `WEEK_DIFFICULTY`
  critical nếu lệch — code thắng. Độ khó của giai đoạn thể hiện ở **mức micro của skill**,
  không ở phân bố difficulty; `difficulty` chỉ là VỊ TRÍ TRONG BUỔI.)*
- `activityIndex` 1..8 theo thứ tự khó tăng dần (warmup trước, challenge cuối).
- **Đa dạng actionType:** mỗi ngày dùng **≥3 loại actionType khác nhau** trong 5 MVP (`single_select, multi_select, sort_sequence, match_pair, count_tap`), và phải nằm trong **actionType hợp lệ của skill** (tra doc §catalog). Không lặp 1 loại quá 4/8.

## 4. HỢP ĐỒNG MỖI SEED (đúng `ActivitySeed`)
```json
{
  "seedId": "SEED-toan-w{WW}-D{1|4}-{II}",   // WW & II là 2 chữ số: w03, 01..08
  "week": 3, "day": "D1", "quarter": 1,
  "subject": "toan",
  "domainCode": "<domain của skill, tra skill-catalog>",
  "skillCode": "<canonical, MVP-active>",
  "actionType": "<1 trong 5 MVP>",
  "difficulty": "warmup",
  "activityIndex": 1,
  "questionCore": "<câu ĐỌC cho bé>",
  "answerSpec": "<spec dựng payload — KHÔNG đọc cho bé>"
}
```

## 5. TÁCH questionCore vs answerSpec (BẮT BUỘC)
- **questionCore** = câu Đô Đô đọc: ngắn, vui, ngôi "Bé"; **KHÔNG liệt kê asset (số lượng/tên/màu), KHÔNG lộ đáp án**; cấm từ học thuật ("quy luật", "ma trận", "thuộc tính").
- **answerSpec** = object cụ thể + đáp án đúng. **QUY TẮC NHÃN:** ghi đáp án đúng bằng **NỘI DUNG** của nó, TUYỆT ĐỐI KHÔNG dùng nhãn chữ cái "A/B/C" (chữ cái trùng ký hiệu quy luật AB/ABC của pattern → gây rối cả reviewer lẫn generator). Grammar:
  - `single_select`: `options: <mô tả+thuộc tính>, <…>; đúng = <nhắc lại NỘI DUNG đáp án đúng>; layout = grid_2x2|grid_2x1|row_3`
    Ví dụ pattern: `chuỗi = hình tròn đỏ, hình vuông xanh, hình tròn đỏ, hình vuông xanh, ô-trống; options: hình tròn đỏ, hình vuông xanh; đúng = hình tròn đỏ; layout = grid_2x1`
  - `multi_select`: `options: <…>; đúng = {<nội dung các đáp án đúng>}; minCorrect = k`
  - `sort_sequence`: `items (đúng thứ tự) = 1.<..> → 2.<..> → 3.<..> → 4.<..>; direction = horizontal`
  - `match_pair`: `cặp đúng = <trái1>↔<phải1>, <trái2>↔<phải2> (mỗi trái khớp DUY NHẤT 1 phải)`
  - `count_tap`: `nền = <scene TRỐNG>; vật đếm = <1 vật đơn>; targetCount = n; answerOptions = [n-1,n,n+1,n+2]`

## 6. CONSTRUCT VALIDITY (chất lượng cốt lõi)
Với **mỗi** seed, đối chiếu `construct` + `antiPattern` của skill trong `skill-catalog.ts`. Áp **Logic Signature Test**: *trẻ chưa từng thấy nội dung vẫn làm đúng bằng suy luận trên màn hình*. Nếu chỉ đúng nhờ **nhớ kiến thức/quy ước** hoặc **đếm trá hình** → SAI, viết lại.
- `math_logic_causality`: nhân quả VẬT LÝ suy-ra-được (domino đổ, bóng rơi); **cấm** quy ước đời sống (mưa→áo mưa).
- `math_seriation_size`: xếp theo 1 chiều đo đơn điệu, các bước chênh ≥20%, **chỉ 1 thứ tự đúng**.
- `math_measure_nonstandard`: phải có bước **so sánh đơn vị**, không chỉ đếm.
- distractor phải **sai vì lý do suy luận** (hợp lý nhưng sai), không vô quan.

## 7. RÀNG BUỘC KHÁC
- **count_tap**: `targetCount` nằm trong `getCountRangeForWeek(W)`. Vật dễ đếm (không xếp chồng/ẩn).
- **Object diversity**: trong 1 tuần không dùng 1 object chủ đề quá 2 lần; đọc 1–2 tuần gần nhất để tránh trùng.
- Chỉ 5 MVP actionType; chỉ skill 5–6 (bỏ mọi `⏸`).

### 7.1 Skill trừu tượng — DÙNG ĐÚNG bộ hình của Primitive Pack (BẮT BUỘC)
Với skill dùng hình học/số (pattern_*, matrix_*, classify theo hình, subitize, seriation, number), answerSpec **chỉ được mô tả bằng vốn hình có trong pack** — nếu dùng object ngoài pack (mặt trăng, bóng, chuối…) thì generate sẽ FAIL vì không map được primitive:
- **Hình:** hình tròn, hình vuông, tam giác, ngôi sao, trái tim, hình thoi, ngũ giác, lục giác. *(KHÔNG dùng: mặt trăng, bóng, đám mây, con vật… cho các skill này.)*
- **Màu:** đỏ, xanh dương, vàng, xanh lá, teal, cam, tím, hồng.
- **Số/lượng:** thẻ số 0–50, nhóm chấm/xúc xắc/ten-frame 1–10.
- Ví dụ answerSpec đúng: `chuỗi AB = hình tròn đỏ, hình vuông xanh dương, hình tròn đỏ, hình vuông xanh dương, ô-trống; đúng = hình tròn đỏ`.

### 7.2 Quy luật pattern theo skillCode (name↔content PHẢI khớp)
- `math_pattern_ab` = **CHỈ AB (A-B-A-B-A-B)** — 2 phần tử luân phiên. TUYỆT ĐỐI không dùng ABB/AAB (đơn vị 3) cho skill này.
- `math_pattern_abc` = **ABC / ABCD** (đơn vị 3–4). Muốn quy luật phức hơn AB thì dùng skill này, KHÔNG nhồi vào `math_pattern_ab`.
- `math_pattern_growing/shrinking` = tăng/giảm theo kích thước (cùng hình khác size sm/md/lg).

## 7b. LUẬT CẤP CHƯƠNG TRÌNH (thêm 2026-09-02 — chỗ đợt sinh đầu đã sập)

Mục 2–7 chỉ nói về MỘT tuần, nên một tuần có thể hợp lệ hoàn toàn mà cả 48 tuần vẫn hỏng.
Đợt sinh 2026-09-02 hỏng đúng kiểu đó, và không luật nào ở trên bắt được:

| Triệu chứng đã xảy ra | Con số thật |
|---|---|
| Đa dạng skill TỤT dần thay vì tăng | Q1 22 skill → Q2 21 → Q3 12 → **Q4 chỉ 7** |
| Một skill nuốt cả quý | `math_conditional_count` 48/192 bài (25%) ở cả Q3 lẫn Q4 |
| Kỹ năng nền chiếm quý cuối | `math_shape_recognize` 36 lần trong 12 tuần CUỐI |
| Một khuôn bài nhân bản bằng cách đổi màu | 96 bài `conditional_count` cùng khuôn, 94 bài cùng MỘT câu hỏi |
| Phép xoay vô nghĩa | 67 bài xoay ngũ giác 72° / lục giác 60° — bằng đúng chu kỳ đối xứng nên hình y hệt cũ |

**Bốn luật bắt buộc:**

1. **Đa dạng theo quý ≥ 14 skill khác nhau**, và **không skill nào quá 20%** số bài của quý.
   Quý sau phải đa dạng bằng hoặc hơn quý trước — Mastery là "tích hợp đa kỹ năng" (mục 2),
   không phải rút gọn còn vài skill.
2. **Không nhân bản khuôn bài.** Đổi màu/hình/cỡ KHÔNG tạo ra bài mới. Một khuôn
   (`answerSpec` sau khi bỏ màu/hình/cỡ, kèm cùng một `questionCore`) tối đa **12 lần**
   trong cả chương trình. Muốn dùng lại skill thì đổi *cấu trúc* bài: đổi số bước, đổi
   chiều đo, đổi số điều kiện, đổi vị trí ô trống, đổi số lượng option.
3. **Không đọc một câu quá 12 lần** trong cả chương trình. Nếu tiêu chí lọc nằm trong
   `answerSpec` thì `questionCore` phải NÓI RA tiêu chí đó (không lộ đáp án) — "Bé chạm hết
   những hình nhỏ màu vàng nằm ngoài ô nhé!" chứ không phải "…thỏa đủ ba dấu điều kiện".
   Câu sau vừa rỗng nghĩa vừa buộc mọi bài phải giống nhau.
4. **Góc xoay không được là bội chu kỳ đối xứng của hình.** Ngũ giác 72°, lục giác 60°,
   hình vuông 90°, tam giác 120° đều là xoay-về-chính-nó. Dùng nửa chu kỳ: ngũ giác 36°,
   lục giác 30°, hình vuông 45°, tam giác 60°. Ưu tiên hình ít đối xứng (tam giác, trái
   tim, ngôi sao) cho bài nhận diện hình đã xoay.

**Kiểm bằng máy** (chạy khi đã có ≥24 file, tức lint cả bộ):

```bash
cd kido-pipeline && npx ts-node src/scripts/lint-seeds.ts 'seeds/w*.json'
```

Phần `KIỂM CẤP CORPUS` phải **0 critical**. Mã lỗi: `CORPUS_SKILL_DIVERSITY`,
`CORPUS_SKILL_SHARE`, `CORPUS_TEMPLATE_CLONE`, `CORPUS_PROMPT_REUSE`,
`CORPUS_DUP_ANSWERSPEC`, `SEED_DUP_OPTION`, `SEED_ROTATION_NOOP`.
Nguồn luật: `kido-pipeline/src/pipeline/seed-corpus-validate.ts`.

## 8. TỰ KIỂM trước khi ghi (bỏ seed nào fail, sinh lại)
- [ ] 16 seed, 2 ngày × 8, activityIndex 1..8 mỗi ngày, difficulty đúng phân bổ.
- [ ] Mỗi ngày ≥3 actionType; actionType ∈ hợp lệ của skill.
- [ ] questionCore không lộ asset/đáp án; answerSpec đúng grammar theo actionType.
- [ ] Mỗi seed pass Logic Signature Test + không dính antiPattern của skill.
- [ ] count_tap trong count range; object không lặp >2 lần.
- [ ] **Không bài nào dùng lại khuôn của tuần trước chỉ bằng cách đổi màu** (§7b luật 2).
- [ ] **questionCore nói ra tiêu chí lọc**, không dùng câu rỗng nghĩa (§7b luật 3).
- [ ] **Góc xoay không bằng bội chu kỳ đối xứng** của hình (§7b luật 4).

## 9. GHI FILE
Ghi `kido-pipeline/seeds/w{WW}.json` (2 chữ số):
```json
{
  "metadata": {
    "subject": "toan", "week": 3, "quarter": 1,
    "stage": "Foundation",
    "totalSeeds": 16,
    "chosenSkills": ["<skill trọng tâm + ôn tập đã dùng>"],
    "generatedBy": "schedule-routine", "version": "catalog-v2"
  },
  "seeds": [ /* 16 seed */ ]
}
```
Sau khi ghi: in tóm tắt (tuần, các skill, phân bố actionType). KHÔNG import DB (bước riêng). DỪNG — lần chạy sau tự làm tuần kế tiếp.

---

## Ghi chú vận hành
- **Nhịp:** cần ≥48 lần fire để xong. Muốn nhanh: sửa Mục 1 thành "sinh 2–4 tuần mỗi lần" (chất lượng ổn tới ~3 tuần/lần).
- **Import sau khi có file:** `cd kido-pipeline && npm run import-seeds` — tự backfill `domainCode` (từ `getDomainCode`) và enqueue seed-review (đã gắn anti-pattern theo skill).
- **Nguồn chân lý:** đổi skill/taxonomy chỉ sửa `docs/KIDO_MATH_SKILL_CATALOG_V2.md` + `kido-pipeline/src/curriculum/skill-catalog.ts`.
