# Thiết kế: Máy nối tiếp v2 (`rework-explore-number-chain`)

## 1. Dạng bài gốc

Cuốn "Tách gộp phạm vi 10", Bài 3 (tài liệu luyện vào lớp 1 của owner):

```
6 →(−4)→ □ →(+2)→ □        xuôi: biết số đầu, điền ô giữa rồi ô cuối
□ →(+3)→ □ →(−2)→ 5        ngược: biết số cuối, gỡ máy 2 ra ô giữa, gỡ máy 1 ra ô đầu
```

Construct: chạy một số qua HAI phép cộng/trừ liên tiếp, và suy ngược (phép ngược
của từng máy). Skill catalog: `math_missing_number._bridge`, `math_two_step_problem`.

## 2. Bảng tiến trình

Mỗi bậc đổi đúng một điều so với bậc trước (contract kiểm). "Chấm" = số bước giải,
theo thứ tự bé điền, có nhóm chấm (`dotSteps`).

| Bậc | Chiều (mỗi vòng 6 bài) | `dotSteps` | Máy (k) | Phạm vi | Thẻ/ô | Bé làm |
|---|---|---|---|---|---|---|
| 1 | 6 xuôi | 2 | 2–4 | 0–10 | 4 | hai phép, đếm chấm cả hai máy |
| 2 | **2 xuôi + 4 ngược** | 2 | 2–4 | 0–10 | 4 | gỡ máy từ số cuối, vẫn có chấm |
| 3 | 2 xuôi + 4 ngược | **1** | 2–4 | 0–10 | 4 | máy tính sau chỉ còn ký hiệu |
| 4 | 2 xuôi + 4 ngược | **0** | 2–4 | 0–10 | 4 | chỉ còn số |
| 5 | 2 xuôi + 4 ngược | 0 | 2–4 | **0–20** | 4 | số lớn tới 20 |

- **Bậc 1 đã là hai bước thật**: hai ô trống; máy nào chạy một mình từ số đầu
  cũng không ra ô cuối; số cuối khác số đầu (không có chuỗi quay về); ô cuối không
  có trong thẻ của ô giữa.
- **Máy bước 2–4** như đề gốc (−4, +2). Máy ±1 (số liền sau/liền trước) không có;
  owner chưa chốt việc bỏ, bản này không đưa lại.
- **Bậc 1–4 trong 0–10** ("phạm vi 10" của đề gốc, có số 0). Thẻ ngược dấu (§4)
  phải nằm trong phạm vi ở CẢ HAI ô, nên số đi vào máy phải ở giữa phạm vi: trong
  1–10 chỉ còn 14–22 chuỗi mỗi chiều; có số 0 và máy 4 thì được 40.
- **Bậc 5 = phạm vi 20** (sau khi bậc 4 đã bỏ hết chấm, nên số > 10 chỉ xuất hiện
  khi không còn chấm). Bản trước dùng "máy bước lớn (tới 5)" trong 1–10: máy 5 không
  bao giờ có chỗ cho cả đáp án lẫn thẻ ngược dấu (cần x − 5 ≥ 0 và x + 5 ≤ 10), máy
  4 chỉ từ 5 hoặc 6 — thẻ ngược dấu sẽ vắng và mẹo bỏ qua dấu thắng lại.
- **Vòng bậc ≥ 2 = 2 xuôi + 2 ngược gỡ máy thêm + 2 ngược gỡ máy bớt** (nhóm theo
  máy 2, máy bé gỡ trước; bucket `forward` / `reverse_add` / `reverse_sub`). Với
  3 xuôi / 3 ngược, bé làm đúng hết bài xuôi chỉ cần 1/3 bài ngược đúng là qua 4/6
  (đoán dấu ở bài ngược: qua 58%, kể cả vòng luyện 82%); với 2/4 cần 2/4 bài ngược
  (26%, 45%). Bài ngược là kỹ năng mới của bậc 2, nên cũng là phần cần luyện nhiều.
- Capacity khai báo: 36 (L1), 72 (L2–L4), 400 (L5); có 40 / 80 / 519 biến thể.

## 3. Hai ô, thứ tự và báo kết quả

`params.blanks` = hai ô theo thứ tự điền (`['mid','end']` xuôi, `['mid','start']`
ngược), mỗi ô có `options` riêng; `answer.values` cùng thứ tự.

- Sai ở ô nào: thẻ rung, mờ, khoá; `onAnswer(false)` mỗi lần (gate
  `test:explore-leveled-rounds` đọc AST: renderer phải báo sai). Thẻ đã chạm sai giữ
  dáng mờ tới khi hàng thẻ được thay (cả lúc chuyển ô 450 ms và lúc diễn lại).
- Đúng ô 1: số vào ô (viền xanh lá, nảy nhẹ), sau 450 ms hàng thẻ đổi sang ô 2,
  bong bóng đổi câu, renderer `onPromptCue(câu ô 2)`. Không báo gì cho play screen.
