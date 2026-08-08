# Design: add-compare-tap-activity

## Context

`math_compare_quantity` hiện đi qua `single_select` với 2 giải pháp đều có nhược điểm: ảnh gen không đúng số lượng; thẻ chấm primitive (giải pháp tạm đang chạy) đúng số lượng nhưng trừu tượng, mất chủ đề vật thật và không đếm được. Hạ tầng `count_tap` đã giải bài "số lượng chính xác" bằng cách app nhân bản 1 sprite × N lần — `compare_tap` tái dùng đúng cơ chế đó cho 2 vùng so sánh.

Hiện trạng liên quan:
- Pipeline: `assetsStep` đã có nhánh hint `transparent`/`scene` riêng cho count_tap ([3-assets.ts:17-25](kido-pipeline/src/pipeline/steps/3-assets.ts)); `validateMechanics` mới có carve-out R12 cho domain cmp (`isSidedCompare`).
- Mobile: `CountTapActivity` có sẵn sprite chip + badge + counter + `speakCount`; `countTapLayout` cho vị trí seeded không chồng lấn; `ActivityContainer` map theo type guard trong `lesson.ts`.
- Data: mới gen seed W1-W2 → chỉ 2 seed `math_compare_quantity` cần regen.

## Goals / Non-Goals

**Goals:**
- Action type `compare_tap` end-to-end: seed → generate → review → assets → publish → mobile render.
- Số lượng 2 bên chính xác tuyệt đối bằng nhân bản sprite; 1 Imagen call/activity.
- Tap-đếm từng bên là giàn giáo tùy chọn; trả lời (chọn khung) được phép bất cứ lúc nào.
- Hỗ trợ cả 2 chiều hỏi: `mode: 'more'` (bên nào nhiều hơn) và `'less'` (bên nào ít hơn).
- Re-spec `CMP_ANTI` cho compare_quantity: chênh lệch 1 (4 vs 5) hợp lệ ở challenge.

**Non-Goals:**
- `compare_length/height/weight/capacity`: vẫn single_select 2 options (so thuộc tính tri giác, không đếm) — giữ carve-out `isSidedCompare` cho nhóm này.
- So sánh "bằng nhau" (`mode: 'equal'`): hoãn — cần UI 3 đáp án, khác cấu trúc 2 khung.
- Không đổi UI/logic count_tap hiện có.

## Decisions

### D1 — Payload: 1 `objectAsset` dùng chung 2 bên
```ts
interface CompareTapPayload {
  objectAsset: AssetReference   // 1 vật đơn lẻ, nền transparent — app nhân bản
  objectName: string            // tên tiếng Việt, vd "quả táo" (cho counter/footer)
  leftCount: number             // 1..6
  rightCount: number            // 1..6, ≠ leftCount
  correctSide: 'left' | 'right'
  mode: 'more' | 'less'
}
```
- **Vì sao 1 asset chung**: so sánh số lượng đòi hỏi 2 bên cùng vật — 2 vật khác nhau tạo nhiễu (bé so "con nào đẹp hơn"). Ép ở tầng schema thay vì dặn AI. *Alternative bị loại*: 2 asset riêng mỗi bên (nhiễu + 2 Imagen call); nhét vào single_select với option-card-đếm-được (xung đột tap: tap vật = đếm ≠ tap card = chọn).
- **Vì sao có `mode`**: validator kiểm được `correctSide` khớp đếm (more → bên count lớn hơn); audio hỏi "ít hơn" không cần suy diễn từ text.
- **Count range 1..6/bên**: khung mỗi bên chỉ ~nửa chiều rộng scene count_tap — 6 sprite là trần an toàn của layout (xem R1).

### D2 — Asset gen: tái dùng hint `transparent` của count_tap
`assetsStep` thêm nhánh `actionType === 'compare_tap'` → `backgroundHints.set(objectAsset.assetId, 'transparent')`. Sprite cắt nền sạch như target của count_tap. Không có backgroundAsset — 2 khung dùng gradient pastel (như fallback count_tap), đỡ 1 Imagen call và tránh nền gây nhiễu đếm.

### D3 — Mobile: 2 khung + đếm độc lập + trả lời bất cứ lúc nào
- `CompareTapActivity` render 2 khung trái/phải cạnh nhau; mỗi khung: sprite × count tại vị trí seeded (`countTapLayout(seed + '-L' | '-R', count)` — seed suffix để 2 bên khác layout), counter riêng góc trên, tap vật → highlight + badge + `speakCount` (đếm theo bên đang tap).
- Chọn đáp án = tap **viền khung** (hoặc nút "Bên này!" dưới mỗi khung — quyết định lúc implement theo hit-target ≥ 44pt). Sai → shake + reset chọn sau 900ms (giống pattern WRONG_RESET_MS của single_select), cho phép đếm tiếp rồi chọn lại.
- Không có phase-gate: không bắt đếm xong mới cho chọn — bé giỏi ước lượng đi đường nhanh, đúng tinh thần "ước lượng trước, đếm để kiểm tra".
- `lesson.ts`: thêm `CompareTapPayload`, nhánh union `type: 'compare_tap'`, guard `isCompareTap`, mapper từ server payload, mock cho preview.

