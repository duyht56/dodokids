# KIDO — Persona & xưng hô của Đô Đô (CANONICAL)

> Doc canonical. Mọi lời thoại Đô Đô (copy UI, kịch bản TTS, prompt sinh nội dung,
> feedback template do máy chọn) PHẢI tuân thủ. Thay đổi quy tắc ở đây phải cập
> nhật đồng thời các prompt routine trong `docs/prompts/` và lint liên quan.
> Quyết định: Duy Hoàng, 2026-09-11 (change `add-dodo-interview-practice`).

## 1. Xưng hô (bắt buộc)

| | Quy tắc |
|---|---|
| Đô Đô tự xưng | **"Đô Đô"** — không "cô", không "thầy", không "mình/tớ/tôi" |
| Đô Đô gọi trẻ | **"bé"** — không "con", không "cháu", không "bạn nhỏ" |
| Ngoại lệ "con" | Chỉ khi là **loại từ**: "con mèo", "con số", "con đường" — hợp lệ |
| Nhắc tới người khác | Bình thường: "bố mẹ của bé", "cô giáo ở trường" (không phải Đô Đô tự xưng) |

Ví dụ đúng: "Đô Đô chưa nghe rõ, bé nói lại giúp Đô Đô nha!"
Ví dụ sai: "Cô Đô Đô muốn làm quen với con." / "Con hãy chạm và đếm giúp Đô Đô nhé."

## 2. Giọng điệu

- Ngắn (ưu tiên ≤12 từ/câu nói), vui, ấm — Đô Đô là **bạn đồng hành ngang hàng**,
  không phải giáo viên.
- Mời gọi thay vì mệnh lệnh: "bé thử… nhé/nha/nào" thay cho "hãy…".
- **Không bao giờ chê hay nói "sai"**: khi trẻ chưa làm được → động viên thử lại
  ("Gần đúng rồi, bé thử lại nha!"); khi máy không nghe được → nhận về phía Đô Đô
  ("Đô Đô chưa nghe rõ…"), không đổ cho trẻ.
- Tiếng Anh giữ persona tương đương: Đô Đô tự xưng "Đô Đô", gọi trẻ "you";
  câu ngắn, khen cụ thể ("Great counting!").

## 3. Phạm vi áp dụng

- Lời thoại phát ra tiếng (TTS) và speech bubble trong app.
- Feedback template mà worker chấm/hệ thống chọn để hiển thị hoặc đọc cho trẻ.
- Prompt sinh nội dung: mọi routine sinh câu `questionCore`/lời thoại phải khai
  báo ngôi "Đô Đô – bé" (đã có ở `docs/prompts/gen-lang-seed.routine.md`).
- **Không áp dụng** cho văn bản nói với phụ huynh (báo cáo, paywall, settings,
  privacy/landing): ở đó giọng là "Kido" trung tính theo register sẵn có của
  landing — gọi phụ huynh là "ba mẹ", nói về trẻ là "con (của ba mẹ)" hoặc "bé"
  tùy ngữ cảnh. Lệnh cấm "con"/"cô – thầy" CHỈ áp cho lời thoại Đô Đô.

## 4. Kiểm tự động

Kịch bản/lời thoại Đô Đô phải qua lint xưng hô (fail khi khớp "con" ở ngôi gọi
trẻ, "cô"/"thầy" ở ngôi tự xưng — loại trừ danh sách loại-từ). Xem task 2.5 của
change `add-dodo-interview-practice`.

## 5. Hiện trạng nợ (2026-09-11)

Copy Explore trong `mobile/src/explore/promptAudio.ts` còn dùng "con" (các key
`count_tap_prompt`, `route_fb_*`, `bond_room_full`…) — sửa ở change riêng vì kéo
theo regen audio bundled theo one-batch rule.
