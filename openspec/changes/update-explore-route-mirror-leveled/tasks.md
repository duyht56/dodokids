## 1. Dẫn đường (mobile `f7604cd`, nhánh `feat/explore-route-mirror-leveled`)

- [x] 1.1 Renderer: mọi lần chạy không về nhà đủ mục tiêu gọi một `onAnswer(false)` sau khi đi xong; bỏ `onTryAgainSound`; bảng và hàng lệnh giữ để sửa.
- [x] 1.2 Màn chơi: `route_planner` vào `SELF_VOICED_MISS_GAMES` và `BOARD_GUIDANCE_GAMES` (không chữ dưới bảng khi sai; lời khen / lời bậc nổi trên bong bóng lúc bảng khoá).
- [x] 1.3 `LEVELED_ROUNDS.route_planner` = 6/4/1 + `levelIntroLine('route', …)`; bỏ nhánh continuous của màn chơi và `nextRoutePlannerLevel`; `isContinuousExploreRunGame` luôn `false`.
- [x] 1.4 Thanh trên dùng "Bậc x/5" + chấm vòng (bài đầu không tô).
- [x] 1.5 `createPausableTimers` cho bước đi / nhịp kết quả / lời dẫn, giữ khi `paused`; giảm chuyển động hiện cả đường một lần, báo sau 900 ms; ô đã đi tô nhạt.

## 2. Soi gương v2

- [x] 2.1 `LEVELED_ROUNDS.mirror_build` = 4/3/1 + `levelIntroLine('mirror', …)`; rời `isProgressiveExploreRunGame`.
- [x] 2.2 `mirrorBuildDemoPair` + renderer: một cặp mỗi bảng (vòng nguồn, đoạn gương, ô đích, bóng hình trượt; tĩnh khi giảm chuyển động), tắt khi chạm ô đích; mức 2 chấm khoảng cách tới gương; bỏ viền nhảy và làm mờ.
- [x] 2.3 `mirrorBuildCopyIsWrong`: generator rút lại, validator từ chối bài tự đối xứng; `minOn` ≥ 2.
- [x] 2.4 Bậc 5 = 5 × (2·3); `mirrorBuildCellLayout` theo vùng chơi đo được, ô ≥ 44 pt, chỉ lấn lề khi màn hẹp.
- [x] 2.5 `mirror-build-v2` (generator, validator, config, manifest, dependency '2').
- [x] 2.6 `supportHintPhraseId('mirror_build')` = `mirror_hint_pair`.

## 3. Audio (đợt v8, chưa render)

- [x] 3.1 Khối câu mới cuối `PROMPT_PHRASES`: `route_intro_2..5`, `mirror_intro_2..5`, `mirror_hint_pair`; `npm run explore-lines:dump` (không đổi manifest câu liền).
- [ ] 3.2 Đợt audio v8: thêm 9 câu vào `kido-pipeline/src/explore/exploreAudioInventory.ts`, render, owner duyệt, bundle.

## 4. kido-server (nhánh `feat/explore-route-mirror-leveled`, `b86e9b6`, chưa push)

- [x] 4.1 `explore.registry.ts`: `BundledLocalGameSpec.version` (giống nhánh `fix/explore-missing-cell-leak`), mirror_build = 2.
- [x] 4.2 Spec mirror-build, route-planner-{privacy,renderer,layout} theo luồng mới.

## 5. Kiểm chứng

- [x] 5.1 mobile: `npx tsc --noEmit`, `npm run lint` (0 lỗi, 9 cảnh báo có sẵn), mọi `npm run test:*` xanh; các kiểm mới đỏ trên mã cũ (chép nguyên 1344/10.000 ở bậc 1; chạy hỏng không báo).
- [x] 5.2 kido-server: `npx jest src/modules/explore` (21 suite, 238 test), `npm run build`.
- [x] 5.3 iOS Simulator SE 375×667: Dẫn đường vòng 3/6 đúng lần đầu → luyện thêm, vòng 4/6 → "Bậc 2/5"; chạy hỏng không đổi cỡ bảng; tạm dừng giữ Đô Đô đứng yên; bậc 5 6/6 → hết lượt. Soi gương: gợi ý một cặp, chạm ô đích thì tắt; 3/4 → "Bậc 2/5"; bậc 5 ô 44 pt vừa màn, 3/4 ở bậc 5 → hết lượt.
- [ ] 5.4 Máy thật / bé thật: thời gian một vòng của trẻ (đo trên sim chỉ là bấm theo kịch bản); máy 320 pt cao ≤ 640 pt ở Soi gương bậc 5 (nút Xong lệch dưới mép ~24 pt theo tính toán).
- [ ] 5.5 Dọn `isContinuousExploreRunGame` sau khi gộp nhánh Xếp tháp (contract của nó còn gọi).
- [ ] 5.6 Owner duyệt, merge nhánh mobile + server và phát hành.
