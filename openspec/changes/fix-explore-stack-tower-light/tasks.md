## 1. Xếp tháp (mobile `af9279d`, nhánh `fix/explore-stack-tower-light` từ `bcb3dab`)

- [x] 1.1 Bỏ bậc `compare` 2 khối; 4 bậc đánh số lại L1–L4 (cấu hình L2–L5 cũ), generator/validator/config/manifest v2; variety theo 4 bậc.
- [x] 1.2 Lượt progressive 4 bảng (`PROGRESSIVE_RUN_SIZE.stack_tower = 4`), không bật lượt theo bậc; bậc bắt đầu đã lưu từ bản cũ mở ở L1 (contract thử 1–5, 6, 99, 0, -1, 2.5, "3", null).
- [x] 1.3 Mỗi lần đặt sai gọi `onAnswer(false)` (giữ trượt về + nghiêng); hỗ trợ chỉ lấy từ `supportLevel` của màn chơi; bỏ `onTryAgainSound` và bộ đếm trượt riêng.
- [x] 1.4 Ô chạm `hit` ≥ 48pt trong `layoutStackTowerScene` (sát nhau trong hàng, không chồng, hàng dưới phủ dải đất, hàng xuống dòng theo bề rộng khối); renderer lấy ô làm view chạm, khối đã xếp `pointerEvents="none"`, trừ viền scene khi đo.
- [x] 1.5 Nhịp leo, tàu chạy khỏi màn, đổi mặt Đô Đô, lời báo xong qua `useBusSequencer(paused)`.
- [x] 1.6 Bỏ `tower_which_bigger` khỏi `promptAudio.ts` (file clip giữ); `npm run explore-lines:dump` (manifest câu liền không đổi).
- [x] 1.7 `test:explore-stack-tower` viết lại; kiểm hành vi mới (đo vùng chạm thật qua harness trên 320/375/430pt, báo sai, tạm dừng) đỏ trên renderer cũ.

## 2. Lật thẻ (mobile `243d221`)

- [x] 2.1 Bốn nhịp (úp thẻ sai, giữ cặp đúng, đóng nhìn trộm, báo xong) qua `useBusSequencer(paused)`; lời báo xong đọc `onAnswer` mới nhất.
- [x] 2.2 `test:explore-memory` chạy renderer qua harness: giữ khi tạm dừng (đỏ trên mã cũ). Harness thêm `useReducer`, `Animated.ValueXY`, `Animated.add/multiply`.

## 3. Chấm toa tàu (mobile `cd751a5`, lỗi có sẵn, commit riêng)

- [x] 3.1 `DotGroup` của toa vẽ màu `palette.ink` (coral mặc định trùng toa cam); contract kiểm.

## 4. Server và pipeline (commit local, không push)

- [x] 4.1 kido-server `fbd3f09` (nhánh `fix/explore-stack-tower-light` từ `main` 2c86f85): `BundledLocalGameSpec.version` (giống từng dòng 54b73d2), `stack_tower` levels [1,2,3,4] v2; `explore.stack-tower.spec.ts`.
- [x] 4.2 kido-pipeline `3ad6a94` (nhánh `fix/explore-stack-tower-light` từ `main` 27436a4): bỏ `tower_which_bigger` khỏi `exploreAudioInventory.ts`.

## 4b. Sau review đối kháng 21/10

