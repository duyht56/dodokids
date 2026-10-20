# Thiết kế: Ô thiếu không còn lộ đáp án

## 1. Bối cảnh và số đo trước

Ô thiếu (`missing_cell`) có 5 bậc: 2×2 hình (L1), 2×2 hình hoặc chấm (L2), 3×3
hình (L3), 3×3 chấm (L4), 3×3 cả hai (L5). L1–L2 có 3 lựa chọn, L3–L5 có 4.
Chơi theo bậc: vòng 6 bài, ≥ 4/6 đúng ngay lần đầu thì lên bậc, thêm tối đa 1
vòng (`update-explore-leveled-rounds`).

Bộ giải ngây thơ chọn đều trong các lựa chọn mà mẹo để lại (0 nếu mẹo loại mất
đáp án). Đo trên 5000 seed mỗi bậc với code cũ (`missing-cell-v1`):

| Mẹo | L1 | L2 | L3 | L4 | L5 |
|---|---|---|---|---|---|
| Đoán bừa | 0,333 | 0,333 | 0,25 | 0,25 | 0,25 |
| Không có trên bảng | **1** | **1** | **1** | **1** | **1** |
| Chung đặc điểm nhiều nhất | **1** | **1** | 0,567 | 0,561 | 0,566 |
| Giá trị hiện ít nhất trên bảng | **1** | **1** | **1** | **1** | **1** |
| Chỉ đọc hàng hoặc chỉ đọc cột | 0,5 | 0,5 | 0,5 | 0,5 | 0,5 |

Xác suất qua một bậc = 1 − (1 − q)², q = P(Bin(6, p) ≥ 4). Với p = 1 thì qua
100%: bé dùng mẹo đi hết L1→L5 trong 30 bài. Đọc một chiều (p = 0,5) qua 56,9%,
không phải "~34%" như bảng ở `update-explore-leveled-rounds/design.md` (con số đó
chỉ tính một vòng).

Nguyên nhân: generator dựng đủ ma trận, xoá 1 ô, lấy nhiễu từ ô còn trên bảng.
Trong ma trận Raven mỗi tổ hợp xuất hiện đúng một lần, nên ô bị xoá là tổ hợp
duy nhất bé chưa thấy, và giá trị hàng/cột của nó hiện ít hơn các giá trị khác.

## 2. Bảng 3×3: che cả một khối 2×2

Gọi ô "?" là (r, c). Chọn thêm một hàng r' ≠ r và một cột c' ≠ c theo seed.
Khối = {r, r'} × {c, c'}. Che cả ba góc còn lại của khối. Bốn lựa chọn đúng là
bốn ô của khối, xáo theo seed.

Phần hiện là hàng r'' và cột c'' còn lại (5 ô, hình chữ thập / chữ L / chữ T tuỳ
vị trí). Hàng r'' hiện đủ 3 ô: thuộc tính hàng giữ nguyên, thuộc tính cột đổi,
nên bé biết thuộc tính nào chạy theo hàng. Mỗi hàng và mỗi cột của khối còn đúng
một ô hiện (ở cột c'' và hàng r''), đó là "chìa khoá" của ô "?".

Vì sao đúng 4 ô che (không phải 3): đổi chỗ r ↔ r' hoặc c ↔ c' giữ nguyên phần
hiện (về tập hợp) và hoán vị bốn lựa chọn. Vậy mọi mẹo không nhìn vị trí (có
trên bảng không, chung đặc điểm, giá trị hiện bao nhiêu lần, giá trị có trên bảng
không) cho bốn lựa chọn cùng một điểm, tức đúng mức đoán bừa 1/4. Mô phỏng các
cách che 3 ô (scratch, vét cạn mọi vị trí):

