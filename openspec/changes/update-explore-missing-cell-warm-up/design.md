# Thiết kế: `update-explore-missing-cell-warm-up`

## 1. Vì sao 2×2 không được chấm điểm

Số đo của contract (`npm run test:explore-missing-cell`, 2000 seed mỗi bậc, bé chọn
đều trong các lựa chọn mẹo còn để lại):

| Mẹo | Làm quen 2×2 | L1 3×3 hình | L2 3×3 chấm | L3 3×3 trộn |
|---|---|---|---|---|
| Đoán bừa | 0,333 | 0,250 | 0,250 | 0,250 |
| Không có trên bảng | 0,500 | 0,250 | 0,250 | 0,250 |
| Chung đặc điểm nhiều nhất | 0,000 | 0,250 | 0,250 | 0,250 |
| Chỉ giá trị có trên bảng | 0,500 | 0,250 | 0,250 | 0,250 |
| **Không có trên bảng + chỉ giá trị có trên bảng** (loại trừ) | **1,000** | 0,250 | 0,250 | 0,250 |
| Đọc một chiều | 0,750 | 0,500 | 0,500 | 0,500 |

Ở 2×2 không che được ô nào (che chéo thì bảng đọc hai cách — leak design §3), nên
nhiễu là một ô trên bảng và một hình có giá trị lạ: loại hai thẻ đó là xong. Mọi mẹo
khác đã được chặn, nhưng chỉ cần một mẹo 100% là đủ để không chấm bậc bằng lưới này.
Contract khoá cả hai mặt: mẹo loại trừ = 1 ở bậc làm quen (lý do không chấm), và mọi
bậc chấm điểm là 3×3 với mọi mẹo ≤ 1/2.

## 2. Thang bậc mới

Giữ nguyên nội dung của ba bậc 3×3 cũ (L3–L5) và đánh số lại L1–L3. Mỗi bậc gỡ một
hỗ trợ:

- **Làm quen → L1** gỡ việc làm mẫu và bảng nhỏ: lên 3×3, có ba ô che (đáp án và
  nhiễu đều là ô bé không nhìn thấy), bốn lựa chọn. Hai thuộc tính (hình, màu) nhìn
  là thấy.
- **L1 → L2** gỡ "nhìn là thấy": một chiều là số chấm (1–6, bước 1 hoặc 2), bé phải
  đếm mới biết hàng/cột giữ giá trị nào.
- **L2 → L3** gỡ "bảng giữ một loại": mỗi bài có thể là hình hoặc chấm, nên mỗi lần
  bé phải tự tìm thuộc tính nào chạy theo hàng, thuộc tính nào chạy theo cột.