- [x] 4b.1 STACK-TOWER-01 (mobile `d4162b6`): sân khấu neo đáy cảnh + `nextStackTowerSceneSize`; khi buộc tính lại, khối trên sàn không bị dừng, Đô Đô và các bước leo theo bố cục mới. Contract thêm 4 tình huống (bàn còn chỗ, bàn sát mép, thêm chỗ trước/sau lần chạm đầu, tính lại giữa lúc leo), đỏ trên renderer `cd751a5`; chạy lại trên iOS Simulator: bàn hiển thị, báo sai, leo và chuyển bài bình thường.
- [x] 4b.2 STACK-TOWER-02: delta `explore-stack-tower-game` viết lại bằng MODIFIED (6) + REMOVED (2) + ADDED (3); `validate --strict` OK; thử archive round-2 rồi change này trên bản sao: không còn câu mâu thuẫn. Chú thích `startLevelChoices.ts` hết ghi "5 boards over L1–L5".
- [x] 4b.5 Vòng kiểm 3 (STACK-TOWER-01 còn lại, NEW-stack-2; mobile `17c149f`, kido-server `a076163`): bàn treo từ đỉnh cảnh, `layoutStackTowerStage` chừa 32pt dưới sàn và 8pt trên Đô Đô (dùng khoảng trống trước, không thu nhỏ tới mức khối bằng cỡ), co ≤ 32pt không gì di chuyển/đổi cỡ/bị dừng, co quá thì khối đang thử nảy thẳng về ô mới. Contract: quét 144 bàn thật (mọi bậc, 3 máy, 2 chiều cao) co 20/30/32pt; đỏ trên renderer `d4162b6`. Probe của người kiểm (`probe-tower.cjs`, `probe-climb.cjs`, chỉ đổi cách tìm sân khấu neo đỉnh và dùng `layoutStackTowerStage` làm "expected"): 4/4 không tính lại, 0 khối dịch/đổi cỡ; 4/4 điểm đáp cuối đúng. iOS Simulator: dải đất dày hơn (phần dự phòng), báo sai, leo, chuyển bài bình thường.
- [x] 4b.6 Vòng kiểm 4 (Medium, do `17c149f`; mobile `374853a`, kido-server `eaa72d8`): sân khấu chỉ thu khi bố cục thu vẫn đọc được (tỉ lệ của bậc − 0,05 và chênh ≥ 6pt); bố cục gốc lấy lại khoảng hở trong ô chạm giữa các hàng sàn và dưới vạch xây (tháp 5 khối ở 276×308 chưa đạt: 11/19 → 6/19, bản cũ 5/19). Contract quét cảnh hẹp 276×248/278/308, 280×250 mọi bậc/chiều đo: game `17c149f` 48 vi phạm, giờ 0. Probe chạy lại: 4/4 không tính lại, 4/4 điểm đáp đúng.
- [ ] 4b.7 Theo dõi (có từ trước): ở máy 320pt, 6/19 tháp 5 khối và phần lớn tàu 5 toa có hai khối kề chênh 4–5pt (tỉ lệ vẫn đạt). Muốn ≥ 6pt ở đó thì cần quyết định thiết kế (vd. bậc 4 trên máy hẹp dùng 4 khối, hoặc sàn hai tầng khác).
- [ ] 4b.3 Khi archive: sửa câu Purpose của `explore-stack-tower-game` ("every mistake answered by physics instead of a wrong state") vì giờ mọi lần sai được báo.
- [ ] 4b.4 Không đưa `b7fa6b7` (nhánh gộp thử: `PROGRESSIVE_WITH_MISSES`, bỏ stack_tower khỏi `NO_MISS_CHANNEL`) về nhánh này: commit đó dựa trên thay đổi của route-mirror ở cùng dòng, làm lại ở đây sẽ tạo thêm xung đột. Dòng AI_CONTEXT "stack only sends onAnswer(true)" để phiên route-mirror sửa.

## 5. Audio đợt v8

- [x] 5.1 Không có clip mới. Clip `explore-audio:vi:phrase:tower_which_bigger:v1` không còn được dùng; lần export pack v8 sẽ bỏ key khỏi registry, file `.wav` đã phát hành giữ nguyên (export chỉ ghi chú file cũ).

## 6. Kiểm chứng

- [x] 6.1 mobile: `npx tsc --noEmit`, `npm run lint` (0 lỗi, 9 cảnh báo có sẵn), cả 32 script `npm run test:*` (20 `test:explore-*`) xanh; commit trung gian `243d221` cũng xanh khi tách riêng.
- [x] 6.2 kido-server `npx jest src/modules/explore` (21 suite, 237 test) với `../mobile` là nhánh mobile này; `tsc -p tsconfig.build.json`. kido-pipeline `npx vitest run src/explore` (81 test); mobile `test:explore-prompt-audio` so inventory với pipeline nhánh này.
- [x] 6.3 iOS Simulator (iPhone 17 Pro Max 440×956, dev client, Metro từ worktree, server local 3001): `kido-parent-preferences` để `stack_tower: 5` → lượt mở L1 "1/4" 3 khối, không lỗi; đặt sai 2 lần → "Bé thử lại nhé.", hàng gợi ý, viền khối đúng, rồi làm mờ, bài giữ nguyên; hộp thoát mở giữa lúc Đô Đô leo (nhịp tạm kéo dài để kịp bấm) → hơn 12 s không báo xong, "Ở lại chơi" → leo nốt, sang 2/4; L3 toa chấm (thấy lỗi chấm toa cam → mục 3); L4 5 cột đặt sai được báo, xếp xong → "Mình luyện xong rồi!". Cảnh đo được 400×624 (khớp công thức cỡ màn của contract). Ảnh ở side-session-notes `stack-tower-sim/`.
- [ ] 6.4 Chưa kiểm: máy thật; máy 320pt và 375pt trên simulator (chỉ contract đo); Lật thẻ tạm dừng trên simulator (chỉ contract); app ra nền giữa lúc leo (cùng đường `paused` với hộp thoát).
- [ ] 6.5 Khi gộp: đoạn §10 BRD ("Xếp tháp … giữ cách chạy cũ") và dòng AI_CONTEXT "stack only sends `onAnswer(true)`" do phiên route-mirror sửa; contract leveled-rounds đã có bản sửa ở nhánh gộp thử (`b7fa6b7`). kido-server: cùng cơ chế `version` với nhánh missing-cell, peekaboo-cups, route-mirror — dòng `stack_tower` liền dòng `missing_cell` nên sẽ có xung đột nhỏ khi gộp.
- [ ] 6.6 Owner duyệt, merge nhánh `fix/explore-stack-tower-light` (mobile, server, pipeline) và phát hành.