| Cách che (3×3, 4 lựa chọn) | Không có trên bảng | Chung nhiều nhất | Hiện ít nhất | Một chiều | Mẹo khác |
|---|---|---|---|---|---|
| Hình chữ L 3 ô (ô "?", cùng hàng, cùng cột) + 1 nhiễu trên bảng | 0,333 | 0,25 | **1** | 0,5 | "lựa chọn không chung gì với lựa chọn trên bảng" = **1** |
| Chéo 3 ô (mỗi hàng, mỗi cột một ô) + 1 nhiễu cùng hàng | 0,333 | 0 | 0,25 | 0,75 | không trên bảng + một chiều = **1** |
| **Khối 2×2 (4 ô), lựa chọn = khối** | **0,25** | **0,25** | **0,25** | **0,5** | mọi mẹo ≤ 0,5 |

Điều kiện "mỗi hàng, mỗi cột còn ít nhất một ô hiện" tự đúng: khối chỉ chiếm 2
hàng × 2 cột.

## 3. Bảng 2×2: vì sao không che, và chọn gì

### 3.1. Che "2 ô chéo" làm bảng có hai cách đọc

Ô "?" ở (r, c), che thêm ô chéo (1−r, 1−c). Phần hiện chỉ còn hai ô (r, 1−c) và
(1−r, c), khác nhau ở cả hai thuộc tính. Không ô nào cho biết thuộc tính nào chạy
theo hàng. Ví dụ đã thấy trên máy ảo: hiện "tròn tím" (trên trái) và "tam giác
xanh dương" (dưới phải), ô "?" ở dưới trái. Đọc "hàng = màu" thì đáp án là tròn
xanh dương; đọc "hàng = hình" thì là tam giác tím. Ô chéo bị che chính là đáp án
của cách đọc ngược, và vì "nhiễu lấy từ ô bị che" nên nó luôn nằm trong lựa chọn.
Bé suy luận đúng vẫn có thể bị chấm sai. Validator mới bắt lỗi này (§4): bỏ qua
số ô che, kiểm riêng điều kiện "một cách đọc" thì 2000/2000 bảng che chéo đều bị
từ chối.

Che một ô cùng hàng (hoặc cùng cột) với ô "?" thì cả hàng (cột) đó bị che, không
đọc được giá trị hàng. Vậy bảng 2×2 không che được ô nào mà vẫn đọc được.

### 3.2. Bảng 2×2 không thể sạch mẹo hoàn toàn

Bảng 2×2 chỉ có 4 tổ hợp. Không che thì 3 tổ hợp đã hiện, nên mọi nhiễu lấy từ
từ vựng của bảng đều đang hiện trên bảng ("không có trên bảng" = 1). Muốn hạ mẹo
này thì phải có nhiễu mang giá trị không có trên bảng. Khi đó mẹo "chỉ chọn lựa
chọn làm từ giá trị có trên bảng" loại được nhiễu ấy, và ghép hai mẹo lại thì
đúng 1. Đây là giới hạn của bảng 2×2, không phải của cách sinh nhiễu: ở 3×3, nhờ
tính đối xứng ở §2, ghép mẹo cũng chỉ còn 1/4.

Thêm nữa, với 3 lựa chọn và 2 thuộc tính, muốn "chung đặc điểm nhiều nhất" không
trỏ vào đáp án thì đáp án phải nằm ở đầu chuỗi "chung đặc điểm" (A – M – Z). Khi
đó trục mà A không chung với M chỉ còn A khớp, nên đọc đúng trục ấy là đủ. Đọc
một chiều ở 2×2 vì thế luôn được 3/4 (đọc trúng trục quyết định: 1; trục kia: 1/2).

### 3.3. Cách sinh ở 2×2

Không che. Ba lựa chọn:

- đáp án A;
- M: ô trên bảng cùng hàng hoặc cùng cột với ô "?" (theo seed);
- Z: chung với M giá trị mà A không có, còn thuộc tính kia mang một giá trị không
  có trên bảng (màu khác, hình khác nhưng không để vuông cạnh thoi, số chấm
  khác 1–6). Z không chung giá trị nào với A.

Kết quả: "không có trên bảng" → {A, Z} = 1/2; "chung nhiều nhất" → M = 0; "giá
trị có trên bảng" → {A, M} = 1/2; "hiện ít nhất" → {A, Z} = 1/2.

Cách khác đã cân nhắc:

- Giữ bảng cũ, nhiễu {M, ô chéo}: "không có trên bảng" = 1 và "hiện ít nhất" = 1.
  Không đạt ngưỡng.
- Đổi 2×2 thành 3×3 hoặc thêm lựa chọn: đổi nội dung bậc, câu
  `missing_cell_intro_3` («Bây giờ bảng có ba hàng ba cột») sai. Không làm.

## 4. Validator độc lập

Chỉ từ phần đang hiện (không dùng `rowAttr`/`columnAttr` để "biết trước" cách
đọc):

1. Ô ẩn đúng là ô "?" cộng `coveredIndices` (đúng số ô của bậc, tăng dần, không
   trùng ô "?"), mọi ô khác hiện và đúng dạng.
2. `deriveAxes`: mỗi hàng, mỗi cột còn ít nhất một ô hiện; các ô cùng hàng chung
   giá trị thuộc tính hàng; giá trị theo hàng (theo cột) khác nhau.
3. **Một cách đọc**: đọc ngược (thuộc tính hàng chạy theo cột) mà phần hiện vẫn
   khớp thì không lựa chọn nào khác đáp án hoàn thành ô "?" theo cách đọc đó.
4. Ô ẩn nằm trong một khối 2 hàng × 2 cột (bảng 2×2 không che thì khối là cả
   bảng).
5. Mỗi lựa chọn hoàn thành một góc của khối, trừ đúng `offBoardOptions` lựa chọn
   mang một giá trị không có trên bảng; lựa chọn ngoài bảng không chung giá trị
   nào với đáp án.
6. Lựa chọn của mỗi ô ẩn đều có mặt.
7. Đúng một lựa chọn khớp cả hàng lẫn cột của ô "?", và là đáp án ghi nhận.
8. Câu đề, audio, asset cố định; replay theo seed giống từng byte.

Đã kiểm riêng ngoài contract (bản sao validator bỏ bước replay): các bảng sửa
tay (hiện ô bị che, bảng cũ một ô ẩn, nhiễu lấy từ bảng thay ô bị che, bảng 2×2
che chéo) đều bị chặn bởi các luật cấu trúc, không cần replay.

## 5. Renderer

- **Ô bị che**: nền trũng, viền xám, sọc chéo như cửa chớp, không bóng. Không vẽ
  khung vuông hay chấm bên trong: bản đầu có một khung vuông viền xám, trên bảng
  hình trông như "hình vuông xám". Ô che là `View`, không chạm được. Nhãn trợ năng
  «Ô đang che».
- **Ô "?"** giữ nguyên (teal, viền nét đứt). Câu đề «Chọn ô còn thiếu cho ô trống
  nhé.» vẫn đúng vì ô che có sọc, không trống.
- **Diễn lại lời giải** sau bài đúng (theo chuẩn §7.14 của Cân thăng bằng):
  - 0 ms: ô "?" điền đáp án (bật), dấu tích trên lựa chọn, Đô Đô reo, bong bóng
    đổi thành câu thần chú, Đô Đô nói `missing_cell_solve`.
  - 500 ms: hàng của ô "?" sáng (viền và nền hổ phách).
  - 1200 ms: thêm cột của ô "?".
  - 1900 ms: các ô bị che mở ra (bật), cả bảng hiện đủ.
  - `onAnswer(true)` khi câu đã nói xong và đã qua ít nhất 2600 ms, thêm 250 ms.
    Sau đó vỏ chơi vẫn khen «Đúng rồi!» và qua bài sau 650 ms.
  - Giảm chuyển động: các bước đổi màu giữ nguyên, bỏ hiệu ứng bật.
  - Bài sai: không đổi (rung nhẹ, `onAnswer(false)` ngay, làm mờ nhiễu theo mức
    hỗ trợ).
- Hẹn giờ dọn khi unmount, nên thoát giữa chừng không gọi `onAnswer(true)`.

## 6. Audio

Câu mới, chưa gen (batch audio kế tiếp, pack v8):

| Key | Câu | Khi nào |
|---|---|---|
| `explore-audio:vi:phrase:missing_cell_solve:v1` | Nhìn hàng, nhìn cột, ghép đủ hai điều. | Sau mỗi bài đúng, trong lúc bảng diễn lại |

