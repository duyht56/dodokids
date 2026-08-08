## Why

Tuần 1 tiếng Anh (`kido-pipeline/seeds/w01-en.json`) **qua hết mọi lớp kiểm** hiện có nhưng hỏng về sư phạm: 6/8 activity là cùng một ánh xạ (nghe `hello`/`goodbye`/`thank you` → chọn ảnh cử chỉ), và vì ba từ đó là **hành vi lời nói không có vật quy chiếu**, trục phân biệt của cả tuần rút về "vẫy tay quay mặt vào hay quay lưng đi" — một quy ước vẽ tranh, không phải tiếng Anh. Pose trở thành *mã phụ* trẻ học thay cho từ, giết khả năng transfer sang người và tình huống mới.

Ba nguyên nhân gốc, không cái nào là lỗi của người viết seed:

1. **Chủ đề `hello` không đủ vốn từ kiểm được** cho 32 activity (4 tuần × 8). Kênh ảnh chỉ kiểm được từ có vật quy chiếu; hành vi lời nói cần `audio_select` theo tình huống, và cả chủ đề chỉ đỡ được vài item.
2. **Không có validator cấp tuần.** Luật "≥3 actionType, ≤4/8" chỉ nằm dưới dạng chữ trong routine; `lint-seeds.ts` lint từng seed, phần `perWeek` chỉ đếm seed lỗi chứ không kiểm phân bố. W1 "PASS" vì chính sách chưa bao giờ được enforce.
3. **Routine đã lệch khỏi repo.** `audio_select` land 2026-07-14 nhưng routine vẫn chặn 3 skill phụ thuộc nó ở nhiều chỗ; routine còn 5 chỗ ghi "4 activity" trong khi lesson canonical là 8; curriculum §5.2 ghi "chờ land" còn §7 ghi "đã land".

Sửa riêng W1 không giải quyết gì — tuần 25 (`animals`, mẫu câu `"Yes, I do./No, I don't."`) sẽ lặp lại đúng lỗi này.

## What Changes

**Ranh giới đo được (nền của mọi thay đổi khác).** Phân loại từ vựng theo kênh kiểm được, thay cho giả định ngầm "mọi từ đều chọn-ảnh được":

| Loại | Kênh hợp lệ |
|---|---|
| Vật / thuộc tính / hành động nhìn thấy được (`cat`, `red`, `running`) | audio → chọn ảnh |
| Hành vi ngữ dụng có ngữ cảnh (`hello`, `thank you`) | tình huống → chọn **clip** (`audio_select`) |
| Biến cá nhân (tên thật, tuổi thật, sở thích thật) | **offline-task** — không có đáp án in-app phổ quát |
| Từ chức năng (`I'm`, `a`) | chỉ khi khác biệt ngữ pháp đổi nghĩa cả câu |

- **BREAKING — thứ tự chủ đề Q1** đổi từ `hello → numbers → colors` thành `colors → numbers → shapes`. Cả ba đều khối `be` nên trục ngữ pháp §3 không đổi. Q1 chạy trọn vòng seed→publish→mobile với chi phí gen ảnh **0**.
- **`hello` không còn là chủ đề 4 tuần.** Hạ xuống: nghi thức mở bài (Đô Đô chào, không chấm) + offline-task §6 + một số item `audio_select` ngữ dụng rải xuyên chương trình.
- **`shapes` là chủ đề thứ 12**, mẫu câu `"It's a red circle."` — kết hợp thuộc tính để ôn `colors` (spiral thật) và để 6 khái niệm hình đỡ được 32 activity.
- **`animals` giữ mẫu câu `"Yes, I do./No, I don't."`** nhưng khai báo rõ là pattern **chỉ chạy bằng `audio_select`**, không phải chọn ảnh.
- **Theme × skill feasibility matrix** — duyệt trước từng tổ hợp là `valid` / `invalid` / `asset-blocked`, thay cho template "4–5 skill cho mọi chủ đề" đang buộc generator bịa `sentence_build`/`category_select` cho chủ đề không đỡ được construct đó.
- **Weekly validator** trong `lint-seeds.ts` — chỉ kiểm thứ đếm được chắc chắn (đủ 8 seed, difficulty 2/4/2, `activityIndex` 1..8 không trùng, actionType ≤4/8, skill có trong matrix). **KHÔNG** đặt quota construct/domain (xem design.md — quota phân bố là công cụ sai).
- **Gỡ khoá `audio_select` trong routine** + vá 5 chỗ "4 activity" + đồng bộ §5.2/§7.

Hai điểm **cần Human Gate**, tách khỏi phần code:
- Sửa §4 (thứ tự chủ đề) — đổi curriculum canonical.
- Sửa §1 (mục tiêu 300–500 từ): yêu cầu mỗi từ xuất hiện ≥3 activity cần 900–1500 lượt từ, nhưng 384 activity × 1 `targetWord` = **384 lượt**. Hụt 2,3–3,9 lần. Hoặc seed mang nhiều từ mỗi item, hoặc hạ con số.

## Capabilities

### New Capabilities
- `english-curriculum`: thứ tự 12 chủ đề + mẫu câu, ranh giới đo-được-trong-app vs offline-task, và theme × skill feasibility matrix quyết định tổ hợp nào được seed.
- `seed-week-validation`: kiểm tra cấp tuần deterministic cho seed file (số lượng, difficulty, index, phân bố actionType, skill hợp lệ theo chủ đề) — chạy trong `lint-seeds.ts`, áp cho mọi môn.

### Modified Capabilities
<!-- Không có: content-pipeline-flow nói về lifecycle draft→imported, không nói về chính sách soạn seed. Weekly validation là hành vi mới, không sửa requirement cũ. -->

## Impact

**Docs canonical (cần đồng bộ cùng change — AGENTS.md):**
- `docs/KIDO_ENGLISH_CURRICULUM.md` — §1 (mục tiêu từ vựng), §4 (bảng chủ đề), §5.2/§7 (drift audio_select), §6 (offline-task nhận `hello`), thêm §4.1 (feasibility matrix) + ranh giới đo được.
- `docs/prompts/gen-english-seed.routine.md` — gỡ khoá 3 skill ⚠, vá "4 activity", nạp matrix.

**Code:**
- `kido-pipeline/src/scripts/lint-seeds.ts` — mở rộng `perWeek` thành validator thật.
- `kido-pipeline/src/curriculum/english-skill-catalog.ts` — thêm feasibility matrix (theme × skill) làm nguồn chân lý trong code.

**Nội dung:**
- `kido-pipeline/seeds/w01-en.json` — viết lại theo chủ đề `colors`. Seed cũ (`hello`) chưa import DB, chưa publish → xoá/thay an toàn, không có activity nào ngoài production bị ảnh hưởng.

**Không đụng tới:** wire contract (`docs/kido-activity-schema.ts`), mobile, kido-server. Change này thuần chính sách nội dung + validator authoring.
