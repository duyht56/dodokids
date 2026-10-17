# Thiết kế: Cân thăng bằng (`balance_scale`)

> Nguồn chuẩn của change. proposal/spec/tasks dẫn về đây khi cần chi tiết.
> Owner yêu cầu 2026-10-16 (kèm 3 phiếu "Toán tư duy cân nặng"), chốt phạm vi
> **6 bậc** (gồm bắc cầu + đổi ngược) và **hình emoji** cùng ngày.

## 1. Bài toán và vì sao trẻ thấy khó

Dạng bài ở phiếu: cân mẫu thăng bằng "1 quả lê = 2 quả táo", cân thứ hai
"2 quả lê = ?" và ba lựa chọn A/B/C (2, 1, 4 quả táo). Phiếu thứ ba có thêm
bắc cầu (1 ô tô = 2 xe máy, 1 xe máy = 2 xe đạp → 1 ô tô = ? xe đạp) và đọc
cân theo chiều ngược.

Đây là **suy luận thay thế (đổi)** trên một quan hệ bằng nhau. Nó không phải so
sánh số lượng. Trẻ 5–6 tuổi vấp ở bốn chỗ:

1. Không đọc được cân: nghĩ bên cao hơn là "nhiều hơn", không biết nằm ngang
   nghĩa là nặng bằng nhau.
2. Nghĩ nhiều món hơn thì nặng hơn: 1 quả lê "ít" hơn 2 quả táo nhưng cân vẫn
   thăng bằng.
3. Chép số của cân mẫu. Phiếu đặt sẵn bẫy: lựa chọn "2" chính là số táo của cân
   mẫu.
4. Thiếu chiến lược. Bé không biết rằng mỗi quả lê "đổi" được 2 quả táo, vậy
   phải đổi từng quả rồi đếm hết.

Game `balance_scale` dạy đúng thứ tự này. Mỗi bậc gỡ một nấc hỗ trợ: cân
nghiêng thật → tự đo ra tỉ lệ → chạm để đổi → đổi trong đầu → dạng phiếu A/B/C
→ đổi hai lần và đổi ngược.

## 2. Chiến lược dạy: "đổi" (thay thế)

Câu thần chú xuyên suốt: **"1 quả lê nặng bằng 2 quả táo, nên đổi 1 quả lê lấy
2 quả táo thì cân vẫn thăng bằng."**

- Cơ chế cốt lõi: **chạm vào món to để đổi**. Món to bung ra thành k món nhỏ
  ngay trên đĩa (một cụm có viền mềm). Cân không nhúc nhích, bé thấy tận mắt
  rằng đổi xong cân vẫn bằng.
- Sau MỌI bài đúng ở bậc tự đổi, cân **diễn lại phép đổi** (bóng mờ k món nhỏ
  hiện dưới từng món to, lần lượt), rồi Đô Đô chốt câu kết luận "2 quả lê nặng
  bằng 4 quả táo!". Bé nghe lại cách giải mỗi lần, đó là phần làm bé thuần thục.
- Bẫy chép số được chặn có chủ đích: bậc 5 luôn có thẻ bằng số món nhỏ của cân
  mẫu (k). Bé chọn nhầm thì cân nghiêng thật cho bé thấy.

Thuật ngữ trẻ nghe: *cân thăng bằng, nặng hơn, nhẹ hơn, nặng bằng, đổi, đĩa,
cân mẫu*. Không dùng "phép nhân", "gấp đôi", "tỉ lệ".

## 3. Đồ vật

Chín món, ba "thang nặng" (nặng → nhẹ), emoji là NỘI DUNG bài (như Lật thẻ, Xe
buýt), không phải icon UI. Thứ tự chỉ số cố định, chỉ được thêm cuối (chỉ số
nằm trong khóa câu đọc).

| idx | id | emoji | nhãn | thang | bậc nặng |
|---|---|---|---|---|---|
| 0 | `balance-watermelon` | 🍉 | quả dưa hấu | fruit | 0 |
| 1 | `balance-pear` | 🍐 | quả lê | fruit | 1 |
| 2 | `balance-apple` | 🍎 | quả táo | fruit | 2 |
| 3 | `balance-dog` | 🐶 | chú chó | animal | 0 |
| 4 | `balance-cat` | 🐱 | chú mèo | animal | 1 |
| 5 | `balance-mouse` | 🐭 | chú chuột | animal | 2 |
| 6 | `balance-car` | 🚗 | chiếc ô tô | vehicle | 0 |
| 7 | `balance-motorbike` | 🛵 | chiếc xe máy | vehicle | 1 |
| 8 | `balance-bicycle` | 🚲 | chiếc xe đạp | vehicle | 2 |

