## ADDED Requirements

### Requirement: Kiểm tra cấu trúc cấp tuần deterministic

`lint-seeds.ts` SHALL kiểm mỗi file seed như một đơn vị TUẦN, không chỉ lint từng seed rời. Kiểm tra MUST deterministic (không gọi LLM) và MUST chạy được offline.

Các kiểm tra cấp tuần:

| Mã | Kiểm | Mức |
|---|---|---|
| `WEEK_COUNT` | Đúng 8 seed cho mỗi (tuần, ngày, môn) | critical |
| `WEEK_INDEX` | `activityIndex` phủ đúng 1..8, không trùng, không hổng | critical |
| `WEEK_DIFFICULTY` | Phân bố `warmup×2, core×4, challenge×2` | critical |
| `WEEK_INDEX_ORDER` | `difficulty` không giảm khi `activityIndex` tăng | warning |
| `WEEK_ACTION_SPREAD` | ≥2 `actionType`, không loại nào >4/8 | warning |
| `WEEK_SKILL_FEASIBLE` | Mọi `skillCode` nằm trong ô `valid` của chủ đề tuần đó | critical |

#### Scenario: Tuần thiếu seed bị bắt
- **WHEN** một file seed có 7 seed cho cùng một (tuần, ngày, môn)
- **THEN** lint báo `WEEK_COUNT` mức critical

#### Scenario: activityIndex trùng bị bắt
- **WHEN** hai seed trong cùng tuần cùng có `activityIndex: 3`
- **THEN** lint báo `WEEK_INDEX` mức critical

#### Scenario: Phân bố difficulty sai bị bắt
- **WHEN** một tuần có `warmup×3, core×4, challenge×1`
- **THEN** lint báo `WEEK_DIFFICULTY` mức critical

#### Scenario: Skill ngoài matrix bị bắt
- **WHEN** một seed chủ đề `colors` dùng skill được đánh dấu `invalid` cho `colors`
- **THEN** lint báo `WEEK_SKILL_FEASIBLE` mức critical

#### Scenario: Tuần hợp lệ đi qua sạch
- **WHEN** một tuần có đủ 8 seed, index 1..8, difficulty 2/4/2, 3 actionType, mọi skill nằm trong matrix
- **THEN** lint không báo lỗi cấp tuần nào

### Requirement: Validator KHÔNG đặt quota phân bố construct hoặc domain

Kiểm tra cấp tuần MUST NOT yêu cầu số lượng tối thiểu của `domain` hoặc `construct` khác nhau.

Lý do: quota phân bố là công cụ sai cho vấn đề này. Tuần 1 `hello` hỏng vì **chủ đề chỉ có một chiều phân biệt**, không phải vì chọn skill lệch — cùng bộ skill đó đặt vào `colors` thì các construct là thật. Không luật phân bố nào phân biệt được hai trường hợp, vì khác biệt nằm ở chủ đề chứ không ở nhãn skill. Ép quota domain còn đẩy generator dùng `phonics`/`dialogue`/`literacy` chỉ để đủ số, mâu thuẫn với phân hóa tuổi Q1–Q2 ở curriculum §5.4.

Việc chặn W1-kiểu-mới thuộc về feasibility matrix (chặn từ đầu vào) và shortcut test từng item (chặn ở seed-review), không thuộc validator phân bố.

#### Scenario: Tuần colors 6/8 vocab vẫn hợp lệ
- **WHEN** một tuần `colors` có 6/8 seed thuộc domain `vocab` nhưng mỗi seed đo một construct thật khác nhau
- **THEN** lint không báo lỗi — phân bố domain không phải tiêu chí

#### Scenario: Không ép skill chưa hợp tuổi vào Q1
- **WHEN** một tuần Q1 chỉ dùng skill nhóm tiếp nhận (§5.1)
- **THEN** lint không đòi thêm skill `phonics`/`dialogue` cho đủ quota

### Requirement: Validator áp cho mọi môn

Kiểm tra cấp tuần SHALL áp cho cả `toan` và `tieng_anh`; các kiểm phụ thuộc chủ đề (`WEEK_SKILL_FEASIBLE`) chỉ áp khi môn đó có khai báo matrix.

#### Scenario: Seed toán được kiểm cấu trúc tuần
- **WHEN** lint chạy trên `seeds/w03.json` (16 seed, D1 + D4)
- **THEN** mỗi ngày được kiểm riêng như một đơn vị 8 seed

#### Scenario: Môn chưa có matrix bỏ qua kiểm feasibility
- **WHEN** lint chạy trên môn chưa khai báo theme × skill matrix
- **THEN** `WEEK_SKILL_FEASIBLE` được bỏ qua, các kiểm cấu trúc khác vẫn chạy
