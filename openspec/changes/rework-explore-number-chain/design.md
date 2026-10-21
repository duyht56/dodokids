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

| Bậc | Chiều | `dotSteps` | Máy (k) | Phạm vi | Thẻ/ô | Bé làm |
|---|---|---|---|---|---|---|
| 1 | xuôi | 2 | 2–3 | 1–10 | 4 | hai phép, đếm chấm cả hai máy |
| 2 | + ngược | 2 | 2–3 | 1–10 | 4 | gỡ máy từ số cuối, vẫn có chấm |
| 3 | xuôi + ngược | **1** | 2–3 | 1–10 | 4 | máy tính sau chỉ còn ký hiệu |
| 4 | xuôi + ngược | **0** | 2–3 | 1–10 | 4 | chỉ còn số |
| 5 | xuôi + ngược | 0 | **2–5, một máy ≥ 4** | 1–10 | 4 | máy bước lớn |

- **Bậc 1 đã là hai bước thật**: hai ô trống; máy nào chạy một mình từ số đầu
  cũng không ra ô cuối; số cuối khác số đầu (không có chuỗi quay về); ô cuối không
  có trong thẻ của ô giữa.
- **Phạm vi 1–10 mọi bậc**: đúng "phạm vi 10" của đề gốc và curriculum mầm non
  (`math_arithmetic_1_50` micro `_sub_within_10` ở L4). Không bậc nào vượt 10, nên
  điều kiện "số > 10 chỉ sau khi bỏ chấm" thoả hiển nhiên (contract vẫn kiểm).
- **Máy bước 2–3 (bậc 1–4)**: đề gốc dùng −4, +2. Máy ±1 chỉ là số liền sau/liền
  trước và đặt đáp án sát số đang hiện: đo được "chọn thẻ cạnh số đầu vào" thắng
  ~39–41% mỗi ô khi còn k = 1, về ~24% (đoán: 25%) khi bỏ.
- Chiều: bậc ≥ 2 mỗi vòng 6 bài chia đều 3 xuôi / 3 ngược (planner, bucket = mode).
- Capacity khai báo: 60 (L1), 120 (L2–L4), 60 (L5); có 68 chuỗi mỗi chiều ở L1–L4,
  164 ở L5.

## 3. Hai ô, thứ tự và báo kết quả

`params.blanks` = hai ô theo thứ tự điền (`['mid','end']` xuôi, `['mid','start']`
ngược), mỗi ô có `options` riêng; `answer.values` cùng thứ tự.

- Sai ở ô nào: thẻ rung, mờ, khoá; `onAnswer(false)` mỗi lần (gate
  `test:explore-leveled-rounds` đọc AST: renderer phải báo sai).
- Đúng ô 1: số vào ô (viền xanh lá, nảy nhẹ), sau 450 ms hàng thẻ đổi sang ô 2,
  bong bóng đổi câu, renderer `onPromptCue(câu ô 2)`. Không báo gì cho play screen.
- Đúng ô 2: diễn lại (§6) rồi `onAnswer(true)` đúng một lần. Play screen tính "đúng
  ngay lần đầu" theo `tries === 0` của cả bài, nên một lần sai ở ô nào cũng làm bài
  không còn là đúng ngay lần đầu.

## 4. Thẻ nhiễu theo lỗi thật

Họ lỗi (suy lại độc lập trong contract và spec server):

| Ô | ngược dấu (`sign`) | lệch một | chỉ chạy một máy (`one_machine`) |
|---|---|---|---|
| xuôi, ô giữa | đầu ∓ k1 | giữa ± 1 | — |
| xuôi, ô cuối | giữa ∓ k2 | cuối ± 1 | đầu (op2) k2 — quên máy 1 |
| ngược, ô giữa | cuối (op2) k2 — chạy xuôi thay vì gỡ | giữa ± 1 | — |
| ngược, ô đầu | giữa (op1) k1 | đầu ± 1 | cuối gỡ k1 — quên máy 2 |

"Chỉ chạy một máy" không dùng ở ô thứ nhất: ở đó chạy đúng một máy là việc phải
làm, và cùng một số xuất hiện ở hai hàng thẻ thì thẻ lặp lại luôn là thẻ sai. Thiếu
thẻ thì lấy số gần (|thẻ − đáp án| ≤ 4). Ràng buộc cứng: 4 thẻ khác nhau trong
1–10, đúng MỘT thẻ khớp máy, không thẻ nào là số đang hiện (ô 1: số đã biết; ô 2:
số đã biết + ô giữa), thẻ ô 1 không chứa đáp án ô 2.

Chống mẹo:

1. **Vị trí theo cỡ chọn trước.** Generator rút `rank0`, `rank1` ∈ {0..3} đều, rồi
   chọn đều trong các chuỗi mà hai ô dựng được đáp án ở đúng vị trí đó
   (`numberChainCandidatesForRanks`, có cache). Không còn số sát 1/10 bị ép làm thẻ
   nhỏ/lớn nhất.
2. **Mốc.** Với mỗi mốc bé có thể bám — số đầu vào của máy đang dùng, giữa phạm vi
   (5,5), các số đang hiện — nếu đáp án đang là thẻ gần mốc nhất thì lấy thêm một
   thẻ gần mốc hơn (lượt 1) hoặc bằng (lượt 2), trong hạn mức mỗi phía.
3. Lấp phần còn lại: lỗi thật trước số gần; ô 2 tránh số đã có ở hàng thẻ ô 1 nếu
   còn số khác. Vị trí trên màn hình xáo theo seed.

`buildNearTargetOptions` (dùng chung) không đổi.

