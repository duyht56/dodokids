# Bảng bậc và bảng khuôn của P1 (bản trước Codex vòng 7, giữ để so sánh)

> Chép nguyên hai bảng của `design.md` bản 2026-10-21 trước khi đổi sang danh mục
> cấu trúc hoán đổi được (P1-X). `design-p1.cjs` đọc file này theo mặc định, nên
> `table.cjs`, `exact.cjs`, `validate-sym.cjs`, `boards.cjs` in lại đúng số đo P1
> cũ (cột "P1" ở design §10). Đừng sửa file này; thiết kế đang chọn ở `../design.md`.

## 5. Bậc (bảng T-Lai, khuôn đối xứng P1)

| Bậc | Tên | Dạng thẻ | Nhà × món | Hình trên màn | Thẻ | Đổi đúng một thứ | Khuôn (a, c, d) |
|---|---|---|---|---|---|---|---|
| 1 | Đèn soi | PNN, thẻ "có" luôn đứng đầu | 8 × 2 | 16 + 3 = 19 | ngửa | (khởi đầu) bài làm mẫu đầu lượt + câu thần chú; **đèn soi theo dấu** khi đọc từng thẻ | (2, 1, 0) |
| 2 | Tự soi | PNN, thẻ "có" luôn đứng đầu | 8 × 2 | 19 | ngửa | bỏ đèn soi | (2, 1, 0) |
| 3 | Đổi chỗ thẻ | PNN / NPN / NNP, rút độc lập đều mỗi bài | 8 × 2 | 19 | ngửa | thẻ "có" không còn đứng đầu | (2, 1, 0) |
| 4 | Nhà ba món | PNN / NPN / NNP, rút độc lập đều mỗi bài | 8 × 3 | 24 + 3 = 27 | ngửa | mỗi nhà 3 món | (2, 1, 0) |
| 5 | Nhiều nhà hơn | PNN / NPN / NNP, rút độc lập đều mỗi bài | 9 × 3 | 27 + 3 = 30 | ngửa | 9 nhà | (3, 1, 0) / (2, 1, 1), 50/50 |
| 6 | Nhớ thẻ | PNN / NPN / NNP, rút độc lập đều mỗi bài | 9 × 3 | 30 | úp sau khi đọc | thẻ úp, bé nhớ hoặc chạm lật để nghe lại | (3, 1, 0) / (2, 1, 1), 50/50 |

## 9. Sinh bài và validator

| Bậc | Khuôn (chữ ký theo vị trí thẻ) | (a, c, d) | Trọng số |
|---|---|---|---|
| 1–4 | `100,010,001,110,101,011,000,000` | (2, 1, 0) | 1 |
| 5–6 | `100,010,001,110,101,011,000,000,000` | (3, 1, 0) | 50% |
| 5–6 | `100,010,001,110,101,011,111,000,000` | (2, 1, 1) | 50% |

Bộ sinh P1: rút khuôn, xếp món đệm ngẫu nhiên, nhận khi R4–R6b đạt với cả ba vai
trò (`sym.cjs` `sampleSym`: ≤ 40 lần xếp, trượt thì rút lại khuôn, ≤ 10 lần).
