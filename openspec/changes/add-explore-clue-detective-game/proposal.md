# Đề xuất: Thám tử Đô Đô (`clue_detective`) — suy luận loại trừ nhiều điều kiện có phủ định

## Why

Khám phá chưa có game nào dạy **suy luận loại trừ nhiều điều kiện có phủ định**:
giữ vài gợi ý cùng lúc ("có quả táo", "không có chú mèo", "không có cây nấm"), áp
từng gợi ý để loại dần lựa chọn, và kìm phản xạ chạm vào thứ vừa nghe tên khi gợi
ý là "không có". Đây là kỹ năng đọc hiểu đề lớp 1 cần ("không", "chưa", "còn
lại"). Dạng bài neo vào một câu đề Đoàn Thị Điểm 2011–2012 (nhìn 3 lớp học, theo
gợi ý phủ định tìm lớp của Mai), nhưng nguồn chỉ là báo đăng lại (Tiền Phong
12/04/2013) và trường không xác nhận, nên game định vị là **"luyện suy luận nhiều
điều kiện"**, không nói "sát đề".

Owner quyết định 2026-10-20 làm game mới, catalog lên 13 thẻ, xem OpenSpec + 2
màn mock trước khi code. Thước đo của owner (lý do đã xoá Ai lạc đàn, Tìm bóng,
Dọn đồ, Cặp đôi hoàn hảo ngày 2026-09-18): "không có value lắm, quá dễ, không có
tính sư phạm". Chuẩn owner thích là Cân thăng bằng (6 bậc, mỗi bậc gỡ một nấc hỗ
trợ, câu thần chú, diễn lại lời giải + câu chốt sau mỗi bài đúng). Vì vậy bậc nào
cũng ba gợi ý (1 "có" + 2 "không có"); đoán bừa qua bậc ≤ 0,6%; mọi chiến lược
**không dùng phủ định** trong một thư viện hữu hạn, công khai (S1–S15 và họ "lọc
rồi xếp hạng" S16), kể cả mọi mẹo ghép hai bộ lọc, đúng ≤ 1/3 trên từng bài (qua
bậc ≤ 19,0%), kiểm bằng validator trên từng bài. Codex vòng 6 chỉ ra bộ sinh M cũ
lộ đáp án cho bé **không đọc dấu thẻ** (100% ở cả 6 bậc), nên thiết kế dùng **khuôn
đối xứng dấu ở mọi bậc**: mọi mẹo không đọc dấu, kể cả cận Bayes, đúng ≤ 1/3 mỗi
bài từ bậc 3 (qua 19,0%). Codex vòng 7 (CHƯA DUYỆT) chỉ ra bản khuôn đối xứng xếp
món đệm ngẫu nhiên (P1) vẫn để một mẹo **chỉ đọc thẻ "có"** ("có món đó, chọn nhà có
tổng tần suất các món nhỏ nhất") đúng 55–62% mỗi bài ở bậc 1–3, 5–6 (qua 70–82%),
vì món đệm có thống kê khác món-thẻ. Bản này (**P1-X**) chỉ rút cấu trúc bàn trong
một **danh mục hoán đổi được** cố định: trên mọi bàn, ba nhà có món thẻ "có" không
phân biệt được bằng bất kỳ cách đếm nào, nên **mọi mẹo chỉ đọc thẻ "có", kể cả cận
Bayes**, đúng 1/3 mỗi bài (qua 19,0%). Chỗ hở còn lại được **công khai**: bé quên
một thẻ "không có" vẫn qua 56,9% ở **mọi** bậc (định lý của khuôn đối xứng; bậc 5–6
tăng từ 33,1% của M); mẹo "bỏ thẻ có, chọn nhà có tổ hợp duy nhất" 100% (cả hai đều
là suy luận một phần có dùng phủ định). Cái giá: rất ít cấu trúc (1 / 1 / 3 / 9 / 9
/ 9 mỗi bậc, bài cụ thể vẫn hàng nghìn nhờ đổi tên món) và bậc 4 đổi hai thứ.

## What Changes

- **Game local, offline, stateless mới** `clue_detective` ("Thám tử Đô Đô"), một
  exerciseType, 6 bậc theo bảng **T-Lai**, mỗi bậc thêm đúng một nấc khó: bậc 1 "Đèn
  soi" (9 nhà × 2 món xếp 3–3–3, thẻ "có" đứng đầu, bài làm mẫu đầu lượt + đèn soi
  theo dấu, 21 hình) → bậc 2 "Tự soi" (bỏ đèn soi) → bậc 3 "Đổi chỗ thẻ"
  (PNN/NPN/NNP rút độc lập mỗi bài) → bậc 4 "Nhà ba món" (8 × 3 xếp 3–2–3, 27 hình;
  bớt một nhà cùng lúc, câu hỏi owner (b)) → bậc 5 "Nhiều nhà hơn" (9 × 3, 30 hình)
  → bậc 6 "Nhớ thẻ" (thẻ úp sau khi đọc). Bỏ hẳn bài hai thẻ và dạng hai thẻ "có".
  Không bậc nào gọi là "cổng dùng đủ 3 thẻ".
