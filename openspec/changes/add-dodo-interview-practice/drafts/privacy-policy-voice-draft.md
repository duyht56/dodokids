# DRAFT — Cập nhật Chính sách bảo mật cho dữ liệu giọng nói ("Luyện phỏng vấn cùng Đô Đô")

> **LƯU Ý ÁP DỤNG — ĐỌC TRƯỚC KHI DÙNG**
>
> Draft này **CHƯA được áp dụng** vào `landing/src/app/privacy/page.tsx`. Chính sách
> hiện hành ("Không ghi âm") đang **đúng sự thật** cho tới khi tính năng Luyện phỏng
> vấn ship. Chỉ merge nội dung dưới đây vào trang privacy **cùng đợt release** chứa
> tính năng (build có quyền mic): publish trang privacy mới **trước hoặc đúng lúc**
> submit build lên Google Play / App Store — không sớm hơn (policy sẽ sai sự thật),
> không muộn hơn (store đối chiếu policy URL với manifest/Info.plist khi review).
>
> Văn phong: giọng "Kido" trung tính nói với phụ huynh, khớp trang privacy hiện có
> ("ba mẹ", "con" = con của ba mẹ, "chúng tôi"). Đây KHÔNG phải lời thoại Đô Đô nên
> không áp quy tắc xưng hô persona (`docs/KIDO_DODO_PERSONA.md` §3). Quy ước trong
> draft: chữ **đậm** = bọc `<Term>` khi chuyển sang JSX.

---

## 1. Văn bản thay thế cho mục "3. Thông tin chúng tôi thu thập"

Thay toàn bộ Section §3 hiện tại bằng nội dung sau (giữ nguyên 6 bullet cũ, **thêm 1
bullet mới** về giọng nói ngay sau bullet "Dữ liệu học tập", và thêm 1 đoạn giải
thích cuối mục):

> ### 3. Thông tin chúng tôi thu thập
>
> Để dịch vụ hoạt động, Dodokids xử lý các nhóm dữ liệu sau:
>
> - **Hồ sơ của con:** tên gọi/biệt danh, độ tuổi (4–6) và hình đại diện chọn sẵn do ba mẹ thiết lập.
> - **Dữ liệu học tập:** bài học và hoạt động đã hoàn thành, kết quả, sao, XP, chuỗi ngày học, thành tích, báo cáo tuần và nhiệm vụ ngoại tuyến.
> - **Dữ liệu giọng nói (chỉ trong tính năng Luyện phỏng vấn cùng Đô Đô):** bản ghi câu trả lời của con, chỉ được thu khi ba mẹ đã bật tính năng cho con và con chủ động nhấn nút ghi âm cho từng câu (push-to-talk), tối đa 60 giây mỗi câu. Bản ghi được gửi qua kết nối mã hoá tới máy chủ Dodokids, sau đó chuyển tới **Google Vertex AI** — bên xử lý dữ liệu thay mặt chúng tôi, theo cấu hình **không lưu trữ (zero-retention) và không dùng để huấn luyện mô hình** — để nhận xét câu trả lời. **File ghi âm bị xoá ngay sau khi việc nhận xét hoàn tất**; chúng tôi chỉ lưu lại kết quả nhận xét và bản tóm tắt nội dung câu trả lời (transcript), không lưu giọng nói của con.
> - **Dữ liệu định danh thiết bị (ẩn danh):** một mã thiết bị do ứng dụng tạo cùng một khoá bí mật ngẫu nhiên lưu an toàn trên máy. Máy chủ chỉ lưu **bản băm (hash)** của khoá này, không phải giá trị gốc.
> - **Bảo vệ tài khoản gia đình:** mã PIN của ba mẹ và mã khôi phục — đều được lưu dưới dạng băm.
> - **Dữ liệu thanh toán:** loại gói đăng ký, mã giao dịch (purchase token) và trạng thái/hạn hiệu lực. Việc thanh toán do Google Play / App Store xử lý; Dodokids **không nhìn thấy** số thẻ hay thông tin thanh toán của ba mẹ.
> - **Nhật ký kỹ thuật tối thiểu:** địa chỉ IP, thời điểm và loại thiết bị khi ứng dụng gọi tới máy chủ, phục vụ vận hành, chống lạm dụng và bảo mật.
>
> Riêng với dữ liệu giọng nói: yêu cầu gửi tới bên xử lý AI **không kèm tên, mã
> thiết bị hay bất kỳ định danh cá nhân nào của con**, và tính năng chỉ hoạt động
> sau khi ba mẹ đồng ý (xem mục "Đồng ý của ba mẹ cho dữ liệu giọng nói").

