# PROJECT KIDO — BRD MÀN HÌNH KHÁM PHÁ

- **Trạng thái:** DRAFT — Product Definition
- **Phiên bản:** 0.4
- **Ngày cập nhật:** 2026-07-14
- **Đối tượng:** Trẻ 4–6 tuổi và phụ huynh
- **Phạm vi:** Mobile child app, runtime game hybrid local/server và cấu hình vận hành liên quan

> Tài liệu này định nghĩa yêu cầu nghiệp vụ cho màn hình **Khám phá**. Đây chưa
> phải tài liệu thiết kế kỹ thuật hoặc kế hoạch triển khai.

---

## 1. TÓM TẮT SẢN PHẨM

**Khám phá** là không gian luyện tập tự chọn, miễn phí 100%, nơi trẻ chơi các
hoạt động ngắn để củng cố kỹ năng nền tảng. Trẻ được tự do chọn trò, chơi lại
không giới hạn và thoát bất kỳ lúc nào.

Khám phá không phải curriculum thứ hai, không thay thế lesson hằng ngày và
không phải khu arcade. Mỗi trò chơi phải gắn với một năng lực rõ ràng, có độ khó
phù hợp và sinh bài chủ yếu bằng thuật toán từ dữ liệu cùng asset đã duyệt.

Mô hình tổng quát:

```text
Lesson chính
  = curriculum 48 tuần
  + lesson được biên soạn và Human Gate
  + đúng 8 activity mỗi ngày học

Khám phá
  = game engine
  + cấu hình độ khó
  + thuật toán sinh bài
  + primitive/asset/audio đã duyệt
  = nhiều lượt luyện tập không cần sản xuất lesson định kỳ
```

---

## 2. BỐI CẢNH VÀ VẤN ĐỀ

Luồng lesson hiện tại phù hợp cho chương trình học có cấu trúc nhưng chưa đáp
ứng đầy đủ các nhu cầu sau:

- Trẻ muốn tự chọn kỹ năng mình thích.
- Trẻ muốn luyện lại một kỹ năng mà không phải học lại cả lesson.
- Phụ huynh cần một khu vực miễn phí có giá trị giáo dục thực.
- Trẻ cần các phiên luyện ngắn 2–5 phút, không chịu áp lực phải hoàn thành bài.
- Một số interaction như tracing cần engine riêng, không phù hợp với lesson
  template hiện tại.
- Nếu mỗi lượt chơi đều phải qua quy trình biên soạn lesson, effort nội dung sẽ
  tăng nhanh và không bền vững.

---

## 3. QUYẾT ĐỊNH SẢN PHẨM ĐÃ CHỐT

1. Khám phá miễn phí 100%.
2. Không quảng cáo, không energy và không giới hạn số lượt chơi.
3. Không có XP, sao, sticker, badge, streak, leaderboard hoặc currency.
4. Không mở game dạy nhận diện mặt chữ, âm chữ, ghép vần hoặc đánh vần trong
   phạm vi hiện tại.
5. Cho phép tracing letter và tracing number trong **Xưởng luyện nét**, với mục
   tiêu vận động tinh và làm quen hình dạng, không đánh giá khả năng đọc.
6. MVP gồm khoảng 8 trò chơi có giá trị bổ trợ kỹ năng rõ ràng.
7. Không xây question bank hoặc lesson mới theo tuần cho Khám phá.
8. Không gọi LLM, image generation hoặc TTS không kiểm soát trong lúc trẻ chơi.
9. Ưu tiên deterministic generator, primitive và kho asset đã approved.
10. Chơi Khám phá không làm thay đổi tiến độ, XP hoặc streak của lesson chính.
11. Không lưu bất kỳ lịch sử chơi nào của Khám phá ở thiết bị, server, analytics,
    cache hoặc báo cáo; mỗi lần vào game đều bắt đầu lại từ đầu.
12. Game có thể sinh/validate 100% từ dependency có sẵn trên thiết bị phải chơi
    được offline. Game còn phụ thuộc server dùng API stateless và không gửi kết quả chơi.

---

## 4. MỤC TIÊU

### 4.1. Mục tiêu sản phẩm