- Đúng ô 2: diễn lại (§6) rồi `onAnswer(true)` đúng một lần. Play screen tính "đúng
  ngay lần đầu" theo `tries === 0` của cả bài, nên một lần sai ở ô nào cũng làm bài
  không còn là đúng ngay lần đầu.

## 4. Thẻ: hai cặp quanh số đi vào máy

Gọi x là số đi vào máy của ô (số đã biết ở ô 1, ô giữa ở ô 2), a là đáp án (cách
x đúng k), m = 2x − a là **thẻ ngược dấu** (xuôi: máy chạy ngược dấu; ngược: chạy
máy xuôi thay vì gỡ — cùng một số). Bốn thẻ:

```
{ a, a ± g, m, m ± g }      g = 1 (lệch một), hoặc 2 khi ± 1 đụng số cấm
```

- **Thẻ ngược dấu có mặt ở 100% ô.** Chỉ có đúng hai số cách x đúng k bước (a và
  m). Bé đếm đúng k mà bỏ qua dấu và chọn ngẫu nhiên giữa hai số đó được 50% mỗi ô;
  ở chiều ngược, không gỡ máy mà chạy xuôi thì đúng 0%. 50% chỉ là mức của bé chọn
  ngẫu nhiên giữa a và m: ở ô 1, a và m vẫn phân biệt được theo vị trí trong phạm vi
  (xem dấu hiệu cấu trúc bên dưới).
- **Phía của thẻ lệch, rút độc lập cho từng cặp.** Thẻ lệch của cặp đáp án và của
  cặp ngược dấu nằm phía trong (về phía x) hay phía ngoài, hai phía rút đều và độc
  lập, cho cả hai ô, cùng với "hai máy cùng dấu hay khác dấu" (rút đều), TRƯỚC khi
  chọn chuỗi (`numberChainCandidatesFor`, lọc theo `(op1 === op2) === sameOps`).
  Nhờ vậy đáp án đứng thứ 1/2/3/4 theo cỡ đều 25%, và mẹo "máy thêm chọn thẻ to
  nhất, máy bớt chọn thẻ bé nhất" (theo câu thần chú) về 50% mỗi ô. Bản trước
  (`centerPull` 0,5) đặt thẻ lệch về phía giữa phạm vi nên lệch "vào trong" ~64% và
  mẹo đó được 64–65% ô (NEW-number-chain-0, review vòng 3): đã bỏ.
- **Hàng xóm**: thẻ lệch luôn cách thẻ của nó g, hai cặp nằm hai phía x nên thẻ nào
  cũng có đúng một thẻ cách ≤ 2 cùng phía: "thẻ có hàng xóm" không còn là dấu hiệu.
- **Ô 2 không lộ qua hàng thẻ ô 1**: thẻ ô 1 không chứa đáp án ô 2 *và* không chứa
  thẻ ngược dấu của ô 2 (chuỗi không dựng được thì bỏ), nên "chọn thẻ cách k chưa
  thấy ở hàng trước" về 50%. Rút cùng dấu / khác dấu đều nên "chọn thẻ xa số đã
  biết" ở ô 2 cũng về 50% (trước đó 68% chuỗi cùng dấu → 65–67%).
- Không thẻ nào là số đang hiện (ô 1: số đã biết; ô 2: số đã biết + ô giữa) hay là
  x. Lỗi "quên một máy" (ô 2: chạy máy 2 từ số đầu / gỡ máy 1 từ số cuối) chỉ có
  mặt khi nó trùng một chỗ của bộ thẻ (5–12% ô).
- Họ lỗi (validator, contract và spec server suy lại độc lập): `sign`,
  `one_machine`, `off_by_one`, `off_by_two`, `sign_off_by_one`, `sign_off_by_two`.
  Validator kiểm cấu trúc: có m, không có x, a và m mỗi thẻ có đúng một thẻ cách ≤ 2
  cùng phía x, hai khoảng cách bằng nhau.

`buildNearTargetOptions` (dùng chung) không đổi.

### Dấu hiệu cấu trúc chưa gỡ được: ô giữa luôn gần giữa phạm vi (chờ owner)

Ô 1 luôn là ô giữa, và ô giữa là số đi vào máy 2: nó phải còn chỗ cho đáp án ô 2,
thẻ ngược dấu ô 2 và hai thẻ lệch trong phạm vi. Vì vậy ở 0–10, máy 2–4, trong cả
42 chuỗi mỗi chiều dựng được, đáp án ô 1 **không bao giờ** xa số 5 hơn thẻ ngược
dấu của nó: gần hơn ở 34 chuỗi, bằng ở 8, xa hơn ở 0 (`research/structure-0-10.cjs`).
Chọn lại trọng số chuỗi không gỡ được (không có chuỗi nào để kéo về), phía thẻ lệch
cũng không (nó không đụng tới a và m). Bé đếm đúng k, bỏ qua dấu, chọn số gần 5
hơn: đúng 93–94% ô 1 ở bậc 1–4, 65% ở bậc 5.