## 2. Văn bản thay thế cho mục "4. Thông tin chúng tôi KHÔNG thu thập"

Thay toàn bộ Section §4 hiện tại (bỏ câu "Không ghi âm…") bằng:

> ### 4. Thông tin chúng tôi KHÔNG thu thập
>
> - Không dùng định danh quảng cáo (Advertising ID), IMEI, số MAC hay Android ID để nhận diện người dùng.
> - Không truy cập danh bạ, tin nhắn, cuộc gọi hay vị trí GPS chính xác.
> - Không quay phim và không truy cập camera của thiết bị.
> - **Không thu âm nền:** micro chỉ hoạt động trong tính năng Luyện phỏng vấn cùng Đô Đô, khi ba mẹ đã bật tính năng và con đang chủ động nhấn ghi âm cho từng câu. Ngoài cử chỉ đó, ứng dụng không nghe, không ghi và không tạo ra bất kỳ dữ liệu âm thanh nào — kể cả khi phiên phỏng vấn đang mở.
> - Không tích hợp SDK quảng cáo hay công cụ phân tích hành vi của bên thứ ba.

## 3. Mục MỚI: "Đồng ý của ba mẹ cho dữ liệu giọng nói"

Chèn thành section riêng **ngay sau §4** (các mục 5–11 hiện tại đánh số lại thành
6–12 — nhớ rà mọi tham chiếu chéo số mục):

> ### 5. Đồng ý của ba mẹ cho dữ liệu giọng nói
>
> Tính năng Luyện phỏng vấn cùng Đô Đô **luôn tắt mặc định** và bị ẩn/khoá cho tới
> khi ba mẹ chủ động bật:
>
> - Việc bật được thực hiện **cho từng bé**, trên màn hình đồng ý dành riêng cho ba mẹ, đặt **sau cổng xác thực phụ huynh (mã PIN)** — trẻ không thể tự bật.
> - Màn hình đồng ý nêu rõ: dữ liệu nào được thu (bản ghi câu trả lời), gửi tới đâu (máy chủ Dodokids, rồi Google Vertex AI với vai trò bên xử lý, không lưu trữ, không huấn luyện), và giữ trong bao lâu (file ghi âm xoá ngay sau khi nhận xét xong).
> - Ba mẹ có thể **thu hồi sự đồng ý bất kỳ lúc nào** trong phần cài đặt. Khi thu hồi, tính năng **khoá lại ngay lập tức** cho bé đó và máy chủ không tiếp nhận thêm bất kỳ bản ghi nào.
> - Kết quả nhận xét và transcript tóm tắt đã lưu thuộc dữ liệu học tập của con: ba mẹ có thể yêu cầu xoá theo mục "Quyền của ba mẹ & cách xoá dữ liệu".

## 4. Bổ sung khuyến nghị cho mục "6. Chia sẻ với bên thứ ba" (đánh số mới: 7)

Không bắt buộc theo task nhưng nên làm cùng lúc để mục chia sẻ nêu đích danh bên xử
lý AI (consent flow đã nêu đích danh, policy nên khớp). Thêm 1 bullet sau bullet
GCP:

> - **Google Vertex AI (Google Cloud):** chỉ để nhận xét câu trả lời trong tính năng Luyện phỏng vấn cùng Đô Đô, với vai trò **bên xử lý dữ liệu thay mặt chúng tôi**, theo cấu hình không lưu trữ (zero-retention) và không dùng dữ liệu của con để huấn luyện mô hình. Yêu cầu gửi đi không kèm định danh cá nhân hay định danh thiết bị của con.

## 5. Mapping khai báo Google Play Data safety

Play Console → App content → Data safety. Khai báo mới cho dữ liệu âm thanh:

| Câu hỏi trên form | Khai báo |
|---|---|
| Data type | **Audio → Voice or sound recordings** |
| Collected? | **Yes** (audio được upload lên máy chủ) |
| Processed ephemerally? | **Yes** — file audio xoá ngay sau khi chấm xong; chỉ giữ kết quả có cấu trúc |
| Required or optional? | **Optional** — chỉ khi ba mẹ opt-in cho từng bé; app dùng bình thường không cần |
| Purpose | **App functionality** (duy nhất; không analytics, không ads, không personalization ngoài tính năng) |
| Shared? | **No (not shared)** — QUYẾT ĐỊNH CHỐT: áp miễn trừ service provider. Căn cứ: dữ liệu chỉ chuyển cho **Google (Vertex AI) với vai trò bên xử lý thay mặt developer (data processor/service provider)**, và theo định nghĩa "data sharing" của Play, transfer tới service provider xử lý thay mặt developer thuộc diện **miễn khai "data sharing"**. Chọn "No" ở câu Shared trên form; privacy policy và màn consent vẫn nêu đích danh Vertex AI (draft này đã nêu ở §3/§5/§7; consent-flow-spec §5.2). Ghi lại căn cứ miễn trừ này khi điền form. `drafts/consent-flow-spec.md` §6 (mục Google Play — Families policy) phải khai đúng cùng phương án này (not shared + miễn trừ service provider), không khai "shared". |
| Data deletion? | **Yes** — audio tự xoá sau chấm (ephemeral); dữ liệu phái sinh (kết quả, transcript) xoá được qua flow xoá dữ liệu hiện có (`/data-deletion`) |

