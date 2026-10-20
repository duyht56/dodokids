# Tasks

## 1. Engine
- [x] 1.1 `ExploreLeveledRounds.roundSize`, `LEVELED_ROUND_RULE` (6/4/1),
      `getExploreRunSize` trả cỡ vòng
- [x] 1.2 Bật `pattern_finder`, `missing_cell`, `peekaboo_recall`,
      `number_chain`; bỏ khỏi `isProgressiveExploreRunGame`
- [x] 1.3 `planExploreRound`: batch nhiều bài trộn đều mode (quota bài chưa ra
      mỗi bucket)
- [x] 1.4 Màn chơi đọc lại câu đề ở bài đầu vòng mới
- [x] 1.5 Ú òa: đồng hồ cát chờ bàn chơi mở

## 2. Kiểm
- [x] 2.1 `verify-explore-leveled-rounds-contracts.cjs` + `test:explore-leveled-rounds`
      (vòng một bậc, không lặp, trộn đều, vòng thêm tránh vòng trước, phụ huynh
      chọn mọi bậc, chỉ game báo sai mới bật, Ú òa chờ mở bàn)
- [x] 2.2 Sửa contract pattern / missing-cell / peekaboo / number-chain
- [x] 2.3 kido-server spec pattern / missing-cell / peekaboo-recall
- [x] 2.4 Review workflow (4 góc nhìn, kiểm chéo 3 phiếu): 5 lỗi giữ lại đã sửa —
      lượt mới chỉ tránh vòng cuối (giờ nhớ bài theo bậc, tránh bài ở bậc bắt
      đầu: lặp 21–100% → 0/150; kiểm lại thấy cửa sổ 8 cắt mất vòng đầu và Cân
      thăng bằng bậc 2 hết bài → provider giữ 2×count, authored chừa chỗ theo
      capacity, test hành vi 3 vòng cùng bậc), cổng "báo sai" khớp cả chú thích (giờ đọc cây
      cú pháp; thêm `number_bus` vào danh sách không có kênh báo sai), spec/đầu
      file Ô thiếu & Ú òa còn ghi "một bài mỗi bậc", tên game không theo catalog
- [x] 2.5 Chơi thử trên simulator (iPhone 17 Pro, 18/10): Ô thiếu và Ú òa qua
      vòng bậc 1 → "Bậc 2/5", 6 chấm sáng + câu lên bậc; Ú òa bậc 2 giữ đồng hồ
      cát đầy trong lúc Đô Đô nói rồi mới chạy. Chưa thử vòng luyện thêm trên máy.

## 3. Docs
- [x] 3.1 BRD §6.1, §7.7, §7.12, §7.14, §10; AI_CONTEXT; EXPLORE_ZERO_HISTORY

## 4. Chờ owner
- [ ] 4.1 Bốn game còn lại: `mirror_build`, `stack_tower`, `route_planner`,
      `number_bus` (`ordinal_position` xong, xem §5; `spin_pattern` gộp vào
      `pattern_finder` 2026-10-20, change `merge-explore-spin-into-pattern`)
- [x] 4.2 Câu giới thiệu từng bậc cho 4 game (một batch audio) — 16 câu owner
      duyệt 18/10; `levelIntroLine` + `introLine` trong `LEVELED_ROUNDS`, mirror
      pipeline, contract leveled-rounds §6 xanh; owner nghe + duyệt 16 clip, đã
      export vào pack v6 (440 clip). Chưa nghe trong app trên máy.

## 5. Đúng vị trí (`ordinal_position`, owner đồng ý 2026-10-20)
- [x] 5.1 Điều kiện: renderer báo mọi lần chạm sai (`onAnswer(false)`, gate đọc
      cây cú pháp); khoá biến thể gồm cả bộ đồ vật nên 2 vòng × 6 bài mỗi bậc
      không lặp (capacity L1 = 12). Số câu hỏi khác nhau ít: L1 4 câu đọc
      (7 kiểu hàng/vị trí), L3 6 câu, nên trong vòng có câu nghe lặp với kệ khác.
- [x] 5.2 Bỏ khỏi `isProgressiveExploreRunGame`, thêm vào `LEVELED_ROUNDS`
      (`LEVELED_ROUND_RULE`, `levelIntroLine('ordinal', level)`)
- [x] 5.3 4 câu intro `ordinal_intro_2..5` (owner duyệt câu), mirror pipeline,
      gen TTS (VieNeu dodo-clone2, temp 0.7), owner nghe + duyệt 4 clip, export
      vào pack v7 (486 clip, file cũ không đổi byte nào)
- [x] 5.4 Contract ordinal-position + leveled-rounds; BRD §10; AI_CONTEXT
- [x] 5.5 Chơi thử trên simulator (iPhone 17 Pro, 20/10): "Bậc 1/5" 1/6…6/6, một
      lần chạm sai (ô mờ, «Bé thử lại nhé.»), 5/6 đúng lần đầu → "Bậc 2/5" +
      «Giỏi quá! Mình lên bậc mới nhé!», bài đầu bậc 2 đếm từ bên phải; clip
      `ordinal_intro_2..5` có trong bundle. Thấy 3 bài liền cùng câu «thứ 1 tính
      từ bên trái» ở bậc 1 (planner trộn theo mode + bộ đồ vật, không theo câu hỏi).
