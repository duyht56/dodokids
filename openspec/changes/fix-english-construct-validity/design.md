## Context

Tuần 1 tiếng Anh qua hết mọi lớp kiểm hiện có nhưng hỏng về sư phạm (chi tiết ở proposal.md). Chẩn đoán ban đầu đã qua một vòng review phản biện của Codex; hai lập luận bị bác và đã sửa trong change này:

1. **"Hành vi lời nói không kiểm được bằng chọn"** — quá mạnh. Đúng cho **kênh ảnh**, sai khi phát biểu tuyệt đối: `audio_select` theo tình huống kiểm được năng lực ngữ dụng tiếp nhận. Taxonomy trong spec đã sửa thành 4 lớp theo *kênh*, không phải "kiểm được / không kiểm được".
2. **"Đổi luật đa dạng từ actionType sang domain"** — bị bác, và bản thân đề xuất thay thế của Codex cũng không đứng vững (xem Quyết định 1).

Ràng buộc nền: trẻ 4–6 tuổi chưa biết đọc; app audio-first, **không có mic** (đã loại ASR vì vi phạm no-stress); chỉ `audio_select` mang được âm thanh (≤3 options, clip ≤4 từ), 4 actionType còn lại chỉ nhận ảnh.

## Goals / Non-Goals

**Goals:**
- Chặn W1-kiểu-mới **từ đầu vào** (feasibility matrix) thay vì phát hiện sau khi đã sinh.
- Biến chính sách soạn seed từ chữ trong prompt thành kiểm tra deterministic chạy được.
- Gỡ drift giữa routine/curriculum và repo (audio_select, "4 activity", §5.2 vs §7).
- Q1 chạy trọn vòng seed→publish→mobile với chi phí gen ảnh 0.

**Non-Goals:**
- Không đụng wire contract (`docs/kido-activity-schema.ts`), mobile, kido-server.
- Không thêm `constructSignature` như một field mới (xem Quyết định 1).
- Không sửa mục tiêu 300–500 từ ở §1 trong change này — chỉ ghi nhận sai số học và đưa lên Human Gate.
- Không viết lại W2–W48; change này chỉ dựng khung + viết lại W1 làm mẫu.

## Decisions

### Quyết định 1: Không dùng quota phân bố — dù trục nào

Ba trục đã cân nhắc, và **cả ba đều thất bại** trên chính W1:

| Luật | Chạy trên W1 | Kết quả |
|---|---|---|
| actionType ≥3, ≤4/8 (hiện tại) | single×4, multi×3, sort×1 | **PASS** — không bắt được |
| domain ≥3, ≤4/8 (đề xuất ban đầu) | vocab 6, listen 1, literacy 1 | FAIL — nhưng đánh oan tuần `colors` tốt (6/8 vocab là bình thường) |
| skillCode ≥3 construct, ≤4/8 (Codex đề xuất) | 4 skill, max 3/8 | **PASS** — không bắt được |

Luật của Codex không bắt được chính seed mà nó đồng ý là hỏng. Lý do sâu hơn: W1 sập vì **chủ đề chỉ có một chiều phân biệt**, không vì chọn skill lệch. Cùng bộ skill đó đặt vào `colors` thì `en_word_recognition` ("nghe red → chọn đỏ") và `en_category_select` ("nghe warm colors → chọn tất cả") là hai construct thật. Khác biệt nằm ở **chủ đề**, không ở nhãn skill — nên không luật phân bố nào phân biệt được.

→ Giữ actionType làm guardrail UI (chống mỏi thao tác) như cũ. Việc chặn chất lượng chuyển sang **feasibility matrix** (đầu vào) + **shortcut test** ở seed-review (từng item).

Cân nhắc và loại: thêm field `constructSignature` dạng enum để đếm được. Loại vì nó chỉ đẩy vấn đề sang chỗ khác — hai item cùng `constructSignature` vẫn có thể là một ánh xạ khi chủ đề mỏng, và ngược lại.

### Quyết định 2: Feasibility matrix sống trong code, không chỉ trong doc

Ma trận đặt trong `english-skill-catalog.ts` (cạnh `ENGLISH_SKILL_CATALOG`) để `lint-seeds.ts` đọc trực tiếp. Doc `KIDO_ENGLISH_CURRICULUM.md` §4.1 là bản người đọc; code là nguồn chân lý cho validator — cùng mô hình `skill-catalog.ts` đang mirror `KIDO_MATH_SKILL_CATALOG_V2.md`.

Hình dạng: `Record<themeCode, Partial<Record<skillCode, 'valid' | 'invalid' | 'asset-blocked'>>>`, mặc định khuyết = `invalid` (allowlist, không phải denylist — an toàn hơn cho chủ đề mới).

### Quyết định 3: `shapes` dùng mẫu câu `"It's a red circle."`

Static Primitive Pack có **8 hình × 8 màu × 4 size = 256 biến thể**, nhưng chỉ **8 khái niệm hình** (`circle, square, triangle, star, heart, diamond, pentagon, hexagon` — [primitive-pack.ts:30](../../../kido-pipeline/src/curriculum/primitive-pack.ts)). Con số "337 asset" là số **file**, không phải số khái niệm. Bỏ `pentagon`/`hexagon` (không hợp 4–6 tuổi, ngoài phạm vi phỏng vấn lớp 1) còn **6 từ dùng được cho 32 activity** — mỏng.