- **Cặp** (món to → món nhỏ) = hai bậc liền nhau trong cùng thang: 6 cặp.
- **Bộ ba** (bắc cầu) = cả một thang: 3 bộ.
- Tỉ lệ k ∈ {2, 3} chọn theo seed cho từng bài, không gắn cố định vào cặp, để
  bé phải đọc cân mẫu chứ không học thuộc "dưa hấu = 3".
- Món to vẽ to hơn món nhỏ (bậc 0 > bậc 1 > bậc 2), để hình hợp trực giác.

## 4. Bậc và mode

Một exerciseType `balance_scale`, mode ở `params.mode`.

| Bậc | Mode | Bé làm | Cân | Số |
|---|---|---|---|---|
| 1 | `balance` | Thả món cùng loại vào đĩa trống tới khi thăng bằng | sống (nghiêng theo từng món) | n ∈ 2..5 |
| 1 | `heavier` | Chạm vào đĩa nặng hơn | nghiêng sẵn | xem dưới |
| 2 | `measure` | 1 món to một bên, thả món nhỏ tới khi thăng bằng | sống | k ∈ {2,3} |
| 3 | `exchange` | Có cân mẫu. Chạm từng món to để đổi (bắt buộc), rồi xếp đĩa kia, bấm **Thả cân** | giữ | m ∈ {2,3}, k ∈ {2,3} |
| 4 | `predict` | Như 3 nhưng tự đổi trong đầu: xếp rồi Thả cân | giữ | m ∈ {2,3}, k ∈ {2,3} |
| 5 | `predict` | như bậc 4, thêm m = 4 | giữ | (m,k) ∈ {(2,2),(2,3),(3,2),(3,3),(4,2)} |
| 5 | `choose` | Dạng phiếu: 3 thẻ, thẻ chọn bay lên cân để kiểm | giữ, tự thả | như trên |
| 6 | `chain` | Hai cân mẫu A→B, B→C. 1 A = ? C. Chạm để đổi (tuỳ chọn, hai lượt) rồi xếp C | giữ | k1,k2 ∈ {2,3} |
| 6 | `reverse` | Cân mẫu 1 to = k nhỏ. Đĩa trái n món nhỏ, bé xếp món TO | giữ | (n,m,k) ∈ {(4,2,2),(6,3,2),(6,2,3)} |

- **heavier**: một trong hai dạng (cùng xác suất theo danh sách cấu hình):
  cùng món (n1 ≠ n2, 1..5), hoặc a món to vs b món nhỏ (a ∈ {1,2}, b ∈ 1..5,
  k ∈ {2,3}, a·k ≠ b). Bên nào đặt món to cũng theo seed. Danh sách cấu hình
  có cả trường hợp "ít món hơn nhưng nặng hơn".
- Tổng món trên một đĩa: món nhỏ ≤ 10, món to ≤ 4. Bậc 6 reverse: món to trên
  đĩa phải ≤ 3.
- **Cân sống** (bậc 1–2): mỗi lần thêm/bớt cân nghiêng theo trọng lượng thật.
  Cộng từng món một từ đĩa trống thì luôn chạm thăng bằng trước khi vượt, nên
  khi thăng bằng game khoá đĩa và mừng ngay: hai mode này **không thể sai**
  (khám phá, không phải kiểm tra).
- **Cân giữ** (bậc 3–6): hai khối chèn đỡ dưới hai đĩa, cân đứng ngang dù bé
  xếp gì. Bé bấm **Thả cân** thì khối chèn rút ra, cân nghiêng thật. Sai thì
  sau ~1,4 s khối chèn đỡ lại, đồ trên đĩa giữ nguyên để bé sửa. Bé phải đoán
  trước rồi mới kiểm, không mò được bằng cách thêm tới khi cân dừng.

## 5. Run policy (authored, 6 slot, có levelOffset)

