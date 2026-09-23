# Android: Google Play

## Track và tên trong API

| Console | API | Ghi chú |
|---|---|---|
| Kiểm thử nội bộ | `internal` | Đích mặc định của skill. Tối đa 100 tester, không qua review. |
| Kiểm thử kín | `alpha` | Track kín mặc định; track kín tự tạo có tên riêng (xem `play.mjs status`). Cần cho gate Production. |
| Kiểm thử mở | `beta` | Chưa dùng. |
| Chính thức | `production` | Khoá cho tới khi có Production access. |

## Upload mặc định

`eas build --auto-submit` gọi `eas submit` theo `submit.production.android`, với track `internal`. `eas submit` không đặt được release notes, nên gắn notes bằng `play.mjs notes`.

### Draft app

Khi app chưa từng được publish qua review, Play coi nó là **draft app**: API chỉ nhận release ở trạng thái `draft`, kể cả khi track Internal đã có bản `completed` do anh roll out tay. Ngày 2026-09-13 dry run `promote --from internal --to alpha` bị Play trả `Only releases with status draft may be created on draft app`.

- Vì vậy `submit.production.android` đặt `"releaseStatus": "draft"`. Mỗi bản mới lên Internal ở dạng nháp, và anh roll out nó trong Console.
- `play.mjs status` dò trạng thái này và in dòng `draft app: yes|no`. Cách dò: trong edit dùng để đọc, nó validate thử một release `completed` trên track trống, rồi huỷ edit. Không có gì thay đổi trên Play.
- Trạng thái draft thường chỉ hết khi app được publish lần đầu qua review, ví dụ bản Closed test đầu tiên sau khi làm xong App content. Khi `status` báo `draft app: no`, bỏ `releaseStatus` khỏi `eas.json` để EAS phát hành thẳng.

Release notes dùng ngôn ngữ `vi-VN` (listing mặc định), tối đa 500 ký tự. `play.mjs` báo lỗi nếu notes dài hơn.

## Promote và staged rollout

Luôn theo thứ tự: chạy dry run, cho anh xem before/after, chờ anh đồng ý, rồi chạy lại với `--commit`.

- **Internal → Closed:**

  ```bash
  node .claude/skills/release-mobile/scripts/play.mjs promote --from internal --to alpha --version-code N
  ```

  Tester của track kín phải tự opt-in. Ai đang ở Internal phải opt-out Internal thì mới nhận được bản Closed. Khi app còn là draft app, thêm `--draft` (không thì Play từ chối), rồi anh hoàn tất và gửi review bản Closed trong Console.

- **Closed → Production** (chỉ khi đã có Production access):

  ```bash
  node .claude/skills/release-mobile/scripts/play.mjs promote --from alpha --to production --version-code N --rollout 0.05
  ```

  Sau đó tăng dần bằng `rollout --track production --fraction 0.2`, rồi `0.5`, rồi `1`. Theo checklist §4.3, chỉ tăng khi vitals, IAP và backend ổn.
- **Sự cố:** `halt --track production`. Muốn chạy tiếp thì dùng `rollout --track production --fraction <x>`.
- **Managed publishing:** nếu bật, commit chỉ đưa thay đổi vào hàng chờ; anh phải bấm "Publish" trong Console.
- **Production access với tài khoản cá nhân:** cần closed test có ≥12 tester opt-in liên tục trong 14 ngày, sau đó Apply for production và chờ Google xét (thường ~7 ngày). Chi tiết ở `docs/GOOGLE_PLAY_GOLIVE_CHECKLIST.md` §0.3 bước 4 và §4.2.

## Kiểm AAB

- `play.mjs status` liệt kê các bundle kèm SHA-256; ghi SHA-256 vào release log.
- Để thấy manifest đã merge (gồm cả quyền do thư viện thêm vào): xem Console → App bundle explorer, hoặc tải AAB từ `artifacts.buildUrl` của `eas build:view <id> --json` rồi chạy `bundletool dump manifest --bundle app.aab` (`brew install bundletool`).
- Nên kiểm manifest ở bản đầu tiên, sau khi nâng Expo SDK hoặc thư viện native, và khi preflight báo quyền mới.

## Lưu ý Console và tài khoản

- Subscription chỉ bán ở VN, nên quốc gia phân phối của app phải khớp. Nếu không, paywall sẽ kẹt ở các nước khác.
- Không sửa quyền của service account: mỗi thay đổi mất ~36–48 giờ mới lan.
- Điều khiển Console bằng trình duyệt: checkbox material và vài dropdown bỏ qua input tự động, nên nhờ anh bấm các chỗ đó. Luôn reload trang hoặc xem activity log để xác nhận đã lưu.
- IAP chỉ nghiệm thu trên bản cài từ link Play (bằng license tester), không nghiệm thu trên APK sideload.