Cách gỡ đều phải đổi tham số nội dung mà owner đang chốt (số 0, máy ±1, bậc 5 lên
20), nên bản này **không đổi** và báo lại. Mức đo theo cấu trúc (một chuỗi = một
phiếu; ngang nhau tính nửa): 0–10 hiện tại 90,5% ô 1; 0–15 71%; 0–20 62%; thêm máy
±1 74%; cho thẻ ngược dấu ô 2 vắng khi ra ngoài phạm vi 67% ô 1 nhưng 50% ô 2 mất
thẻ ngược dấu (mẹo bỏ qua dấu thắng lại ở ô 2). Contract gác các mẹo gốc này ở
đúng mức đo (§5, lớp "cấu trúc") để nó không nặng thêm.

## 5. Đo lối tắt (planner thật, vòng 6 bài + vòng luyện chống lặp)

Từ vòng sửa 3, contract `npm run test:explore-number-chain` tự đo mọi mẹo (2000
vòng planner mỗi bậc qua `createExploreRunBatch`, vòng 6 bài + vòng luyện) và
`NC_REPORT=1` in bảng đầy đủ: `research/shortcuts-v2-r3.txt`. Bản cũ:
`research/measure-v1.cjs` → `shortcuts-v1-bcb3dab.txt`; bản v2 đầu
`shortcuts-v2-f1cd796.txt`; sau review nhánh `shortcuts-v2-3d125bb.txt`
(`measure-v2.cjs`). "Qua vòng" = ≥ 4/6 bài đúng ngay lần đầu, một bài = cả hai ô;
số trong ngoặc tính cả vòng luyện. Đoán mò: 6–6,5% bài, qua vòng ≤ 0,1%. Probe của
reviewer (round3-residuals: chain-probe, chain-probe2, nc4-planner2, nc02) chạy lại
trên cây này cho cùng số.

**Không cần biết gì** (to nhất, bé nhất, thứ 2/3 theo cỡ, xa số 5, gần/xa số đi vào
máy, gần/xa số đang hiện, nhiều/ít hàng xóm, vị trí cố định, tránh/chọn thẻ đã thấy,
thẻ ngoài cùng xa số 5): mẹo tốt nhất là "tránh thẻ đã thấy" ≤ 28% ô, ≤ 8% bài,
qua vòng ≤ 0,2%. Hạng đáp án theo cỡ 25% ± 1. Contract gác ≤ 15% bài, qua vòng
≤ 1% (≤ 2%), hạng 25% ± 3.

**Chỉ biết chiều** (máy thêm → số lớn hơn x; chọn thẻ bất kỳ / gần x nhất / xa x
nhất = "to nhất khi thêm, bé nhất khi bớt" / nhiều hàng xóm / ngoài cùng / giữa rồi
ngoài cùng) và **chỉ biết số bước** (đếm đúng k, bỏ qua dấu; chọn ngẫu nhiên, xa/gần
số đã biết, to/bé, thẻ chưa thấy / đã thấy, theo phía thẻ lệch, luôn lên / luôn
xuống): mọi mẹo ≤ 51% ô, ≤ 26% bài, qua vòng ≤ 4,5% (≤ 9%) ở mọi bậc.
Contract gác ≤ 56% ô, ≤ 30% bài, qua vòng ≤ 7% (≤ 13%).

**Cấu trúc — chọn thẻ gần số 5** (cùng gốc ở §4, ngưỡng = mức đo + ~3 điểm):

| Mẹo | Bậc 1–4: ô / bài / qua vòng (vòng luyện) | Bậc 5 |
|---|---|---|
| Không biết gì, thẻ gần 5 nhất | 44% / 16% / 0,6–0,8% (1,0–1,8%) | 33% / 9,5% / 0,2% (0,3%) |
| Chỉ biết chiều, thẻ phía đó gần 5 nhất | 59% / 34–35% / 11–13% (21–23%) | 55% / 30% / 7% (13%) |
| Đếm k bỏ qua dấu, chọn số gần 5 | 72% / 47% / 26–30% (47–51%) | 58% / 33% / 9–10% (17–19%) |

**Chiều ngược** (bậc ≥ 2): không gỡ máy (chạy máy xuôi từ số đã biết) đúng 0% ô
ngược, qua vòng 0%. Giỏi xuôi + bỏ qua dấu ở bài ngược (chọn ngẫu nhiên): qua vòng
25–28% (44–47%); giỏi xuôi + bỏ qua dấu ở bài ngược + chọn số gần 5: qua vòng
63–66% (86–91%) ở bậc 2–4, 39–40% (61–64%) ở bậc 5 — cùng dấu hiệu cấu trúc trên.
Contract gác: không gỡ máy = 0; bậc 2–4 ≤ 33% (≤ 52%) và ≤ 70% (≤ 94%); bậc 5
≤ 30% (≤ 50%) và ≤ 45% (≤ 69%).