Bé mới (bậc bắt đầu 1) đi trọn cung dạy trong MỘT lượt; ba mẹ nâng bậc bắt đầu
ở màn phụ huynh khi bé vững (cơ chế `startingLevelByGame` sẵn có, không lưu
lịch sử chơi). Level hiệu dụng của slot = clamp(start + offset) (đã có ở
`resolveExploreRunSlotLevel`). Mode của slot CHỈ đến từ bảng vai trò × level:

| slot | offset | L1 | L2 | L3 | L4 | L5 | L6 |
|---|---|---|---|---|---|---|---|
| s1 | 0 | balance | measure | exchange | predict | predict | chain |
| s2 | 0 | heavier | measure | exchange | predict | choose | reverse |
| s3 | +1 | — | measure | exchange | predict | choose | chain |
| s4 | +2 | — | — | exchange | predict | choose | reverse |
| s5 | +3 | — | — | — | predict | choose | chain |
| s6 | +4 | — | — | — | — | choose | chain |

Lượt theo bậc bắt đầu:

- L1: balance, heavier, measure, exchange, predict, choose (trọn cung)
- L2: measure, measure, exchange, predict, choose, chain
- L3: exchange, exchange, predict, choose, chain, chain
- L4: predict, predict, choose, reverse, chain, chain
- L5: predict, choose, chain, reverse, chain, chain
- L6: chain, reverse, chain, reverse, chain, chain

Các slot được sinh lần lượt; mỗi slot tránh mọi bài đã ra trong lượt (và bài
cùng slot của lượt trước), nên một lượt không bao giờ lặp lại đúng một bài. Thay
đổi này nằm ở `createExploreRunBatch`, áp cho mọi game có runPolicy (Xe buýt
cũng hết lặp bài trong lượt).

Không có runSlot (sinh tự do / script kiểm): mode chọn đều trong các mode của
level. Variety bucket = mode; bucket theo level: L1 [balance, heavier],
L2 [measure], L3 [exchange], L4 [predict], L5 [predict, choose],
L6 [chain, reverse].

## 6. Tương tác

Bố cục từ trên xuống (đo theo vùng thật, không theo thiết bị): dòng đề →
hàng cân mẫu (0, 1 hoặc 2 cân nhỏ, luôn thăng bằng) → cân chính → hàng điều
khiển (rổ + Thả cân, hoặc 3 thẻ).

- **Rổ**: khay có vài món của loại cần thả. Chạm rổ thì 1 món rơi vào đĩa phải.
  Đĩa đầy thì rổ mờ đi.
- **Bớt**: chạm vào đĩa phải (vùng chạm lớn) để bớt món vừa thả gần nhất. Món
  nhỏ chỉ ~24 pt, không bắt bé chạm trúng từng món.
- **Đổi**: món to trên đĩa trái chạm được khi được phép đổi (bậc 3 bắt buộc,
  bậc 6 chain luôn được, bậc 4–5 chỉ mở ở trợ giúp mức 2). Đổi xong, cụm k món
  nhỏ nằm đúng chỗ món to. Chain: 1 A → k1 cụm B, mỗi B chạm tiếp → k2 C.
- **Thả cân**: bật khi đĩa phải có ít nhất 1 món. Bậc 3: chỉ hiện rổ + Thả cân
  sau khi đã đổi hết món to.
- **Thẻ** (choose): mỗi thẻ là một nhóm món nhỏ (hàng tối đa 5). Chạm thẻ thì
  nhóm đó rơi lên đĩa phải, cân tự thả. Sai thì nhóm rút về, thẻ mờ và khoá.
- **heavier**: không rổ, chạm thẳng vào đĩa.
- **Nút bớt**: ở bài giữ cân, cạnh rổ có nút "−" (cùng kiểu rổ, huy hiệu trừ)
  để lấy bớt một món; sau lần thả "nặng quá" nó nhấp nháy và có bàn tay chỉ.
- **Thời điểm nói**: chữ trên dải lời đổi khi câu thật sự bắt đầu; bài chỉ sang
  bài sau khi câu chốt đã nói xong; trợ giúp chỉ đến sau khi câu báo sai nói xong
  và cân đã mở. Câu nhắc (chạm để đổi, xếp đĩa kia, thả cân, trợ giúp) là câu
  "nhẹ": chờ lời đề (kể cả khi bé bấm 🔊) nói xong mới phát, và tự bỏ nếu bé đã
  làm.
