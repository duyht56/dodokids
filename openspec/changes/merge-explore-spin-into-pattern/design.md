# Thiết kế: họ `rotation` trong Tìm quy luật

## 1. Bối cảnh

`pattern_finder` có 5 bậc (`PATTERN_LEVELS`, `patternGame.ts`):

| Bậc | Grammar | Độ dài hàng | Lựa chọn |
|---|---|---|---|
| 1 | shape_AB, color_AB | 6 | 2 |
| 2 | shape/color AAB, ABB | 6 | 2 |
| 3 | object_ABC, color_ABC | 6 | 3 |
| 4 | quantity tăng/giảm | 4 | 3 |
| 5 | numeric bước 1/2 | 4 | 3 |

Hai mode: `complete` và `fix_error` (`FIX_ERROR_SHARE = 0.5`). Chơi theo bậc:
vòng 6 bài, ≥ 4 đúng ngay lần đầu thì lên bậc (`update-explore-leveled-rounds`).
Lựa chọn chỉ lấy từ từ vựng của chính bài (`fix-explore-catalog-round-1`).

`spin_pattern` có 5 bậc riêng: dãy 4→6 mũi tên, ô trống ở cuối, bất kỳ hoặc ở
giữa, 3–4 lựa chọn. Lượt chạy progressive 5 bài L1→L5.

## 2. Quyết định: chỉ đặt `rotation` ở bậc 3

`rotation` là một nhánh họ thứ ba, không phải cycle (`isCycleFamily`) cũng không
phải progression:

- Coi là cycle ABCD thì contract đòi hàng chứa đủ hai chu kỳ (8 ô > 6), và có
  16/96 bài `fix_error` sửa được ở hai chỗ.
- Coi là progression thì `optionsFor` loại các giá trị đã hiện, mà ở ô 5–6 thì
  đáp án đã hiện trên hàng.

| Điều kiện | Giá trị | Lý do |
|---|---|---|
| Bậc | Chỉ L3 | Hàng L3 dài 6. L4/L5 dài 4: chu kỳ 4 cần `minContextIndex` = 4 nên không còn ô hợp lệ (`random.int(0, -1)` ném `EXPLORE_INVALID_RANDOM_BOUNDS`). Đổi độ dài theo grammar thì phải đổi schema, validator, contract, và token nhảy cỡ 52pt ↔ 35pt trong cùng một bậc. |
| Độ dài hàng | 6 | Bằng các họ khác của L3. `fitPatternTokenSize(375, 6, 52)` = 35pt, hàng 303pt vừa một dòng ở 375pt. |
| Ô trống (`complete`) | index 4 hoặc 5 (index đếm từ 0) | Lúc đó cả bốn hướng đều đã hiện, và đáp án lặp lại index 0 hoặc 1. Ô ở index 2–3 thì đáp án không hiện ở đâu khác trên hàng (0/8 trường hợp), bé chọn "hướng chưa thấy" là đúng, đúng lỗi của `spin_pattern` hiện nay. Ô ở index 0–1 thì đáp án vẫn hiện ở index 4–5, nhưng bé chưa thấy đủ một vòng bốn mũi tên trước ô trống (`minContextIndex` = 4, giống chu kỳ 4 của các họ lặp). |
| Chiều xoay | Cả thuận (`+90°`) lẫn ngược (`+270°`) | Hai chiều cho 16 bài `complete` khác nhau (4 hướng đầu × 2 chiều × 2 ô). Riêng chiều thuận chỉ có 8. Chiều xoay KHÔNG làm bài khó hơn: ở ô 5–6 nhóm bốn lặp lại đã đủ cho đáp án. |
| Lựa chọn | 3: đáp án + 2 hướng sai rút theo seed, cả ba đều có trên hàng | Giữ luật "chỉ lấy từ từ vựng". 4 lựa chọn cỡ 84pt sẽ xuống dòng trên mọi máy hẹp hơn 456pt (3+1 từ 356pt trở lên, 2+2 dưới đó). |
| Mode | Chỉ `complete` | Lượt đầu tiên bé gặp mũi tên không nên là bài "tìm chỗ sai". Bucket `fix_error` của L3 vẫn lấy từ ABC. Sau này có thể mở `fix_error` cho mũi tên (§7). |
| Màu, cỡ | Một màu cho cả hàng và lựa chọn, cùng cỡ | Bài chỉ đọc một thuộc tính là hướng (BRD §7.7 guardrail). |