- Cho trẻ chủ động chọn hoạt động muốn luyện.
- Cung cấp trải nghiệm miễn phí có giá trị giáo dục lâu dài.
- Tăng khả năng luyện lặp lại mà không tăng tuyến tính effort sản xuất nội dung.
- Tận dụng primitive, object sprite, number card và audio library hiện có.
- Giữ trải nghiệm riêng tư, không tracking hành vi hoặc tạo hồ sơ năng lực từ Khám phá.
- Tạo một không gian nhẹ nhàng, audio-first, visual-first và không gây áp lực.

### 4.2. Mục tiêu học tập

- Phát triển vận động tinh và phối hợp tay–mắt.
- Củng cố nhận diện số, số lượng và thứ tự số.
- Củng cố đếm, so sánh, tách gộp, cộng và trừ trực quan.
- Phát triển khả năng nhận biết quy luật.
- Luyện trí nhớ làm việc và chú ý.

### 4.3. Không phải mục tiêu

- Không tạo curriculum song song với chương trình 48 tuần.
- Không đánh dấu lesson hoàn thành thay cho luồng học chính.
- Không dạy đọc, ghép vần hoặc đánh vần.
- Không tối ưu thời gian giữ trẻ trong ứng dụng bằng reward loop.
- Không so sánh trẻ với trẻ khác.
- Không tạo phép tính trừu tượng vượt mức sẵn sàng của trẻ.
- Không sinh nội dung hoặc hình ảnh tự do tại runtime.

---

## 5. ĐỐI TƯỢNG SỬ DỤNG

### 5.1. Trẻ 4–5 tuổi

- Thao tác chạm, kéo và tracing đơn giản.
- Nét cơ bản, hình, chữ/số có trợ giúp trực quan.
- Số và số lượng chủ yếu trong phạm vi 5–10.
- Mỗi phiên khoảng 2–3 phút.
- Hướng dẫn chủ yếu bằng audio và animation.

### 5.2. Trẻ 5–6 tuổi

- Tracing chữ hoa, chữ thường và số với ít trợ giúp hơn.
- Số trong phạm vi 10–20; phạm vi 50 là nhánh nâng cao.
- Cộng trừ trực quan, đếm tăng và tách gộp.
- Trò chơi cần ghi nhớ hoặc suy luận 2–3 bước.
- Mỗi phiên khoảng 3–5 phút.

Tuổi chỉ là mức khởi đầu. Hệ thống không được khóa cứng nội dung chỉ dựa trên
tuổi; trẻ hoặc phụ huynh có thể chọn mức khác nhưng hệ thống không tự thay đổi
theo lịch sử luyện tập.

---

## 6. TRẢI NGHIỆM TỔNG THỂ

### 6.1. Luồng chính

```text
Mở Khám phá
  → xem 8 trò chơi
  → chọn trò
  → nghe hướng dẫn ngắn
  → thực hiện 5–8 lượt tương tác, hoặc đi tiếp đến cuối nhóm với game dạng
    ordered-track như Xưởng luyện nét
  → nhận feedback/hint mang tính hướng dẫn
  → kết thúc tự nhiên
  → Chơi lại từ đầu hoặc Chọn trò khác
```

### 6.2. Nguyên tắc trải nghiệm

- Trẻ được chọn tự do, không phải mở khóa game theo thứ tự.
- Có thể thoát bất kỳ lúc nào mà không bị mất quyền lợi.
- Thoát game sẽ hủy toàn bộ trạng thái lượt hiện tại; lần vào sau bắt đầu từ đầu.
- Game ordered-track có thể đánh dấu item đã luyện trong lần đang mở route, nhưng
  mọi dấu này phải bị xóa khi thoát và không được dùng làm lịch sử hay mở khóa.
- Không có trạng thái “Thua”.
- Không dùng countdown trong MVP.
- Sau khi trẻ chưa làm đúng nhiều lần, hệ thống tăng trợ giúp hoặc giảm độ phức
  tạp thay vì tiếp tục báo sai.
- Không hiển thị điểm, phần thưởng hoặc màn nhận vật phẩm.
- Sau một khoảng chơi liên tục phù hợp, hệ thống có thể đề nghị trẻ nghỉ hoặc
  vận động; lời nhắc không mang tính phạt.

### 6.3. Feedback không phải phần thưởng

Trẻ vẫn cần phản hồi để hiểu thao tác:

