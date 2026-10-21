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

## 5. Audio đợt v8

- [x] 5.1 Không có clip mới. Clip `explore-audio:vi:phrase:tower_which_bigger:v1` không còn được dùng; lần export pack v8 sẽ bỏ key khỏi registry, file `.wav` đã phát hành giữ nguyên (export chỉ ghi chú file cũ).

## 6. Kiểm chứng

- [x] 6.1 mobile: `npx tsc --noEmit`, `npm run lint` (0 lỗi, 9 cảnh báo có sẵn), cả 32 script `npm run test:*` (20 `test:explore-*`) xanh; commit trung gian `243d221` cũng xanh khi tách riêng.
- [x] 6.2 kido-server `npx jest src/modules/explore` (21 suite, 237 test) với `../mobile` là nhánh mobile này; `tsc -p tsconfig.build.json`. kido-pipeline `npx vitest run src/explore` (81 test); mobile `test:explore-prompt-audio` so inventory với pipeline nhánh này.
- [x] 6.3 iOS Simulator (iPhone 17 Pro Max 440×956, dev client, Metro từ worktree, server local 3001): `kido-parent-preferences` để `stack_tower: 5` → lượt mở L1 "1/4" 3 khối, không lỗi; đặt sai 2 lần → "Bé thử lại nhé.", hàng gợi ý, viền khối đúng, rồi làm mờ, bài giữ nguyên; hộp thoát mở giữa lúc Đô Đô leo (nhịp tạm kéo dài để kịp bấm) → hơn 12 s không báo xong, "Ở lại chơi" → leo nốt, sang 2/4; L3 toa chấm (thấy lỗi chấm toa cam → mục 3); L4 5 cột đặt sai được báo, xếp xong → "Mình luyện xong rồi!". Cảnh đo được 400×624 (khớp công thức cỡ màn của contract). Ảnh ở side-session-notes `stack-tower-sim/`.
- [ ] 6.4 Chưa kiểm: máy thật; máy 320pt và 375pt trên simulator (chỉ contract đo); Lật thẻ tạm dừng trên simulator (chỉ contract); app ra nền giữa lúc leo (cùng đường `paused` với hộp thoát).
- [ ] 6.5 Khi gộp: dòng "memory/stack/route/tracing/number_bus scenes only send `onAnswer(true)`" ở `docs/AI_CONTEXT.md` và đoạn §10 BRD ("Xếp tháp … giữ cách chạy cũ") để phiên route-mirror sửa cùng lúc; Xếp tháp nay báo mọi lần sai nhưng vẫn progressive. `NO_MISS_CHANNEL` trong `verify-explore-leveled-rounds-contracts.cjs` vẫn đúng (chỉ kiểm không có lượt theo bậc) nhưng chú thích "no miss channel" không còn đúng với stack_tower. kido-server: cùng cơ chế `version` với nhánh missing-cell, peekaboo-cups, route-mirror — dòng `stack_tower` liền dòng `missing_cell` nên sẽ có xung đột nhỏ khi gộp.
- [ ] 6.6 Owner duyệt, merge nhánh `fix/explore-stack-tower-light` (mobile, server, pipeline) và phát hành.
