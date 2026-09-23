# Rubric chấm v1 — Luyện phỏng vấn cùng Đô Đô

> Draft cho task 0.8 của change `add-dodo-interview-practice`. Trạng thái: **draft**,
> chờ họp go/no-go (task 0.9) chốt.
> Liên quan: `proposal.md`, `design.md`, `specs/dodo-interview-practice/spec.md`,
> `docs/KIDO_DODO_PERSONA.md` (persona canonical).
>
> Tham số cố định toàn change: **10 câu/phiên**, 3 mode (`lam_quen` thuần Việt /
> `english_basics` / `tong_hop_clc`), tối đa **60 giây/câu trả lời**, cap **2 phiên/bé/ngày**,
> **1 phiên trải nghiệm miễn phí/bé**. File audio câu trả lời **xóa ngay sau khi chấm xong**.

## 1. Nguyên tắc no-stress và LUẬT HÀO PHÓNG

Máy chấm tồn tại để giúp bé **tự tin hơn**, không phải để phán xét. Mọi quyết định
rubric đi theo bốn nguyên tắc, xếp theo thứ tự ưu tiên:

1. **Không bao giờ nói "sai" với bé.** Bé chỉ thấy sao và lời khen; mọi đánh giá
   chi tiết chỉ nằm trong báo cáo phụ huynh (và ở đó cũng đóng khung tích cực,
   không dùng chữ "sai"/"kém"/"trượt").
2. **LUẬT HÀO PHÓNG (bắt buộc, là invariant của contract):** khi model không đủ
   tự tin về điều nghe được — `do_tin_cay = 'thap'` — thì `dung_chu_de` **BẮT BUỘC**
   là `'chua_ro'`, **không bao giờ** `'lac_de'`. Nói cách khác: `'lac_de'` chỉ hợp lệ
   khi `do_tin_cay = 'cao'`. Nghi ngờ thì nhận về phía máy ("Đô Đô chưa nghe rõ"),
   không quy lỗi cho bé.
3. **Lỗi nghe là lỗi của Đô Đô.** "Chưa nghe rõ" hiển thị như một sự cố kỹ thuật
   dễ thương, không phải một kết quả của bé — không tính vào thống kê, không kéo
   sao xuống.
4. **Chấm async, phiên của bé không chờ.** Màn kết thúc (sao + clip khen) hiển thị
   ngay khi phiên xong; kết quả chấm cập nhật vào báo cáo phụ huynh khi worker xong.

## 2. Contract JSON kết quả chấm (source of truth tầng doc)

Worker chấm (Vertex Gemini Flash, structured output) trả về cho **mỗi câu trả lời**
đúng một object theo contract sau. **File này là source of truth ở tầng doc**;
prompt runtime tại `kido-pipeline/src/scripts/interview-rubric.prompt.ts` **phải khớp
từng tên field và từng giá trị enum dưới đây** — sửa một trong hai bên thì phải sửa
bên kia trong cùng change.

```json
{
  "nghe_duoc_gi": "string",
  "do_tin_cay": "cao | thap",
  "dung_chu_de": "dung | chua_ro | lac_de",
  "do_day_du": 1,
  "tin_hieu_tu_tin": "string",
  "feedback_template": "string"
}
```

