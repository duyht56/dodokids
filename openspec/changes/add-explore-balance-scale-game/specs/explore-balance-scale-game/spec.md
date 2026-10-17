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

### Requirement: Run authored 6 slot có levelOffset

Game SHALL khai `runPolicy` 6 slot với `levelOffset` [0, 0, 1, 2, 3, 4] và vai
trò slot trong `generatorHint`; mode của slot SHALL chỉ đến từ bảng vai trò ×
level ở mục 5 `design.md`. Bé bắt đầu bậc 1 SHALL gặp lần lượt balance,
heavier, measure, exchange, predict, choose. Một lượt SHALL không có hai bài
trùng nhau.

#### Scenario: Không lặp bài trong lượt

- **WHEN** phụ huynh đặt bậc bắt đầu 6 (bốn slot `chain`)
- **THEN** sáu bài của lượt đều khác nhau

#### Scenario: Lượt đầu của bé mới

- **WHEN** phụ huynh chưa đặt bậc bắt đầu và bé mở game
- **THEN** sáu bài theo thứ tự balance, heavier, measure, exchange, predict, choose

### Requirement: Không lưu lịch sử chơi

Mọi trạng thái chơi (đồ trên đĩa, lần sai, trợ giúp, bài đã ra) SHALL chỉ nằm
trong bộ nhớ của màn chơi và mất khi thoát, đúng `explore-stateless-privacy`.

#### Scenario: Thoát giữa lượt

- **WHEN** bé thoát giữa lượt rồi vào lại
- **THEN** lượt mới bắt đầu từ bậc phụ huynh đặt, không còn gì của lượt trước