## 3. Validator (độc lập)

Với bài `rotation`:

1. Dựng lại hàng từ `startOrientation`, `step` (90 hoặc 270) và độ dài 6.
2. Ô trống phải ở index 4 hoặc 5. Hàng hiện ra khớp từng ô.
3. Chứng minh đáp án duy nhất theo CẢ hai cách đọc:
   - luật bước ±90° rút từ các ô đã hiện,
   - nhóm bốn lặp lại.
   Hai cách phải ra cùng một hướng, và đúng một lựa chọn bằng hướng đó.
4. Lựa chọn: đúng 3 phần tử, khác nhau, đều thuộc tập hướng đã hiện, có đáp án.
5. Thứ tự lựa chọn tái tạo được theo seed.
6. Không có `fix_error` cho `rotation` ở version này: validator từ chối.
7. Kiểm presentation: một màu, `uniformSize`, đúng 4 id `arrow:0/90/180/270`.

## 4. Renderer

- `PatternTokenKind` thêm `'arrow'`. `TokenGlyph` vẽ mũi tên bằng View, xoay theo
  `orientation`. Tách `Arrow` từ `SpinPatternRenderer.tsx` ra một primitive dùng
  chung (vd `components/ArrowGlyph.tsx`), không emoji, chạy offline.
- `ruleHint` trên màn hình: họ `rotation` dùng câu "Nhìn nhóm hình lặp lại từ
  đầu nhé." (khớp clip `pattern_hint_shape`).
- Dò lại bằng sim ở 375 và 390pt: hàng 6 mũi tên một dòng, mũi tên 35pt vẫn đọc
  rõ hướng.

## 5. Audio

| Chỗ | Clip | Việc |
|---|---|---|
| Câu đề | `spin_which` ("Mũi tên ở ô trống quay về hướng nào nhỉ?") | Dùng lại: `patternPromptPhraseId('rotation', *)` → `spin_which` |
| Gợi ý | `pattern_hint_shape` | Dùng lại |
| Câu lên bậc 3 | `pattern_intro_3` | Viết lại câu, owner duyệt, gen lại một clip, export pack. Đề xuất: "Bây giờ có ba hình thay phiên nhau và mũi tên xoay, bé xem kỹ nhé!" |
| Tên game | (Xoay hình chưa từng có clip tên) | Không có gì để gỡ |

Clip intro hiện chưa có trong bản store (pack v6 chưa phát hành), nên gen lại
cùng id, không cần tăng version khoá.

## 6. Đánh đổi: ít bé gặp mũi tên hơn

Hiện lượt Xoay hình nào cũng có mũi tên. Sau khi gộp, bé bắt đầu ở bậc 1 phải
qua hai vòng (ít nhất 12 bài) mới tới bậc 3. Trong phiên 3–5 phút, nhiều bé sẽ
không tới. Ở bậc 3, mũi tên chiếm khoảng 1–2/6 bài (bốn bucket chia
2/2/1/1), nên điều kiện lên bậc không kiểm riêng kỹ năng xoay.

Cách giảm (không thêm lịch sử):

