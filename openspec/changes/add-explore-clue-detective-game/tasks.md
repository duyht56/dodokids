# Tasks — add-explore-clue-detective-game

> Nguồn chi tiết cho mọi mục: `design.md` của change này. Số đo tái lập bằng
> `research/` (README có lệnh chạy và số mong đợi).
> **Cổng:** không mục nào từ nhóm 1 trở đi bắt đầu trước khi 0.2 xong. Sau 0.2,
> owner có thể cho làm nhóm 1–2 (merge Ô thiếu, module thuần, không phụ thuộc ký
> hiệu) song song với 0.3–0.5. **Renderer (nhóm 5) chỉ code sau khi 0.5 đạt.**
> Lát cắt: A = nhóm 2 → B = nhóm 3–5 (ẩn khỏi catalog) → C = nhóm 6–7 (7.3 bật
> hiển thị cùng commit export pack v9) → D = nhóm 8–11 (server một lần deploy).

> **Quyết định owner 2026-10-21:** (a) chấp nhận; (b) giữ P1-X; độ dài lượt giữ
> nguyên; (c) tên "Thám tử Đô Đô". Owner cho **code ngay, trước buổi thử giấy**:
> renderer (nhóm 5) được code, nhưng game giữ `catalogVisible: false` (ẩn với bé)
> tới khi 0.3–0.5 đạt VÀ pack v9 có trong bundle; nếu thử giấy buộc đổi ký hiệu thì
> sửa renderer sau. Code do Codex CLI viết trong worktree
> `dodokids-wt/clue-detective` (nhánh `feat/explore-clue-detective` từ `main` của cả
> 4 repo), Claude review. Nhánh Ô thiếu CHƯA merge vào đây (owner chọn tách từ
> `main`): nhóm 1 chuyển thành bước hợp nhất lúc tích hợp — merge Ô thiếu trước,
> rồi nhánh này. Xung đột thật duy nhất với nhánh Ô thiếu: server
> `explore.registry.ts`, `interface BundledLocalGameSpec`; giữ cả
> `catalogVisible?` lẫn `version?`. `promptAudio.ts`, `exploreAudioInventory.ts`,
> BRD và AI_CONTEXT merge sạch nhưng phải sửa tay câu trạng thái nhánh (1.4).


> **Lượt sửa B + C 2026-10-21:** đã sửa 15 mục review B, gồm `blast-2` và
> `quality-2`; 18 đột biến trên bản sao đều bị assert riêng bắt. Nhóm 2 đối chiếu
> lại code/contract đã commit và kết quả research của lát A (không đổi generator).
> Lát C lần này chỉ inventory/lệnh gen, server local và docs: không gen audio thật,
> không export pack/bật hiển thị, không merge Ô thiếu, không commit hoặc push.
> Vì vậy phần code ở 6.6 và 8.1 đã xong trên nhánh hiện tại (Ô thiếu v1), còn
> merge/commit ở 6.6b và 8.1b chưa làm; 8.3 chỉ đóng sau khi kiểm lại bản tích hợp.
> Thử giấy, Human Gate và deploy vẫn để mở.

## 0. Cổng trước khi code (owner)

- [x] 0.1 Dựng 2 màn mock đúng kích thước theo design §11, dùng đúng hai bàn mẫu ở
      đó (`research/boards-x.cjs 7`): (1) bậc 1 "Đèn soi" 9 × 2 PNN (K4 ∪ K3), lưới
      3–3–3, ở cả 375×667 và 360×640, lúc đọc thẻ "không có cây nấm" (biển cấm phủ
      lên món, không lóe); (2) bậc 6 "Nhớ thẻ" 9 × 3 NPN cấu hình Pappus ở 360×640
      (không dải lời) ngay sau lần chạm nhầm nhà "chiếc ô tô + hộp quà + bông hoa"
      (thiếu cánh diều). Kèm một bản có câu dài nhất trên dải lời (`clue_hint_2`) và
      một bản cỡ chữ hệ thống 1,3
- [x] 0.2 Owner duyệt OpenSpec + 2 màn mock, sau khi Codex xem lại bản P1-X (vòng 7
      CHƯA DUYỆT bản P1; design §9 "Vì sao bỏ xếp món đệm ngẫu nhiên")
- [x] 0.3 In bộ thử giấy đúng cỡ 360×640 (design §4, §11): 14 món + 2 món dự phòng;
      thẻ A (và B dự phòng); miếng ký hiệu trong suốt (vòng xanh, biển cấm); nắp cửa
      chớp giấy vừa cửa sổ mỗi nhà; miếng hình Đô Đô; bài 2 nhà và 3 nhà thẻ đơn;
      một bàn B1 9 × 2 để làm mẫu; hai bàn mẫu design §11 (B1 9 × 2 emoji 32 pt,
      lưới 3–3–3; B6 9 × 3 Pappus emoji 29 pt); mỗi thứ có bản màu và bản đen trắng
      > Owner bỏ qua thử giấy (21/10/2026).
