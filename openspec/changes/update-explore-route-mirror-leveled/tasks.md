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
- [x] 3.2 Thêm 9 câu vào `kido-pipeline/src/explore/exploreAudioInventory.ts` — ở nhánh tích hợp `integrate/explore-2026-10-21` (66389c5, local, không push), trước khối `chain2_*` như mobile.
- [ ] 3.3 Đợt audio v8: render, owner duyệt, bundle.

## 4. kido-server (nhánh `feat/explore-route-mirror-leveled`, `b86e9b6`, chưa push)

- [x] 4.1 `explore.registry.ts`: `BundledLocalGameSpec.version` (giống nhánh `fix/explore-missing-cell-leak`), mirror_build = 2.
- [x] 4.2 Spec mirror-build, route-planner-{privacy,renderer,layout} theo luồng mới.

## 5. Tạm dừng — phần của phiên này trong review đối kháng Đợt 1 (mobile `382984c`, server `f7a5512`)

- [x] 5.1 C03/C07: `answer()` giữ kết quả renderer báo trong lúc tạm dừng, xử lý khi bỏ tạm dừng (sai trước, đúng sau); `handleTryAgainSound` im khi tạm dừng.
- [x] 5.2 C02/C10: lúc tạm dừng ghi lại renderer có đang nói lời của nó (sau câu hỏi của bài) không; bài đã giải hoặc renderer đang nói thì không đọc lại câu hỏi.
- [x] 5.3 C11 (màn chơi): lời nhắc nghỉ bị bỏ trước khi bắt đầu được nói khi bỏ tạm dừng, một lần.
- [x] 5.4 C01/C08/C13: Dẫn đường dừng bước đi (`f7604cd`) và nói lại lời dẫn bị cắt (`speakGuidance`).
- [x] 5.5 Test: `test:explore-play-shell` §7 (mount màn chơi thật), `test:explore-route-planner` (lời dẫn bị cắt); đỏ trên mã trước sửa.
- [ ] 5.6 Không làm ở đây (phiên khác): Xe buýt C05/C15–C17, Cân C06 (câu nhẹ của renderer bị tạm dừng huỷ trả `false` cho renderer tự nói lại), Xưởng C09/C12/C14, Ú òa C04.

## 6. Review đối kháng nhánh (ROUTE-MIRROR-01..03)

- [x] 6.1 01: Soi gương bố cục gọn khi bảng thấp (đề nhỏ, bỏ dòng nhắc, khe hẹp), khe chọn theo cả chiều cao; dải phản hồi `pointerEvents="none"`; contract đo cả chiều cao trên 6 cỡ máy.
- [x] 6.2 02: `onBoardBusy` (prop renderer mới, tuỳ chọn); Dẫn đường bận từ lúc bấm chạy tới khi lời kết được gửi; tạm dừng lúc bận thì không đọc câu hỏi.
- [x] 6.3 03: renderer bị cắt giữa câu có 1,5 s để nói tiếp / báo bài; im lặng thì câu hỏi được đọc. Lần tạm dừng sau huỷ lần đọc đang chờ.
- [x] 6.4 Ghi chú: 9 câu audio đã có trong inventory pipeline ở nhánh tích hợp (66389c5); lý do thật của Xếp tháp (chủ sản phẩm chưa bật).

- [x] 6.5 Vòng kiểm 3 trên cây gộp (round3-residuals.md): Dẫn đường nhả cờ bận ở mọi đường thoát (sửa lệnh trong 420 ms, unmount); game tự đọc câu hỏi đã nói sau cue gần nhất thì không đọc lại cue đó (Máy nối tiếp v2). Probe của người kiểm (stuck-busy, route-busy, rm03 chain/sweep/pattern) chạy lại trên d68a655 + bản sửa: hết im lặng, hết câu hỏi cũ; Tìm quy luật vẫn được đọc câu hỏi sau 1,5 s. Mobile `91b0c8d`, `e9ef258`.

## 7. Kiểm chứng

- [x] 7.1 mobile: `npx tsc --noEmit`, `npm run lint` (0 lỗi, 9 cảnh báo có sẵn), mọi `npm run test:*` xanh; các kiểm mới đỏ trên mã cũ (chép nguyên 1344/10.000 ở bậc 1; chạy hỏng không báo).
- [x] 7.2 kido-server: `npx jest src/modules/explore` (21 suite, 238 test), `npm run build`.
- [x] 7.3 iOS Simulator SE 375×667: Dẫn đường vòng 3/6 đúng lần đầu → luyện thêm, vòng 4/6 → "Bậc 2/5"; chạy hỏng không đổi cỡ bảng; tạm dừng giữ Đô Đô đứng yên; bậc 5 6/6 → hết lượt. Soi gương: gợi ý một cặp, chạm ô đích thì tắt; 3/4 → "Bậc 2/5"; bậc 5 ô 44 pt vừa màn, 3/4 ở bậc 5 → hết lượt.
- [ ] 7.4 Máy thật / bé thật: thời gian một vòng của trẻ (đo trên sim chỉ là bấm theo kịch bản); bố cục gọn của Soi gương trên máy Android 16:9 thật (iOS Simulator không có máy này).
- [ ] 7.5 Dọn `isContinuousExploreRunGame` sau khi gộp nhánh Xếp tháp (contract của nó còn gọi).
- [ ] 7.6 Owner duyệt, merge nhánh mobile + server và phát hành.