- **Dạy trong game**: câu thần chú "Bé soi từng thẻ một. Nhà Đô Đô đúng với cả ba
  thẻ." ("đóng cửa" chỉ dùng cho việc Đô Đô làm; bỏ chữ "khớp"); **bài làm mẫu đầu
  lượt** ở mọi bậc bắt đầu: Đô Đô tự giải một bàn bằng ĐÚNG chuỗi diễn lại (thẻ sáng
  lần lượt → ký hiệu phủ lên món → các nhà chưa đúng thẻ đó khép cửa chớp → còn một
  nhà), kèm câu dạy ký hiệu; thiếu audio hay tắt tiếng vẫn chạy đúng chuỗi đó (Codex
  vòng 6 mục 2B); bậc 1–2 nhắc ký hiệu ở bài đầu các vòng sau; đèn soi và phản hồi
  vẽ đúng ký hiệu của thẻ (vòng xanh / biển cấm), không bao giờ "lóe" món bị cấm;
  nghe lại không giới hạn; khoá chạm khi Đô Đô đang đọc (không đếm ngược).
- **Diễn lại sau mỗi bài đúng, một hành vi**: có lời ở bậc 1–2 và ở mọi bậc khi bài
  có lần nhầm; bài đúng ngay lần đầu từ bậc 3 thì thẻ sáng lần lượt + khép cửa im
  lặng + câu chốt (~4 s). Thời lượng ước tính đo theo 229 ms/âm tiết.
