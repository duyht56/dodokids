## ADDED Requirements

### Requirement: Persona và xưng hô của Đô Đô

Mọi lời thoại, copy UI và feedback template trong đó Đô Đô là người nói SHALL xưng "Đô Đô" và gọi trẻ là "bé". Các từ "con"/"cháu"/"bạn nhỏ" (ngôi gọi trẻ) và "cô"/"thầy"/"mình"/"tớ"/"tôi" (ngôi tự xưng) SHALL NOT xuất hiện trong lời thoại Đô Đô. Từ "con" dùng làm loại từ ("con mèo", "con số") không thuộc phạm vi cấm. Quy tắc này SHALL được ghi tại doc canonical `docs/KIDO_DODO_PERSONA.md`.

#### Scenario: Clip dẫn chuyện đúng ngôi

- **WHEN** một clip dẫn chuyện được soạn để Đô Đô mời trẻ trả lời lại
- **THEN** lời thoại có dạng "Đô Đô chưa nghe rõ, bé nói lại giúp Đô Đô nha", không dùng "con" hay "cô"

#### Scenario: Feedback template do máy chấm chọn

- **WHEN** worker chấm chọn một feedback template hiển thị/đọc cho trẻ
- **THEN** template đó tuân thủ cùng quy tắc xưng hô như clip soạn tay

### Requirement: Phiên phỏng vấn theo kịch bản với audio duyệt sẵn

Một phiên phỏng vấn SHALL gồm 10 câu hỏi lấy từ ngân hàng câu hỏi đã duyệt, theo một trong ba mode: Làm quen (thuần Việt), English basics, Tổng hợp phong cách CLC (Việt + Anh + logic). Mọi audio Đô Đô phát trong phiên (câu hỏi, dẫn chuyện, phản hồi) SHALL là clip pre-generate đã qua Human Gate theo lifecycle `draft → pending_review → approved → imported`. Hệ thống SHALL NOT tổng hợp giọng nói (TTS) tại runtime.

#### Scenario: Bắt đầu phiên với nội dung đã duyệt

- **WHEN** trẻ bắt đầu một phiên phỏng vấn ở bất kỳ mode nào
- **THEN** mọi clip phát ra đều tham chiếu asset đã ở trạng thái imported, không có lời thoại sinh động tại runtime

#### Scenario: Câu hỏi chưa qua Human Gate

- **WHEN** một câu hỏi mới được pipeline sinh nhưng chưa được duyệt approved
- **THEN** câu hỏi đó không xuất hiện trong bất kỳ phiên nào trên app

### Requirement: Ghi âm push-to-talk có kiểm soát

Micro SHALL chỉ thu khi trẻ chủ động bật ghi âm cho từng câu (push-to-talk) và SHALL tự dừng sau tối đa 60 giây mỗi câu. Ứng dụng SHALL NOT thu âm nền ngoài cử chỉ push-to-talk. Trẻ MAY nghe lại câu trả lời của mình trước khi sang câu tiếp theo.

#### Scenario: Thu âm một câu trả lời

- **WHEN** trẻ chạm nút mic, trả lời, rồi chạm dừng
- **THEN** chỉ khoảng thời gian giữa hai lần chạm được ghi, và bản ghi vượt 60 giây thì tự dừng tại 60 giây

#### Scenario: Ngoài cử chỉ push-to-talk

- **WHEN** phiên đang mở nhưng trẻ không chạm nút mic
- **THEN** micro không thu và không có dữ liệu âm thanh nào được tạo

### Requirement: Chấm async hào phóng theo nguyên tắc no-stress

Câu trả lời SHALL được chấm bất đồng bộ ở server (không chặn luồng phiên của trẻ) bằng rubric hào phóng: khi model không đủ tự tin về nội dung nghe được, kết quả SHALL là "chưa nghe rõ" chứ không phải "sai". Trẻ SHALL chỉ thấy phản hồi tích cực (sao, clip khen, lời mời thử lại); mọi đánh giá chi tiết theo câu SHALL chỉ hiển thị trong báo cáo dành cho phụ huynh. Kết quả chấm SHALL là JSON có cấu trúc gồm tối thiểu: nội dung nghe được, mức độ đúng chủ đề, mức độ đầy đủ, và feedback template được chọn.

#### Scenario: Trẻ trả lời đúng chủ đề

- **WHEN** trẻ trả lời rõ ràng, đúng chủ đề câu hỏi
- **THEN** báo cáo phụ huynh ghi nhận mức tích cực cho câu đó và trẻ nhận phản hồi khen

