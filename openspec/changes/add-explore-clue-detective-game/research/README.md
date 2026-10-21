# research/ — mô phỏng tái lập số đo của Thám tử Đô Đô

Script mô phỏng thiết kế đang chọn: bảng bậc **T-Lai**, **khuôn đối xứng dấu** và
**danh mục cấu trúc hoán đổi được P1-X** (`CLUE_STRUCTURES`), thư viện chiến lược
S1–S15, họ "lọc rồi xếp hạng" S16, thư viện mù dấu và hai cận Bayes (design §5, §9,
§10). Chỉ dùng module có sẵn của Node (≥ 18), không cài gì. Không phải code của app:
contract `verify-explore-clue-detective-contracts.cjs` (tasks 2.7) sẽ dựng lại các
phép kiểm này trên generator thật.

**Nguồn và lịch sử.**

- 2026-10-20: chép từ scratchpad `clue-sim/` (bộ sinh M, nay ở `legacy/`).
- 2026-10-21 (sau Codex vòng 6 và `tmp/game-ideas-2026-10-20/clue-sim-symmetric.md`):
  chép từ scratchpad `clue-sym/` các script của P1 (`sym.cjs`, `symrun.cjs`,
  `sym-catalog.cjs`, `sym-table.cjs`, `boards.cjs`, `validate-sym.cjs`,
  `accept-leak.cjs`, `round-leak.cjs`) và bản sửa của `lib.cjs` / `gen.cjs` (R9: tên
  món thật trong pool 14, loại cặp gần âm ngay khi chọn; `NO_R9=1` trả về mô hình
  cũ); `design-p1.cjs`, `exact.cjs`, `table.cjs` viết cho P1.
- 2026-10-21 (sau Codex vòng 7, `tmp/game-ideas-2026-10-20/codex-r7.md`): chép từ
  scratchpad `clue-exch/exch/` các script tính hoán đổi được (`fam.cjs`, `check.cjs`,
  `autom.cjs`, `enum.cjs`, `catalog.cjs`, `bayes-p.cjs`, `views.cjs`, `exact-x.cjs`,
  `table-x.cjs`, `boards-x.cjs`, `xgen.cjs`, `p1gen.cjs`, `measure-p1.cjs`,
  `codex-cx.cjs`, `taut.cjs` + `taut.json`). Sửa khi chép:
  - `design-x.cjs` (mới) đọc **thẳng từ `../design.md`** bảng bậc (§5: số nhà × món,
    dạng thẻ) và danh mục `CLUE_STRUCTURES` (§9), kiểm khuôn đối xứng dấu, khớp
    (a, c, d) và số nhà; `catalog.cjs` lấy danh mục `CAT` từ đó (bản scratchpad đọc
    file vét cạn), nên sửa bảng trong design là số đo đổi theo (`DESIGN=<đường dẫn>`
    để trỏ file khác). `CAT5` (phương án R5′) chép cứng trong `catalog.cjs`.
  - `enum.cjs` ghi `found-*.json` vào `OUT` (mặc định thư mục tạm của máy,
    `clue-detective-research/`; không ghi vào repo) và so danh mục chặt vét được với
    design §9 (dòng `KHỚP`); `bayes-p.cjs strict` đọc danh mục của design, `fam` và
    `views.cjs` đọc `OUT`.
  - `exact-x.cjs` in thêm bảng đầy đủ design §10, R7 / R8 / loại vi phạm đầu, định lý
    S13, kiểm từng dòng danh mục (R1–R12, ba vai trò) và cận Bayes mù dấu tính từ
    danh mục; dòng cuối `KIỂM: …`.
  - `measure-p1.cjs` bỏ tổng tần suất món đệm khỏi nhóm "không phủ định" (như
    `table-x.cjs` và design §9); `codex-cx.cjs` in thêm quỹ đạo đáp án và R12;
    `table-x.cjs` không ghi JSON vào repo (chỉ khi đặt `OUT`).
  - P1 thành bản so sánh: `design-p1.cjs` đọc mặc định `p1-design.md` (bản chép bảng
    bậc + bảng khuôn của P1), nên `table.cjs`, `exact.cjs`, `validate-sym.cjs`,
    `boards.cjs` in lại đúng số P1 cũ.
  - `sym.cjs` (`sampleSym`) sửa cho khớp chữ của bộ sinh P1 (Codex vòng 7, mục 1.3):
    trượt 40 lần xếp món đệm thì rút lại khuôn và món đệm, tối đa 10 lần, rồi báo lỗi
    (bản cũ trả bản tốt nhất). Trên 120.000 bài nhánh dự phòng chưa lần nào chạy (tối
    đa 18 lần xếp), nên `table.cjs`, `exact.cjs`, `sym-table.cjs`, `boards.cjs` in ra
    giống từng byte bản cũ và `validate-sym.cjs` vẫn 0 lỗi. `level.lenient` (chỉ
    `sym-catalog.cjs` bật, vì nó dò cả khuôn không xếp được món đệm như 7×2) giữ đúng
    hành vi cũ: một lần rút khuôn, trả bản tốt nhất với `instOk = false`;
    `sym-catalog.cjs` (cả `RC=1`) in ra giống từng byte bản cũ.