- [x] 0.4 Thử giấy 5 bé theo 5 bước ở design §4: ≥ 2/5 bé 4,0–4,9 tuổi chưa luyện
      phiếu, ≥ 1 bé đã luyện phiếu; ~15 phút mỗi bé. Ghi nguyên lời bé ở bước 1 và 2;
      **phân biệt gọi tên bằng từ khác (không tính lỗi) với nhận nhầm hình (tính
      lỗi)**; thử cả bản màu, bản đen trắng và tắt tiếng. **Làm mẫu tắt tiếng dùng
      ĐÚNG chuỗi bài làm mẫu của app** (= chuỗi diễn lại): thẻ sáng lần lượt → ký
      hiệu phủ lên món ở mọi cửa sổ có nó → úp nắp cửa chớp lên các nhà chưa đúng
      thẻ đó → còn một nhà, đặt miếng Đô Đô lên nhà đó; KHÔNG gạt nhà ra, không chỉ
      tay vào nhà, không thao tác nào app không có. Ở bước 5 thử đúng hai bàn mẫu
      design §11 (B1 9 × 2 và 9 × 3 Pappus, bàn "mọi món đúng 3 nhà"), đo số lần
      nhận nhầm món, đọc ngược dấu, cần người lớn giúp và thời gian
      > Owner bỏ qua thử giấy (21/10/2026).
- [x] 0.5 Chốt theo tiêu chí ở design §4 (đạt khi đủ 4 tiêu chí; bước 5 chặn code
      renderer nếu vượt ngưỡng). A trượt (1)–(3) → thử B với 5 bé khác; cả hai trượt
      → dừng game, báo owner; trượt (4) → báo owner. Thay món ≥ 2/5 bé nhận nhầm
      hình bằng món dự phòng; thêm cặp gần âm phát hiện được vào
      `CLUE_NEAR_SOUND_PAIRS`. Renderer (nhóm 5) không được code trước khi mục này
      đạt
      > Owner bỏ qua thử giấy (21/10/2026); renderer đã code trước đó theo quyết định owner.
- [x] 0.6 Owner trả lời câu hỏi (a)–(d) ở design §15: (a) chấp nhận quên 1 thẻ
      "không có" vẫn qua 56,9% ở mọi bậc để mẹo đoán thẻ "có" mà không đọc dấu chỉ
      còn ≤ 19%; (b) chấp nhận P1-X (danh mục hoán đổi được: 1 / 1 / 3 / 9 / 9 / 9
      cấu trúc, bậc 1–3 9 nhà × 2 món, bậc 4 đổi hai thứ 9 → 8 nhà + 3 món) hay
      P1-X′ (nới R5 thành R5′, 8 nhà ở bậc 1–3, 2 / 2 / 6 / 12 / 12 / 12 cấu trúc)
      hay giữ P1 (mẹo chỉ đọc thẻ "có" qua 58,6–82,6%); (c) tên game "Thám tử Đô
      Đô" hay "Tìm nhà Đô Đô"; (d) ai làm buổi thử giấy, khi nào

## 1. Hợp nhất nhánh Ô thiếu (lúc tích hợp, theo quyết định owner 2026-10-21)

Trong change này chỉ ĐỌC `missingCellGame.ts` và
`verify-explore-missing-cell-contracts.cjs` làm mẫu, không sửa hai file này.

- [x] 1.1 Merge mobile `f579d30` (nhánh `fix/explore-missing-cell-leak`:
      `missingCellGame.ts`, `promptAudio.ts` thêm `missing_cell_solve`,
      `MissingCellRenderer.tsx`, contract Ô thiếu) vào `main`; chạy
      `test:explore-missing-cell` và mọi `test:explore-*`
      > Xong 21/10/2026: Ô thiếu vào `main` (mobile `f68a5cb`), nhánh này merge `main` sau đó.
- [x] 1.2 Merge server `54b73d2` (cùng nhánh: `explore.registry.ts` thêm
      `BundledLocalGameSpec.version`, `missing_cell` v2,
      `explore.missing-cell.spec.ts`) vào `main` local, **chưa push**; `npm test` +
      `npm run build`
      > Xong 21/10/2026: server `e6572d7` trên `main`.
- [x] 1.3 Merge kido-pipeline `aa783a6` (nhánh `fix/explore-missing-cell-leak`:
      `exploreAudioInventory.ts` thêm `missing_cell_solve`) vào `main` local,
      **chưa push**; `npx vitest run src/explore`
      > Xong 21/10/2026: pipeline `9e0335a` trên `main`.
- [x] 1.4 Sau khi merge Ô thiếu rồi nhánh này: sửa tay các câu trạng thái nhánh
      trong `AI_CONTEXT.md`, BRD §7.15/§9 và comment `exploreAudioInventory.ts`.
      Xoá câu "The missing-cell branch is not merged here… then this one.";
      cập nhật tổng inventory trong AI_CONTEXT và BRD thành 89 khoá / dự kiến
      82 lần tổng hợp, gồm `missing_cell_solve`, bỏ câu "chưa nằm trong số này".
      Xoá comment "Chưa gồm missing_cell_solve…", sửa comment inventory thành
      "56 câu liền từ mobile + missing_cell_solve (Ô thiếu)". Kiểm ba file không
      còn các câu trạng thái cũ; `promptAudio.ts` vẫn giữ `missing_cell_solve`.
      > Xong khi merge `main` vào nhánh này (21/10/2026): câu trạng thái nhánh đã sửa; `missing_cell_solve` đi trong pack v8 nên tổng của Thám tử giữ 88 khoá / 81 lần.