Ghi chú thêm:

- Dữ liệu phái sinh (kết quả chấm + transcript tóm tắt) cần rà xem đã nằm trong
  khai báo "App activity / App interactions" hiện có chưa; nếu chưa, bổ sung
  (gắn childId ẩn danh, không PII).
- Khai báo Data safety phải **khớp 100% với manifest**: thêm `RECORD_AUDIO` vào
  inventory quyền (checklist go-live §2.5).

## 6. Mapping khai báo Apple App Privacy (nutrition label)

App Store Connect → App Privacy:

| Mục | Khai báo |
|---|---|
| Data type | **Audio Data** (nhóm User Content) |
| Purpose | **App Functionality** |
| Linked to user's identity? | **Not linked** — request AI không kèm định danh; childId phía server là mã ẩn danh, không PII |
| Used for tracking? | **No** |

Ghi chú thêm:

- Theo định nghĩa "collect" của Apple, audio xoá ngay sau khi phục vụ request có
  thể thuộc diện ephemeral; tuy nhiên với app Kids Category, khai báo **Audio Data
  như trên** là phương án an toàn/nhất quán với Data safety phía Play — không tận
  dụng carve-out.
- `NSMicrophoneUsageDescription` phải mô tả đúng: mic chỉ dùng trong Luyện phỏng
  vấn, push-to-talk, ba mẹ bật mới hoạt động.
- Chuẩn bị App Review notes: consent flow sau parental gate, proxy 100% qua server,
  zero-retention, audio xoá sau chấm (giảm rủi ro 5.1.1(i)/5.1.2(i) theo design.md).

## 7. Checklist cập nhật ĐỒNG THỜI khi release

Tất cả các mục dưới đây phải xong trong cùng đợt release chứa tính năng:

- [ ] `landing/src/app/privacy/page.tsx`: thay §3, §4 theo draft; chèn mục consent
      mới sau §4; (khuyến nghị) thêm bullet Vertex AI vào mục chia sẻ; đánh số lại
      các mục sau; cập nhật ngày "Cập nhật lần cuối" ở đầu trang (`LegalPage`).
- [ ] `landing` — trang `/data-deletion`: bổ sung dữ liệu giọng nói phái sinh (kết
      quả chấm, transcript tóm tắt) vào phạm vi xoá; nêu rõ file audio không tồn
      tại để xoá vì đã tự xoá sau chấm.
- [ ] Google Play Console → App content → **Data safety**: thêm dòng Audio theo
      bảng §5; xác nhận khớp manifest `RECORD_AUDIO`.
- [ ] Google Play Console → App content → **AI-generated content declaration**
      (yêu cầu trong proposal).
- [ ] Google Play Console → Store listing: privacy policy URL giữ nguyên `/privacy`
      (chỉ đổi nội dung trang, không đổi URL).
- [ ] App Store Connect → **App Privacy**: thêm Audio Data theo bảng §6.
- [ ] App Store Connect → App Review notes: mô tả consent + Kids Category +
      zero-retention (kèm kịch bản kháng nghị).
- [ ] Mobile build đồng bộ: `expo-audio` config plugin (`microphonePermission`,
      `RECORD_AUDIO`) + `NSMicrophoneUsageDescription` — nội dung usage description
      khớp từng chữ với cam kết trong policy.
- [ ] Copy màn hình consent trong app khớp từng cam kết của policy (nêu đích danh
      Google Vertex AI, zero-retention, xoá audio sau chấm, thu hồi được).
- [ ] `docs/GOOGLE_PLAY_GOLIVE_CHECKLIST.md` (mục quyền/§2.5 inventory) và checklist
      go-live iOS: thêm mục quyền mic + Data safety/nutrition label.
- [ ] Doc sync trong cùng change: `docs/KIDO_ENGLISH_CURRICULUM.md` dòng 47 (điều
      kiện go/no-go) — theo proposal.