- Audio xác nhận nhẹ khi hoàn thành đúng.
- Animation giải thích việc thêm, bớt, tách hoặc gộp.
- Hint chỉ rõ bước tiếp theo khi trẻ gặp khó khăn.
- Lời kết trung tính như “Mình luyện xong rồi” hoặc “Con muốn chơi lại không?”.

Không hiển thị XP, sao, sticker, badge, streak, currency hoặc bảng thành tích.

---

## 7. DANH MỤC 8 TRÒ CHƠI

> **Cập nhật (2026-08) — thay slot hiển thị của Xưởng luyện nét.** Vì bộ nét chữ
> tiếng Việt chưa đủ ổn định về thị giác, **Xưởng luyện nét (`tracing_workshop`)
> được GIỮ LẠI nhưng ẨN khỏi catalog trẻ** (`catalogVisible: false`) — engine,
> path pack, route, renderer và test vẫn còn nguyên để bật lại sau khi sửa. Slot
> hiển thị được thay bằng **Dẫn đường cho Đô Đô (`route_planner`)**: game lập kế
> hoạch không gian trên lưới, trẻ ghép chuỗi mũi tên (tối đa 8 lệnh) rồi cho Đô
> Đô chạy để hoàn thành mục tiêu theo thứ tự và về nhà. Mỗi bảng sinh cục bộ từ
> seed và được validator độc lập chứng minh giải được trong 8 lệnh; 5 cấp L1–L5
> (L5 lặp lại đến khi thoát). **Chơi offline hoàn toàn** (generator + validator +
> config + visual đều bundled; audio tùy chọn, KHÔNG bắt buộc). Hiển thị hiệu lực
> = bundled AND server (fail-closed) để metadata server cũ không vô tình lộ lại
> Tracing. Chi tiết: openspec `explore-route-planner-game`, `explore-catalog`,
> `explore-session-runtime`.

### 7.1. Game 1 — Xưởng luyện nét (giữ lại, ẩn khỏi catalog)

**Mục tiêu:** vận động tinh, điều khiển nét và phối hợp tay–mắt.

#### Nội dung

- Nét ngang, dọc, xiên, cong, móc, vòng và ziczac.
- Đường đi và mê cung đơn giản.
- Hình tròn, vuông, tam giác, sao và hình cơ bản khác.
- Tracing number `0–9`.
- Tracing letter hoa và thường.

#### Bộ chữ

- Bộ Latin dùng chung: `A–Z`, `a–z`.
- Bổ sung glyph tiếng Việt đặc thù: `Ă, Â, Đ, Ê, Ô, Ơ, Ư` và chữ thường tương
  ứng.
- Với chữ có dấu, ưu tiên hoàn thành thân chữ trước rồi mới thêm dấu.

#### Ranh giới sư phạm

Tracing letter chỉ rèn vận động và làm quen hình dạng. Game không yêu cầu trẻ:

- Nghe âm rồi chọn chữ.
- Gọi tên hoặc nhận diện chữ.
- Nối chữ với âm đầu.
- Ghép vần hoặc đánh vần.
- Chứng minh đã biết đọc chữ.

#### Cách sinh bài

Mỗi nét, hình, chữ hoặc số là một vector path có thứ tự nét, điểm bắt đầu,
hướng đi và vùng sai lệch cho phép. Engine thay đổi mức trợ giúp thay vì tạo
asset mới.

#### Cách chọn và chuyển bài

- Xưởng hiển thị toàn bộ vector path đã được duyệt, chia theo nhóm nét cơ bản,
  đường đi, hình, số, chữ hoa, chữ thường và glyph tiếng Việt.
- Trẻ được chọn trực tiếp bất kỳ item nào làm điểm bắt đầu.
- Hoàn thành một item sẽ tự chuyển sang item kế tiếp theo thứ tự canonical trong
  cùng nhóm; không giới hạn cứng ở 5–8 item.
- Nhóm kết thúc tự nhiên ở item cuối. Trẻ có thể luyện lại nhóm hoặc quay về chọn
  item khác.
- Dấu đã luyện chỉ tồn tại trong lần đang mở Xưởng và không được lưu sang lần sau.

#### Độ khó

Nội dung muốn luyện và mức hỗ trợ là hai trục độc lập. Mọi item đã được bật đều
có thể chọn trực tiếp; L1–L5 điều khiển hành lang, cue và evaluator:

- L1: hành lang rộng nhất, nhiều điểm hướng dẫn và có hút nét.
- L2: hỗ trợ cao nhưng giảm nhẹ vùng hút và điểm hướng dẫn.
- L3: hỗ trợ trung bình.
- L4: ít điểm hướng dẫn và vùng sai lệch hẹp hơn.
- L5: ít hỗ trợ nhất, vùng sai lệch và snap chặt nhất.

#### Effort nội dung

Tạo một lần 97 glyph/path gồm nét, đường đi, hình, chữ và số. Không cần sản xuất
lesson định kỳ.

### 7.2. Game 2 — Khám phá số

**Mục tiêu:** nhận diện số, thứ tự số và quan hệ trước–sau.

#### Mode

- Nghe tên số rồi chọn thẻ.
- Tìm số giống mẫu.
- Chọn số đứng trước hoặc sau.
- Điền số còn thiếu.
- Sắp xếp 3–5 thẻ số.

#### Sinh bài

Engine chọn phạm vi, chọn số mục tiêu, sinh distractor gần số mục tiêu rồi xáo
trộn vị trí đáp án. Distractor phải đo đúng khả năng phân biệt số; không chọn số
quá xa hoặc vô nghĩa.

#### Độ khó

- L1: 1–5.
- L2: 1–10.
- L3: 1–20.
- L4: trước–sau, số thiếu và sắp xếp trong 20.
- L5: 1–50 và dãy nhiều số.

#### Asset

Number card SVG/primitive; không cần ảnh mới.

### 7.3. Game 3 — Chạm và đếm

**Mục tiêu:** tương ứng một–một giữa vật và số đếm.

#### Cách chơi

- Chọn một object đã approved từ asset library.
- Sinh số lượng mục tiêu.
- Clone object và xếp bằng seeded, non-overlapping layout.
- Trẻ chạm từng vật rồi chọn thẻ số tương ứng.

#### Độ khó

- L1: 1–5 vật xếp hàng.
- L2: 1–10 vật rải nhẹ.
- L3: 6–15 vật rải rác.
- L4: 10–20 vật chia nhóm.
- L5: hai loại vật nhưng chỉ đếm loại được yêu cầu.

#### Asset rule

Chỉ chọn asset có tag phù hợp để đếm, là một vật đơn lẻ, rõ ràng và không có
background gây nhầm. Một sprite được clone nhiều lần; không tạo ảnh theo đề.

### 7.4. Game 4 — Bên nào nhiều hơn?

**Mục tiêu:** so sánh số lượng và phát triển number sense.

#### Mode

- Chọn bên nhiều hơn.
- Chọn bên ít hơn.
- Nhận biết hai bên bằng nhau.

Hai bên phải dùng cùng một object sprite, chỉ khác số lượng. Layout không được
trở thành clue ngoài ý muốn.

#### Độ khó

- L1: phạm vi 5, chênh lệch ít nhất 2.
- L2: phạm vi 10, có chênh lệch 1.
- L3: phạm vi 20.
- L4: thêm trường hợp bằng nhau.
- L5: bố trí hai nhóm khác nhau nhưng vẫn nhìn và đếm rõ.

#### Effort nội dung

Sinh từ hai số và một approved sprite; không cần question bank.

### 7.5. Game 5 — Ngôi nhà tách gộp

**Mục tiêu:** hiểu số 5 và số 10 được tạo bởi hai phần và khi gộp hai phần thì
vẫn giữ nguyên số ban đầu.

#### Cấu trúc một lượt chơi

Một lượt `Ngôi nhà tách gộp` có **đúng 10 tương tác** theo progression cố định,
không phụ thuộc kết quả chơi và không lưu lịch sử:

- Tương tác 1–5: chỉ tách–gộp **số 5**.
- Tương tác 6–10: chỉ tách–gộp **số 10**.

Trong mỗi tương tác, hệ thống đặt sẵn một phần dương ở ô `Có sẵn`; ô `Bé thêm`
bắt đầu từ 0 và toàn bộ ô là vùng bấm. Mỗi lần chạm trực tiếp vào ô sẽ thêm một
vật và tăng số đếm. Bên dưới chỉ có một nút `Kiểm tra`; không có nút thêm, bớt
hoặc làm lại riêng. Giao diện không hiển thị phần bù hay số vật còn lại.