Đã cân nhắc chia 3×3 thành nhiều bậc hơn (ví dụ bậc đầu giữ cố định "màu theo hàng,
hình theo cột", bậc sau đổi ngẫu nhiên; hoặc tách bước đếm 1 và 2). Không làm vì: mỗi
bậc mới cần câu "bây giờ có gì mới" mà bé 4–5 tuổi hiểu được ("hàng và cột có thể đổi
chỗ" khó nói thành lời cho trẻ) và một clip mới; thang ba bậc dùng lại đúng ba clip đã
duyệt (`missing_cell_intro_3/4/5`) với nghĩa khớp nguyên văn. Một lượt từ L1 tới hết
L3 vẫn ≥ 18 bài + 2 bài làm quen.

Không đổi nội dung bậc nên cùng logic sinh bài; vì số bậc đổi (luồng seed đặt tên
theo bậc `L${level}`), generator / validator / config / manifest lên v3 cùng lúc và
server mirror `levels: [1, 2, 3]`, `version: 3`.

## 3. Bài làm quen nằm ở đâu

**Bậc generator 0, ngoài `levels`.** `MISSING_CELL_LEVELS[0]` là cấu hình 2×2 của
v2 (hình × màu, 3 lựa chọn, 1 nhiễu ngoài bảng, không che). Generator, validator độc
lập và replay theo seed không đổi gì ngoài việc nhận bậc 0; variety khai luôn bậc 0
(sức chứa 12, bucket `shape`) để planner chọn bài như mọi batch.

Đã cân nhắc đánh dấu bài làm quen bằng một trường trong `params` hay trong envelope:
phải sửa validator/replay và kiểu dữ liệu chung, và bài 2×2 vẫn là "một bậc" về
nội dung. Dùng một bậc nằm ngoài `levels` thì tự động không bậc nào chạm tới nó:
`resolveStartingLevel` chỉ trả bậc trong `levels`, `nextExploreRound` chỉ đi lên
bậc trong `levels`, màn cài đặt phụ huynh chỉ liệt kê `levels`
(`exploreStartLevelChoices` → [1, 2, 3]).

## 4. Khi nào có bài làm quen

- **Chỉ khi lượt bắt đầu ở bậc thấp nhất (L1).** Phụ huynh chọn bậc 2–3 nghĩa là bé
  đã đọc được bảng; ép làm quen 2×2 lúc đó chỉ làm chậm.
- **Chỉ lượt đầu của mỗi lần mở game** (mỗi lần màn chơi được mount). «Chơi lượt mới»
  ngay sau đó không lặp lại: bé vừa làm xong. Ghi nhớ "đã làm quen" chỉ là một ref
  trong màn chơi đang mở, mất khi thoát.
- Không thể "chỉ lần đầu tiên bé chơi": Khám phá không lưu lịch sử chơi
  (`docs/EXPLORE_ZERO_HISTORY.md`), nên mỗi lần vào game ở L1 đều có 2 bài làm quen.
  Giá: 2 bài 2×2 (khoảng 15–25 giây), bài đầu có làm mẫu. Bé đã quen có thể làm rất
  nhanh; phụ huynh muốn bỏ hẳn thì chọn bậc bắt đầu 2.

## 5. Làm mẫu (bài làm quen đầu)

Dùng lại cơ chế diễn lời giải sẵn có của renderer (bước `row` → `column`, câu thần
chú `missing_cell_solve`, nhịp qua `useBusSequencer(paused)`):

1. Màn chơi đọc câu hỏi như mọi bài («Chọn ô còn thiếu cho ô trống nhé.»).
2. Renderer xin câu thần chú dạng **gentle** (chờ câu hỏi nói xong, không cắt nó);
   lúc câu bắt đầu (`onStart`) hàng của ô "?" sáng, 700 ms sau thêm cột; bong bóng
   hiện chữ câu thần chú.
3. Các lựa chọn mờ và không bấm được cho tới khi câu nói xong và đã sáng ít nhất
   2 giây (`DEMO_MIN_MS`), rồi sống lại; bong bóng quay về câu hỏi; hàng + cột vẫn
   sáng trong lúc bé chọn (hỗ trợ của bài này).
4. Tạm dừng giữa lúc làm mẫu: nhịp giữ lại, câu thần chú bị cắt được nói lại khi quay
   lại (`throughPause`). Thiếu clip: vẫn sáng và chờ đủ 2 giây.

Bài làm quen thứ hai không làm mẫu (gỡ hỗ trợ). Sau mỗi bài đúng vẫn có lời giải diễn
lại như mọi bài.

## 6. Màn chơi chung

- `ExploreLeveledRounds.warmUp = { level, count, demoCount, doneLine }`;
  `getExploreWarmUp(game, startLevel)` trả về khi game có khai và `startLevel` là
  bậc thấp nhất (và bậc làm quen không phải bậc của game).
- Lúc tải lượt: tạo vòng như cũ, rồi (nếu có) xin `count` bài ở bậc làm quen và đặt
  **trước** vòng trong `exercises`; `warmUpCount` nhớ có bao nhiêu bài ở đầu. Lỗi
  sinh bài làm quen thì bỏ qua, lượt chạy như không có.
- Bài làm quen: không cộng `roundFirstTry`, không bao giờ là "bài cuối vòng". Bài
  làm quen cuối: như lên bậc (`level_up`, «Giỏi quá! Bé lên bậc mới nhé!» trên dải
  phản hồi, đọc thêm `doneLine`), chấm làm quen đầy, 1,2 s sau đổi sang bài đầu của
  vòng, khoá tới khi lời nói xong, câu hỏi đọc lại sau đó.
- Đầu màn hình: «Làm quen» + `k/2` + hai chấm của bài làm quen; vào vòng thì
  «Bậc 1/3» + `k/6` + sáu chấm, không chấm nào là bài làm quen. Nhãn trợ năng tương
  ứng («Làm quen, bài 1 trên 2»).
- Khoá bài đã chơi theo bậc (`roundKeysByLevelRef`, `previousVariantKeysRef`) chỉ
  gồm bài trong vòng.
- Renderer nhận `demo` (tuỳ chọn trong `ExploreRendererProps`); renderer khác bỏ qua.

Câu kết không hiện nguyên văn trên dải phản hồi: «Bây giờ bảng có ba hàng ba cột, bé
nhìn kỹ nhé!» dài, chạm mép màn 440 pt khi thử trên máy ảo, và dải phản hồi không
xuống dòng; lên bậc thường cũng chỉ hiện «Giỏi quá! Bé lên bậc mới nhé!» và đọc câu
giới thiệu.

## 7. Bậc bắt đầu đã lưu

Giá trị cũ không phân biệt được với giá trị mới (cả hai là số nguyên 1–5 / 1–3), nên
cần một mốc phiên bản: store `kido-parent-preferences` (zustand persist) lên
`version: 1` với `migrate` gọi `migrateExploreParentConfig(state.explore, version)`
trong `explore/parentConfig.ts` (thuần, không đụng storage). Từ version 0:

- `startingLevelByGame.missing_cell` = `missingCellStartLevelFromV2(v)`:
  1, 2, 3 → 1 (2×2 hình, 2×2 chấm, 3×3 hình đều mở ở 3×3 hình); 4 → 2; ≥ 5 → 3.
- Chỉ có bậc chung `startingLevel` (bản cũ cũng áp cho Ô thiếu): ghi thêm
  `missing_cell` theo cùng bảng, các game khác giữ bậc chung.
- Giá trị rác (0, âm, 2.5, "3", null) bị sanitize bỏ trước khi chuyển — như cũ.
- Zustand ghi lại trạng thái đã chuyển một lần với version 1; lần mở sau không
  chuyển nữa. Giá trị phụ huynh chọn sau cập nhật được ghi version 1.

Chỉ kẹp (`resolveStartingLevel`) thì không crash nhưng sai nghĩa: bậc 3 cũ (3×3 hình)
sẽ mở L3 mới (trộn), bậc 4 cũ (3×3 chấm) cũng thành L3.

Đã thử trên iOS Simulator: ghi `{"state":{"explore":{"startingLevelByGame":
{"missing_cell":4}}},"version":0}` → mở app, vào Ô thiếu thấy «Bậc 2/3» (bảng chấm
3×3, không có bài làm quen); storage sau đó là `{"missing_cell":2}`, `version: 1`.

## 8. Câu thoại

Không có clip mới, không render. Bảng `MISSING_CELL_LEVEL_INTRO` trong
`promptAudio.ts`: L2 → `missing_cell_intro_4` («Bây giờ bé đếm chấm trên bảng ba hàng
ba cột nhé!»), L3 → `missing_cell_intro_5` («Bây giờ có cả hình và chấm, bé nhìn hàng
và cột nhé!»); `missingCellWarmUpDoneLine()` → `missing_cell_intro_3`. Làm mẫu dùng
`missing_cell_solve`. `missing_cell_intro_2` rời `PROMPT_PHRASES` và inventory
pipeline; file `.wav` v1 giữ trong assets, lần xuất pack sau sẽ bỏ key khỏi registry.

## 9. Chưa kiểm được

- Trẻ thật: bé có chờ hết phần làm mẫu (~2 s câu hỏi + ~2,6 s thần chú) không, hay
  bấm vào lựa chọn đang mờ rồi bỏ đi; 2 bài làm quen mỗi lần vào có làm bé đã quen
  sốt ruột không.
- Android và máy hẹp 320–375 pt cho bảng 2×2 (bố cục giữ nguyên bản L1 cũ đã kiểm ở
  `fix-explore-missing-cell-leak`).
- Âm thanh thật trên máy (chỉ kiểm thứ tự câu hỏi → thần chú trong harness với
  thời lượng clip thật).
