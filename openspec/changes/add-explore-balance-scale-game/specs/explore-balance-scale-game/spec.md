# Spec: explore-balance-scale-game

## Purpose

Định nghĩa "Cân thăng bằng" (`balance_scale`) — game Khám phá offline dạy suy
luận thay thế ("đổi") trên cân thăng bằng qua 6 bậc. Chi tiết: `design.md` của
change này.

## ADDED Requirements

### Requirement: Puzzle local deterministic đúng envelope hiện hành

Game SHALL sinh mọi bài local từ generator có version + random seed, không
request mạng, chỉ dependency bundled. Envelope SHALL đúng shape
`ExploreExerciseEnvelope` hiện hành; `params` SHALL chứa `level` và `mode`.
`params.options` CHỈ hợp lệ ở mode `choose`. Replay cùng (level, seed, runSlot)
SHALL byte-identical sau khi bỏ `variantKey`/`bucketKey`, và validator SHALL
reject envelope không replay được.

#### Scenario: Chơi trong airplane mode

- **WHEN** bé mở `balance_scale` không có mạng
- **THEN** bài mới được sinh, validate và hiển thị mà không có API request

#### Scenario: Mode dựng bị gắn options

- **WHEN** một envelope `predict` bị sửa để chứa `params.options`
- **THEN** validator reject

### Requirement: Bất biến số học từng mode

Validator SHALL tự suy lại đáp án bằng số học, độc lập với generator, theo mục
8 của `design.md`: `measure` đáp án k; `exchange`/`predict`/`choose` đáp án
m·k ≤ 10; `chain` đáp án k1·k2; `reverse` đáp án n/k; `heavier` đáp án là bên có
tổng trọng lượng lớn hơn và hai bên không bao giờ bằng nhau. Fact SHALL chỉ nối
hai món liền nhau trong cùng một thang nặng; `chain` SHALL dùng trọn một thang.

#### Scenario: Thẻ chép cân mẫu ở dạng phiếu

- **WHEN** generator sinh bài `choose` với m quả lê, cân mẫu 1 lê = k táo
- **THEN** options có đúng ba số khác nhau trong 1..10, gồm m·k và k

#### Scenario: Đổi ngược chia hết

- **WHEN** generator sinh bài `reverse`
- **THEN** số món nhỏ bên trái chia hết cho k và đáp án là thương

### Requirement: Cân sống ở bậc dạy, cân giữ ở bậc luyện

Ở `balance` và `measure`, cân SHALL nghiêng theo trọng lượng thật sau mỗi lần
thêm/bớt và game SHALL khoá đĩa, mừng ngay khi hai bên bằng nhau (không có lần
sai). Ở `exchange`, `predict`, `choose`, `chain`, `reverse`, cân SHALL đứng
ngang tới khi bé bấm Thả cân (hoặc chọn thẻ); khi đó cân SHALL nghiêng theo
trọng lượng thật, và lần lệch SHALL gọi `onAnswer(false)` rồi giữ nguyên đồ
trên đĩa để bé sửa.

#### Scenario: Thả cân khi còn thiếu

- **WHEN** bé thả cân với đĩa phải nhẹ hơn đĩa trái
- **THEN** đĩa phải bay lên, Đô Đô nói "Đĩa này còn nhẹ quá, bé thêm nữa nhé." và không có số nào được đọc

### Requirement: Chạm để đổi

Món to trên đĩa trái SHALL đổi được thành đúng k món nhỏ (theo cân mẫu) khi
được phép: bắt buộc ở `exchange` trước khi hiện rổ, luôn được ở `chain` (hai
lượt A→B→C), và chỉ từ trợ giúp mức 2 ở `predict`/`choose`. Đổi SHALL không
làm đổi trọng lượng của đĩa.

#### Scenario: Bậc đổi có hướng dẫn