## 5. Đo lối tắt (planner thật, vòng 6 bài + vòng luyện chống lặp)

`research/measure-v1.cjs` (mã `bcb3dab`, 2000 vòng/bậc) và
`research/measure-v2.cjs` (2000 vòng/bậc); kết quả đầy đủ ở `research/*.txt`.
"Qua vòng" = ≥ 4/6 bài đúng ngay lần đầu; v2 tính cả hai ô.

| Bậc | v1: mẹo tốt nhất | v1 qua vòng (+ vòng luyện) | v2: đoán mò / bài | v2 mẹo nêu (max/min/trung vị/vị trí/gần số hiện) tốt nhất / bài | v2 qua vòng (+ luyện) mẹo nêu | v2 mẹo khác tốt nhất / bài, qua vòng (+ luyện) |
|---|---|---|---|---|---|---|
| 1 | gần ô giữa 69,7% | 74,4% (93,3%) | 6,4% | gần số hiện 7,4% | ≤ 0,05% (≤ 0,05%) | dấu + gần 10,8%, 0,1% (0,25%) |
| 2 | gần ô giữa 61,0% | 57,0% (82,3%) | 6,1% | gần số hiện 7,3% | ≤ 0,15% (≤ 0,15%) | dấu + gần 11,0%, 0,6% (0,65%) |
| 3 | gần số hiện 44,3% | 24,4% (42,9%) | 6,1% | gần số hiện 7,8% | ≤ 0,1% (≤ 0,1%) | dấu + gần 11,2%, 0,2% (0,25%) |
| 4 | gần số hiện 46,1% | 27,8% (48,6%) | 6,4% | gần số hiện 7,5% | ≤ 0,05% (≤ 0,1%) | dấu + gần 11,0%, 0,2% (0,45%) |
| 5 | gần số hiện 42,8% | 21,1% (37,8%) | 6,5% | bé nhất 6,6% | ≤ 0,1% (≤ 0,1%) | bỏ thẻ đã thấy 9,8%, 0% (0,1%) |

Đoán mò (chọn ngẫu nhiên mỗi ô) qua vòng 0–0,15%. Vị trí của đáp án theo cỡ:
24,6–25,4% mỗi hạng, mọi bậc. "Dấu + gần" (máy thêm thì
chọn thẻ lớn hơn số đầu vào gần nhất) dùng một phần hiểu biết thật (chiều của máy);
"bỏ thẻ đã thấy" ở ô 2 khai thác chỗ hai hàng thẻ trùng số (khó tránh hết trong
1–10). Contract (`test:explore-number-chain`) gác: mẹo nêu ≤ 9,5%/bài, qua vòng
≤ 0,6% (+ luyện ≤ 0,8%); mẹo khác ≤ 14%/bài, qua vòng ≤ 1,2% (+ luyện ≤ 1,5%); vị
trí theo cỡ 25% ± 2,5%.

## 6. Điểm tựa chấm và diễn lại

- `DotGroup` (`VisualMathPrimitives`) thêm prop tuỳ chọn: `size` (chấm nhỏ, hàng
  5 như khung 10, nhóm ≤ 10 vừa dưới ô 64 pt) và `changed` (`{count, kind:
  'add'|'remove', progress?}`: chấm thêm màu xanh rơi vào; chấm bớt thành vòng rỗng
  bị gạch, chìm xuống). Không truyền thì như cũ (Ô thiếu, Máy cộng trừ không đổi).
- Khi chơi: bước có chấm vẽ chấm dưới số đầu vào (đã biết/đã điền), chấm của máy
  phía trên máy (k chấm xanh hoặc k vòng gạch), và chấm dưới ô ra khi đã điền.
  `numberChainStepHasDots(params, bước, support)`: theo `dotSteps`, hoặc support ≥ 1
  cho bước đang làm (và giữ cho các bước trước trong bài).
- Diễn lại (sau ô 2, mọi bậc, kể cả bậc không chấm): chuỗi chạy XUÔI kể cả bài
  ngược — ô đầu giữ chấm; chặng 1 (350 ms): ô giữa hiện chấm của số đầu + k1 chấm
  rơi vào / k1 chấm rời đi, máy 1 nhịp sáng (700 ms), giữ 650 ms; chặng 2 tương tự.
  Đồng thời Đô Đô nói câu thần chú (không chen số; mọi số nằm trên máy). Báo đúng
  khi cả hai xong + 250 ms (tối thiểu 1,2 s). Đo trên máy ảo: máy 1 chạy ~0,4–1,1 s
  sau chạm, máy 2 ~1,8–2,5 s, báo đúng ~3,4 s khi chưa có clip.
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
| `chain2_intro_5` | Bây giờ máy thêm bớt tới năm, bé tính kỹ nhé! |

Bậc 2 giữ `chain_intro_2` («Bây giờ có lúc bé tìm số ở ô đầu nhé!», pack v7). Câu
nào cũng không có số, nên không cần câu liền (`promptLines`); `explore-lines:dump`
không đổi. Bong bóng giữ cao hai dòng (câu ô 2 một dòng không làm bảng nhảy);
câu thần chú ngược rút còn hai dòng trên màn 375 pt.

## 8. Ngoài phạm vi

- Phản hồi riêng theo lỗi (vd. "Máy này bớt mà, bé thử bớt nhé") khi bé chọn thẻ
  ngược dấu: cần thêm câu và quyết định sư phạm của owner.
- Diễn lại chặng gây nhầm sau khi sai (C06 đề xuất): trợ giúp hiện đưa chấm về.
- Kéo chấm qua máy (tương tác kéo-thả): Khám phá giữ chạm.
