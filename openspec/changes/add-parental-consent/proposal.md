## Why

Hôm nay app gửi tên gọi, tuổi và avatar của bé (4–6 tuổi) lên server ở `SetupScreen` trước bất kỳ thao tác nào của người lớn, và không nơi nào ghi nhận sự đồng ý của phụ huynh. Chính sách Gia đình của Google Play yêu cầu tuân thủ luật bảo vệ trẻ em hiện hành; Luật 91/2025/QH15 và Nghị định 356/2025/NĐ-CP yêu cầu cha, mẹ hoặc người giám hộ đồng ý trước khi xử lý dữ liệu cá nhân của trẻ, và bên xử lý phải lưu bằng chứng về thời điểm và nội dung đồng ý. Checklist go-live Play đang mở mục P0 "Chốt cơ chế parental notice/consent… trước khi tạo hồ sơ server-side". Chủ sản phẩm đã quyết định (14/09/2026) thêm bước này và ship làm bản cập nhật đầu tiên của đợt closed test.

## What Changes

- **Mobile:** màn mới `ParentConsent` đặt giữa slide giới thiệu và `SetupScreen`. Bước A là câu hỏi người lớn (phép cộng viết bằng chữ, preset mạnh hơn, khoá 30 giây sau 3 lần sai). Bước B là thông báo ngắn (lưu gì, để làm gì, ai lưu, ở đâu, bao lâu, quyền của ba mẹ, link Chính sách bảo mật chỉ hiện sau A), ô xác nhận không đánh sẵn, "Đồng ý và tiếp tục" / "Không đồng ý". Nếu ba mẹ không đồng ý, không gửi gì.
- **Mobile:** Setup chỉ gọi `POST /children` khi session đã có đồng ý hợp lệ; lỗi 409 `parental_consent_required` đưa về màn đồng ý. Gợi ý nhập biệt danh.
- **Mobile:** household cũ (tạo bởi build trước) mở trên bản mới thấy cổng đồng ý một lần, với lựa chọn thay thế "Xoá dữ liệu gia đình". Trạng thái không biết (server cũ) không bao giờ kích hoạt cổng.
- **Mobile:** mọi request gửi header `X-Kido-Client-Features: parental-consent-v1`; Cài đặt hiện ngày đồng ý.
- **Server:** `Household.parentalConsent` (và lịch sử tối đa 10 bản ghi bị thay thế); endpoint mới `POST /anonymous-sessions/parental-consent { noticeVersion }`; `register`/`recover`/`status` trả `parentalConsent`.
- **Server:** `POST /children` trả 409 `parental_consent_required` khi client khai báo `parental-consent-v1` mà household chưa đồng ý; client không khai báo (build cũ) vẫn tạo được cho tới khi bật `PARENTAL_CONSENT_ENFORCE_ALL=true`. Không đổi body của request cũ nào.
- **Landing:** privacy §2/§3/§5/§7/§8/§10 mô tả bước đồng ý và bản ghi; trang data-deletion thêm bản ghi đồng ý vào danh sách bị xoá; cập nhật `LEGAL_UPDATED`.
- **Docs:** `docs/KIDO_PARENTAL_CONSENT_NOTICE.md` lưu nguyên văn từng phiên bản thông báo; cập nhật `docs/AI_CONTEXT.md`, checklist go-live Play/Apple.
- Không backfill "đã đồng ý" cho household cũ. Rút lại đồng ý = xoá dữ liệu gia đình hiện có; bản ghi đồng ý bị xoá cùng household.

## Capabilities

### New Capabilities

- `parental-consent`: ghi nhận, trả trạng thái và cưỡng chế sự đồng ý của ba mẹ trên household trước khi tạo hồ sơ bé; luồng mobile hỏi đồng ý lần đầu và hỏi lại household cũ; rút lại bằng xoá household.

### Modified Capabilities

- (Không viết delta MODIFIED: `anonymous-household-session` chưa archive vào `openspec/specs/`. Các thay đổi lên `POST /children`, `status`, `register`, `recover` được đặc tả trong `parental-consent`.)

## Impact

- **Server:** `common/schemas/household.schema.ts`; `modules/anonymous-sessions/` (constants, DTO, controller, service, spec); `modules/children/` (controller đọc header, service kiểm đồng ý, spec mới); env `PARENTAL_CONSENT_ENFORCE_ALL` (mặc định tắt). Không migration.
- **Mobile:** `ParentConsentScreen` mới, `components/parentGate/adultChallenge.ts` mới, `ParentGateModal` (chỉ import), `AuthStack`/`types`, `OnboardingScreen` (4 chỗ), `SetupScreen`, `anonymousSessionStore`, `api.ts`, `constants/legal.ts`, `App.tsx`, `SettingsScreen`, script `verify-parental-consent-contracts.cjs`. Chỉ JS/TS nhưng cần build store mới (không có expo-updates).
- **Landing:** `privacy/page.tsx`, `data-deletion/page.tsx`, `LegalPage.tsx` (`LEGAL_UPDATED`), tuỳ chọn `terms/page.tsx`.
- **Thứ tự triển khai:** server → landing (cùng ngày rollout build) → mobile → bật cưỡng chế toàn phần trước Production. Không rollback server về trước thay đổi này khi build mới đã phát hành.
- **Tương thích:** build cũ không đổi hành vi; field mới trong response được bỏ qua; `POST /children` không header vẫn được nhận khi cờ tắt.
- **Rủi ro tồn dư:** câu hỏi người lớn chứng minh "người lớn", không chứng minh "đúng người giám hộ" (tự khai); household ẩn danh vẫn được tạo trước khi đồng ý (không chứa dữ liệu của bé); các điều khoản luật cần luật sư xác nhận trước Production.