- **WHEN** bé chạm quả lê thứ nhất ở bài `exchange` 2 quả lê, cân mẫu 1 lê = 2 táo
- **THEN** quả lê đó thành 2 quả táo trên đĩa trái, cân vẫn ngang, và rổ chỉ hiện sau khi quả lê thứ hai cũng được đổi

### Requirement: Trợ giúp không lộ đáp án

Trợ giúp mức 1 SHALL chỉ trỏ (cân mẫu nhịp sáng, đĩa trái nhịp sáng, vạch
ngang). Mức 2 MAY mở chạm-để-đổi hoặc bóng mờ nhóm. Trợ giúp SHALL không bao giờ
làm mờ thẻ; ở `choose` thẻ sai đã chọn tự khoá.

#### Scenario: Trợ giúp mức 2 ở dạng phiếu

- **WHEN** bé chọn sai hai lần ở bài `choose`
- **THEN** hai thẻ sai đã khoá, món to trên đĩa trái chạm được để đổi, và không thẻ nào bị làm mờ thêm

### Requirement: Lượt gồm nhiều vòng 6 bài, lên bậc khi làm tốt

Game SHALL khai `runPolicy` 6 slot không có `levelOffset`, vai trò slot trong
`generatorHint`; mode của slot SHALL chỉ đến từ bảng vai trò × bậc ở mục 5
`design.md`, nên mỗi vòng là 6 bài cùng một bậc. Hết một vòng, màn chơi SHALL
lên bậc kế tiếp nếu ít nhất 4 bài đúng ngay lần đầu, SHALL chơi một vòng mới
cùng bậc nếu chưa đạt (tối đa một vòng luyện thêm mỗi bậc; vòng luyện thêm vẫn
chưa đạt thì kết thúc lượt), và SHALL kết thúc lượt khi qua bậc 6. Vòng mới
SHALL khoá tới khi lời lên bậc nói xong. Một vòng SHALL
không có hai bài trùng nhau. Bậc và số bài đúng lần đầu SHALL chỉ nằm trong bộ
nhớ của màn chơi.

#### Scenario: Bé mới lên bậc

- **WHEN** phụ huynh chưa đặt bậc bắt đầu và bé làm đúng ngay lần đầu 5/6 bài của vòng bậc 1 (balance, heavier xen kẽ)
- **THEN** Đô Đô nói "Giỏi quá! Mình lên bậc mới nhé!" và câu giới thiệu bậc 2, rồi vòng 6 bài `measure` bắt đầu với "Bậc 2/6"

#### Scenario: Luyện thêm khi chưa vững

- **WHEN** bé chỉ đúng ngay lần đầu 3/6 bài của vòng bậc 4
- **THEN** Đô Đô nói "Mình luyện thêm bậc này nhé!" và một vòng bậc 4 mới bắt đầu với bài khác

#### Scenario: Kết thúc lượt

- **WHEN** bé đạt vòng bậc 6
- **THEN** màn "Mình luyện xong rồi!" hiện ra

#### Scenario: Không luyện mãi một bậc

- **WHEN** bé chưa đạt cả vòng bậc 4 lẫn vòng luyện thêm bậc 4
- **THEN** lượt kết thúc với "Mình luyện xong rồi! Bé muốn chơi lại không?"

#### Scenario: Không lặp bài trong vòng

- **WHEN** phụ huynh đặt bậc bắt đầu 6
- **THEN** sáu bài của vòng đều khác nhau

### Requirement: Không lưu lịch sử chơi

Mọi trạng thái chơi (đồ trên đĩa, lần sai, trợ giúp, bài đã ra) SHALL chỉ nằm
trong bộ nhớ của màn chơi và mất khi thoát, đúng `explore-stateless-privacy`.

#### Scenario: Thoát giữa lượt

- **WHEN** bé thoát giữa lượt rồi vào lại
- **THEN** lượt mới bắt đầu từ bậc phụ huynh đặt, không còn gì của lượt trước