| Field | Kiểu / giá trị | Ý nghĩa |
|---|---|---|
| `nghe_duoc_gi` | string | Transcript tóm tắt điều model nghe được (tiếng Việt hoặc tiếng Anh theo câu hỏi). Đây là phần "transcript tóm tắt" được lưu lâu dài; audio gốc xóa ngay sau chấm. **Luật redaction PII (bắt buộc, ghi cả trong prompt runtime):** nếu nghe thấy số điện thoại, địa chỉ nhà, hay dãy số định danh, `nghe_duoc_gi` chỉ ghi nhận dạng tóm tắt ("bé nói sẽ đọc số điện thoại của bố mẹ"), **không bao giờ** chép lại dãy số/địa chỉ cụ thể — khớp design §6: chỉ lưu dữ liệu không PII. |
| `do_tin_cay` | `'cao'` \| `'thap'` | Model tự đánh giá độ tin cậy của việc nghe. `'thap'` = nhiễu, nói nhỏ, không chắc nội dung. |
| `dung_chu_de` | `'dung'` \| `'chua_ro'` \| `'lac_de'` | Câu trả lời có bám chủ đề câu hỏi không. **Ràng buộc bởi LUẬT HÀO PHÓNG:** `do_tin_cay='thap'` ⇒ bắt buộc `'chua_ro'`. |
| `do_day_du` | `1` \| `2` \| `3` | Mức đầy đủ: **1** = một từ/cụm rất ngắn; **2** = câu trọn vẹn, đủ ý chính; **3** = có mở rộng, thêm chi tiết. |
| `tin_hieu_tu_tin` | string | Mô tả tín hiệu tự tin khi nói. **Quy ước v1 để mapping máy đọc được:** chuỗi bắt đầu bằng token `tu_tin` hoặc `ngap_ngung`, theo sau là ` \| ` và mô tả tự do (ví dụ: `"tu_tin \| nói to, rõ, không ngắt quãng"`). Prompt.ts phải yêu cầu đúng quy ước prefix này. |
| `feedback_template` | string | **Id của một template trong pool đã duyệt** (đã qua Human Gate, có clip audio `imported`). Worker chỉ **chọn**, không bao giờ tự sinh lời thoại cho bé tại runtime — nhất quán với quyết định "không TTS runtime". Template phải tuân thủ persona `docs/KIDO_DODO_PERSONA.md`. |

Invariant kiểm tự động (server validate trước khi lưu; vi phạm ⇒ retry job, không lưu):

- `do_tin_cay = 'thap'` ⇒ `dung_chu_de = 'chua_ro'`.
- `feedback_template` phải tồn tại trong pool template đã `approved`/`imported`.
- `tin_hieu_tu_tin` phải đúng dạng `<token> | <mô tả>` — token là `tu_tin` hoặc
  `ngap_ngung`, có dấu ` | ` phân tách (cùng mức chặt với validate của POC).
- `nghe_duoc_gi` không chứa chuỗi ≥7 chữ số liên tiếp (dấu hiệu số điện thoại /
  dãy số định danh lọt qua luật redaction PII); vi phạm ⇒ retry job, không lưu.

## 3. Mapping sang 3 mức hiển thị cho PHỤ HUYNH

Báo cáo phụ huynh hiển thị mỗi câu ở đúng **một** trong ba mức dưới đây, hoặc trạng
thái "chưa nghe rõ" (không phải một mức). Ký hiệu: `tu_tin?` = prefix của
`tin_hieu_tu_tin` là `tu_tin`.

| Mức hiển thị | Điều kiện (theo contract §2) |
|---|---|
| **"Tự tin"** | `dung_chu_de = 'dung'` **và** `do_day_du >= 2` **và** `tu_tin?` |
| **"Tốt"** | `dung_chu_de = 'dung'` **và** (`do_day_du = 1` **hoặc** prefix là `ngap_ngung`) |
| **"Cùng bé luyện thêm"** | `dung_chu_de = 'lac_de'` (theo luật hào phóng, điều này chỉ xảy ra khi `do_tin_cay = 'cao'`) |
| *(không phải mức)* **"Đô Đô chưa nghe rõ câu này"** | `dung_chu_de = 'chua_ro'` |

Quy tắc bổ sung:

- `'chua_ro'` **không xếp vào mức nào**: hiển thị dòng trạng thái "Đô Đô chưa nghe
  rõ câu này" và **loại khỏi mọi thống kê** (tỉ lệ phiên, công thức sao §4, biểu đồ
  tiến bộ). Không bao giờ diễn giải "chưa nghe rõ" thành "trả lời sai".
- Ba mức đều là nhãn **tích cực**; không hiển thị điểm số thô, không hiển thị
  `do_tin_cay`/`do_day_du` dạng số cho phụ huynh.
- Mapping chạy ở server (task 3.6), là hàm thuần từ JSON §2 — không gọi model lần hai.

## 4. Quy tắc hiển thị cho BÉ + công thức sao

