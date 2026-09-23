## Why

Phụ huynh mục tiêu của Kido (con 4–6 tuổi) có một nỗi đau mùa tuyển sinh: các trường tiểu học CLC/tư thục (Ngôi Sao, Nguyễn Siêu, Vinschool, Đoàn Thị Điểm, Archimedes…) khảo sát đầu vào lớp 1 bằng phỏng vấn trực tiếp — 2 vòng Việt + Anh, mỗi vòng 5–7 phút, có trường tính 15/150 điểm. Trẻ trượt không phải vì thiếu kiến thức mà vì thiếu tự tin khi đối đáp với người lạ. Kido hiện không có tính năng nào luyện kỹ năng nói; `docs/KIDO_ENGLISH_CURRICULUM.md` từng chủ động loại mic/ASR khỏi MVP (dòng 47) vì "ASR chấm giọng trẻ Việt báo sai nhiều → vi phạm no-stress", và đẩy phần nói sang offline-task cho phụ huynh.

Tính năng "Luyện phỏng vấn cùng Đô Đô" giải quyết đúng nỗi đau đó theo cách **không vi phạm lý do đã loại ASR**: Đô Đô hỏi bằng audio duyệt sẵn, bé trả lời qua push-to-talk, máy chấm chạy **async ở hậu trường với rubric hào phóng** (không bao giờ nói "sai" với bé — chi tiết chỉ vào báo cáo phụ huynh). Đây là feature "bán gói" mạnh cho subscription hiện có, chi phí vận hành ~500–1.300đ/phiên.

Đề xuất này **đảo một quyết định sản phẩm cũ** (mic/ASR out-of-MVP) một cách có điều kiện: chỉ triển khai khi POC Phase 0 chứng minh Gemini hiểu giọng trẻ 5–6 tuổi đạt ngưỡng chấp nhận (xem `design.md` §Go/No-Go). `docs/KIDO_ENGLISH_CURRICULUM.md` phải được cập nhật trong cùng change này.

## What Changes

- **Phase 0 (gate, 1 tuần):** POC chấm audio giọng trẻ thật bằng Vertex Gemini Flash; viết lại privacy policy (landing đang cam kết "Không ghi âm" — mâu thuẫn trực tiếp); spec consent flow phụ huynh; soạn kịch bản phỏng vấn v1 + rubric. Kết thúc bằng quyết định go/no-go.
- **Nội dung + pipeline:** ngân hàng ~50–100 câu phỏng vấn (3 mode: Làm quen thuần Việt / English basics / Tổng hợp phong cách CLC) + ~35 clip dẫn chuyện/phản hồi của Đô Đô. Toàn bộ audio pre-generate qua pipeline TTS hiện có (giọng Sulafat/Puck), đi đủ lifecycle `draft → pending_review → approved → imported` qua Human Gate. **Không có TTS runtime.**
- **Mobile:** bật mic permission (`expo-audio` plugin, đã có sẵn API ghi âm); màn phỏng vấn với mascot Đô Đô (tái dùng `ExploreMascot`) + push-to-talk ≤60s/câu, 10 câu/phiên; upload ngầm từng câu; màn kết quả bé (sao + clip khen) và báo cáo phụ huynh theo câu. Entry point **ngoài Khám phá** (ràng buộc C-13: Khám phá free 100%).
- **Server:** module NestJS `interview` mới — tạo phiên, nhận upload audio, guard entitlement + cap 2 phiên/bé/ngày; worker chấm async (queue trên Redis sẵn có) gọi Vertex Gemini Flash với rubric → JSON có cấu trúc; **xóa file audio ngay sau khi chấm**; request/response thuần, không websocket.
- **Persona (quy tắc mới, canonical):** Đô Đô xưng **"Đô Đô"**, gọi trẻ là **"bé"**; cấm "con", cấm "cô/thầy" — áp dụng cho mọi kịch bản, copy UI và feedback template của change này, và ghi thành doc canonical mới `docs/KIDO_DODO_PERSONA.md` để toàn app theo (copy Explore hiện lệch chuẩn sẽ sửa ở change riêng).
- **Compliance:** consent màn hình riêng cho phụ huynh (sau parental gate, opt-in theo bé, thu hồi được); cập nhật privacy policy, Google Play Data safety, Apple App Privacy nutrition label; khai báo AI-generated content trên Play Console; mọi call AI đi qua kido-server, không device → provider trực tiếp.
- **Monetization:** nằm trong 2 SKU hiện có (139k/tháng, 999k/năm) + 1 phiên trải nghiệm miễn phí; không tạo SKU mới.

## Capabilities

### New Capabilities
- `dodo-interview-practice`: phiên luyện phỏng vấn có kịch bản với mascot Đô Đô — phát câu hỏi audio duyệt sẵn, ghi âm câu trả lời push-to-talk, chấm async hào phóng, báo cáo cho phụ huynh, gate bằng consent + entitlement, và quy tắc persona/xưng hô của Đô Đô.

### Modified Capabilities
- (không sửa spec capability hiện có; entitlement dùng lại cơ chế sẵn có, wire contract lesson/progress không đổi)

## Impact

- **Mobile (mới):** màn phỏng vấn, màn kết quả bé, màn báo cáo phụ huynh, consent screen; config plugin `expo-audio` (`microphonePermission`, `RECORD_AUDIO`) + rebuild; `NSMicrophoneUsageDescription`.
- **Server (mới):** `kido-server/src/modules/interview/` (controller, service, DTO, eval worker, queue); env mới `GCP_PROJECT`/`GEMINI_MODEL`; dependency `@google/genai`.
- **Pipeline:** batch content phỏng vấn (seed câu hỏi + TTS + review) theo lifecycle hiện có; không đổi bước pipeline nào.
- **Docs:** `docs/KIDO_DODO_PERSONA.md` (mới, canonical); `docs/KIDO_ENGLISH_CURRICULUM.md` (cập nhật quyết định dòng 47 kèm điều kiện go/no-go); 2 checklist go-live (mục quyền mic + Data safety/nutrition label); `landing/src/app/privacy/page.tsx` §3–4.
- **Không đụng:** `docs/kido-activity-schema.ts` (không thêm `actionType` — phỏng vấn là module riêng, không phải activity trong lesson); Khám phá; wire contract lesson/progress; SKU/IAP.
- **Rủi ro tồn dư:** duyệt Apple Kids Category với AI bên thứ ba là vùng xám (có tiền lệ reject 5.1.1(i)/5.1.2(i)) — giảm thiểu bằng consent + proxy qua server + zero-retention, chấp nhận khả năng phải kháng nghị; chất lượng hiểu giọng trẻ là gate Phase 0, có phương án lùi (phụ huynh tự nghe lại + checklist, không AI).