- 2026-10-21 (kiểm độc lập P1-X): `xgen.cjs` đặt tên món **đều trên mọi phép gán hợp
  lệ** (`nameUniform`: xáo pool 14, lấy đủ món, có cặp gần âm thì xáo lại) thay cho
  `lib.cjs` `nameBoard` (rút tuần tự, loại gần âm ngay khi chọn), vì cách cũ làm cận
  Bayes "chỉ đọc thẻ có" vượt 1/3 khi bé biết cách đặt tên (`naming-bias.cjs`, mới;
  `sampleX(…, naming = 'seq')` giữ cách cũ để tái lập). P1 và `legacy/` vẫn dùng
  `nameBoard`; `table-x.cjs` in ra giống từng byte (thống kê không đọc tên món).
  `sym-table.cjs`, `legacy/run.cjs`, `legacy/catalog.cjs` nhận `OUT` là thư mục.

`require` đều tương đối theo file nên chạy được từ bất kỳ thư mục nào.

## Lệnh và số mong đợi — thiết kế đang chọn (P1-X)

Chạy trong thư mục này (hoặc `node <đường dẫn>/research/<script>`). `OUT=<thư mục>`
đổi chỗ ghi / đọc file vét cạn. `sym-table.cjs`, `legacy/run.cjs`, `legacy/catalog.cjs`
nhận `OUT` là file hoặc thư mục (thư mục thì ghi `sym-table.json` / `results.json` /
`catalog.json` vào đó), nên `export OUT=<thư mục>` một lần cho cả phiên không làm
script nào crash; stdout không đổi.

