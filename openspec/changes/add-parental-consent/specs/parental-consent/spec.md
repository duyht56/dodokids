## ADDED Requirements

### Requirement: Ghi nhận sự đồng ý của ba mẹ trên household

Server SHALL expose `POST /anonymous-sessions/parental-consent` behind the device bearer, accept only `noticeVersion` from an accepted list, and store on the household `noticeVersion`, `policyVersion`, server-clock `grantedAt`, `method`, `declaredRole`, `purposes`, and the session `deviceId`. It MUST NOT store IP address or parent identity.

#### Scenario: Ghi nhận lần đầu
- **WHEN** an authenticated household without consent posts an accepted `noticeVersion`
- **THEN** the household stores the consent record with server time and the session `deviceId`
- **AND** the response returns `{ parentalConsent: { noticeVersion, grantedAt } }`

#### Scenario: Gửi lại cùng phiên bản
- **WHEN** the household posts the same `noticeVersion` again
- **THEN** the stored `grantedAt` is unchanged and no history entry is added

#### Scenario: Hai request song song
- **WHEN** two requests for the same household and the same `noticeVersion` arrive together
- **THEN** exactly one consent record is stored
- **AND** both responses carry that record's `grantedAt`

#### Scenario: Household đã bị xoá
- **WHEN** a tombstoned household posts consent
- **THEN** server returns `409 { error: "household_deleted" }`

#### Scenario: Phiên bản lạ
- **WHEN** the body carries an unknown `noticeVersion` or any extra field
- **THEN** server returns `400` and stores nothing

### Requirement: Trả trạng thái đồng ý cho thiết bị

`GET /anonymous-sessions/status`, `POST /anonymous-sessions/register` and `POST /anonymous-sessions/recover` SHALL include `parentalConsent` as `{ noticeVersion, grantedAt }` or `null`.

#### Scenario: Household mới
- **WHEN** a new device registers a new household
- **THEN** the response includes `parentalConsent: null`

### Requirement: POST /children tôn trọng đồng ý của ba mẹ

`POST /children` SHALL return `409 { error: "parental_consent_required" }` without creating a child when the household has no consent and either the request declares `parental-consent-v1` in `X-Kido-Client-Features` or `PARENTAL_CONSENT_ENFORCE_ALL` is `true`. Requests without the declaration MUST keep today's behaviour while the flag is off.

#### Scenario: Client mới chưa đồng ý
- **WHEN** a client declaring `parental-consent-v1` creates a child for a household without consent
- **THEN** server returns 409 and no child is stored

#### Scenario: Client cũ
- **WHEN** a client without the declaration creates a child while the flag is off
- **THEN** the child is created and the server logs a warning without the child's name

### Requirement: Mobile hỏi đồng ý trước khi nhập thông tin của bé

The mobile app SHALL show an adult check followed by a consent notice with an unticked confirmation before `SetupScreen`, and MUST NOT send any child data until the server has recorded consent. Households onboarded without consent MUST see a one-time consent gate on the new build; an unknown consent state MUST NOT trigger that gate.

#### Scenario: Cài mới
- **WHEN** a parent finishes the onboarding slides on a fresh install
- **THEN** the app shows the adult check, then the consent notice, and opens Setup only after consent is stored

#### Scenario: Ba mẹ không đồng ý
- **WHEN** the parent chooses "Không đồng ý"
- **THEN** no request carrying child data is sent and the parent can review again or return to the slides

#### Scenario: Household cũ trên bản mới
- **WHEN** an onboarded household with `parentalConsent: null` opens the new build
- **THEN** the app blocks with the consent gate, offering consent or household deletion
- **AND** queued lesson rewards stay on the device until consent is recorded

### Requirement: Rút lại đồng ý bằng xoá household

Withdrawing consent SHALL be done through the existing household deletion, which MUST remove the consent record together with the household.

#### Scenario: Xoá dữ liệu gia đình
- **WHEN** the parent deletes family data
- **THEN** the household and its consent record are hard-deleted and the next onboarding asks for consent again