Đã mirror sang `kido-pipeline/src/explore/exploreAudioInventory.ts` (contract
prompt-audio bắt buộc). Cần owner nghe duyệt như các câu khác.

Chưa làm, chỉ ghi lại: câu chốt theo từng bài kiểu «Hàng cần màu đỏ, cột cần
hình tròn: chọn hình tròn đỏ.» Câu này cần câu liền có tham số (4 màu × 4 hình +
6 số chấm × 4 màu, hai cách đọc), khoảng 80 clip. Đáng làm nếu playtest cho thấy
câu thần chú chung chưa đủ.

## 7. Số đo sau (5000 seed mỗi bậc, `missing-cell-v2`)

| Mẹo | L1 | L2 | L3 | L4 | L5 |
|---|---|---|---|---|---|
| Đoán bừa | 0,333 | 0,333 | 0,25 | 0,25 | 0,25 |
| Không có trên bảng (ngưỡng 1/2 · 1/3) | 0,5 | 0,5 | 0,25 | 0,25 | 0,25 |
| Chung đặc điểm nhiều nhất (ngưỡng đoán bừa + 0,1) | 0 | 0 | 0,25 | 0,25 | 0,25 |
| Chung đặc điểm ít nhất | 0,5 | 0,5 | 0,25 | 0,25 | 0,25 |
| Giá trị hiện ít nhất trên bảng | 0,5 | 0,5 | 0,25 | 0,25 | 0,25 |
| Chỉ giá trị có trên bảng | 0,5 | 0,5 | 0,25 | 0,25 | 0,25 |
| Không có trên bảng + chỉ giá trị có trên bảng | 1 | 1 | 0,25 | 0,25 | 0,25 |
| Chỉ đọc một chiều | 0,75 | 0,75 | 0,5 | 0,5 | 0,5 |
| Một chiều + không có trên bảng | 1 | 1 | 0,5 | 0,5 | 0,5 |

Xác suất qua bậc (luật §10): ở L3–L5 mọi mẹo không nhìn vị trí còn 7,4% (bằng
đoán bừa), đọc một chiều 56,9%. Ở L1–L2 mẹo đơn còn 56,9% (p = 0,5), "chung
nhiều nhất" 0%. Ghép hai mẹo hoặc đọc một chiều thì vẫn qua (97–100%), giới hạn
của bảng 2×2 (§3.2). L1–L2 là bậc làm quen; bậc 3 trở đi mới thật sự đòi đọc cả
hàng lẫn cột, và lời giải diễn lại ở mọi bậc dạy cách đọc ấy.

Contract `verify-explore-missing-cell-contracts.cjs` đo lại trên 2000 seed mỗi
bậc mỗi lần chạy và chặn ngưỡng.

## 8. Ngoài phạm vi

- **Seed lesson dính cùng mẹo**: 11 seed `math_matrix_3x3` (w26, w29, w33, w36,
  w38: "mỗi hàng và cột có đủ ba dáng cùng ba màu", 1 ô trống) và 15 seed
  `math_matrix_2x2_adv` trong `kido-pipeline/seeds/`. Đáp án luôn là lựa chọn duy
  nhất không có trên bảng. Cần sửa luật soạn seed (che thêm ô, nhiễu lấy từ ô bị
  che) ở `docs/KIDO_SEED_AUTHORING.md` và soạn lại các seed này, qua seed review
  và Human Gate. Việc riêng, không chặn change này.
- **Tiêu chí "Khi nào bé đã vững?"** (`masteryCriteria.ts`) cho Ô thiếu chưa có.
  Câu chữ cần owner duyệt nên không thêm ở đây. Gợi ý: bậc 3 «Bé tìm đúng ô dù
  vài ô bị che, nhìn ô cùng hàng và ô cùng cột để ghép đáp án.»
- **Playtest với trẻ** trước khi phát hành: bé có hiểu ô sọc là "đang che"
  không, nhịp diễn lại 2,6 giây có dài quá không.