| Lệnh | Thời gian | Số mong đợi |
|---|---|---|
| `node exact-x.cjs` | < 1 s | Bảng design §10 (tóm tắt + đầy đủ, dán thẳng). Đoán bừa 0,4% (9 nhà) / 0,6% (B4); không phủ định (S1–S15 + S16, 595) 19,0% mọi bậc, mẹo Codex vòng 7 19,0%; cận Bayes "chỉ đọc thẻ có" 19,0%; mù dấu trừ vị trí 19,0%, kể cả vị trí và cận Bayes mù dấu 100% (B1–B2, giàn đỡ) / 19,0%; S13 tệ nhất 56,9% mọi bậc, ngẫu nhiên 36,5% (9 nhà) / 43,2% (B4); S3 7,4% / 19,0% (B4); S3∩S9 100%; danh mục 1 / 1 / 1 / 3 / 3 / 3 (cấu trúc 1 / 1 / 3 / 9 / 9 / 9); R8 3 / 3 / 3–6 / 3–5 / 3–6 / 3–6; vi phạm đầu "cấm" / "thiếu" 25/75 (B1–B2), 46/54 (B3, B5–B6), 52/48 (B4); R7 PNN 6/1/1 (9 nhà), 5/1/1 (8 nhà), NPN 3/4/1, 3/3/1, NNP 3/2/3, 3/2/2; dòng cuối `KIỂM: mọi cấu trúc của danh mục đạt R1–R12 …` |
| `CATSET=CAT5 node exact-x.cjs` | < 1 s | Phương án P1-X′ (R5′): 19 / 19 / 19 / 27 / 30 / 30 hình; danh mục 2 / 2 / 2 / 4 / 3+1 / 3+1 (cấu trúc 2 / 2 / 6 / 12 / 12 / 12); không phủ định 19,0%; cận Bayes chỉ đọc thẻ có 19,0% (B1–B4) / 12,4% (B5–B6); S3 19,0% / 12,4%; dòng `KIỂM` đạt |
| `node table-x.cjs` | ~30 s | 6.000 bài/bậc, tên món thật (pool 14, R9). P1: mẹo Codex vòng 7 55,7 / 55,5 / 55,4 / 38,4 / 61,2 / 61,5% → qua 70,4 / 69,9 / 69,7 / 29,0 / 81,4 / 81,9%; không phủ định tệ nhất (S16) qua 70,4 / 69,9 / 69,7 / 58,6 / 82,3 / 82,6% (B4 `P\|fillMax.max`, B5–B6 `P\|f2Sum.min`); bỏ thống kê món đệm 70,4 / 69,9 / 69,7 / 49,8 / 82,3 / 82,6%. P1-X: trùng `exact-x.cjs` (cột mù dấu "kể cả vị trí" B3–B6 dao động 19,7–21,8%); cấu trúc thấy 1 / 1 / 3 / 9 / 9 / 9; lỗi R1–R9 / R11 0 / 0 mọi bậc. `RUN=P1,X,X5` (~40 s) thêm P1-X′: 0 / 0 lỗi |
| `node measure-p1.cjs` | ~10 s | P1, seed khác: mẹo Codex 56,1 / 55,3 / 56,0 / 38,0 / 61,5 / 61,9% → qua 71,2 / 69,6 / 70,9 / 28,2 / 82,0 / 82,6%; **bài có ≥ 1 mẹo không phủ định của S16 > 1/3: 100% mọi bậc** |
| `node naming-bias.cjs` | ~13 s | Cận Bayes "chỉ đọc thẻ có" khi bé biết cả cách đặt tên (chú cá / hộp quà ở chỗ thẻ hay chỗ món đệm), chính xác: đặt tên đều (`xgen.cjs`, đang dùng) 33,3% → 19,0% mọi bậc, góc nhìn tệ nhất 33,3%; rút tuần tự loại gần âm ngay khi chọn (bản trước) 33,9 / 34,1 / 36,2 / 34,5% (B1–2 / B3 / B4 / B5–6) → qua 20,0 / 20,4 / 24,4 / 21,1%, góc nhìn tệ nhất đến 40,0%; mẹo "né nhà có cá/quà" lấy mẫu 30.000 bài: tuần tự 33,9–34,1% → 20,0–20,4%, đều 33,2–33,4%; dòng cuối `KIỂM: đặt tên đều → … đúng 1/3` |
| `node codex-cx.cjs` | < 1 s | Phản ví dụ Codex vòng 7 (8×2): vai trò A mẹo 1,000, quỹ đạo đáp án 1/3; vai trò B, C 0,333 (S16 tệ nhất 0,500), quỹ đạo 2/3; thư viện cũ 0,333 cả ba dạng; `R12: KHÔNG có trong CLUE_STRUCTURES` |
| `node boards-x.cjs 7` | < 1 s | Hai bàn mẫu design §11: (a) bậc 1 9×2 PNN K4 ∪ K3, thẻ CÓ quả chuối, đáp án ô 9, đổi vai trò ô 9 / 4 / 5; (b) bậc 6 9×3 NPN Pappus, thẻ CÓ cánh diều, đáp án ô 4, chạm nhầm ô 2 (thiếu món), mọi món = 3 nhà. Cả hai: "kiểm luật … đạt", S16 0,333, mẹo Codex 0,333, S13 0,5, S3 0,250, quỹ đạo 3/3/3 |
| `node catalog.cjs` | < 1 s | Danh mục `CAT` (đọc design §9): 9x2 1, 8x3 3, 9x3a 3 cấu trúc; `CAT5` (R5′): 8x2 2, 9x2 5, 8x3 4, 9x3a 3, 9x3b 1 |
| `node taut.cjs 3` | < 1 s | Ghi lại `taut.json` giống từng byte: viết lại lời giải của S16 = `P∩S8`, `P∩S7` × mọi thống kê (70); m = 2 thêm `P`, `P∩S9` × thống kê món đệm |
| `node enum.cjs 8x2` | < 1 s | 0 cách gán thoả điều kiện cần (bất khả, chứng minh ở design §9) |
| `node enum.cjs 9x2` | < 1 s | 56 gán → 2 cấu trúc, cả 2 đạt họ, 1 chặt `AD BD CD AB AC BC EF EG FG` (lăng trụ `AD BE CF AB AC BC DE DF EF` không chặt); `KHỚP` design §9 |
| `node enum.cjs 8x3` | ~2 s | 704 cấu trúc thoả điều kiện cần → 3 đạt họ, cả 3 chặt (Möbius–Kantor, \|Stab(A)\| = 6, 5 món đệm); `KHỚP` |
| `T=3 node enum.cjs 9x3a` | ~7,5 phút | 42.413.760 gán → 4.727 cấu trúc → 45 đạt họ → 3 chặt (K4 + HI, K4 + HIJ, Pappus); `KHỚP` |
| `node enum.cjs 9x3a` (mọi t) | ~8,5 phút | 48.465.540 gán → 9.763 cấu trúc → 45 đạt họ (đều t = 3; t ≠ 3: 0) → 3 chặt; `KHỚP` |
| `node enum.cjs 9x3b` | ~9 s | (2, 1, 1): 5.585 cấu trúc thoả điều kiện cần, 0 đạt họ (bất khả) |
| `R5O=1 node enum.cjs 8x2` / `9x2` / `8x3` / `9x3b` | ≤ 65 s | R5′: 2 / 5 / 4 / 1 cấu trúc chặt (9x3b = bát diện + một nhà lẻ GHI); `KHỚP` `CAT5`. `T=3 R5O=1 … 9x3a` chưa chạy xong (> 13 phút CPU) |
| `node bayes-p.cjs <conf> strict` | < 1 s | Danh mục của design: cận Bayes "chỉ đọc thẻ có" 33,3% (9x2, 8x3, 9x3a), góc nhìn tệ nhất 33,3%; `R5O=1 node bayes-p.cjs 9x3b strict` 25,0% |
| `node bayes-p.cjs <conf> fam` (sau `enum.cjs`) | < 1 s | Mọi cấu trúc đạt họ: 66,7% (9x2, góc nhìn tệ nhất 100%), 33,3% (8x3), 51,1% (9x3a, 15 góc nhìn, tệ nhất 100%) |
| `node views.cjs 9x3a` (sau `T=3 node enum.cjs 9x3a`) | ~3 s | Hoán đổi theo phân phối: 6 cấu trúc với trọng số đều, ~15 với trọng số tối ưu (khởi tạo ngẫu nhiên) |