- **Lời đề** (cũng là thứ nút 🔊 đọc lại) = cân mẫu + câu hỏi. Câu "Bé chạm
  vào … để đổi nhé!" của bậc 3 do renderer nói một lần sau lời đề, để đọc lại đề
  sau khi đã đổi xong không nhắc lại bước cũ.
- **Bàn tay gợi ý**: hiện nếu bé chưa chạm gì sau khi Đô Đô đọc xong đề +
  2,5 s, trỏ vào việc kế tiếp (rổ / món to cần đổi / Thả cân). Tắt khi phụ
  huynh bật "giảm hỗ trợ" (`reducedSupport`).
- **Giảm chuyển động**: bỏ nghiêng chậm, khối chèn và cụm đổi hiện/ẩn tức thì.

## 7. Phản hồi và trợ giúp

Theo hợp đồng với màn chơi: `onAnswer(true)` chỉ gọi sau màn kết của renderer;
lần sai gọi `onAnswer(false)` TRƯỚC rồi renderer mới nói câu của mình.

| Tình huống | Hình | Lời Đô Đô |
|---|---|---|
| Thăng bằng (sống) | cân về ngang, đĩa sáng | "Cân thăng bằng rồi!" + balance: "Hai bên nặng bằng nhau." / measure: "Một quả lê nặng bằng hai quả táo!" |
| heavier đúng | đĩa chọn sáng | "Bên nặng hơn thì chìm xuống thấp." |
| heavier sai | đĩa lắc nhẹ | "Bên nặng hơn thì chìm xuống thấp." |
| Thả cân, thiếu | đĩa phải bay lên | "Đĩa này còn nhẹ quá, bé thêm nữa nhé." |
| Thả cân, thừa | đĩa phải chìm xuống | "Đĩa này nặng quá rồi, bé bớt ra nhé." |
| Thẻ sai | cân lệch rồi nhóm rút về | "Cân bị lệch rồi, bé chọn thẻ khác nhé." |
| Thả cân, đúng | cân ngang → diễn lại phép đổi | "Cân thăng bằng rồi!" + kết luận "Hai quả lê nặng bằng bốn quả táo!" |
| Xếp mà chưa thả ~6 s | nút Thả cân nhịp | "Bé xếp xong thì bấm thả cân nhé." (một lần) |

Trợ giúp theo `supportLevel` (1 sau lần sai đầu, 2 sau lần thứ hai), không bao
giờ đếm hộ hay hiện đáp án ở mức 1:

| Mode | Mức 1 | Mức 2 |
|---|---|---|
| heavier | vạch ngang nét đứt nối hai đáy đĩa | như mức 1 |
| exchange (đã đổi) | đĩa trái nhịp sáng ("đếm bên này") | khung trống nét đứt trên đĩa phải, số khung = số món bên trái (bậc dạy, được phép) |
| predict | cân mẫu nhịp sáng | mở **chạm để đổi** món to + bàn tay + "Bé chạm vào quả lê để đổi nhé!" |
| choose | cân mẫu nhịp sáng | mở chạm để đổi (không làm mờ thẻ: thẻ sai đã tự khoá, hai lần sai là khoá hết thẻ sai) |
| chain | hai cân mẫu nhịp sáng | bàn tay trỏ món chưa đổi kế tiếp + câu chạm-để-đổi của món đó |
| reverse | cân mẫu nhịp sáng | gom món nhỏ bên trái thành nhóm k có viền nét đứt, mỗi nhóm có bóng mờ món to |

`balanceSupportCue(params, supportLevel)` là hàm thuần để script kiểm chứng
"mức 1 không lộ đáp án" và "không bao giờ làm mờ thẻ".

## 8. Bất biến (validator độc lập)

Validator tự tính lại bằng số học, rồi replay byte-identical (bỏ
variantKey/bucketKey). Đơn vị nặng: món nhỏ nhất của bài = 1.

- Chung: gameCode/exerciseType/versions đúng; `level` có trong 1..6; mode thuộc
  level; nếu có `runSlotKey` thì slot thuộc policy và ô bảng (slot, level) đúng
  bằng mode; mọi item id có trong danh sách; promptVi, audioRefs, assetRefs
  khớp hàm dựng; `options` chỉ có ở `choose`.
