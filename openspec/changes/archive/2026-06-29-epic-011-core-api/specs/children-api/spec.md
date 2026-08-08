## ADDED Requirements

### Requirement: POST /children tạo child profile mới
`POST /children` SHALL nhận `{ name: string, age: 4|5|6 }`, tạo document trong collection `children` với `childId` tự generate (`child_{nanoid(10)}`), `progress` default, `entitlement` default (trial), trả về child document đầy đủ.

#### Scenario: Tạo child thành công
- **WHEN** `POST /children` với body `{ "name": "An", "age": 5 }`
- **THEN** response `201 Created` với body `{ "childId": "child_xK3mP9qRvT", "name": "An", "age": 5, "createdAt": "...", "progress": { "currentWeek": 1, "currentDay": 1, ... }, "entitlement": { "plan": "free", "status": "trial", "trialWeeksUnlocked": 2 } }`

#### Scenario: Thiếu field bắt buộc bị reject
- **WHEN** `POST /children` với body thiếu `age`
- **THEN** response `400 Bad Request` với message `"age must be one of 4, 5, 6"`

#### Scenario: age ngoài range [4,5,6] bị reject
- **WHEN** `POST /children` với `{ "name": "An", "age": 3 }`
- **THEN** response `400 Bad Request`

### Requirement: GET /children/:childId trả về child profile
`GET /children/:childId` SHALL trả về child document nếu tồn tại, `404` nếu không tìm thấy.

#### Scenario: Lấy child tồn tại
- **WHEN** `GET /children/child_xK3mP9qRvT` và child tồn tại
- **THEN** response `200 OK` với full child document

#### Scenario: childId không tồn tại
- **WHEN** `GET /children/child_notexist`
- **THEN** response `404 Not Found` với `{ "message": "Child not found" }`