Luồng hoàn thành của một tương tác tách trực tiếp là:

```text
nhìn số cần tách và phần có sẵn → tự thêm/bớt → kiểm tra
→ “N gồm A và B” → gộp hai phần → đọc giải thích → tiếp tục
```

Phần hệ thống đặt sẵn bị khóa. Nếu kiểm tra thiếu, trẻ tiếp tục chạm để đếm; nếu
kiểm tra thừa, ô của bé trở về 0 để đếm lại còn phần có sẵn không đổi. Phản hồi
không được tiết lộ số đúng. Khi kiểm tra đúng, quan hệ tách–gộp phải đứng yên
cho tới khi trẻ bấm `Gộp lại`; màn giải thích sau khi gộp tiếp tục đứng yên cho
tới khi trẻ chủ động bấm `Tiếp tục`.

Ví dụ:

```text
      5
    /   \
   2     3
```

#### Mode

- Hoàn thành phần còn lại để tạo số 5.
- Hoàn thành phần còn lại để tạo số 10.
- Gộp hai phần để trở lại số ban đầu.

#### Sinh bài

Tổng do slot cố định là 5 hoặc 10. Mỗi slot khai báo một phần có sẵn lớn hơn 0
và nhỏ hơn tổng; phần trẻ cần thêm được tính độc lập bằng `tổng - phần có sẵn`.

#### Độ khó

- Block 1: năm tương tác với tổng cố định là 5.
- Block 2: năm tương tác với tổng cố định là 10.

#### Asset

Một object sprite được clone; hai ô trực quan có nhãn `Có sẵn` và `Bé thêm`.

### 7.6. Game 6 — Máy cộng trừ

**Mục tiêu:** cộng trừ trực quan bằng thêm/bớt, đếm tăng và tách gộp.

#### Mode

1. Thêm vật rồi đếm tổng.
2. Bớt vật rồi đếm phần còn lại.
3. Đếm tăng từ số lớn hơn.
4. Tách để tạo 10.
5. Phép tính hai hoặc ba toán hạng.

#### Ràng buộc sinh bài

- Không sinh kết quả âm.
- Không vượt phạm vi đang luyện.
- Ba toán hạng chỉ xuất hiện sau khi trẻ ổn định với hai toán hạng.
- Cộng trừ phạm vi 20 cần visual scaffolding.
- Phạm vi 50 là nhánh nâng cao và phải dùng nhóm chục–đơn vị, number line hoặc
  biểu diễn trực quan tương đương.
- Không mặc định đưa phép tính trừu tượng phạm vi 50 cho trẻ 4 tuổi.

#### Độ khó

| Cấp | Phạm vi | Phương pháp |
|---|---:|---|
| L1 | 5 | Thêm/bớt vật |
| L2 | 10 | Thêm/bớt và đếm tất cả |
| L3 | 10 | Đếm tăng |
| L4 | 20 | Tách gộp và tạo 10 |
| L5 | 20 | Hai hoặc ba toán hạng |
| Advanced | 50 | Chục–đơn vị và number line |

#### Effort nội dung

Phép tính được sinh từ constraint và công thức; không liệt kê thủ công từng đề.

### 7.7. Game 7 — Tìm quy luật

**Mục tiêu:** nhận biết và hoàn thành pattern.

#### Pattern hỗ trợ

- AB.
- AAB.
- ABB.
- ABC.
- Tăng hoặc giảm số lượng.
- Dãy số bước 1 hoặc bước 2.

#### Sinh bài

Engine chọn grammar, chọn token khác nhau, lặp pattern, ẩn một vị trí hợp lệ và
tính đáp án từ chính grammar. Validator phải kiểm tra chuỗi sau khi sinh.

#### Guardrail

- Một bài chỉ kiểm tra số thuộc tính phù hợp với cấp độ.
- Đáp án phải suy ra duy nhất.
- Không dùng background, vị trí hoặc kích thước như clue ngoài ý muốn.
- Ưu tiên shape, color, number card và dot primitive.

### 7.8. Game 8 — Lật thẻ tìm cặp

**Mục tiêu:** trí nhớ làm việc và chú ý.

#### Sinh bài

Chọn số cặp theo level, lấy các asset khác nhau từ approved pool, nhân đôi và
xáo trộn bằng random seed.

#### Độ khó