#### Scenario: Model không chắc chắn

- **WHEN** bản ghi nhiễu hoặc model không đủ tự tin về điều trẻ nói
- **THEN** kết quả câu đó là "chưa nghe rõ" kèm gợi ý luyện lại, không bao giờ hiển thị cho trẻ hay phụ huynh là "trả lời sai" do lỗi nghe

#### Scenario: Phản hồi cho trẻ khi kết thúc phiên

- **WHEN** phiên kết thúc trong khi việc chấm chưa xong
- **THEN** trẻ vẫn nhận màn kết thúc với sao và clip Đô Đô khen ngay lập tức, không phải chờ kết quả chấm

### Requirement: Consent phụ huynh và quyền riêng tư dữ liệu giọng nói

Tính năng SHALL bị ẩn/khóa cho tới khi phụ huynh hoàn tất opt-in cho từng trẻ qua màn hình consent đặt sau parental gate; consent SHALL nêu đích danh bên xử lý AI và chính sách lưu trữ. Phụ huynh MAY thu hồi consent bất kỳ lúc nào; khi thu hồi, tính năng SHALL bị khóa lại. File audio SHALL bị xóa ngay sau khi chấm xong; hệ thống chỉ lưu điểm, nhận xét và transcript tóm tắt. Mọi request AI SHALL đi qua kido-server; thiết bị SHALL NOT gọi trực tiếp nhà cung cấp AI và request AI SHALL NOT kèm định danh thiết bị hay định danh cá nhân của trẻ.

#### Scenario: Chưa có consent

- **WHEN** hộ gia đình chưa opt-in cho trẻ đang active
- **THEN** entry point phỏng vấn không cho vào phiên và không có quyền mic nào được yêu cầu

#### Scenario: Thu hồi consent

- **WHEN** phụ huynh tắt opt-in trong phần cài đặt
- **THEN** tính năng khóa lại ngay và không còn upload audio nào được chấp nhận cho trẻ đó

#### Scenario: Vòng đời file audio

- **WHEN** worker chấm xong một câu trả lời
- **THEN** file audio gốc bị xóa khỏi hệ thống lưu trữ, chỉ còn kết quả chấm có cấu trúc

### Requirement: Entitlement và giới hạn sử dụng

Phiên phỏng vấn SHALL yêu cầu subscription đang hiệu lực (SKU hiện có) hoặc lượt trải nghiệm miễn phí (1 phiên cho mỗi trẻ). Server SHALL từ chối tạo phiên vượt giới hạn 2 phiên/trẻ/ngày. Entry point SHALL nằm ngoài khu Khám phá.

#### Scenario: Hết lượt trải nghiệm và không có subscription

- **WHEN** trẻ đã dùng lượt trải nghiệm miễn phí và hộ không có subscription hiệu lực
- **THEN** yêu cầu tạo phiên bị từ chối và app dẫn tới paywall hiện có

#### Scenario: Vượt giới hạn ngày

- **WHEN** trẻ đã hoàn thành 2 phiên trong ngày
- **THEN** yêu cầu tạo phiên thứ ba bị server từ chối, app hiển thị lời hẹn của Đô Đô sang hôm sau

### Requirement: Cổng go/no-go trước khi triển khai

Tính năng SHALL NOT được triển khai ra người dùng khi POC Phase 0 chưa đạt ngưỡng: tối thiểu 85% câu trả lời rõ ràng trong bộ mẫu giọng trẻ thật được hiểu đúng nội dung, và không có trường hợp câu trả lời đúng bị chấm là sai (false negative gắt bằng 0 trên bộ mẫu). Nếu POC không đạt, phạm vi SHALL lùi về phương án không AI: ghi âm cho phụ huynh nghe lại kèm checklist chấm tay.

#### Scenario: POC đạt ngưỡng

- **WHEN** bộ mẫu ≥20 bản ghi giọng trẻ 5–6 tuổi đạt cả hai ngưỡng trên
- **THEN** các task triển khai Phase 1 được phép bắt đầu và quyết định tại `docs/KIDO_ENGLISH_CURRICULUM.md` được cập nhật trong cùng change

#### Scenario: POC không đạt

- **WHEN** bộ mẫu không đạt một trong hai ngưỡng
- **THEN** worker chấm AI bị loại khỏi phạm vi, phiên vẫn ghi âm nhưng kết quả là bản ghi + checklist cho phụ huynh tự chấm
