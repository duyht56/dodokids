# Tasks: add-compare-tap-activity

## 1. Types & Schema (nền cho mọi thứ sau)

- [x] 1.1 kido-pipeline `src/types/activity.types.ts`: thêm `'compare_tap'` vào ActionType, interface `CompareTapPayload { objectAsset, objectName, leftCount, rightCount, correctSide, mode }`
- [x] 1.2 kido-server `src/common/types/activity.types.ts` + mongoose schema: thêm `compare_tap` vào actionType enum (payload vẫn Mixed) + `docs/kido-activity-schema.ts` mirror
- [x] 1.3 Grep toàn repo mọi switch/enum theo actionType — xử lý: preview map.ts (case mới), LessonPlayerWeb.tsx (CompareTap component + Renderer case), fixtures.ts (mock), store.ts union. Publish guard + lint ở task 2.7/2.8

## 2. Pipeline — generate & validate

- [x] 2.1 `generate.prompt.ts`: block payload compare_tap + hướng dẫn skill; single_select cmp carve-out chỉ còn length/height; xóa dead isSidedCompare branch trong primitiveBlock; checklist item 6
- [x] 2.2 `activity-mechanics.ts`: R21 compare_tap (objectAsset, counts 1..6 khác nhau, correctSide↔mode, ngưỡng chênh lệch theo difficulty, cấm questionImage/options) + 8 unit tests
- [x] 2.3 `normalize-payload.ts`: normalizeCompareTap (giữ imageDesc, ép counts number, suy correctSide, alias 'object') + 2 tests
- [x] 2.4 `review.prompt.ts`: R21 mới + R12 cmp exception chỉ length/height + cập nhật LƯU Ý PHÂN CÔNG
- [x] 2.5 `skill-catalog.ts`: bỏ `math_compare_quantity` khỏi PRIMITIVE_SKILLS; re-spec antiPattern theo design D5
- [x] 2.6 `steps/3-assets.ts`: nhánh compare_tap → backgroundHints objectAsset = 'transparent'
- [x] 2.7 `lint-seeds.ts` (MVP_ACTIONS + COMPARE_ACTION) + seed-review.prompts (case compare_tap) + answerSpec format trong `docs/KIDO_SEED_AUTHORING.md`
- [x] 2.8 Publish: resolve-assets + asset-url.checker + DTO đều generic (actionType @IsString, payload @IsObject) → compare_tap qua guard không cần đổi; thêm spec test compare_tap (pass + broken objectAsset)

## 3. Mobile

- [x] 3.1 `mobile/src/types/lesson.ts`: CompareTapPayload, union member, isCompareTap guard, mapper từ server payload, mock activity (thay watch_video trong buildMockLesson)
- [x] 3.2 Generalize `countTapLayout(seed,count,cols)` — compare dùng cols=2 (cell rộng đủ cho sprite 44px ở khung nửa màn); mirror web replica; 3 unit test khung hẹp (no-collision ≤6, spread 2 cột, 2 bên khác nhau)
- [x] 3.3 `CompareTapActivity.tsx`: 2 khung + sprite nhân bản seeded (-left/-right), counter độc lập, tap-đếm + speakCount + badge, nút "Bên này!" (48pt tách vùng sprite), trả lời bất cứ lúc nào, sai reset 900ms giữ trạng thái đếm, nút "Đếm lại"
- [x] 3.4 `ActivityContainer.tsx`: import + route compare_tap → CompareTapActivity (seed = activity.id)
- [x] 3.5 Preview web: CompareTap component trong LessonPlayerWeb.tsx + case Renderer + map.ts case + mock fixture

## 4. Docs & curriculum

- [x] 4.1 `docs/KIDO_MATH_CURRICULUM.md`: §5.1 6 type + row compare_tap + ghi chú freeze 5→6 + payload canonical objectAsset
- [x] 4.2 `docs/KIDO_MATH_SKILL_CATALOG_V2.md`: compare_quantity → compare_tap; re-spec anti-pattern (ngưỡng chênh lệch theo difficulty + phải cùng vật)

## 5. Data migration W1-W2

- [x] 5.1 Seed file: chỉ w01.json D1-02 dùng compare_quantity (w02 không có) → đổi actionType `compare_tap` + answerSpec format mới; lint 0 lỗi. ⚠️ DB reset pipelineStatus='pending' cần Mongo (chạy khi có infra).
- [ ] 5.2 ⚠️ CHỜ INFRA: `run-pipeline --seed SEED-toan-w01-D1-02` (cần Mongo + Gemini + Imagen — tốn phí, không chạy headless được ở đây)
- [ ] 5.3 ⚠️ CHỜ HUMAN GATE: review activity mới + `publish-week --week 1`
- [x] 5.4 Memory "Math curriculum freeze" đã cập nhật 5→6 action types (ngày 2026-07-05) + MEMORY.md index

## 6. Verify

- [x] 6.1 Test xanh: kido-pipeline vitest 78/78, kido-server jest publish+activity 8/8; tsc pipeline (gồm app/) exit 0, mobile exit 0, server chỉ lỗi iap.spec cũ (không liên quan)
- [ ] 6.2 ⚠️ CHỜ VISUAL: chạy preview/mobile xác nhận đếm 2 bên, trả lời sớm, sai-thử-lại (cần dev server/thiết bị)
