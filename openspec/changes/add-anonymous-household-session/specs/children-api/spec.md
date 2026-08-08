## MODIFIED Requirements

### Requirement: POST /children tạo child profile mới

Endpoint `POST /children` SHALL require a valid anonymous device bearer, accept `name` and `age` in the request body, create a child owned by the authenticated household with default progress state, and return the created child document including `childId`, `name`, `age`, `avatar`, and `progress`.

#### Scenario: Tạo child thành công

- **WHEN** an authenticated household sends `POST /children` with valid `name` and `age`
- **THEN** server creates the child under that household with a unique `childId` and default values
- **AND** returns the created child document

#### Scenario: Tạo child không có session

- **WHEN** a caller sends `POST /children` without a valid device bearer
- **THEN** server returns `401`
- **AND** no child is created

### Requirement: GET /children/:childId trả về child profile

Endpoint `GET /children/:childId` SHALL require a valid anonymous device bearer and return the complete child document only when the child belongs to the authenticated household.

#### Scenario: Lấy child tồn tại thuộc household

- **WHEN** an authenticated household requests its existing `childId`
- **THEN** server returns the complete child document

#### Scenario: Child thuộc household khác

- **WHEN** an authenticated household requests a `childId` owned by another household
- **THEN** server returns `403` or a non-enumerating `404`
- **AND** does not return child data

