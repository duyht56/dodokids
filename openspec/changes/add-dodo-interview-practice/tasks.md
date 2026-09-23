## 0. Phase 0 — gate go/no-go (1 tuần, 3 track song song)

- [ ] 0.1 Thu ≥20 bản ghi giọng trẻ 5–6 tuổi thật trả lời câu phỏng vấn (Việt + Anh, có nhiễu/nói nhỏ), kèm ground-truth nội dung
- [x] 0.2 Script POC trong kido-pipeline: gửi audio + rubric prompt vào Vertex Gemini Flash → JSON `{nghe_duoc_gi, do_tin_cay, dung_chu_de, do_day_du, tin_hieu_tu_tin, feedback_template}`
- [ ] 0.3 Đo kết quả theo ngưỡng spec (≥85% hiểu đúng; 0 false-negative gắt); thử ≥2 model/prompt variant nếu chưa đạt
- [ ] 0.4 POC ghi âm `expo-audio` trên 1 máy Android yếu: format, sample rate, dung lượng/60s
- [x] 0.5 Draft privacy policy mới (`landing/src/app/privacy/page.tsx` §3–4): bỏ "Không ghi âm", thêm mục dữ liệu giọng nói, nêu đích danh Vertex AI, cam kết xóa audio sau chấm
- [x] 0.6 Spec consent flow: màn hình sau parental gate, opt-in theo bé, thu hồi trong cài đặt phụ huynh, lưu server-side
- [x] 0.7 Soạn kịch bản v1: 10 câu/phiên × 3 mode + ~35 clip dẫn/phản hồi, đúng persona "Đô Đô – bé"
- [x] 0.8 Chốt rubric hiển thị: bé thấy sao + clip khen; phụ huynh thấy 3 mức đóng khung tích cực ("Tự tin" / "Tốt" / "Cùng bé luyện thêm")
- [ ] 0.9 Họp go/no-go, ghi kết luận vào change; nếu NO-GO → chuyển tasks mục 4 sang phương án không AI (bản ghi + checklist phụ huynh)

## 1. Docs canonical (cùng change, trước khi implement)

- [x] 1.1 Tạo `docs/KIDO_DODO_PERSONA.md`: xưng "Đô Đô", gọi "bé", cấm "con"/"cô"/"thầy"; giọng điệu ngắn-vui-không chê; ví dụ đúng/sai
- [x] 1.2 Cập nhật `docs/KIDO_ENGLISH_CURRICULUM.md` dòng 47: quyết định mic/ASR được đảo có điều kiện, dẫn chiếu change này và ngưỡng go/no-go
- [x] 1.3 Cập nhật 2 checklist go-live (Google Play / Apple): mục quyền mic, Data safety, nutrition label, khai báo AI content

## 2. Nội dung + pipeline

- [ ] 2.1 Data model câu hỏi phỏng vấn (module riêng, không đụng `kido-activity-schema.ts`): `{id, mode, text_vi/text_en, audioUrl, expected_hints, max_answer_seconds}`
- [ ] 2.2 Nhập ngân hàng ~50–100 câu (3 mode) từ kịch bản 0.7 + nguồn 30 câu CLC; review nội dung như seed thường
- [ ] 2.3 Generate toàn bộ clip qua pipeline TTS (một batch, giọng Sulafat/Puck) → GCS bucket audio
- [ ] 2.4 Đưa batch qua Human Gate đủ lifecycle `draft → pending_review → approved`; publish sang kido-server → `imported`
- [ ] 2.5 Lint xưng hô tự động cho kịch bản: fail khi lời thoại Đô Đô chứa "con" (ngôi gọi) / "cô" / "thầy"

## 3. Server — module `interview`