- L1: 2 cặp.
- L2: 3 cặp.
- L3: 4 cặp.
- L4: 6 cặp.
- L5: 8 cặp.

Không giới hạn thời gian. Độ khó đến từ số lượng thẻ và độ tương đồng có kiểm
soát giữa asset, không đến từ áp lực tốc độ.

#### Asset rule

- Asset phải dễ nhận diện và có hình đơn lẻ.
- Cấp thấp không dùng các variant quá giống nhau của cùng một object.
- Không dùng asset có background hoặc chi tiết gây nhầm lẫn.

---

## 8. MÔ HÌNH SINH BÀI VÀ QUẢN TRỊ NỘI DUNG

### 8.1. Nguyên tắc

```text
GameConfig
  + Skill level
  + Approved asset pool
  + Random seed
        ↓
Deterministic generator
        ↓
Exercise instance
        ↓
Deterministic validator
        ↓
Playable exercise
```

- Không xây question bank cho từng tuần.
- Không tạo image riêng cho từng exercise.
- Không gọi LLM hoặc image generation tại runtime.
- Đáp án phải được tính bằng rule xác định.
- Một exercise phải tái tạo được từ `generatorVersion + randomSeed`.
- Asset chỉ được chọn từ pool đã approved và có tag phù hợp.
- Mỗi generator phải có validator độc lập.

### 8.2. Phân loại effort nội dung

| Game | Cách sinh | Asset mới ban đầu | Nội dung định kỳ |
|---|---|---:|---:|
| Xưởng luyện nét (ẩn khỏi catalog) | Vector path + config | Pack vector | Không |
| Dẫn đường cho Đô Đô | Grid generator + solver độc lập | Thumbnail | Không |
| Khám phá số | Công thức số | Không | Không |
| Chạm và đếm | Count + layout | Không | Không |
| Bên nào nhiều hơn | Hai số + clone sprite | Không | Không |
| Ngôi nhà tách gộp | Partition algorithm | Không | Không |
| Máy cộng trừ | Arithmetic constraints | Không | Không |
| Tìm quy luật | Pattern grammar | Không | Không |
| Lật thẻ tìm cặp | Sample asset + shuffle | Không | Không |

### 8.3. Human review

Khám phá không dùng AI để sinh từng exercise. Việc kiểm duyệt tập trung ở cấp:

- Mục tiêu và construct của game.
- Generator rule và difficulty config.
- Validator.
- Vector path.
- Asset pool và tag.
- Audio template.
- Bộ representative test cases và boundary cases.

Không yêu cầu đội content duyệt thủ công từng tổ hợp ngẫu nhiên nếu tổ hợp được
sinh hoàn toàn từ rule đã duyệt và đã qua validator.

### 8.4. Tiêu chí chi phí nội dung

1. Không game nào cần tạo question bank hằng tuần.
2. Không game nào cần sinh ảnh riêng cho từng lượt chơi.
3. Một game mới chỉ cần game config, generator, validator, asset/vector pool và
   audio template.
4. Mỗi game phải chứng minh sinh được ít nhất 200 exercise hợp lệ mà không thêm
   nội dung thủ công.
5. Asset mới phải có khả năng tái sử dụng cho nhiều game, không tạo riêng chỉ để
   phục vụ một exercise.

---

## 9. AUDIO

Khám phá tiếp tục tuân theo audio-first. Audio dùng template có tham số:

```text
“Con hãy chọn số {number}.”
“Bên nào có nhiều {objectName} hơn?”
“Có tất cả bao nhiêu {objectName}?”
“Con hãy tìm hai thẻ giống nhau.”
```

Nguồn tham số:

- Số 0–50.
- `viLabel` hoặc label đã duyệt của asset.
- Thư viện câu hướng dẫn cố định.

Audio có thể được render trước hoặc sinh một lần rồi cache theo khóa ổn định như
`templateId + params + voiceVersion`. Không gọi TTS không kiểm soát mỗi lần trẻ
chơi và không yêu cầu đội content tạo audio cho từng lesson.

---

## 10. ĐỘ KHÓ VÀ CẤU HÌNH KHỞI ĐẦU

- Tuổi và cấu hình tĩnh do phụ huynh chọn xác định level khởi đầu.
- Trong lượt chơi hiện tại, khi trẻ cần nhiều hint, game có thể tăng visual
  support hoặc giảm độ phức tạp tạm thời.