### D4 — Validator (mechanics) — rule mới R21, chạy deterministic
Cho `actionType === 'compare_tap'`:
- `objectAsset` là assetRef hợp lệ; **không có** `questionImage`/`options`.
- `leftCount`, `rightCount` nguyên dương ≤ 6 và **khác nhau**.
- `correctSide` khớp `mode`: more → bên count lớn; less → bên count nhỏ.
- Ngưỡng chênh lệch theo difficulty (đọc `meta.difficulty`): warmup ≥ 3, core ≥ 2, challenge ≥ 1 — thay `CMP_ANTI` cũ cho skill này.
Review prompt (LLM) chỉ soi phần máy không đếm được: imageDesc của objectAsset (R19/R20), audio phù hợp mode.

### D5 — Chuyển skill + giữ carve-out cmp cho skill còn lại
- `skill-catalog.ts`: bỏ `math_compare_quantity` khỏi `PRIMITIVE_SKILLS`; thêm map `skillCode → actionType khuyến nghị` không cần thiết — seed đã mang `actionType`, chỉ cần seed-review/lint chấp nhận cặp (`math_compare_quantity`, `compare_tap`).
- `isSidedCompare` giữ nguyên cho `compare_length/height/…` (vẫn single_select không questionImage). R12 carve-out không đụng compare_tap vì nhánh đó chỉ chạy cho single/multi_select.
- Re-spec catalog: `math_compare_quantity.antiPattern` đổi thành "2 bên khác vật, hoặc chênh lệch không khớp ngưỡng difficulty".

### D6 — Seed answerSpec format
`"vật = quả táo đỏ; trái = 5, phải = 2; hỏi = nhiều hơn; đúng = trái"` — documented trong `KIDO_SEED_AUTHORING.md`; lint-seeds kiểm actionType `compare_tap` chỉ đi với skill `math_compare_quantity` (giai đoạn này).

### D7 — Server: enum + publish guard
- `actionType` enum (server types + mongoose) thêm `compare_tap`; payload vẫn `Schema.Types.Mixed` — không cần schema mới.
- Publish guard: kiểm `objectAsset.imageUrl` đã resolve (tương tự kiểm asset count_tap), đủ field count/side/mode.

## Risks / Trade-offs

- [R1 — `countTapLayout` capacity ở khung hẹp] Layout viết cho scene full-width; khung nửa chiều rộng với 6 sprite có thể chật → **Mitigation**: task riêng kiểm capacity với aspect mới; nếu chật, giảm spriteSize (52→44) hoặc trần count = 5. Test unit cho layout ở kích thước khung mới.
- [R2 — Bé tap khung khi định tap vật (mis-tap chọn nhầm đáp án)] → **Mitigation**: vùng chọn là nút/viền tách biệt khỏi vùng sprite, thêm `useDoubleTapGuard`; sai không phạt nặng (reset 900ms như single_select).
- [R3 — MVP freeze bị phá, chuỗi tool cũ chưa biết type mới] Chỗ nào switch theo actionType mà default = throw sẽ vỡ (worker cũ, preview web `app/components/player/map.ts`, fixtures) → **Mitigation**: grep toàn repo `single_select|multi_select|sort_sequence|match_pair|count_tap` liệt kê mọi switch/enum, cập nhật đủ trong 1 epic; preview web thêm player compare_tap tối thiểu.
- [R4 — TTS đếm 2 bên gây rối (đang đếm trái, tap phải)] → **Mitigation**: `speakCount` đọc số của bên vừa tap (mỗi bên counter độc lập); không đọc chen — hủy utterance đang phát (behavior sẵn có của speech service nếu có, kiểm lúc implement).
- [R5 — Regen W1-W2 đổi actionType làm lệch activity đã publish] → **Mitigation**: chỉ 2 seed; reset pipelineStatus từng seed, qua Human Gate như thường; publish-week chạy lại cho tuần bị ảnh hưởng.

## Migration Plan

1. Land code (pipeline → server → mobile) + tests; chưa đụng data.
2. Cập nhật 2 seed `math_compare_quantity` W1-W2: `actionType: 'compare_tap'` + answerSpec format mới (sửa file wNN.json + DB), reset `pipelineStatus: 'pending'`.
3. Chạy pipeline cho 2 seed → Human Gate review → publish lại tuần.
4. Rollback: revert commit; seed cũ (single_select + thẻ chấm) vẫn hợp lệ vì carve-out cmp trong R12 giữ nguyên.

## Open Questions

- Trần count 6/bên có giữ được khi test layout thực tế trên màn 375pt? (R1 — quyết ở task mobile)
- Nút chọn đáp án: viền khung tap được hay nút riêng "Bên này!"? (quyết theo hit-target khi implement, ưu tiên nút riêng nếu khung < 44pt margin)
