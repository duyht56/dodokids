# iOS: TestFlight và App Store

## Upload mặc định

`eas build --auto-submit` upload IPA lên App Store Connect bằng ASC API key đã nạp vào EAS. Sau khi upload, Apple xử lý ("Processing") 5–30 phút rồi build mới hiện trong TestFlight.

- "What to Test" lấy từ `--what-to-test`.
- Export compliance: `ios.config.usesNonExemptEncryption: false` nên không bị hỏi mỗi lần upload.
- Internal testers (user trong ASC, tối đa 100) nhận bản ngay khi group bật Automatic Distribution, không cần review.
- External testers: bản đầu tiên của mỗi version phải qua Beta App Review (thường dưới 24 giờ). Thêm build vào group external là phát hành ra ngoài, nên hỏi anh trước.

## Version và build number

- Build number do EAS remote tự tăng.
- Khi `expo.version` chưa được Apple duyệt, có thể upload nhiều build cùng version. Khi Apple duyệt hoặc phát hành version đó, "train" đóng lại và bản kế tiếp phải bump version.
- Từ 28/04/2026 Apple bắt buộc build bằng Xcode 26 / iOS 26 SDK. Yêu cầu này áp lên image cloud của EAS (image `auto` hiện đạt). `--local` thì dùng Xcode 26.6 trên máy. Xem `docs/APPLE_SUBMIT_RUNBOOK.md` §C2.

## Gửi App Review (lệnh riêng)

Gửi review làm trên ASC web. Trước khi đề nghị anh bấm Submit, soát từng mục:

1. Build đã chọn đúng version và build number, và đã Processing xong.
2. Screenshots: iPhone 6.9" (1320×2868) và iPad 13" (2064×2752). iPad là bắt buộc vì `supportsTablet: true`. Dùng JPEG, không alpha. Xem runbook §E.
3. Metadata:
   - description nêu giá, chu kỳ, việc tự gia hạn và cách huỷ
   - Privacy Policy URL, EULA
   - category Education
   - App Privacy label
   - bộ câu hỏi age rating mới
4. Subscriptions: mỗi gói có review screenshot và review notes. Subscription đầu tiên phải được gửi **cùng** một version app, ở mục "In-App Purchases and Subscriptions" trên trang version.
5. App Review notes: đường tới paywall, cách qua parental gate, và ghi rõ không cần tài khoản.
6. Pricing & Availability:
   - territory (loại EU ở v1, runbook §0.3)
   - đã khai DSA "not a trader"
   - đã quyết định có bật Mac availability không (runbook §F8)
7. Blocker còn lại: `docs/APPLE_SUBMIT_RUNBOOK.md` §F và `docs/APPLE_APP_STORE_GOLIVE_CHECKLIST.md` §0.2.

Sau đó chọn "Manual release" hoặc "Automatically release". Với bản cập nhật, cân nhắc **Phased Release** trong 7 ngày. Chỉ bấm "Add for Review"/"Submit for Review" khi anh đã xác nhận.

## Theo dõi

- Trạng thái review xem trên ASC. Bị reject thì đọc Resolution Center, sửa, build mới (build number tự tăng) rồi submit lại.
- Khi version đã lên App Store, tag `v<version>` trong `mobile/` (xem SKILL.md, mục "Lệnh riêng").