## P1 trước vòng 7 (so sánh) và các phép kiểm cũ

Đọc `p1-design.md` (bản chép bảng bậc + bảng khuôn của P1) qua `design-p1.cjs`.

| Lệnh | Thời gian | Số mong đợi |
|---|---|---|
| `node table.cjs` | ~3 s | Bảng P1: đoán bừa 0,6% (B1–B4) / 0,4% (B5–B6); mọi chiến lược S1–S15 không dùng phủ định, kể cả 198 mẹo ghép, 33,3%/bài → 19,0%; mù dấu trừ vị trí 19,0% mọi bậc, kể cả vị trí và cận Bayes 19,0% từ B3 (B1–B2: 100%, giàn đỡ); S13 tệ nhất 56,9% mọi bậc; S13 ngẫu nhiên 43,2% / 39,8%; S3 19,0% / 12,4%; S3∩S9 100%; R11 100%; cấu trúc 3 / 3 / 9 / 5.604 / 5.845 / 5.865 |
| `SEED=2000 node table.cjs` | ~3 s | Lệch ≤ 0,1 điểm; cấu trúc B4–B6 5.570 / 5.855 / 5.847 |
| `node exact.cjs` | < 1 s | Số chính xác của P1: như trên ở 0,1 điểm; R11 đạt; định lý S13 (quên thẻ "không có" = 1/2) đúng mọi khuôn × dạng; R8 3 / 3–5 / 3–6; vi phạm đầu "cấm"/"thiếu" 29/71 (B1–B2), 52/48 (B3–B6); dòng cuối `KIỂM: mọi bậc NN ≤ 1/3, R11 đạt, …` |
| `node validate-sym.cjs` | ~3 s | 36.000 bài trên 6 bậc P1: lỗi R1–R9 **0**, bàn trượt R11 **0** |
| `MUT_R9=1 node validate-sym.cjs` | ~3 s | Đột biến đặt tên không loại gần âm: 10.759 bài lỗi R9 (phép kiểm R9 có tác dụng) |
| `node accept-leak.cjs` | ~1 s | Nhận món đệm chỉ theo vai trò thật → Bayes mù dấu qua 58,7% (8×2), 33,5% (8×3), 29,5% (9×3 (3,1,0)), 26,6% (9×3 (2,1,1)); theo cả ba vai trò → 19,0% (điều kiện kín 2) |
| `node round-leak.cjs` | < 1 s | Túi ×2 mỗi dạng: bé mù dấu nhớ dạng đúng 56,1%/bài, qua 66,6%; rút độc lập 19,0% (điều kiện kín 4) |
| `node sym-table.cjs 1000` | ~15 s | T-Lai (M): mẹo Codex vòng 6 / Bayes mù dấu 100% cả 6 bậc, vai trò ok 0%; P1 = bảng trên; P1-túi = P1 của `clue-sim-symmetric.md` §3; P2, 9×2, 10×3, RC9/RC10 để so. `node sym-table.cjs 1000 P1` chỉ in P1 |
| `node sym-catalog.cjs 400` | ~5 s | Mọi khuôn đối xứng K = 7–10, m = 2–3 (design §9, §10 giới hạn 7); `RC=1` thêm khuôn đóng vai trò không đối xứng |
| `node boards.cjs 3` / `node boards.cjs 2` | < 1 s | Hai bàn mẫu P1 cũ (bậc 1 8×2 PNN thẻ CÓ quả chuối; bậc 6 9×3 NPN thẻ CÓ cánh diều) |
| `node gate-explore.cjs` | ~1 s | Cho phép khuôn riêng theo dạng: trần S13 khi giữ mọi mẹo không phủ định ≤ 1/3: 8 / 9 / 10 nhà → 41,8% / 32,9% / 26,3%; min S2∩S9 khi S13 ≤ 1/3 = 0,500 |