Bé **chỉ** thấy: **sao (1–3)** của cả phiên + **clip Đô Đô khen kết phiên**
(`clip_end_*`, chọn **tại client** theo tín hiệu hoàn thành — xem §5.2).
**Không bao giờ** hiển thị cho bé: điểm số, phần trăm, lỗi, transcript, nhãn mức
của từng câu, hay bất kỳ dấu hiệu "trả lời chưa đúng" nào. Giữa phiên, phản hồi
từng câu chỉ là clip khen/động viên từ pool đã duyệt, hoặc clip "Đô Đô chưa nghe rõ"
mời nói lại.

Công thức sao (tính ở server khi worker chấm xong đủ phiên). Màn kết thúc hiển thị
**ngay** với animation sao + clip `clip_end_*` do client chọn (khớp spec "màn kết
thúc hiển thị ngay, không chờ chấm"); số sao chốt theo công thức chỉ cập nhật
**con số** trên màn kết quả và báo cáo phụ huynh khi worker xong — **không** kèm
bất kỳ clip audio nào chọn theo mức sao:

```
S_dat  = số câu đạt mức "Tự tin" hoặc "Tốt"        (theo mapping §3)
S_tinh = số câu được tính = số câu có dung_chu_de ≠ 'chua_ro'

Nếu S_tinh = 0  (cả phiên đều "chưa nghe rõ") → 2 sao   (benefit of the doubt)
Ngược lại, r = S_dat / S_tinh:
  r ≥ 0.7        → 3 sao
  0.4 ≤ r < 0.7  → 2 sao
  r < 0.4        → 1 sao
```

- **Sàn 1 sao:** hoàn thành phiên luôn có ít nhất 1 sao — không tồn tại 0 sao.
- Câu `'chua_ro'` nằm ngoài cả tử số lẫn mẫu số: máy nghe kém không bao giờ kéo
  sao của bé xuống.
- Clip khen cuối phiên **không** chọn theo mức sao: v1 client chọn mức
  `tu_tin` / `tot` / `luyen_them` theo heuristic hoàn thành (số câu có trả lời,
  tổng độ dài bản ghi) để phát ngay — cùng một cơ chế ghi tại
  `interview-script-v1.md` §2. Pool mỗi mức ≥2 biến thể (v1 có đúng 2:
  `_1`/`_2`), chọn ngẫu nhiên để giảm lặp; mở rộng lên ≥3 biến thể/mức là việc
  của batch content sau.

## 5. Copy mẫu

### 5.1 Báo cáo phụ huynh (giọng "Kido" trung tính — KHÔNG dùng persona Đô Đô)

Mở đầu báo cáo:

> Bé đã hoàn thành phiên luyện phỏng vấn cùng Đô Đô (10 câu, mode Làm quen).
> Kido ghi nhận theo từng câu và đóng khung theo hướng tích cực, kèm gợi ý để
> anh chị cùng bé luyện thêm tại nhà.

Tóm tắt phiên (ví dụ):

> Phiên hôm nay: 6/9 câu đạt mức "Tự tin" hoặc "Tốt". Có 1 câu Đô Đô chưa nghe rõ
> — câu này không tính vào thống kê. So với phiên trước, bé nói trọn câu nhiều hơn.

Theo từng mức:

| Mức | Mô tả trong báo cáo | Gợi ý luyện tại nhà |
|---|---|---|
| **Tự tin** | "Bé trả lời đúng chủ đề, câu đủ ý và giọng nói tự tin." | "Anh chị khen cụ thể điều bé vừa kể, rồi mở rộng bằng câu hỏi 'Thế còn…?' để bé kể dài hơn." |
| **Tốt** | "Bé trả lời đúng chủ đề; câu còn ngắn hoặc bé còn hơi ngập ngừng." | "Trong sinh hoạt hằng ngày, anh chị hỏi lại câu tương tự và kiên nhẫn chờ bé nói trọn câu, tránh nhắc lời ngay." |
| **Cùng bé luyện thêm** | "Bé đã mạnh dạn trả lời, tuy nội dung chưa bám vào câu hỏi." | "Anh chị chơi trò hỏi–đáp: đặt câu hỏi tương tự, cùng bé tìm 1–2 từ khóa của câu hỏi trước khi bé trả lời." |
| **(Chưa nghe rõ)** | "Đô Đô chưa nghe rõ câu này." | "Câu này không tính vào kết quả. Lần sau anh chị có thể cho bé luyện ở nơi yên tĩnh và cầm máy gần bé hơn." |

Lưu ý copy: tuyệt đối không dùng "sai", "kém", "trượt", "yếu"; mức thấp nhất luôn
mở đầu bằng một ghi nhận tích cực ("Bé đã mạnh dạn trả lời…").

### 5.2 Màn kết quả bé (lời Đô Đô — đúng persona `docs/KIDO_DODO_PERSONA.md`)

Clip khen kết phiên: client chọn từ pool `clip_end_*` theo heuristic hoàn thành
(**không** theo mức sao — xem §4). Transcript canonical của pool nằm trong danh
mục clip `interview-script-v1.md` §2 (một nguồn sự thật, không chép lại ở đây);
v1 gồm 6 clip, mỗi mức 2 biến thể, mọi câu ≤12 từ, không mệnh lệnh, không "sai":

- Mức `tu_tin`: `clip_end_tu_tin_1`, `clip_end_tu_tin_2`
- Mức `tot`: `clip_end_tot_1`, `clip_end_tot_2`
- Mức `luyen_them` (vẫn thuần khen, không chê): `clip_end_luyen_them_1`,
  `clip_end_luyen_them_2`

Clip giữa phiên (pool template, worker chỉ chọn theo `feedback_template`):

- Khen sau một câu (`fb_tot_1`): "Bé trả lời hay lắm, Đô Đô vui ghê!"
- Máy không nghe được (`fb_chua_nghe_ro`): "Đô Đô chưa nghe rõ, bé nói lại giúp Đô Đô nha!"
- **v1 dùng feedback tiếng Việt cho MỌI mode**, kể cả `english_basics`: pool
  `fb_*` trong `interview-rubric.prompt.ts` toàn tiếng Việt và danh mục clip v1
  không có clip feedback tiếng Anh. Feedback tiếng Anh (id `fb_en_*` + clip +
  luật chọn theo `lang`) là phạm vi batch content sau, không thuộc v1.

Toàn bộ clip trên phải đi qua pipeline TTS + Human Gate đủ lifecycle
`draft → pending_review → approved → imported` trước khi xuất hiện trong phiên,
và phải qua lint xưng hô (task 2.5).

## 6. Gate POC (go/no-go) và cách đo

Tính năng **không được triển khai** khi POC Phase 0 chưa đạt **cả hai** ngưỡng trên
bộ mẫu ≥20 bản ghi giọng trẻ 5–6 tuổi thật (Việt + Anh, có nhiễu, có nói nhỏ, kèm
ground-truth nội dung — task 0.1):

1. **≥85% hiểu đúng trên câu rõ ràng.** Trên tập bản ghi được người gán nhãn đánh
   dấu "rõ ràng", tỉ lệ bản ghi mà `nghe_duoc_gi` khớp nội dung chính của
   ground-truth (người đối chiếu xác nhận đúng ý, không cần đúng từng từ) phải
   ≥85%.
2. **0 false-negative gắt.** Không có bất kỳ bản ghi nào mà ground-truth là câu trả
   lời đúng chủ đề nhưng máy chấm `dung_chu_de = 'lac_de'`. Rơi về `'chua_ro'`
   **không** tính là false-negative gắt (đó chính là đường thoát của luật hào
   phóng); `'lac_de'` trên câu đúng thì tính, và số lượng cho phép là **0**.

Cách đo (task 0.2–0.3):

- Script POC trong `kido-pipeline` chạy từng bản ghi qua prompt
  `interview-rubric.prompt.ts` → JSON contract §2; xuất bảng đối chiếu
  `bản ghi × (ground-truth, JSON trả về, đạt/không)`.
- **Kiểm invariant trước khi tính điểm:** bất kỳ row nào có `do_tin_cay='thap'`
  mà `dung_chu_de='lac_de'` là vi phạm contract → POC fail ngay tại đó (lỗi
  prompt, phải sửa trước khi đo lại).
- Chưa đạt ngưỡng → thử ≥2 variant model/prompt trước khi kết luận; kết luận cuối
  ghi vào change tại họp go/no-go (task 0.9).
- **NO-GO:** loại worker chấm AI khỏi phạm vi, lùi về phương án không AI (bản ghi
  cho phụ huynh nghe lại + checklist chấm tay), giữ nguyên UX phiên.