## 6. Điểm tựa chấm và diễn lại

- `DotGroup` (`VisualMathPrimitives`) thêm prop tuỳ chọn: `size` (chấm nhỏ, hàng
  5 như khung 10) và `changed` (`{count, kind: 'add'|'remove', progress?}`: chấm
  thêm màu xanh rơi vào; chấm bớt thành vòng rỗng bị gạch, chìm xuống). Không truyền
  thì như cũ (Ô thiếu, Máy cộng trừ không đổi).
- Cỡ chấm dưới ô: 10 pt (hai hàng) khi phạm vi tới 10, 6 pt (bốn hàng) ở bậc 5; khay
  chấm giữ chiều cao cố định theo bậc nên bảng không nhảy.
- Khi chơi: bước có chấm vẽ chấm dưới số đầu vào (đã biết/đã điền), chấm của máy
  phía trên máy (k chấm xanh hoặc k vòng gạch), và chấm dưới ô ra khi đã điền.
  `numberChainStepHasDots(params, bước, support)`: theo `dotSteps`, hoặc support ≥ 1
  cho bước đang làm (và giữ cho các bước trước trong bài).
- Diễn lại (sau ô 2, mọi bậc): chuỗi chạy XUÔI kể cả bài ngược — ô đầu giữ chấm;
  chặng 1 (350 ms): ô giữa hiện chấm của số đầu + k1 chấm rơi vào / k1 chấm rời đi,
  máy 1 nhịp sáng (700 ms), giữ 650 ms; chặng 2 tương tự. Đồng thời Đô Đô nói câu
  thần chú (không chen số). Báo đúng khi cả hai xong + 250 ms (tối thiểu 1,2 s).
- Giảm chuyển động: cùng hai chặng, mỗi chặng đứng yên 1,1 s, không animation nào
  bắt đầu. Tạm dừng (`paused`): mọi nhịp đi qua `useBusSequencer(paused)`; câu
  thần chú đi qua `throughPause` (bị cắt thì nói lại cả câu, báo đúng chờ lần đọc
  đó; tạm dừng sau câu thần chú không đọc lại). Từ thẻ đúng ô 2 tới ngay trước báo
  đúng, bảng báo bận (`onBoardBusy`, nhả khi rời bảng), nên màn chơi không đọc lại
  câu hỏi của ô đã điền khi quay lại (task 8.7).

## 7. Lời của Đô Đô (audio v8, chưa thu)

| id | câu |
|---|---|
| `game_number_chain` | Máy nối tiếp |
| `chain2_forward_q` | Cho số chạy qua hai máy nhé. Ô giữa là số mấy? |
| `chain2_reverse_q` | Bé tính ngược từ số cuối nhé. Ô giữa là số mấy? |
| `chain2_ask_end` | Còn ô cuối là số mấy? |
| `chain2_ask_start` | Còn ô đầu là số mấy? |
| `chain2_mantra_forward` | Qua máy thêm thì nhiều lên, qua máy bớt thì ít đi. |
| `chain2_mantra_reverse` | Đi ngược: máy thêm thì bớt, máy bớt thì thêm. |
| `chain2_hint_dots` | Bé đếm chấm rồi xem máy thêm hay bớt nhé. |
| `chain2_intro_3` | Bây giờ có một máy không còn chấm, bé tự tính nhé! |
| `chain2_intro_4` | Bây giờ không còn chấm nữa, bé nhìn số mà tính nhé! |

Câu lên bậc 2 và bậc 5 dùng lại clip pack v7: `chain_intro_2` («Bây giờ có lúc bé
tìm số ở ô đầu nhé!») và `chain_intro_4` («Bây giờ bé tính với số lớn tới hai mươi
nhé!»). Câu nào cũng không có số, nên không cần câu liền (`promptLines`);
`explore-lines:dump` không đổi. Bong bóng giữ cao hai dòng.

## 8. Ngoài phạm vi

- Phản hồi riêng theo lỗi (vd. "Máy này bớt mà, bé thử bớt nhé") khi bé chọn thẻ
  ngược dấu: cần thêm câu và quyết định sư phạm của owner.
- Diễn lại chặng gây nhầm sau khi sai (C06 đề xuất): trợ giúp hiện đưa chấm về.
- Luật qua vòng 4/6 và cách chia vòng dùng chung cho các game theo bậc: không đổi.
- Kéo chấm qua máy (tương tác kéo-thả): Khám phá giữ chạm.