Số "cấu trúc thấy", số lần xếp món đệm và S11 của P1 (phụ thuộc món đệm) đổi nhẹ
theo seed; mọi số khác là giá trị chính xác của khuôn (`exact.cjs`). Mẹo mù dấu
"vị trí" đúng 0 hoặc 1 mỗi bài nên lấy mẫu dao động vài điểm; vì vậy `table.cjs` và
`exact-x.cjs` in số mù dấu chính xác.

## legacy/ — bộ sinh M (lịch sử, game không dùng nữa)

Script chỉ phục vụ bộ sinh M và bảng T-Lai 7 nhà, giữ để tái lập design bản
2026-10-20 và các vòng review trước. Dùng chung `../lib.cjs`, `../gen.cjs` (bản có
R9); kết quả giống từng byte bản trước R9 vì trần món đệm 10 không bao giờ chạm.

| Lệnh | Số mong đợi |
|---|---|
| `node legacy/table.cjs` (và `SEED=2000`) | Bảng §10 bản 2026-10-20: S13 tệ nhất 56,9% (B1–B4), 33,6% / 33,1% (B5 / B6); S3∩S9 100% / 99,4%; cấu trúc 6 / 6 / 18 / 4172 / 5372 / 5342 |
| `node legacy/exact-m.cjs` | Đọc bảng 18 khuôn đã làm tròn (`legacy/m-templates.md`): bậc 5–6 S13 tệ nhất 33,1%, S13 ngẫu nhiên 32,4%, S3 31,0%, S3∩S9 99,5%, S2∩S9 18,9%. `MODE=seed` dựng lại M theo seed |
| `node legacy/validate.cjs` | R1–R5 + R9: phần 1 30.000 bài, phần 2 (T-Lai, M) 36.000 bài, **0 lỗi** |
| `HYBRID=1 node legacy/run.cjs 1000 T-Lai M` | Tóm tắt từng bậc + top 5 mẹo ghép không phủ định (đều 19,0%) |
| `node legacy/show-gen.cjs` | Khuôn và trọng số bộ sinh M |
| `node legacy/tmpl-list.cjs` | 7×2 PNN: 16 khuôn, 2 đạt tầng 1, 1 đạt cả R6 bậc 1–4 |
| `node legacy/run.cjs 1000 all U,D,M,MD` | So T-Codex / T-Ped / T-Eng với 4 bộ sinh (~22 s) |
| `node legacy/catalog.cjs 300` | Mọi cấu hình dạng thẻ × K × m với bộ sinh M (~11 s) |