- Mọi điều chỉnh tạm thời bị hủy khi thoát; lần vào sau quay về level khởi đầu.
- Không có trạng thái kỹ năng, adaptive evidence hoặc đề xuất dựa trên nhiều phiên.
- Trẻ hoặc phụ huynh có thể chọn mức dễ hơn.
- Không ghi thời gian trả lời, hint hoặc outcome để dùng ở lần chơi sau.

---

## 11. YÊU CẦU CHỨC NĂNG

### 11.1. Trẻ

- Truy cập Khám phá từ navigation chính.
- Truy cập toàn bộ game mà không cần subscription trả phí.
- Xem và nghe tên từng game.
- Chọn game tự do; mỗi lần chọn luôn bắt đầu một lượt mới.
- Chơi lại không giới hạn.
- Nhận audio instruction, feedback và hint.
- Thoát bất kỳ lúc nào.
- Không nhìn thấy XP, sticker, badge, streak hoặc leaderboard.

### 11.2. Phụ huynh

- Có thể chọn cấu hình khởi đầu tĩnh như level dễ hơn hoặc mức hỗ trợ.
- Có thể bật lời nhắc nghỉ trung tính dựa trên timer của lượt hiện tại.
- Không xem lịch sử game, kỹ năng, phạm vi, thời lượng, hint hoặc outcome vì
  Khám phá không lưu dữ liệu chơi.
- Không có giới hạn thời lượng tích lũy theo ngày/tuần vì cơ chế đó cần lịch sử.

### 11.3. Vận hành

- Bật/tắt một game, level hoặc asset pool bằng cấu hình.
- Version generator và validator.
- Tái hiện exercise bằng seed trong automated test/canary không gắn với lượt chơi của trẻ.
- Loại asset khỏi pool mà không cần phát hành lại toàn bộ nội dung.
- Theo dõi tỷ lệ lỗi generator/validator.

---

## 12. YÊU CẦU DỮ LIỆU MỨC NGHIỆP VỤ

- Không lưu hoặc truyền game đã chọn, exercise, answer, outcome, tries, hint,
  duration, completion, exit, seed, level đạt được hoặc tracing data của trẻ.
- Trạng thái lượt hiện tại chỉ tồn tại trong memory và bị hủy khi exit/unmount.
- Được lưu dữ liệu dùng chung không gắn với hành vi trẻ: game config/version,
  feature flag, approved asset/vector/audio manifest và parent-authored static config.
- Server game chỉ cấp exercise theo request stateless; không tạo session/attempt ID
  và không nhận kết quả chơi.

---

## 13. CHỈ SỐ THÀNH CÔNG

### 13.1. Product và learning metrics

Không thu thập product metric hoặc learning signal từ hành vi chơi Khám phá.
Đánh giá trước phát hành dùng usability test có quy trình riêng và không đưa vào
runtime production.

### 13.3. Cost metrics

- Số giờ content operation cần cho mỗi game/tháng.
- Tỷ lệ exercise được sinh mà không cần can thiệp thủ công.
- Tỷ lệ reuse asset.
- Số asset/audio mới phát sinh trên mỗi game.
- Tỷ lệ exercise bị validator từ chối.

### 13.4. Guardrail verification

- Automated property/boundary tests của generator và validator.
- Screenshot/device tests cho layout, vùng chạm và accessibility.
- Non-user-specific service health cho endpoint stateless.
- Không ghi duration, exit, tap hoặc seed của lượt chơi production.

---

## 14. PHẠM VI PHÁT HÀNH ĐỀ XUẤT

### Phase A — Engine đơn giản, reuse cao

1. Khám phá số.
2. Chạm và đếm.
3. Bên nào nhiều hơn.
4. Lật thẻ tìm cặp.

### Phase B — Toán sâu hơn

5. Ngôi nhà tách gộp.
6. Máy cộng trừ.
7. Tìm quy luật.

### Phase C — Interaction mới

8. Xưởng luyện nét, gồm nét, hình, tracing number và tracing letter.

Phase C đứng sau về thứ tự kỹ thuật vì cần renderer và cách đánh giá đường đi
mới, dù effort sản xuất nội dung định kỳ thấp.

---

## 15. ACCEPTANCE CRITERIA CẤP SẢN PHẨM

Khám phá MVP được xem là đạt khi:

1. Trẻ có thể truy cập mà không cần subscription trả phí.
2. Không có quảng cáo, energy, giới hạn lượt hoặc cơ chế mua lượt chơi.
3. Có đúng phạm vi game đã được duyệt cho phase phát hành.
4. Mỗi game gắn với skill/micro-skill và progression rõ ràng.
5. Không có trạng thái thua hoặc feedback gây xấu hổ.
6. Không tạo XP, sao, sticker, badge, streak hoặc currency.
7. Chơi Khám phá không đánh dấu lesson hoàn thành và không thay đổi lesson
   progress.
8. Mỗi exercise được sinh từ deterministic rule và tái hiện được bằng seed.
9. Mỗi generator có validator và boundary test tương ứng.
10. Asset chỉ lấy từ approved pool hoặc deterministic primitive/vector pack.
11. Không gọi LLM, image generation hoặc TTS không cache tại runtime.
12. Mỗi game chứng minh sinh được ít nhất 200 exercise hợp lệ mà không cần
    question bank thủ công.
13. Không có lịch sử, resume, “Chơi tiếp”, Explore report hoặc behavior analytics.
14. Thoát và vào lại luôn bắt đầu từ đầu.
15. Game có đủ local dependency chơi được offline; game cần server dùng API stateless.
16. Tracing letter không được diễn giải như năng lực đọc chữ.

---

## 16. RỦI RO VÀ BIỆN PHÁP KIỂM SOÁT

| Rủi ro | Biện pháp |
|---|---|
| Random tạo bài sai hoặc vô nghĩa | Constraint rõ, seeded generator và validator độc lập |
| Asset không phù hợp để clone/đếm | Approved asset pool và tag eligibility |
| Layout làm trẻ đếm sót | Non-overlapping layout, giới hạn density và visual test |
| Pattern có nhiều đáp án | Grammar xác định và validator kiểm tra tính duy nhất |
| Tracing chấm quá khắt khe | Tolerance theo tuổi/level, partial guidance và không reset toàn bộ |
| Tracing letter bị hiểu thành dạy đọc | Ranh giới sư phạm và wording rõ ràng; không có reporting |
| Phạm vi 50 quá khó | Chỉ mở ở advanced với visual scaffolding |
| Audio template nghe rời rạc | Render/cache theo câu hoàn chỉnh và version giọng đọc |
| Khám phá cạnh tranh với lesson chính | Không reward, không thay đổi lesson progress, session ngắn |
| Content operation tăng dần | Không question bank, đo cost metric và reuse asset bắt buộc |

---

## 17. CÁC NGUYÊN TẮC KHÔNG ĐƯỢC PHÁ VỠ

1. **Learning construct trước giao diện:** mỗi game phải đo/luyện đúng năng lực
   đã khai báo.
2. **Deterministic-first:** bài có đáp án chính xác phải được sinh và kiểm tra
   bằng rule, không giao cho mô hình tạo sinh.
3. **Reuse-first:** dùng primitive và approved asset trước khi đề xuất asset mới.
4. **No-stress:** không có thua, mất thưởng hoặc ngôn ngữ tiêu cực.
5. **No reward economy:** feedback hướng dẫn được phép; phần thưởng và currency
   không thuộc phạm vi.
6. **Free means free:** không khóa game bằng subscription, quảng cáo hoặc lượt.
7. **Low content operations:** đầu tư vào engine, config và validator thay vì
   sản xuất lesson lặp lại.
8. **No history:** không lưu, gửi, phân tích hoặc báo cáo bất kỳ hành vi chơi
   Khám phá nào; mỗi lần vào game bắt đầu lại.
9. **Offline by capability:** chỉ gắn offline khi toàn bộ generator, validator,
   asset/vector và audio dependency đã có trên thiết bị.

---

## 18. TÀI LIỆU LIÊN QUAN

- `docs/AI_CONTEXT.md`
- `docs/KIDO_MATH_CURRICULUM.md`
- `docs/KIDO_MATH_SKILL_CATALOG_V2.md`
- `docs/KIDO_LANG_SKILL_CATALOG.md`
- `docs/KIDO_VISUAL_ASSET_SYSTEM.md`
- `docs/kido-activity-schema.ts`
- `docs/KIDO_EXPLORE_THUMBNAIL_PROMPTS.md`
