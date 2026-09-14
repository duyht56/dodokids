## 1. Server — ghi nhận đồng ý

- [x] 1.1 Thêm sub-schema `HouseholdParentalConsent` (`noticeVersion`, `policyVersion`, `grantedAt`, `method`, `declaredRole`, `purposes`, `deviceId`) và field `parentalConsent` (mặc định null) + `parentalConsentHistory` (mặc định []) vào `Household`
- [x] 1.2 Thêm `parental-consent.constants.ts` (bảng `PARENTAL_CONSENT_NOTICES`, `PARENTAL_CONSENT_METHOD`, `PARENTAL_CONSENT_CLIENT_FEATURE`, `clientDeclaresFeature`)
- [x] 1.3 Thêm `RecordParentalConsentDto` (`noticeVersion` thuộc bảng; không nhận field nào khác)
- [x] 1.4 Thêm `POST /anonymous-sessions/parental-consent` (DeviceSessionGuard, RateLimit 10/60) và `recordParentalConsent`: từ chối tombstone (409 `household_deleted`), idempotent cùng phiên bản kể cả khi hai request chạy song song (lệnh ghi ghim trạng thái đồng ý vừa đọc), đẩy bản cũ vào history (cắt 10) khi phiên bản đổi, `deviceId` lấy từ session, `grantedAt` giờ máy chủ
- [x] 1.5 Trả `parentalConsent: { noticeVersion, grantedAt } | null` trong `status`, `register` (household mới = null), `resumeExisting`, `recover`

## 2. Server — cưỡng chế ở POST /children

- [x] 2.1 `ChildrenController.create` đọc header `x-kido-client-features` và truyền `consentAware`
- [x] 2.2 `ChildrenService.create`: một truy vấn `deletedAt parentalConsent`; giữ 409 `household_deleted`; 409 `parental_consent_required` khi `consentAware` hoặc `PARENTAL_CONSENT_ENFORCE_ALL=true` mà chưa có đồng ý; client cũ thì tạo và log cảnh báo chỉ kèm householdId
- [x] 2.3 Mở rộng `anonymous-sessions.service.spec.ts` (ghi, idempotent, đổi phiên bản, tombstone, trả trạng thái, hai request song song; mock `updateOne` so mọi filter kể cả đường dẫn có dấu chấm, `applyUpdate` hỗ trợ `$push`/`$slice`) và kiểm DTO với ValidationPipe như `main.ts`
- [x] 2.4 Thêm `children.service.spec.ts` theo bảng cưỡng chế (header × đồng ý × cờ, tombstone ưu tiên, log không có tên bé)
- [x] 2.5 `cd kido-server && npm test && npm run build`

## 3. Mobile — màn đồng ý

- [x] 3.1 Tách `VN_NUMBER_WORDS` (0–19) và `makeAdultChallenge(preset)` sang `src/components/parentGate/adultChallenge.ts`; `ParentGateModal` import với preset `standard`, không đổi hành vi
- [x] 3.2 Thêm `PARENTAL_CONSENT_NOTICE_VERSION` và `CLIENT_FEATURES` vào `src/constants/legal.ts`; gửi header `X-Kido-Client-Features` trong `src/services/api.ts`
- [x] 3.3 `anonymousSessionStore`: field `parentalConsent` (undefined = không biết), `sessionFrom`, action `recordParentalConsent`, helper `parentalConsentState`
- [x] 3.4 Tạo `ParentConsentScreen` (bước kiểm tra/đồng ý/từ chối; chế độ `first_run`/`reconsent`; checkbox không đánh sẵn; link chính sách chỉ sau bước A; khoá 30 giây sau 3 lần sai; bỏ qua khi đã đồng ý; bố cục điện thoại/iPad qua `ContentFrame measure="form"`; a11y)
- [x] 3.5 Đăng ký `ParentConsent` trong `AuthStack`/`types` (gestureEnabled false); đổi 4 chỗ `replace('Setup')` trong `OnboardingScreen` thành `replace('ParentConsent')`
- [x] 3.6 `SetupScreen`: kiểm tra đồng ý sau `bootstrapSession()` và trước tra cứu/tạo hồ sơ; 409 `parental_consent_required` về `ParentConsent`; gợi ý biệt danh + placeholder
- [x] 3.7 `App.tsx`: cổng reconsent khi `isOnboarded` và trạng thái `missing`/`outdated`, lựa chọn thay thế "Xoá dữ liệu gia đình" qua `deleteHouseholdData()`; tạm dừng đồng bộ hàng đợi phần thưởng trong lúc cổng đang hiện
- [x] 3.8 `SettingsScreen`: dòng "Ba mẹ đã đồng ý ngày …" + chú thích rút lại đồng ý
- [x] 3.9 Thêm `scripts/verify-parental-consent-contracts.cjs` + script `test:parental-consent`; chạy nó, `test:anonymous-session`, `npx tsc --noEmit`, eslint có mục tiêu (không prettier --write)

## 4. Landing và docs

- [x] 4.1 Cập nhật `landing/src/app/privacy/page.tsx` (Tóm tắt, §2, §3, §5, §7, §8, §10 — không đánh số lại; các câu khẳng định gắn với "phiên bản có bước đồng ý") và `data-deletion/page.tsx`; đổi `LEGAL_UPDATED` bằng ngày publish = `policyVersion` trong bảng server
- [x] 4.2 Tạo `docs/KIDO_PARENTAL_CONSENT_NOTICE.md` chứa nguyên văn thông báo phiên bản `2026-09-15`
- [x] 4.3 Cập nhật `docs/AI_CONTEXT.md` (Runtime API Contracts) và viết spec `specs/parental-consent/spec.md`

## 5. Rollout và bằng chứng

- [x] 5.1 Deploy server (push main), smoke trên prod bằng thiết bị giả rồi xoá household giả; xác nhận build cũ vẫn chạy (004c469 lên prod 14/09/2026, smoke 13/13)
- [ ] 5.2 Build production EAS → Internal testing (rollout tay vì app đang Bản nháp) → cùng ngày publish landing → Closed testing (sau khi bản đang được Google xét đã duyệt)
- [ ] 5.3 QA tay theo ma trận (cài mới, từ chối, mất mạng, tắt app giữa chừng, household cũ, khôi phục, xoá, a11y, iPad) và chụp ảnh bước A/B/C
- [ ] 5.4 Tick checklist Play mục consent kèm ảnh; mô tả cơ chế trong Families/Data safety và App Review notes
- [ ] 5.5 Trước Production: bật `PARENTAL_CONSENT_ENFORCE_ALL=true` khi mọi tester internal đã cập nhật; đếm household `parentalConsent: null`