## Mô hình

- Bài = dạng thẻ (`PNN`, `NPN`, `NNP`) + chữ ký từng nhà (bit j bật khi nhà có món
  của thẻ j, j theo thứ tự đọc; chuỗi in theo thẻ 1→3) + món đệm. Vị trí đáp án rút
  đều theo seed nên S12 = 1/K, bằng đoán bừa.
- Khuôn đối xứng (a, c, d): a nhà `000`, mỗi chữ ký một món 1 nhà, mỗi chữ ký hai
  món c nhà, d nhà `111`; dùng chung cho ba dạng, đáp án = nhà chữ ký e_p (p = vị trí
  thẻ "có").
- **P1-X** (đang chọn): cấu trúc rút đều trong danh mục `CLUE_STRUCTURES` của bậc
  (design §9; trong script: id 0, 1, 2 = món thẻ vị trí 1, 2, 3, id ≥ 3 = món đệm;
  chữ A, B, C, D, … trong design), đặt tên món đều trên mọi phép gán hợp lệ của pool
  14 (`xgen.cjs` `nameUniform`, design §9 "Đặt tên đều"). Không có
  vòng xếp món đệm. **Chặt** = với cả ba vai trò, mọi nhà có món thẻ "có" nằm trong
  một quỹ đạo của nhóm tự đẳng cấu giữ món đó (`autom.cjs`) ⇒ mọi mẹo chỉ đọc thẻ "có",
  kể cả mẹo ngoài họ, đúng đúng 1/(số nhà có món đó) trên TỪNG bàn.
- **P1** (so sánh): món đệm xếp ngẫu nhiên, nhận khi mọi mẹo không phủ định của
  S1–S15 phụ thuộc món đệm ≤ 1/3 với cả ba vai trò (`sym.cjs` `sampleSym`).
- Họ S16 (`fam.cjs`): 17 bộ lọc không phủ định + 10 bộ lọc có phủ định + 2 bộ lọc
  viết lại lời giải, × (chọn đều + 17 thống kê × min / max). Thống kê không đọc dấu;
  thống kê món đệm (`fill*`) cần biết món nào trên thẻ. `fillSum` (Σ tần suất món
  đệm) tách khỏi "không phủ định": trên mọi bàn đạt họ nó bằng 3 × số món đệm ≡
  `P∩S7` (viết lại lời giải).