## 2. Module thuần (mobile, lát A — chưa đăng ký mã)

- [x] 2.1 `games/clueDetectiveGame.ts`: `CLUE_ITEMS` (14 món + 2 dự phòng "chú
      rùa", "chú bướm", nhãn đọc riêng), `CLUE_NEAR_SOUND_PAIRS`, bảng bậc T-Lai (K
      9 / 9 / 9 / 8 / 9 / 9, m 2 / 2 / 2 / 3 / 3 / 3, dạng thẻ: PNN ở bậc 1–2, rút độc
      lập ở bậc 3–6, `spotlight`, `cardsFaceDown`), versions, `LEVEL_ORDER`
      [1..6], `clueLevelIntroLine`, `CLUE_DETECTIVE_GAME` (local, offline,
      `dependencyManifest` KHÔNG gồm audio pack), không `runPolicy`
- [x] 2.2 `CLUE_STRUCTURES[level]` tĩnh = danh mục hoán đổi được 7 dòng ở design §9
      (chung cho cả ba dạng thẻ; bậc 1–3 một cấu trúc 9 × 2 K4 ∪ K3; bậc 4 ba cấu trúc
      8 × 3 Möbius–Kantor; bậc 5–6 ba cấu trúc 9 × 3 khuôn (3, 1, 0)), viết bằng món-thẻ
      A, B, C theo vị trí thẻ và món đệm D, E, …; `CLUE_TEMPLATES[level]` suy ra từ cột
      khuôn. KHÔNG có cấu trúc hay trọng số riêng theo dạng. Contract so bằng đúng
      với design §9 (như `research/design-x.cjs` đọc) và kiểm từng dòng: khuôn đối
      xứng dấu, R1–R12 với cả ba vai trò, chặt (như `research/exact-x.cjs`). Bỏ hẳn
      bộ sinh M, bảng 18 khuôn và vòng xếp món đệm ngẫu nhiên của P1
- [x] 2.3 Generator deterministic theo (level, seed), namespace theo bậc: rút cấu
      trúc đều trong `CLUE_STRUCTURES[level]` TRƯỚC và độc lập với dạng; dạng thẻ rút
      đều độc lập mỗi bài từ bậc 3 (namespace riêng, KHÔNG túi ×2, không lấy từ
      bucket); đặt tên A, B, C rồi D, E, … bằng pool 14, rút ĐỀU trên mọi phép gán hợp
      lệ (xáo pool, lấy đủ món; có cặp gần âm thì xáo lại phần đặt tên, trước khi dựng
      bàn; KHÔNG rút tuần tự rồi loại món gần âm, design §9 "Đặt tên đều"); đáp án = nhà
      có chữ ký e_p; vị trí đáp án đều theo seed (KHÔNG túi vị trí);
      ≤ 400 lần thử (contract: lần thử đầu đạt trên mọi seed)
- [x] 2.4 Validator độc lập R0–R12 (design §9) + replay byte-identical; R6 (S1 mọi
      thẻ, S3 ≤ 1/3) ở MỌI bậc; R6c (họ S16, cả ba vai trò); R10 theo khuôn của bậc +
      đáp án e_p; R11 "đổi vai trò" (đặt thẻ "có" ở vị trí 1 / 2 / 3: cả ba đạt
      R1–R6c, ba đáp án khác nhau); R12 "hoán đổi được" (cấu trúc thuộc
      `CLUE_STRUCTURES[level]`, so khoá chuẩn bỏ tên món, món-thẻ cố định theo vị trí);
      thư viện S1–S16 với đúng quy tắc chấm: tập rỗng → đoán bừa 1/K; phép giao rỗng
      → dùng bộ lọc đầu; xếp hạng hoà → chọn đều; bỏ phép giao và chiến lược viết lại
      lời giải (kể cả tổng tần suất món đệm)
- [x] 2.5 Hàm thuần cho renderer: `clueViolation` (thẻ vi phạm đầu tiên, món, loại),
      `clueReplaySteps` (nhà khép ở từng bước; chế độ có lời / ngắn theo bậc và số
      lần nhầm; dùng CHUNG cho diễn lại và bài làm mẫu), `clueDemoBoard` (bàn làm mẫu
      đầu lượt: generator của bậc, namespace `demo`, qua validator, khác `variantKey`
      mọi bài của vòng), `clueSupportCue` (mức 1 không đổi nhà; mức 2 không khép đáp
      án, không tự giảm số nhà mở từ ≥ 2 xuống 1), `clueSpotlight` (vòng xanh / biển
      cấm theo dấu), `clueTeachingPlan` (bài làm mẫu đầu lượt ở mọi bậc bắt đầu; bài
      nào nhắc ký hiệu (bài 1 các vòng sau ở bậc 1–2), bài nào có câu thần chú, theo
      bậc, vị trí bài trong vòng và cờ đã dạy), `clueCardFaceDown` (thiếu clip thì
      ngửa), hàm dựng câu trả về chữ + khoá audio cùng lúc
