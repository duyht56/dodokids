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

## 4. Thẻ: hai cặp đối xứng quanh số đi vào máy

Gọi x là số đi vào máy của ô (số đã biết ở ô 1, ô giữa ở ô 2), a là đáp án (cách
x đúng k), m = 2x − a là **thẻ ngược dấu** (xuôi: máy chạy ngược dấu; ngược: chạy
máy xuôi thay vì gỡ — cùng một số). Bốn thẻ:

```
{ a, a ± g, m, m ∓ g }      g = 1 (lệch một), hoặc 2 khi ± 1 đụng số cấm
```

- **Thẻ ngược dấu có mặt ở 100% ô.** Chỉ có đúng hai số cách x đúng k bước (a và
  m), nên bé đếm đúng k mà bỏ qua dấu, hay ở chiều ngược không gỡ máy mà chạy xuôi,
  chỉ còn 50/50 (không gỡ máy: 0%). Đây là mức sàn: không bộ bốn thẻ nào làm mẹo
  này thấp hơn mà vẫn có đáp án.
- **Đối xứng quanh x**: mọi mẹo chỉ dựa vào khoảng cách tới x (gần nhất, xa nhất)
  không phân biệt a với m. Hai cặp cách nhau ≥ 2, nên thẻ nào cũng có cùng số hàng
  xóm ±1 (cùng 1, hoặc cùng 0 khi g = 2): hết dấu hiệu "thẻ có hàng xóm"
  (NUMBER-CHAIN-02).
- **Phía của thẻ lệch** (vào trong, về phía x / ra ngoài) quyết định đáp án đứng thứ
  mấy theo cỡ: ra ngoài → thứ 2 hoặc 3, vào trong → bé nhất hoặc to nhất. Rút đều
  phía cho mỗi ô TRƯỚC, rồi chọn chuỗi dựng được (`numberChainCandidatesFor`).
- **Kéo về giữa phạm vi** (`centerPull`, 0,5 ở bậc 1–4, 0,25 ở bậc 5): ô giữa phải
  là số đi vào máy 2 nên luôn gần giữa phạm vi hơn thẻ ngược dấu của nó; rút phía
  đều thì "chọn thẻ gần 5" thắng ~60% ô 1. Với xác suất `centerPull`, thẻ lệch được
  đặt về phía giữa phạm vi (`numberChainCenterSide`). Trong 0–10 hai mẹo "theo cỡ"
  và "gần số giữa" kéo ngược nhau; 0,5 là điểm cân bằng đo được (bỏ hẳn đáp án = 5
  chỉ lợi ~1% mà mất 20% chuỗi). Ở 0–20 dư chỗ hơn, 0,25 là đủ.
- Không thẻ nào là số đang hiện (ô 1: số đã biết; ô 2: số đã biết + ô giữa); thẻ ô
  1 không chứa đáp án ô 2. Lỗi "quên một máy" (ô 2: chạy máy 2 từ số đầu / gỡ máy 1
  từ số cuối) chỉ có mặt khi nó trùng một chỗ của bộ đối xứng (~12% ô 2 ở bậc 1–4).
- Họ lỗi (validator, contract và spec server suy lại độc lập): `sign`,
  `one_machine`, `off_by_one`, `off_by_two`, `sign_off_by_one`, `sign_off_by_two`.
  Không còn thẻ "số gần" tuỳ ý.

`buildNearTargetOptions` (dùng chung) không đổi.

## 5. Đo lối tắt (planner thật, vòng 6 bài + vòng luyện chống lặp)

`research/measure-v1.cjs` (mã `bcb3dab`) và `research/measure-v2.cjs`, 2000 vòng mỗi
bậc; kết quả: `research/shortcuts-v1-bcb3dab.txt` (bản cũ), `shortcuts-v2-f1cd796.txt`
(bản v2 đầu, trước review nhánh), `shortcuts-v2.txt` (hiện tại). "Qua vòng" = ≥ 4/6
bài đúng ngay lần đầu, một bài = cả hai ô; số trong ngoặc tính cả vòng luyện. Đoán
mò: 6,3% bài, qua vòng ≤ 0,1%.

**Lớp 1 — mẹo không cần biết gì** (to nhất, bé nhất, thẻ thứ 2/3 theo cỡ, gần số
giữa phạm vi, gần số đi vào máy, gần số đang hiện, xa nhất, nhiều/ít hàng xóm, một
vị trí cố định, tránh/chọn thẻ đã thấy ở hàng trước):

| Bậc | v1 (mẹo tốt nhất, qua vòng) | v2 hiện tại: mẹo tốt nhất / bài | qua vòng |
|---|---|---|---|
| 1 | gần ô giữa: 74,4% (93,3%) | bé nhất 14,2% | 0,3% (0,6%) |
| 2 | gần ô giữa: 57,0% (82,3%) | bé nhất 13,6% | 0% (0,05%) |
| 3 | gần số hiện: 24,4% (42,9%) | to nhất 13,7% | 0,2% (0,25%) |
| 4 | gần số hiện: 27,8% (48,6%) | bé nhất 14,0% | 0,15% (0,25%) |
| 5 | gần số hiện: 21,1% (37,8%) | gần số giữa 9,6% | 0,25% (0,3%) |

Gần số đang hiện ≤ 5%, thẻ có hàng xóm 6,3% (đoán), vị trí 6,3%. Contract gác: mỗi
mẹo ≤ 42% ô, ≤ 15% bài, qua vòng ≤ 0,8% (≤ 1,5%).

**Lớp 2 — biết một nửa** (đếm đúng k mà bỏ qua dấu; chỉ biết chiều của máy: thẻ bất
kỳ / gần nhất / nhiều hàng xóm phía đó): ≈ 50% mỗi ô ở mọi bậc (bậc 5 "chiều + gần
nhất" 53%), 25% bài, qua vòng 3–4,5% (7–10%). Bản v2 đầu: bỏ qua dấu 84–87% ô, qua
vòng ~75% (NUMBER-CHAIN-01). Contract gác: bỏ qua dấu = 50% ± 3% mỗi ô (thẻ ngược
dấu luôn ở đó); mọi mẹo lớp 2 ≤ 56% ô, ≤ 30% bài, qua vòng ≤ 7% (≤ 13%).

**Lớp 3 — chiều ngược** (bậc ≥ 2): không gỡ máy (chạy máy xuôi từ số đã biết) đúng
0% ô ngược, qua vòng 0%. Giỏi xuôi + đoán dấu ở bài ngược: qua vòng 25–28% (44–46%)
— trước khi chia vòng 2/4 là 58% (82%), bản v2 đầu 97–99%. Contract gác ≤ 30%
(≤ 50%).

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
  bắt đầu. Tạm dừng (`paused`): mọi nhịp đi qua `useBusSequencer(paused)`.

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