- **Phản hồi sai nói luật trước rồi chỉ nhà**, hai loại ("có món bị cấm" / "thiếu
  món phải có"), dùng lại clip gợi ý; trợ giúp mức 1 đọc lại, mức 2 khép các nhà
  trái thẻ đầu nhưng không tự giảm số nhà mở từ ≥ 2 xuống 1; bàn tay gợi ý sau 10 s,
  chỉ trỏ thẻ.
- **Điều phối đọc đề**: `clue_detective` vào `RENDERER_CUED_PROMPT_GAMES`; renderer
  đọc câu đố + từng gợi ý qua `onSpeakFeedback({ gentle, onStart, stillWanted })`,
  sáng thẻ đúng lúc câu bắt đầu, mở khoá khi câu cuối xong; 🔊 đọc lại đồng bộ hình.
- **Khuôn đối xứng dấu + danh mục cấu trúc hoán đổi được + validator độc lập** (thay
  bộ sinh M và cách xếp món đệm ngẫu nhiên): bảng `CLUE_STRUCTURES` 7 dòng dùng chung
  cho cả ba dạng thẻ (bậc 1–3: 9 × 2 "K4 ∪ K3", 1 cấu trúc; bậc 4: 8 × 3 cấu hình
  Möbius–Kantor, 3 cách đặt thẻ; bậc 5–6: 9 × 3 khuôn (3, 1, 0), 3 cấu trúc gồm
  Pappus), rút cấu trúc trước, chỉ đặt tên món (rút đều trên mọi phép gán hợp lệ, để
  bé biết cách đặt tên cũng không vượt 1/3), đáp án là nhà có chữ ký một món của
  thẻ "có"; mọi dòng đã đạt mọi luật với cả ba vai trò (không còn vòng xếp món đệm).
  Vét cạn chứng minh 8 × 2 và 9 × 3 (2, 1, 1) không có cấu trúc nào như vậy khi giữ
  luật "món đệm ≥ 2 nhà". Dạng thẻ rút độc lập mỗi bài từ bậc 3 (không túi ×2,
  contract χ²); pool 14 món + R9 cặp gần âm, vị trí đáp án đều theo seed (không túi
  vị trí); validator R0–R12 gồm thư viện S1–S15, luật R6b cho mọi phép giao hai bộ
  lọc không dùng phủ định, **R6c cho họ S16 (595 chiến lược, công khai)**, **R11
  "đổi vai trò"** và **R12 "hoán đổi được"** (cấu trúc thuộc danh mục; mọi dòng
  danh mục chặt); contract đo thêm thư viện mù dấu, cận Bayes mù dấu và cận Bayes
  "chỉ đọc thẻ có".
- **Script tái lập** mô phỏng trong `research/` của change, đọc thẳng bảng bậc và
  danh mục `CLUE_STRUCTURES` từ `design.md` (README: lệnh chạy, số mong đợi); P1 cũ
  (xếp món đệm ngẫu nhiên) giữ để so, đọc `research/p1-design.md`, `sym.cjs` sửa cho
  khớp chữ của bộ sinh P1; script chỉ phục vụ bộ sinh M giữ ở `research/legacy/`.
- **Ký hiệu**: thẻ "có" tròn nền xanh đặc, thẻ "không có" kiểu biển cấm (viền tròn
  + vạch chéo), không bao giờ X/vạch chéo trơn; phương án dự phòng "món vắng".
  **Cổng thử giấy 5 bé trước khi code renderer** (≥ 2/5 bé 4,0–4,9 tuổi chưa luyện
  phiếu; bản màu, đen trắng, tắt tiếng; làm mẫu tắt tiếng bằng đúng chuỗi bài làm
  mẫu của app, không có bước "gạt nhà ra"; bàn B1 9 × 2 và bàn 9 × 3 Pappus thật).
- **Bố cục**: lưới 9 nhà 3–3–3 / 8 nhà 3–2–3 (luôn 3 hàng), hệ số co `fit`, sàn
  emoji 22 pt, dải lời 2 dòng hoặc bỏ dải lời trên màn thấp, khe giữa nhà ≥ 8 pt;
  contract đo cả cỡ chữ 1,3.
- **Lượt theo bậc** dùng luật chung 6/4/1 (`LEVELED_ROUND_RULE`).
- **Batch audio một lần → pack `explore-audio-vi-v8`**: 88 khoá mới (56 câu liền
  theo món, 13 câu cố định, 5 mảnh, 14 nhãn) + `missing_cell_solve` của Ô thiếu; 16
  clip có chữ "không" owner tự nghe riêng; quy trình reject → sinh lại một khoá.
- **Hiển thị**: game chỉ hiện trong catalog khi pack v8 có trong bundle
  (`catalogVisible: false` tới lúc đó). Không thêm audio pack vào
  `dependencyManifest`.
- `EXPLORE_GAME_CODES` ba nơi thêm `clue_detective` ở cuối (13 mã); catalog 12 →
  13 thẻ, nhóm "Quy luật" (đề xuất); kido-server mirror theo thứ tự merge/deploy
  cứng (Ô thiếu trước, một commit server, push chỉ khi owner cho phép, smoke test).
  Rollback tách hai việc: server hỏng thì revert; muốn ẩn game thì **kill switch**
  giữ bản ghi server với `catalogVisible: false` (revert mã server KHÔNG ẩn game vì
  app dùng bản bundled; hiển thị = bundled AND server).

## Capabilities

### New Capabilities

- `explore-clue-detective-game`: puzzle "nhà Đô Đô là nhà nào?" 6 bậc dạy suy
  luận loại trừ nhiều điều kiện có phủ định, với bộ sinh rút từ danh mục cấu trúc
  hoán đổi được (khuôn đối xứng dấu) + validator độc lập chặn một thư viện chiến lược
  hữu hạn trên từng bài, chặn mọi mẹo chỉ đọc thẻ "có" (R12) và mọi mẹo không đọc dấu
  (R11, dạng thẻ rút độc lập), chỗ hở công khai được đo, renderer
  tự điều phối đọc đề, bài làm mẫu đầu lượt ở mọi bậc bắt đầu, phản hồi theo đúng
  gợi ý bị vi phạm, diễn lại lời giải sau mỗi bài đúng, lượt theo bậc và trợ giúp
  không lộ đáp án.

## Impact

- **Mobile Explore**: `games/clueDetectiveGame.ts` (mới),
  `renderers/ClueDetectiveRenderer.tsx` + `renderers/clueDetective/*` (mới),
  `registry.ts` (GAME_COPY, LOCAL_GAMES, BUNDLED_OVERRIDES, LEVELED_ROUNDS),
  `rendererRegistry.tsx` (renderer + prop đăng ký đọc lại, vị trí bài trong vòng,
  bộ nhớ của lượt), `audio.ts` (kiểm/sửa chuỗi lời gentle của renderer),
  `variety.ts`, `thumbnails.ts`, `masteryCriteria.ts`, `promptAudio.ts`,
  `promptLines.ts` + `explorePromptLines.generated.json`,
  `exploreAudioCapability.ts` (pack v8), `types/explore.ts`,
  `ExploreCatalogScreen.tsx` (nhóm), `ExplorePlayScreen.tsx`
  (`RENDERER_CUED_PROMPT_GAMES`, `SELF_VOICED_MISS_GAMES`, 🔊); script mới
  `verify-explore-clue-detective-contracts.cjs` (`test:explore-clue-detective`) và
  sửa contract leveled-rounds, variety-buckets, prompt-lines, Xe buýt (assert nhóm
  catalog).
- **kido-server**: `explore.types.ts`, `explore.registry.ts`, spec đếm catalog 13,
  trong một commit, sau khi merge `54b73d2` (Ô thiếu); `catalogVisible` server mirror
  đúng cờ bundled (spec contract-codes so trường này). Push = deploy; chỉ push khi
  owner cho phép, sau khi app bật hiển thị (pack v8), gộp một lần deploy với Ô
  thiếu. Nếu phải ẩn game sau phát hành: kill switch là một commit server riêng
  (`catalogVisible: false` cho `clue_detective` + ngoại lệ có tên trong
  `explore.contract-codes.spec.ts`), không phải revert.
- **kido-pipeline**: lệnh sinh lại đúng một khoá (nếu chưa có), mirror
  `exploreAudioInventory.ts`, pack v8, batch gen. Commit local, không push.
- **docs**: `kido-explore-contract.ts`, BRD §7.15 + §9 + §10, `AI_CONTEXT.md`,
  `KIDO_MARKETING_CLAIMS.md` C-50, `KIDO_EXPLORE_THUMBNAIL_PROMPTS.md`.
- **Phụ thuộc Ô thiếu**: merge mobile `f579d30` + server `54b73d2` (nhánh
  `fix/explore-missing-cell-leak`) vào `main` trước; change này không sửa
  `missingCellGame.ts` hay contract riêng của Ô thiếu.
- **Không** đổi schema lesson, curriculum, progress, reward, analytics hay
  `explore-stateless-privacy`: mọi trạng thái chơi (kể cả cờ đã dạy ký hiệu) chỉ nằm
  trong bộ nhớ. Không đổi shape `ExploreExerciseEnvelope`, `ExploreRunSlot`,
  `ExploreRunPolicy`.
- Effort **L**, cộng 1–2 tuần lịch cho thử giấy, owner nghe audio và playtest
  (`design.md` §13).