Kết hợp thuộc tính giải được: 6 hình × 8 màu = **48 tổ hợp**, và đó đúng là construct của `en_attribute` ("nghe cụm tính từ + danh từ → chọn đúng"). Chủ đề `shapes` do đó thành nơi **ôn lại `colors` qua tổ hợp** — spiral thật chứ không phải spiral dán nhãn.

Ghi nhận: pack **thiếu `rectangle` và `oval`** — hai hình mầm non chuẩn. Không thêm primitive trong change này; nếu vốn từ cần chúng thì mở change riêng cho `primitive-pack.ts`.

### Quyết định 4: `animals` giữ nguyên mẫu câu

Codex đề xuất đổi `animals` sang `"I like ___."`, nhưng `food` (tuần 21–24) **đã dùng đúng câu đó**. Đổi sẽ làm hai chủ đề liền kề trùng mẫu câu và `animals` mất vai trò "dạy dạng câu trả lời" của khối `like` mà §3 cố ý xếp.

→ Giữ `"Yes, I do. / No, I don't."`, nhưng khai báo rõ là pattern **chỉ sinh được bằng `audio_select`**. Từ vựng con vật vẫn dùng chọn ảnh bình thường.

### Quyết định 5: Validator mở rộng `lint-seeds.ts`, không tạo file mới

[lint-seeds.ts:76](../../../kido-pipeline/src/scripts/lint-seeds.ts) đã có `perWeek` nhưng chỉ đếm seed lỗi. Glob mặc định `seeds/w*.json` **đã bắt cả `w01-en.json`**. Mở rộng chỗ này rẻ hơn và tránh hai đường lint song song.

Nhóm theo `(week, day, subject)` chứ không theo file, vì file toán chứa 2 ngày (D1 + D4 = 16 seed) còn file tiếng Anh 1 ngày (D3 = 8 seed).

## Risks / Trade-offs

**[Ma trận allowlist chặn quá tay khi thêm chủ đề mới]** → Mặc định khuyết = `invalid` sẽ làm chủ đề mới không sinh được seed nào cho tới khi khai báo. Đây là chủ ý (fail loud), nhưng cần ghi rõ trong routine để người vận hành không tưởng là bug.

**[Feasibility matrix là phán đoán người, không phải phép đo]** → Ô `valid`/`invalid` do người điền, có thể sai như bảng §4 cũ đã sai. Giảm thiểu: mỗi ô `invalid` phải kèm lý do một dòng, để review được thay vì tin mù.

**[Shortcut test vẫn dựa vào LLM ở seed-review]** → Phần chặn mạnh nhất (từng item có thật sự cần tiếng Anh không) vẫn không deterministic. Change này không giải quyết; nó chỉ đảm bảo phần *cấu trúc* thì deterministic. Ghi nhận là giới hạn đã biết.

**[Đổi thứ tự chủ đề là BREAKING với nội dung đã sinh]** → Hiện chỉ có `w01-en.json` (chủ đề `hello`), **chưa import DB, chưa publish**. Không có activity production nào bị ảnh hưởng. Nếu sau này đã có seed W1–W12 thì change này phải kèm bước migrate.

## Migration Plan

1. Sửa doc + code (matrix, validator) trước — chưa đụng nội dung.
2. Chạy validator lên `w01-en.json` **hiện tại** để chứng minh nó bắt được lỗi cũ (kỳ vọng: `WEEK_SKILL_FEASIBLE` critical vì `hello` không còn trong bảng chủ đề).
3. Viết lại `w01-en.json` theo `colors`, chạy validator lại — kỳ vọng sạch.
4. Human Gate duyệt §4 (thứ tự chủ đề) + §1 (mục tiêu từ vựng) trước khi chạy routine cho W2+.

Rollback: change thuần doc + validator + 1 file seed chưa import. Revert file là đủ; không có state ngoài repo.

## Open Questions

**Cần Human Gate (quyết định sản phẩm, không phải kỹ thuật):**

1. **Mục tiêu 300–500 từ ở §1 sai số học.** Yêu cầu mỗi từ xuất hiện ≥3 activity cần 900–1500 lượt từ; 384 activity × 1 `targetWord` = 384 lượt. Hụt 2,3–3,9 lần. Hai lối: (a) seed mang nhiều từ mỗi item + thêm lexical coverage ledger, hoặc (b) hạ con số xuống ~120–150 từ. Change này không tự quyết.

2. **Chủ đề thứ 12 thay `hello`: `shapes` hay `classroom_objects`?** `shapes` thắng về chi phí (asset = 0) nhưng mỏng (6 khái niệm) và trùng nội dung với môn Toán. `classroom_objects` gần school-readiness hơn nhưng tốn asset. Change này giả định `shapes`.

3. **`pentagon`/`hexagon` có vào vốn từ không?** Đề xuất: không (ngoài phạm vi 4–6 tuổi). Nếu loại thì cần cân nhắc bổ sung `rectangle`/`oval` vào Primitive Pack ở change riêng.

**Kỹ thuật, tự quyết được:**

4. Ngưỡng `WEEK_ACTION_SPREAD` nên là ≥2 hay ≥3 actionType? Đề xuất ≥2 (mức warning), vì ép loại thứ ba thường sinh item giả — đúng cơ chế đã tạo ra 3 bài `multi_select` thừa trong W1.