- [x] 2.6 `CLUE_DETECTIVE_VARIETY`: MỘT bucket mỗi bậc (KHÔNG dùng dạng thẻ hay vị
      trí đáp án làm bucket, vì `planExploreRound` chia đều theo bucket sẽ dựng lại
      túi ×2), `variantKey` = bài cụ thể (chuẩn hoá design §9), `capacityByLevel`
      ≥ 200; KHÔNG khai `QUESTION_POLICIES` cho game này (design §9, Codex vòng 8)
- [x] 2.7 `scripts/verify-explore-clue-detective-contracts.cjs` + npm script
      `test:explore-clue-detective` (chỉ ĐỌC `verify-explore-missing-cell-contracts.cjs`
      làm mẫu), seed cố định:
      - determinism + tampering (đổi đáp án, đổi món một nhà, lật dấu một thẻ, chuyển
        bậc, chèn cặp gần âm, khuôn ngoài bảng, bàn mà một vai trò khác trượt R11,
        xếp lại món đệm thành cấu trúc cùng khuôn ngoài danh mục: "lăng trụ" 9 × 2 →
        R12);
      - R0–R12 trên seed 1..2.000 mỗi bậc (R11 đạt 100%, lần thử đầu đạt 100%);
        danh mục = design §9, chung cho ba dạng, mọi khuôn đối xứng dấu, mọi dòng
        chặt và đạt R1–R12 với cả ba vai trò;
      - thư viện: seed gốc 1000 + bậc, 1.000 vòng × 6 bài mỗi bậc: mọi chiến lược
        không dùng phủ định, đơn, ghép và họ S16 (595, trừ viết lại lời giải), ≤ 1/3
        trên TỪNG bài; mẹo Codex vòng 7 ≤ 1/3; qua bậc tính chính xác
        Poisson–binomial ≤ 19,1%; đoán bừa ≤ 0,6%;
      - **cận Bayes "chỉ đọc thẻ có"** tính chính xác từ danh mục (như
        `research/bayes-p.cjs`): 1/3 mỗi bài, qua ≤ 19,1%; kể cả khi bé biết cách đặt
        tên món (như `research/naming-bias.cjs`: 1/3 trên mọi góc nhìn; đột biến "rút
        tuần tự, loại gần âm ngay khi chọn" phải bị bắt, 33,9–36,2%), và χ² chú cá /
        hộp quà ở chỗ thẻ so với chỗ món đệm khớp tỉ lệ số chỗ; phản ví dụ Codex vòng 7
        (8 × 2) không chặt (như `research/codex-cx.cjs`);
      - **thư viện mù dấu** (như `research/sym.cjs`: mẹo Codex vòng 6, món-thẻ nhiều
        nhà nhất, đồng xuất hiện, vị trí thẻ "có", đổi vai trò theo luật bộ sinh):
        từ bậc 3 mỗi mẹo ≤ 1/3 trên TỪNG bài (trung bình ba vai trò) và cận Bayes
        tính chính xác từ danh mục ≤ 1/3 (qua ≤ 19,1%); bậc 1–2: mọi mẹo mù dấu
        trừ vị trí ≤ 1/3;
      - **điều kiện kín** (design §9, cả năm): phép kiểm danh mục bắt đột biến "thêm
        một cấu trúc chỉ đạt ở vai trò thật" và "thêm cấu trúc không chặt"; cấu trúc
        rút độc lập với dạng (χ² bảng chéo cấu trúc × dạng, p ≥ 0,001); dạng thẻ bậc
        3–6 trên seed 1..2.000 χ² đều p ≥ 0,001, và số bài mỗi dạng trong vòng do
        `planExploreRound` thật dựng khớp Bin(6, 1/3) (χ², p ≥ 0,001; không túi ×2),
        kèm phân phối cấu trúc trong vòng (rủi ro 12, design §15);
      - **hậu nghiệm theo lịch sử** qua `planExploreRound` thật, ≥ 100.000 vòng mỗi
        bậc: mẹo "suy bộ ba món-thẻ của các bài trước từ đáp án đã công bố, rồi loại
        giả thuyết đáp án mà planner sẽ tránh, chỉ đọc thẻ có" ≤ 1/3 + 0,1 điểm phần
        trăm mỗi bài và ở bài thứ sáu; `CLUE_DETECTIVE` không có mục trong
        `QUESTION_POLICIES` (assert);
      - hàng rào chỗ hở công khai, tính chính xác từ danh mục (như
        `research/exact-x.cjs`): S13 tệ nhất ≤ 57,0% ở MỌI bậc (định lý: quên thẻ
        "không có" = 1/2 trên mọi bài); S3 ≤ 8,0% (bậc 1–3, 5–6) và ≤ 20,0% (bậc 4);
      - vị trí đáp án: seed 1..2.000 mỗi bậc, mọi ô có đáp án, χ² đều p ≥ 0,001;
      - ≥ 200 `variantKey` khác nhau mỗi bậc trên seed 1..2.000;
      - phản hồi đúng loại; trợ giúp; diễn lại khép ≥ 1 nhà mỗi bước; R8 ≥ 3;
      - soi theo dấu: hai kiểu vẽ khác nhau, không có hiệu ứng lóe trên món thẻ
        "không có";
      - kế hoạch dạy ký hiệu: mọi bậc bắt đầu 1–6 đều có bài làm mẫu với
        `clue_sign_has` và `clue_sign_not` trước lần chạm nhà đầu tiên; bài làm mẫu
        dùng đúng `clueReplaySteps` (cả khi thiếu clip), không gọi `onAnswer`, không
        trùng `variantKey` với bài của vòng; phần đọc đề không có câu thần chú cùng
        câu dạy ký hiệu (trợ giúp mức 1 sau lần nhầm vẫn đọc thần chú);
      - audio + quy ước xưng hô; thẻ "không có" không có vạch chéo trơn hay X;
      - bố cục 375×667 và 360×640, cỡ chữ 1,0 và 1,3, lưới 3–3–3 (m = 2, m = 3) và
        3–2–3 (m = 3): lưới vừa không cuộn (cả bề ngang hàng 3 nhà), emoji ≥ 22 pt,
        khe giữa nhà ≥ 8 pt, vùng chạm ≥ 88 × 64 pt, số dòng câu dài nhất trên dải
        lời ≤ 2 hoặc cỡ đó bỏ dải lời
- [x] 2.8 Đối chiếu số của contract với `research/` (`node exact-x.cjs`, `node
      table-x.cjs`, `node codex-cx.cjs`, `node bayes-p.cjs <cấu hình> strict`, `node
      naming-bias.cjs`, `node enum.cjs 9x2` / `8x3` cho dòng `KHỚP`): ô nào lệch quá
      0,5 điểm thì dừng, tìm nguyên nhân trước khi đi tiếp

## 3. Mã thứ 13 và đăng ký (mobile, lát B — ẩn khỏi catalog)

- [x] 3.1 `docs/kido-explore-contract.ts`: thêm `clue_detective` cuối danh sách
- [x] 3.2 `mobile/src/types/explore.ts`: thêm `clue_detective` cuối danh sách
- [x] 3.3 `registry.ts`: import, `GAME_COPY` sau `missing_cell` ("Thám tử Đô Đô" hoặc
      tên owner chốt ở 0.6, "Nghe gợi ý, tìm đúng nhà của Đô Đô"), `LOCAL_GAMES`,
      `BUNDLED_OVERRIDES` với `catalogVisible: false`, `LEVELED_ROUNDS`
      (`{ ...LEVELED_ROUND_RULE, introLine }`)
- [x] 3.4 `rendererRegistry.tsx` (đăng ký renderer), `variety.ts` (VARIETY_CONFIGS,
      variantKey, bucketKey một bucket mỗi bậc, KHÔNG thêm QUESTION_POLICIES), `thumbnails.ts`
      (fallback `house`)
- [x] 3.5 `ExploreCatalogScreen.tsx`: nhóm "Quy luật" + sửa assert nhóm trong
      `verify-explore-number-bus-contracts.cjs`
- [x] 3.6 `masteryCriteria.ts`: 6 câu "khi nào bé vững" (design §13)
- [x] 3.7 `verify-explore-leveled-rounds-contracts.cjs` (RENDERERS; câu giới thiệu có
      "bé"), `verify-explore-variety-buckets.cjs` (generator)

## 4. Điều phối đọc đề (mobile)

- [x] 4.1 `ExplorePlayScreen.tsx`: thêm `clue_detective` vào
      `RENDERER_CUED_PROMPT_GAMES` (màn chơi không phát `audioRefs` khi vào bài) và
      `SELF_VOICED_MISS_GAMES`; nút 🔊 gọi hàm đọc lại do renderer đăng ký nếu có,
      không thì giữ hành vi cũ
- [x] 4.2 `rendererRegistry.tsx` (`ExploreRendererProps`): prop đăng ký hàm đọc lại
      (vd `registerPromptReplay`), vị trí bài trong vòng và bộ nhớ của lượt qua
      `runMemory`/`onRunMemoryChange` (React state ở shell, chỉ trong RAM, mất khi
      thoát); game khác không đổi hành vi
- [x] 4.3 `audio.ts`: kiểm chuỗi `onSpeakFeedback(refs, { gentle, onStart,
      stillWanted })` của renderer: `onStart` gọi đúng một lần mỗi câu, promise trả
      `false` khi câu bị bỏ, đổi bài hoặc thoát Khám phá huỷ phần còn lại của chuỗi
      mà không cắt câu lên bậc của màn chơi; sửa nếu thiếu
- [x] 4.4 Assert contract (trong contract của game hoặc contract màn chơi hiện có):
      **đọc một lần** (không phát `audioRefs`, mỗi gợi ý một lần mỗi bài); **chạm
      liên tục** (chạm nhà lúc khoá không tính, không xếp thêm lời; chạm thẻ liên
      tục chỉ đọc câu mới nhất); **chuyển vòng** (câu lên bậc đọc trước, câu đầu của
      renderer chờ); **thoát giữa câu** (lời dừng, không `onAnswer`, không còn timer)

## 5. Renderer (mobile) — chỉ sau 0.5

- [x] 5.1 `renderers/clueDetective/layout.ts` thuần (design §11): hệ số co `fit`,
      sàn emoji 22 pt, dải lời 2 dòng hoặc bỏ khi emoji < 26 pt, khe cột 12 / hàng 8,
      cửa sổ 1 × 2 (m = 2) / 2 × 2 (m = 3), lưới 9 nhà 3–3–3 / 8 nhà 3–2–3 (luôn 3
      hàng; hàng 3 nhà + 2 khe ≤ màn − 40), iPad tối đa 1,35
- [x] 5.2 `ClueDetectiveRenderer.tsx` + `clueDetective/*`: nhà vẽ bằng View (mái,
      cửa sổ, cửa chớp khép/mở, mờ 40%), thẻ ký hiệu đã chốt bằng
      `react-native-svg`, mặt lưng thẻ có chấm thứ tự, soi theo dấu (vòng xanh /
      biển cấm, không lóe), bong bóng bóng mờ món thiếu, `ExploreMascot`,
      `GhostHand` (10 s, không hiện nếu vừa chạm thẻ trong 5 s), giảm chuyển động
- [x] 5.3 Luồng một bài qua điều phối nhóm 4: **bài làm mẫu đầu lượt** ở mọi bậc
      bắt đầu (bàn `clueDemoBoard`, chạy đúng `clueReplaySteps`: thẻ sáng → ký hiệu
      phủ lên món → nhà chưa đúng khép cửa chớp → còn một nhà + `clue_found`, kèm
      câu dạy ký hiệu; thiếu clip / tắt tiếng chạy đúng chuỗi hình đó, 1,2 s mỗi thẻ;
      không `onAnswer`); khoá khi đọc (chạm lúc khoá không tính, tắt bàn tay), sáng
      thẻ ở `onStart`, đèn soi theo dấu (bậc 1), nhắc ký hiệu ở bài 1 các vòng sau
      bậc 1–2, câu thần chú ở bài đầu vòng không có câu dạy ký hiệu, thẻ úp (bậc 6,
      thiếu clip luôn ngửa), mở khoá khi câu cuối xong (thiếu clip 1,2 s mỗi thẻ);
      chạm thẻ nghe lại không giới hạn; 🔊 đọc lại đồng bộ hình
- [x] 5.4 Chạm nhầm: `onAnswer(false)` TRƯỚC, rồi câu luật (clip gợi ý) + câu chỉ
      nhà, hình đúng loại, khép nhà, nhà không nhận chạm trong lúc nói; trợ giúp 1/2
      qua `supportRef`, chỉ khi bàn mở khoá và câu phản hồi đã nói xong
- [x] 5.5 Chạm đúng: diễn lại có lời (bậc 1–2, hoặc bài có ≥ 1 lần nhầm) hoặc diễn
      lại ngắn (bậc 3–6, đúng ngay lần đầu), `clue_found`, chờ
      `max(diễn lại, 1100 ms)` + 250 ms rồi `onAnswer(true)`

## 6. Audio inventory (mobile + pipeline)

- [x] 6.1 kido-pipeline: lệnh sinh lại đúng một (hoặc vài) khoá, kể cả clip inventory
      đã reject (vd `explore-audio:generate -- --keys <key…>`), nếu pipeline chưa có;
      không đụng clip khác; test. Commit local còn mở, làm cùng 6.6b, không push
- [x] 6.2 `promptAudio.ts`: `game_clue_detective`, 7 câu `clue_*`, `clue_intro_2..6`
      (theo ký hiệu đã chốt), hợp kiểu `levelIntroLine` thêm `'clue'`, 14 nhãn
      `clue-*`, 5 mảnh ghép, hàm dựng khoá. `missing_cell_solve` chờ merge ở 1.1
- [x] 6.3 `promptLines.ts`: template `clue_has`, `clue_not`, `clue_fb_extra`,
      `clue_fb_missing` (domain 14 món); `npm run explore-lines:dump`
- [x] 6.4 `verify-explore-prompt-lines-contracts.cjs`: `clueUtterances()`, map
      generator, tham số template; quy ước xưng hô (không "con", "cô", "thầy",
      "sai", "khớp"; câu nhắc tới người chơi gọi "bé")
- [x] 6.5 `exploreAudioCapability.ts`: thêm `explore-audio-vi-v9`
- [x] 6.6 kido-pipeline `exploreAudioInventory.ts`: mirror phrases/labels, nâng
      `EXPLORE_AUDIO_PACK_VERSION` lên v9; `exploreAudioInventory.test.ts` kỳ vọng v9
- [x] 6.6b Gộp `missing_cell_solve`: chờ merge pipeline `aa783a6` ở 1.3 trước
      nhánh này, giữ v9 và dọn comment theo 1.4; chạy
      `npx vitest run src/explore` và mobile `npm run test:explore-prompt-audio`
      sau khi đã merge mobile `f579d30`; commit local cùng 6.1, không push.
      Số 89 khoá / 82 lần tổng hợp ở design §12 chỉ đúng sau bước merge này
      > Không còn cần: `missing_cell_solve` đã được gen/duyệt/export trong pack v8 (21/10/2026); Thám tử là pack v9 riêng.

## 7. Audio batch (Human Gate)

- [x] 7.1 Gen ~81 lần tổng hợp VieNeu `dodo-clone2`:
      `VIENEU_TEMPERATURE=0.7 npm run explore-audio:generate` thường (không `--keys`,
      không `--force`), để 7 nhãn `clue-*` cùng chữ với clip v8 đã duyệt của game khác (vd «chú mèo» của Cân thăng bằng, «quả táo» của bài đếm) được dùng lại.
      `--keys` chỉ để sinh lại khoá `clue_*` bị reject ở 7.2; không bao giờ truyền 7
      nhãn dùng chung (take ép ghi đè clip đã duyệt của game kia)
      > Xong 21/10/2026: `generate` thường, 81 lần tổng hợp (25 câu lẻ + 56 câu liền), 0 lần QC đọc lại; 7 nhãn dùng lại clip v8.
- [x] 7.2 Owner TỰ NGHE riêng 16 clip có chữ "không" (không duyệt gộp) + 14
      `clue_has` + 14 `clue_fb_missing` + chuỗi clip ghép dự phòng; nghe liền chim /
      cá / chó / rùa / bướm; checklist "số chữ 'không' nghe được = số chữ 'không'
      trong câu"; clip chưa rõ → reject → sinh lại đúng khoá đó (6.1) → nghe lại.
      Dự trù 10–15 phút
      > Xong 21/10/2026: owner nghe trang `tmp/audio-review-2026-10-21-v9/` (16 câu «không» xếp đầu, nhóm tên dễ nhầm) và duyệt cả 81.
- [x] 7.3 Export pack v9 → mobile; test offline-audio + prompt-lines + prompt-audio.
      Được export khi game còn ẩn: từ khi Thám tử vào `main`, mọi lần export (kể cả sửa
      clip của game khác) cần đủ 88 khoá `clue_*` đã duyệt. Bật hiển thị
      (`catalogVisible` của `clue_detective`) là commit riêng sau đó, cùng cờ server
      (8.4), sau 10.6
      > Xong 21/10/2026: export 602 clip (297 câu liền), pack `explore-audio-vi-v9`, game vẫn ẩn.
## 8. kido-server (push = deploy)

- [x] 8.1 Code trên server `2c86f85`, chưa commit: `explore.types.ts` (thêm mã
      thứ 13 cuối danh sách), `explore.registry.ts`
      (`PUBLIC_GAMES` cùng tên/mô tả/icon với `GAME_COPY`; `BUNDLED_LOCAL_GAMES`
      prefix `clue-detective`, assets, levels [1..6], `catalogVisible: false`
      mirror bundled), trường tuỳ chọn `BundledLocalGameSpec.catalogVisible`
      và spec đếm catalog 13
- [x] 8.1b Sau 1.2: rebase/merge lên `main` đã có `54b73d2`, giữ cả
      `catalogVisible?` lẫn `version?` trong `interface BundledLocalGameSpec`.
      `clue_detective` không khai `version` nên dùng mặc định 1; gộp code 8.1
      trong **cùng một commit** server. Đổi sang hiện khi làm 7.3, trước push
      > Xong khi merge `main` vào nhánh này (21/10/2026): giữ cả `catalogVisible?` lẫn `version?`.
- [x] 8.2 `explore.service.spec.ts`: đếm catalog 12 → 13 + một `it` (local, offline,
      L1–L6, `generateBatch` báo lỗi); tuỳ chọn `explore.clue-detective.spec.ts`
- [ ] 8.3 `npm test` + `npm run build` server với working tree mobile đã có cả
      missing-cell-v2 lẫn Thám tử (`explore.contract-codes.spec.ts` import mobile);
      ghi lại SHA docs/mobile/server đã kiểm
      > Kiểm 2026-10-21: đã chạy đầy đủ; 52 suite / 594 test đạt, hai suite
      > HTTP (11 test) bị sandbox chặn `listen EPERM 0.0.0.0`. Build server đạt.
      > Giữ 8.3 mở tới khi chạy lại trong môi trường cho phép Supertest mở cổng;
      > hai file test lỗi giống hệt `main`, không phải thay đổi Thám tử.
- [ ] 8.4 Push server CHỈ khi owner cho phép, SAU 7.3 (cờ hiển thị server = hiện),
      gộp Ô thiếu + Thám tử trong MỘT lần deploy; deploy lúc mã còn ẩn thì cần lần
      deploy thứ hai để bật (hiển thị là AND)
- [ ] 8.5 Smoke test sau deploy: server khởi động (health), catalog Khám phá trả 13
      mã, `missing_cell` ở v2, `clue_detective` có đúng cờ hiển thị; app bản đang
      chạy vẫn mở catalog bình thường
- [ ] 8.6 Rollback (design §13 bước 7), tách hai việc:
      - **server hỏng** (smoke test đỏ): `git revert` commit server Thám tử (và
        commit Ô thiếu nếu lỗi do nó) rồi push = một lần deploy tiến; không quay về
        bản deploy cũ, không đụng phần consent. Việc này KHÔNG ẩn game: không có bản
        ghi server thì app dùng bundled (`isExploreGameCatalogVisible`,
        `mobile/src/explore/registry.ts:447–455`, `serverVisible` mặc định `true`);
      - **muốn ẩn game**: kill switch = commit server GIỮ bản ghi `clue_detective`
        với `catalogVisible: false` (trường tuỳ chọn của `BundledLocalGameSpec`) +
        ngoại lệ có tên trong `explore.contract-codes.spec.ts` (server chỉ được chặt
        hơn bundled), `npm test` + `npm run build`, owner duyệt push; smoke test
        catalog trả `catalogVisible: false` và app ẩn thẻ. Ghi rõ giới hạn: app không
        cache catalog server, máy offline vẫn thấy game; tắt cả offline cần bản app /
        OTA có bundled `catalogVisible: false`

## 9. Docs

- [x] 9.1 BRD §7.15 (mẫu §7.14, có chỗ hở công khai), §10 (danh sách game chơi theo
      bậc), §9 (pack v9), sửa tiêu đề §7 "DANH MỤC 8 TRÒ CHƠI"
- [x] 9.2 `AI_CONTEXT.md`: 13 mã, pack v9, gạch đầu dòng Thám tử
- [ ] 9.3 `KIDO_MARKETING_CLAIMS.md`: khi tích hợp, sau khi bản sửa claims ở
      checkout chính đã commit, thêm dòng ⛔ nội bộ cho Thám tử với mã còn trống.
      Không cấp mã mới ở nhánh này; public copy giữ nguyên tới khi lên store
- [x] 9.4 `KIDO_EXPLORE_THUMBNAIL_PROMPTS.md`: dòng trạng thái + §10

## 10. Kiểm chứng

- [ ] 10.1 Đo thời lượng clip thật của pack v9; tính P95 thời gian khoá đọc đề và
      diễn lại theo bậc; cập nhật bảng thời lượng ở design §2
- [x] 10.2 mobile `npx tsc --noEmit`, `npm run lint`, mọi `npm run test:explore-*`
- [ ] 10.3 kido-server `npm test`, `npm run build`; kido-pipeline `npm test`
- [ ] 10.4 Chơi thật trên iOS simulator (cỡ SE) và máy/emulator 360×640: lượt từ bậc
      1 lên bậc 2 (bài làm mẫu, rồi nhắc ký hiệu ở vòng bậc 2), bắt đầu ở bậc 5 (bài
      làm mẫu có câu dạy ký hiệu), một vòng bậc 6 (thẻ úp),
      chạm nhầm cả hai loại, trợ giúp mức 2, nút 🔊, máy bay (offline), tắt tiếng,
      cỡ chữ 1,3
- [ ] 10.5 Review workflow (nhiều góc nhìn, kiểm chéo) như Cân §8
- [ ] 10.6 (Cổng trước khi bật hiển thị) Test play-shell gắn `ClueDetectiveRenderer` thật cạnh
      màn chơi, chạy effect con trước cha như React: tạm dừng lúc rảnh (đọc câu hỏi + thẻ
      một lần), lúc đang đọc thẻ / trợ giúp (renderer tự đọc tiếp, màn chơi không đọc
      chồng), lúc khoảng lặng giữa hai câu, lúc bài mẫu / phản hồi / diễn lại. Vòng
      `onPromptCue` của `verify-explore-play-shell-contracts.cjs` không phủ Thám tử
      (game dùng `registerPromptReplay`). Kèm xem lại: tiếp tục bài mẫu / diễn lại sau
      tạm dừng vẫn hiện cửa chớp + đèn soi cũ trong lúc hỏi lại (có từ trước merge)

## 11. Thử với bé sau khi có bản chạy

- [ ] 11.1 Playtest 3–5 bé trên máy nhỏ: bậc 1–2 (phủ định, ký hiệu, bài làm mẫu),
      bậc 3 (đổi chỗ thẻ), chỗ chuyển bậc 3 → 4 (bớt một nhà, thêm món), bậc 5 (bàn
      "đều" 9 × 3), bậc 6 (thẻ úp); ghi mẫu chọn lặp (dấu hiệu học mẹo của danh mục:
      mọi bậc ít cấu trúc, bậc 1–3 chỉ 1), đo bàn tay gợi ý 10 s, độ dài bài làm mẫu
      và diễn lại
- [ ] 11.2 Owner chơi thử và quyết định đưa vào bản phát hành