- Thêm mục `pattern_finder` vào `EXPLORE_MASTERY_CRITERIA` (`masteryCriteria.ts`,
  phần "Khi nào bé đã vững?" ở màn chọn bậc bắt đầu của phụ huynh). Hiện game này
  chưa có dòng nào. Câu của bậc 3 nhắc cả ba hình thay phiên lẫn mũi tên xoay,
  để phụ huynh biết muốn bé luyện xoay thì chọn bậc 3. Owner duyệt câu chữ.
- Không thêm thẻ riêng, không tự đẩy bậc.
- Bé được phụ huynh đặt bắt đầu ở bậc 3 sẽ không nghe câu `pattern_intro_3`
  (câu này chỉ nói khi lên bậc). Câu đề `spin_which` vẫn đọc ở mọi bài mũi tên.

## 7. Phương án đã cân nhắc

- **Giữ Xoay hình standalone**: phải sửa ba lỗi riêng (kho bậc 1, lộ đáp án,
  xuống dòng) mà vẫn để hai thẻ gần giống nhau cạnh nhau. Loại.
- **Gộp cả ba thành một thẻ** (ủy quyền sang ba generator, thang 6 bậc, vòng có
  4 bài chính và 2 bài xem trước): 12–18 ngày công, 4–5 câu intro mới. Chưa có
  playtest đổi dạng bài cho bé 4–5 tuổi. Ma trận hai thuộc tính không hợp luật
  "mỗi bài chỉ đọc một thuộc tính" của `pattern_finder`. Owner không chọn.
- **Xoay ở L4–L5**: không sinh được bài (§2). Loại.
- **Ẩn bằng `catalogVisible: false` thay vì xoá mã**: an toàn hơn nếu cần lùi
  lại, nhưng để lại mã chết ở ba repo. Tiền lệ của repo là xoá hẳn (đợt
  2026-09-18 và 2026-09-22). Chọn xoá hẳn.
- **`fix_error` cho mũi tên**: hợp lệ với hàng 6, lỗi ở index 2–5, nếu loại các
  bài sửa được hai chỗ (khoảng 80/96 bài sạch). Để change sau, sau khi có
  playtest bậc 3.

## 8. Tương thích và phát hành

- Ba bản `EXPLORE_GAME_CODES` (docs, mobile, server) phải bỏ `spin_pattern` cùng
  lúc, nếu không `explore.contract-codes.spec.ts` báo lỗi. Boot guard của server
  đòi số `PUBLIC_GAMES` bằng số mã.
- Lúc chạy, thứ tự deploy không quan trọng:
  - Server cũ có mã mà app mới không có: bị bỏ qua (fail-closed).
  - Server mới không có mã mà app cũ có: app cũ vẫn hiện và chơi Xoay hình
    offline (`isExploreGameCatalogVisible` coi server vắng mục là cho phép),
    không đọc hay ghi lịch sử nào. Chỉ mất kill switch của game này trên app
    cũ. Đây là ghi chú tương thích, không phải requirement, vì test của repo
    không còn chạy được code đã gỡ.
- Thứ tự archive: delta ở đây viết trên bản chưa archive của bốn change, phải
  archive trước change này. Nếu không, MODIFIED ở đây sẽ bị ghi đè, hoặc ghi đè
  mất nội dung của chúng.
  - `explore-pattern-game`: `enhance-explore-pattern-families-fixerror` ("Supported
    pattern grammars", "Level-bounded attributes") và `fix-explore-catalog-round-1`
    ("Pattern completion interaction", "Per-puzzle spoken question").
  - "Free Explore catalog": `replace-explore-tracing-with-route-planner`,
    `fix-explore-catalog-round-1`, `add-explore-round-2-games`.
- Đổi là JS + một asset audio. Chọn kênh store hay OTA khi chạy skill
  release-mobile.
- Lỗi đã biết, ngoài phạm vi change này: `missing_cell` có đáp án luôn là lựa
  chọn duy nhất chưa có trên bảng (`missingCellGame.ts:312-332`). Hàng 6 ô của
  `pattern_finder` tràn 9pt ở máy 360pt (có từ trước).