- [ ] 3.1 Scaffold `kido-server/src/modules/interview/`: controller, service, DTO, schema Mongoose (session, answer, result)
- [ ] 3.2 Endpoint tạo phiên: guard consent + entitlement (subscription hoặc 1 lượt trải nghiệm/trẻ) + cap 2 phiên/trẻ/ngày
- [ ] 3.3 Endpoint upload câu trả lời (multipart, giới hạn dung lượng/định dạng) → storage tạm (bucket riêng)
- [ ] 3.4 Worker chấm BullMQ trên Redis sẵn có: gọi Vertex Gemini Flash (`@google/genai`), structured output theo rubric; retry + dead-letter
- [ ] 3.5 Xóa file audio ngay sau khi chấm xong; job dọn rác cho file mồ côi
- [ ] 3.6 Endpoint kết quả phiên (bé: sao + template id; phụ huynh: chi tiết theo câu) + lịch sử tiến bộ
- [ ] 3.7 Consent API: opt-in/thu hồi theo trẻ, chặn upload khi đã thu hồi
- [ ] 3.8 Config env `GCP_PROJECT`/`GCP_LOCATION`/`GEMINI_MODEL`; log token + cost mỗi phiên
- [ ] 3.9 Moderation flag đơn giản trên nội dung nghe được (danh mục cần phụ huynh lưu ý)

## 4. Mobile

- [ ] 4.1 Bật plugin `expo-audio` (`microphonePermission` string tiếng Việt, `recordAudioAndroid`) + `NSMicrophoneUsageDescription`; rebuild dev client 2 nền tảng
- [ ] 4.2 Màn consent phụ huynh (sau `ParentGateModal`), đồng bộ trạng thái consent với server; entry point ẩn khi chưa consent
- [ ] 4.3 InterviewScreen: mascot (`ExploreMascot` mood think/cheer) + speech bubble; phát clip câu hỏi qua `speech.ts`; prefetch qua `assetCache`
- [ ] 4.4 Push-to-talk: nút mic lớn chạm-nói/chạm-xong, đếm ngược 60s, nghe lại câu trả lời, quyền mic xin đúng lúc vào phiên đầu
- [ ] 4.5 Upload ngầm từng câu trong lúc bé làm câu tiếp; hàng đợi retry khi mạng yếu; phiên kết thúc không chờ upload
- [ ] 4.6 Màn kết thúc bé: sao + clip Đô Đô khen (không hiển thị điểm số/lỗi)
- [ ] 4.7 Màn báo cáo phụ huynh: chi tiết theo câu, 3 mức tích cực, tiến bộ qua các phiên, gợi ý luyện tại nhà
- [ ] 4.8 Paywall hook: hết lượt trải nghiệm → `PaywallScreen` hiện có; copy nêu tính năng phỏng vấn

## 5. Compliance & ship

- [ ] 5.1 Publish privacy policy mới trên landing; đối chiếu inventory quyền khớp manifest 100% (checklist §2.5)
- [ ] 5.2 Cập nhật Google Play Data safety + Families declaration + khai báo AI-generated content
- [ ] 5.3 Cập nhật Apple App Privacy nutrition label (Audio Data → App Functionality, not linked); rà `PrivacyInfo.xcprivacy`
- [ ] 5.4 Beta nội bộ 5–10 gia đình: đo tỉ lệ "chưa nghe rõ", thời lượng phiên, cost thực tế/phiên, quan sát cảm xúc bé
- [ ] 5.5 Staged rollout Android trước theo lộ trình go-live; chuẩn bị kịch bản kháng nghị Apple Kids Category

## 6. Verification

- [ ] 6.1 `cd mobile && npm run lint`
- [ ] 6.2 `cd kido-server && npm test && npm run build` (test mới: guard entitlement/cap/consent, vòng đời xóa audio, worker chấm với mock provider)
- [ ] 6.3 `cd kido-pipeline && npm test && npm run build` (test lint xưng hô 2.5)
- [ ] 6.4 E2E tay trên iPad + Android yếu: phiên đủ 10 câu, mất mạng giữa phiên, thu hồi consent giữa chừng