- `balance`: không fact; left = {X, n}, n ∈ 2..5; basket = X; đáp án n.
- `heavier`: cùng món (fact rỗng, n1 ≠ n2) hoặc 1 fact cặp liền kề; trọng
  lượng hai bên khác nhau; đáp án = bên nặng hơn.
- `measure`: 1 fact cặp liền kề, k ∈ {2,3}; left = {to, 1}; basket = nhỏ;
  đáp án k.
- `exchange`/`predict`: 1 fact; left = {to, m}; basket = nhỏ; (m,k) thuộc tập
  của level; đáp án m·k ≤ 10.
- `choose`: như predict + options = hoán vị theo seed của {m·k, k, d} với d là
  giá trị đầu tiên trong [m+k, m, m·k+1, m·k−1, m·k+2] khác m·k và khác k,
  nằm trong 1..10. Thẻ k (chép cân mẫu) là BẮT BUỘC.
- `chain`: 2 fact (A→B k1, B→C k2) là một thang trọn vẹn; left = {A, 1};
  basket = C; đáp án k1·k2.
- `reverse`: 1 fact (to→nhỏ k); left = {nhỏ, n}; basket = to; (n,m,k) thuộc
  tập; đáp án m = n/k.

## 9. Audio (pack v6)

Một batch duy nhất, giọng VieNeu `dodo-clone2`, temp 0.7, câu liền như pack
v5. Xưng "Đô Đô", gọi "bé".

- Câu cố định (`PROMPT_PHRASES`, tiền tố `bal_`): đề balance, heavier, luật
  nặng-chìm, thăng bằng, hai bên bằng nhau, xếp đĩa kia, nhẹ quá, nặng quá, nhìn
  cân mẫu, thẻ lệch, nhắc thả cân, đổi thử, tên game.
- Mảnh để ghép khi chưa có câu liền: nhãn 9 món (`PROMPT_LABELS`), từ "nặng
  bằng", "mấy" (`PROMPT_WORDS`), "Bé chạm vào … để đổi nhé!".
- Câu liền (`promptLines.ts`, domain suy từ hằng số game):
  - `bal_ask` [m, X, Y] "Hai quả lê nặng bằng mấy quả táo?"
  - `bal_is` [m, X, n, Y] "Hai quả lê nặng bằng bốn quả táo!" (cũng dùng cho
    câu đọc cân mẫu m = 1)
  - `bal_tap` [X] "Bé chạm vào quả lê để đổi nhé!"
- Ước lượng: 39 + 69 + 6 = 114 câu liền + ~24 clip ngắn. Thiếu clip thì im
  lặng như mọi game Khám phá; chữ trên màn và hình vẫn đủ để chơi.

## 10. Đăng ký

Mã `balance_scale`, exerciseType `balance_scale`, generator
`balance-scale-v1`, validator `balance-scale-validator-v1`, config
`balance-scale-config-v1`, levels [1..6], offline, local.

- Catalog: tên "Cân thăng bằng", mô tả "Đọc cân và đổi đồ cho cân thăng
  bằng", đứng sau `number_bus` (trục toán: đếm → tách gộp → đổi → chuỗi phép).
- Nhóm catalog "Sắp xếp và dẫn đường" (cùng nhóm các game số).
- Thumbnail: icon vector `scale` tới khi có PNG clay (prompt thêm vào
  `KIDO_EXPLORE_THUMBNAIL_PROMPTS.md`).
- Tiêu chí "khi nào bé vững" cho 6 bậc ở `masteryCriteria.ts`.
- Ba danh sách `EXPLORE_GAME_CODES` (docs, mobile, server) thêm mã ở cuối
  (13 mã); kido-server mirror vào `BUNDLED_LOCAL_GAMES` + `PUBLIC_GAMES`.

## 11. Ngoài phạm vi

- Cân có món ở cả hai bên của câu hỏi (vd "1 lê + 1 táo = ? táo").
- Số lớn hơn 10, phân số, cân lệch ở cân mẫu.
- Vẽ riêng hình clay cho 9 món (owner chọn emoji; có thể thay sau).
- Nhớ bé đã xem phần dạy chưa: Khám phá không lưu lịch sử, nên phần dạy nằm
  trong cung bậc của lượt và bậc bắt đầu do phụ huynh chọn.
