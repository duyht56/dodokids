# Proposal: add-compare-tap-activity

## Why

Skill so sánh số lượng (`math_compare_quantity`, domain `cmp`) hiện không có kiểu tương tác phù hợp: ảnh gen không vẽ đúng số lượng (AI không đếm được), còn giải pháp tạm bằng thẻ chấm primitive thì trừu tượng — mất chủ đề vật thật (táo, cá) và không cho bé công cụ đếm để kiểm chứng. Về sư phạm, trẻ 4-6 tuổi cần tiến trình cụ thể → hình ảnh → trừu tượng, và cần giàn giáo tap-đếm để bài chênh lệch nhỏ (4 vs 5) trở thành thử thách hợp lệ thay vì bị anti-pattern cấm. Làm ngay bây giờ vì mới chỉ gen seed W1-W2 — blast radius nhỏ nhất có thể trước khi content nhân rộng.

## What Changes

- **BREAKING (MVP freeze)**: thêm action type thứ 6 `compare_tap` — mở rộng bộ 5 action type MVP đã chốt (single_select, multi_select, sort_sequence, match_pair, count_tap).
- Payload mới: `{ objectAsset (1 assetRef dùng chung cả 2 bên), leftCount, rightCount, correctSide: 'left'|'right', mode: 'more'|'less' }` — app nhân bản 1 sprite × N lần mỗi bên nên số lượng chính xác tuyệt đối, chỉ tốn 1 Imagen call/activity.
- Mobile: component `CompareTapActivity` mới — 2 khung trái/phải, mỗi khung render sprite × count với layout seeded (tái dùng `countTapLayout`), tap từng vật để đếm (counter riêng mỗi bên, `speakCount`), bé được trả lời bất cứ lúc nào bằng cách tap chọn khung (đếm là giàn giáo, không ép).
- Pipeline: generate prompt + mechanics validator + review rule + normalize + assets step nhận `compare_tap`; seed lint chấp nhận actionType mới.
- Server: `activity.types`, mongoose schema (payload Mixed đã hỗ trợ — bổ sung discriminator value), publish guard.
- Curriculum: `math_compare_quantity` chuyển từ `PRIMITIVE_SKILLS` (giải pháp tạm session trước) sang `compare_tap`; re-spec `CMP_ANTI` — chênh lệch nhỏ (4 vs 5) hợp lệ ở mức challenge khi có tap-đếm; cập nhật `docs/KIDO_MATH_CURRICULUM.md` (bỏ ghi chú freeze 5 type).
- Regen: seed W1-W2 của `math_compare_quantity` được regen sang actionType mới.
- Ngoài scope: `compare_length/height/weight/capacity` vẫn dùng single_select 2 options (so thuộc tính tri giác, không cần đếm); `watch_video` vẫn hoãn.

## Capabilities

### New Capabilities

- `compare-tap-activity`: kiểu tương tác so sánh số lượng 2 bên — render 2 vùng sprite nhân bản chính xác, tap-đếm từng bên làm giàn giáo, chọn bên thỏa câu hỏi (nhiều hơn/ít hơn) làm đáp án.

### Modified Capabilities

- `content-pipeline-flow`: pipeline generate/review/assets chấp nhận actionType `compare_tap` — validator R-rule mới (cấm questionImage, bắt buộc objectAsset + 2 count khác nhau + correctSide khớp mode), assets step chỉ resolve 1 objectAsset.
- `mongoose-schemas`: `actionType` enum thêm giá trị `compare_tap`; payload scenario mới cho shape `compare_tap`.
- `activity-container`: container map actionType `compare_tap` → component `CompareTapActivity`.

## Impact

- **kido-pipeline**: `src/types/activity.types.ts`, `src/prompts/generate.prompt.ts`, `src/prompts/review.prompt.ts`, `src/pipeline/activity-mechanics.ts`, `src/pipeline/normalize-payload.ts`, `src/pipeline/steps/3-assets.ts`, `src/curriculum/skill-catalog.ts` (bỏ `math_compare_quantity` khỏi `PRIMITIVE_SKILLS`, bỏ nhánh cmp trong R12 carve-out nếu chuyển hẳn), `src/scripts/lint-seeds.ts`, tests tương ứng.
- **kido-server**: `src/common/types/activity.types.ts`, mongoose schema/enum, `src/modules/publish/publish.guard`.
- **mobile**: `src/components/activities/CompareTapActivity.tsx` (mới), `src/components/activities/` container map, `src/types/lesson.ts` (payload type).
- **docs**: `KIDO_MATH_CURRICULUM.md`, `KIDO_MATH_SKILL_CATALOG_V2.md` (re-spec CMP_ANTI), `KIDO_SEED_AUTHORING.md` (answerSpec format cho compare_tap), `docs/kido-activity-schema.ts`.
- **Data**: regen seed + activity W1-W2 cho `math_compare_quantity` (2 seed hiện có); Human Gate review lại các activity này.
- **Memory/quy ước**: cập nhật ghi chú "Math curriculum freeze" — 5 type → 6 type.