- `check.cjs`: R1–R9 (R5 hoặc R5′), R7, R8, R6/R6b thư viện cũ với ba vai trò
  (`SETS_ALL`), R11, họ S16, mù dấu, quỹ đạo đáp án dưới Stab(thẻ có).
- `enum.cjs`: vét cạn gán món đệm (nhãn chuẩn, ≤ 10 món đệm) có cắt tỉa theo điều
  kiện cần (bổ đề design §9: mọi món trong 6 nhà có món-thẻ có ở đúng 3 nhà).
- Pool 14 món thật, R9 (chú cá / hộp quà). Chiến lược trả về tập ứng viên, bé chọn
  đều trong tập; tập rỗng → đoán bừa (1/K); phép giao rỗng → dùng bộ lọc đầu. Mẹo
  mù dấu đoán vị trí thẻ "có" từ bàn rồi giải đúng; cận Bayes mù dấu = Σ góc nhìn max
  dạng P(góc nhìn, dạng); cận Bayes "chỉ đọc thẻ có" = Σ góc nhìn max nhà P(góc nhìn,
  đáp án = nhà) (`bayes-p.cjs`). Qua bậc tính chính xác: q = P(≥ 4/6) Poisson–binomial
  từ xác suất từng bài, qua = 1 − (1 − q)².

## Tên trong code ↔ design §9

| Code | Design |
|---|---|
| `S1@j`, `S1:P1`, `S1:N1`, `S1:N2` | S1 dùng đúng một thẻ (theo vị trí đọc / thẻ "có" / thẻ "không có" thứ nhất, thứ hai) |
| `S2` … `S11` | S2 … S11 |
| `S13-@j`, `S13-P1`, `S13-N1`, `S13-N2`, `S13-rand` | S13 quên một thẻ (theo vị trí / theo loại / ngẫu nhiên) |
| `A∩B` | S14 mẹo ghép; `S2∩S9` = S15 |
| `<bộ lọc>\|<thống kê>.<min\|max>`, `<bộ lọc>\|uni` (`fam.cjs`) | S16 "lọc rồi xếp hạng"; `P\|sumF.min` = mẹo Codex vòng 7 |
| `P`, `ANY`, `notP`, `asP:q`, `asP:r`, `asP:qr`, `P∩asP:q` … | có món thẻ "có"; có ≥ 1 món-thẻ; không có món thẻ "có"; đọc thẻ "không có" thứ nhất / thứ hai / cả hai như "có" … |
| `N:q`, `N:r`, `S13:dropR`, `S13:dropQ` | bộ lọc có phủ định: chỉ thẻ "không có" thứ nhất / thứ hai; S13 bỏ thẻ thứ hai / thứ nhất |
| `sumF`, `minF`, `maxF`, `f2Sum`, `nUniq`, `nRare`, `degSum`, `degMin`, `degMax`, `hdeg`, `pairMax`, `pairSum`, `fillMean`, `fillMin`, `fillMax`, `fillDegMean`, `fillSum` | 17 thống kê S16 (design §9) |
| `REWRITE`, `taut.json` | viết lại lời giải |
| `B-codex`, `B-freq`, `B-cooc`, `B-pairmin`, `B-pos1..3`, `B-R1`, `B-R1R2`, `B-rule` | thư viện mù dấu (i)–(v); `roleOK` = R11 |
| `orbit`, `strict`, `famOK` | quỹ đạo đáp án; chặt (R12); đạt họ |
| `CAT`, `CAT5`, `9x2`, `8x3`, `9x3a`, `9x3b` | `CLUE_STRUCTURES` (R5) / phương án P1-X′ (R5′); 9 × 3 khuôn (3, 1, 0) / (2, 1, 1) |
| `E0`–`E3` | "đúng c món-thẻ" của thiết kế cũ; với dạng 1 có + 2 không chỉ c = 1 (= S8) trúng được đáp án |
| `(a,c,d)`, `SYM` | khuôn đối xứng dấu |
| U, D, M, M1, MD | các bộ sinh cũ (chỉ ở `legacy/` và dòng T-Lai / P2 của `sym-table.cjs`) |
