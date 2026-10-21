## 1. Ô thiếu (mobile `a16c305`, nhánh `feat/explore-missing-cell-warmup` từ `main` `ea97722`)

- [x] 1.1 `MISSING_CELL_LEVELS`: bậc làm quen 0 (2×2 hình × màu, cấu hình L1 cũ) + L1–L3 3×3 (L3–L5 cũ); `MISSING_CELL_LEVEL_ORDER` = [1,2,3]; variety khai bậc 0; generator/validator/config/manifest v3.
- [x] 1.2 `missingCellStartLevelFromV2` (1–3 → 1, 4 → 2, ≥5 → 3).
- [x] 1.3 Renderer: prop `demo` — thần chú gentle sau câu hỏi, sáng hàng rồi cột lúc câu bắt đầu, lựa chọn khoá + mờ tới khi nói xong và ≥ 2 s, hàng + cột vẫn sáng khi chọn; nhịp qua `useBusSequencer(paused)` / `throughPause`.
- [x] 1.4 `promptAudio.ts`: `MISSING_CELL_LEVEL_INTRO` (L2 → intro_4, L3 → intro_5), `missingCellWarmUpDoneLine` (intro_3); bỏ `missing_cell_intro_2`.

## 2. Khung chơi chung (mobile `a16c305`)

- [x] 2.1 `registry.ts`: `ExploreWarmUp`, `ExploreLeveledRounds.warmUp`, `getExploreWarmUp(game, startLevel)` (chỉ ở bậc thấp nhất, bậc làm quen không được là bậc của game); `missing_cell` khai 2 bài, 1 bài làm mẫu.
- [x] 2.2 `rendererRegistry.tsx`: prop tuỳ chọn `demo`.
- [x] 2.3 `ExplorePlayScreen.tsx`: bài làm quen đặt trước vòng (`warmUpCount`), chỉ lượt đầu của lần mở game (`warmUpOfferedRef`); không đếm đúng-lần-đầu, không là bài cuối vòng; `finishWarmUp` như lên bậc (`fb_level_next` + `doneLine`, khoá tới khi nói xong, đọc lại câu hỏi); đầu màn «Làm quen k/2» + chấm riêng, vòng không chứa bài làm quen; khoá bài đã chơi chỉ gồm bài trong vòng.

## 3. Bậc bắt đầu đã lưu (mobile `a16c305`)

- [x] 3.1 `parentConfig.ts`: `EXPLORE_PARENT_CONFIG_VERSION = 1`, `migrateExploreParentConfig(input, fromVersion)` (sanitize rồi chuyển Ô thiếu; bậc chung cũ ghim cho riêng Ô thiếu).
- [x] 3.2 `parentPreferencesStore.ts`: persist `version: 1` + `migrate`.

## 4. Test (mobile `a16c305`)

- [x] 4.1 `test:explore-missing-cell`: thang 3 bậc 3×3 + bậc làm quen, corpus/tamper/support/vòng một bài ở cả bậc 0, mẹo loại trừ = 1 chỉ ở bậc làm quen, mọi bậc chấm điểm 3×3 và mọi mẹo ≤ 1/2, đăng ký `warmUp`, intro mới, `missing_cell_intro_2` đã bỏ, không vòng nào rơi vào bậc 0, bảng chuyển bậc cũ; diễn mẫu qua harness (khoá, sáng hàng → cột, tạm dừng nói lại, ≥ 2 s, bảng không `demo` chơi ngay).
- [x] 4.2 `test:explore-play-shell` §10 (màn chơi thật): «Làm quen 1/2» → «Bậc 1/3, 1/6»; 2/2 làm quen đúng ngay + 3/6 → luyện lại L1 (đếm làm quen thì thành 5/6 và lên bậc); 4/6 → L2; làm quen sai vẫn vào vòng bình thường; «Chơi lượt mới» không có làm quen; bậc 2/3 không có làm quen; Tìm quy luật không đổi; câu thần chú chờ câu hỏi (clip thời lượng thật).
- [x] 4.3 `test:explore-leveled-rounds` §7: chỉ Ô thiếu có làm quen, bậc làm quen không là bậc của game, chỉ từ bậc thấp nhất, batch bài khác nhau đúng bucket, câu kết đúng giọng Đô Đô.
- [x] 4.4 `test:explore-parent-config`: bảng chuyển 1–5/6/99, bậc chung, rác, version 1 giữ nguyên, kẹp; store qua lần mở lại app (v0 `missing_cell: 4` → 2, lưu lại version 1, mở lần nữa không chuyển).
- [x] 4.5 Kiểm ngược (làm hỏng mã có chủ đích, đã trả lại): đếm đúng-lần-đầu ở bài làm quen → §10 đỏ; làm quen ở mọi lượt → đỏ; làm quen ở mọi bậc bắt đầu → đỏ; chấm vòng gồm bài làm quen → đỏ; store version 0 → parent-config đỏ; thần chú không gentle → §10 đỏ.

## 5. Server và pipeline (commit local, không push)

- [x] 5.1 kido-server `7870c06` (nhánh `feat/explore-missing-cell-warmup` từ `main` `0688497`): `missing_cell` levels [1,2,3] version 3; `explore.missing-cell.spec.ts` theo bậc làm quen + L1–L3.
- [x] 5.2 kido-pipeline `af860fd` (cùng tên nhánh, từ `main` `da55776`): bỏ `missing_cell_intro_2` khỏi `exploreAudioInventory.ts`.

## 6. Audio

- [x] 6.1 Không có clip mới, không render. `missing_cell_intro_2:v1` không còn được dùng; lần xuất pack sau sẽ bỏ key khỏi registry, file `.wav` đã phát hành giữ nguyên.

## 7. Kiểm chứng

- [x] 7.1 mobile: mọi `npm run test:*` (32 script) xanh, `npx tsc --noEmit` xanh, `npm run lint` 0 lỗi (9 cảnh báo có sẵn ở file khác).
- [x] 7.2 kido-server: `npx jest src/modules/explore` 22 suite / 244 test xanh, `npm run build` xanh.
- [x] 7.3 kido-pipeline: `npx vitest run src/explore` 8 file / 99 test xanh.
- [x] 7.4 iOS Simulator (iPhone 17 Pro Max, Metro riêng từ worktree): vào Ô thiếu thấy «Làm quen 1/2», bài đầu sáng hàng rồi cột với thần chú, lựa chọn sống lại sau đó; bài 2/2 tự làm; vào «Bậc 1/3, 1/6» bảng 3×3 có ô che, «Giỏi quá! Bé lên bậc mới nhé!» dưới bảng; chơi vòng 4/6 đúng ngay → «Bậc 2/3» bảng chấm 3×3. Ghi v0 `missing_cell: 4` → mở «Bậc 2/3» không có làm quen, storage thành `missing_cell: 2` version 1; đã xoá lại khoá đó.
- [x] 7.5 `openspec validate update-explore-missing-cell-warm-up --strict`.
- [ ] 7.6 Chưa kiểm: trẻ thật, Android, máy 320–375 pt cho bài làm quen, âm thanh nghe thật trên máy.

## 8. Khi archive

- [ ] 8.1 Archive sau `add-explore-missing-cell-game` và `fix-explore-missing-cell-leak` (delta này sửa requirement của hai change đó); Purpose của `explore-missing-cell-game` ("a 2×2 or 3×3 grid") nên ghi thêm "2×2 chỉ ở bài làm quen".
- [ ] 8.2 Requirement mới của `explore-session-runtime` đứng cạnh "Leveled rounds" (`update-explore-leveled-rounds`, chưa archive).
