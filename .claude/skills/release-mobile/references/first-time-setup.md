# Thiết lập lần đầu

Mỗi bước dưới đây chỉ làm một lần cho mỗi máy hoặc mỗi loại credential. Đăng nhập, tạo key và nhập mật khẩu là việc của anh; Claude hướng dẫn rồi kiểm lại bằng preflight.

## 1. EAS

Anh chạy trong terminal của mình (Terminal panel của app desktop, hoặc gõ `! eas login` trong Claude Code CLI):

```bash
eas login
```

Dùng account `duyht56`, rồi kiểm bằng `eas whoami`.

Cách thay thế: tạo access token ở expo.dev → Account settings → Access tokens, rồi export `EXPO_TOKEN` trong `~/.zshrc`. Không để token trong repo.

## 2. Android

### Upload keystore (đã có trên EAS)

Bản versionCode 2 được build bằng EAS, nên keystore nằm trên EAS. Kiểm một lần cho chắc:

```bash
cd mobile && eas credentials -p android
```

Chọn profile `production` rồi xem SHA-1/SHA-256 của keystore. So với Play Console → App integrity (Tính toàn vẹn của ứng dụng) → chứng chỉ khoá tải lên (upload key certificate). Khớp là xong.

**Đã đối chiếu ngày 2026-09-13**, không cần kiểm lại trừ khi Play báo sai key:
- Keystore mặc định trên EAS có SHA-1 `b356011c28014329b50cb2ded527f5e49bdc2652` và SHA-256 `4ef799c95fdd860f2030e5a61a256d643309c89a2cdf6ed3c2e8a6c8d17d478c`.
- Đây đúng là chứng chỉ đã ký AAB versionCode 2 đang có trên Play. SHA-256 của file tải từ EAS build `9c20b8b8-1205-434c-9c9a-9807563e7dab` trùng SHA-256 của bundle mà `play.mjs status` báo.

Muốn đối chiếu lại mà không cần Console: tải artifact của build (`eas build:view <id> --json` → `artifacts.buildUrl`), rồi so `shasum -a 256` với bundle trong `play.mjs status`. Xem chứng chỉ ký bằng `keytool -printcert -jarfile <file>.aab`.

**Không** chọn "Generate new keystore" hay "Remove keystore": đổi keystore thì Play từ chối mọi bản sau.

### Key cho `eas submit`

`eas submit` cần một Google service account có quyền phát hành. SA `kido-server-play@dodokids-play.iam.gserviceaccount.com` đang có quyền Admin cấp tài khoản nên dùng được. Nên nạp key lên EAS để không phải để file key trong repo:

1. Xuất key ra một file tạm có quyền 600. Anh chạy lệnh này từ root repo:

   ```bash
   node -e 'const fs=require("fs");const l=fs.readFileSync("kido-server/.env","utf8").split("\n").find(x=>x.startsWith("GOOGLE_PLAY_KEY="));let v=l.slice(16).trim();if(/^[\x27"]/.test(v))v=v.slice(1,-1);fs.writeFileSync(process.argv[1],JSON.stringify(JSON.parse(v),null,2),{mode:0o600})' ~/dodokids-play-sa.json
   ```

2. `cd mobile && eas credentials -p android` → `production` → Google Service Account → key cho Play Store Submissions → upload file vừa xuất. Ô "Path to Google Service Account file" không hiểu `~`, nên phải gõ đường dẫn tuyệt đối, ví dụ `/Users/<user>/dodokids-play-sa.json`.
3. Xoá file tạm: `rm ~/dodokids-play-sa.json`.

**Đã làm ngày 2026-09-13:** key của `kido-server-play@dodokids-play.iam.gserviceaccount.com` được gán cho Play Store Submissions trên EAS.

Về lâu dài nên tách một SA chỉ để phát hành, khỏi SA của server (server chỉ cần quyền tài chính và đơn hàng). Nhớ rằng mỗi lần đổi quyền phải chờ ~36–48 giờ mới có hiệu lực, nên đừng đổi ngay trước một đợt release.

## 3. iOS

### eas.json

`submit.production.ios` phải có `"ascAppId": "6811548180"` và `"appleTeamId": "T9SMHB8ZL3"` (thêm ngày 2026-09-13). Preflight kiểm hai giá trị này.

### Distribution certificate và provisioning profile

Máy này mới có chứng chỉ Apple Development; bản App Store cần chứng chỉ Distribution. Để EAS tạo và giữ nó (một lần, chạy interactive):

```bash
cd mobile && eas credentials -p ios
```

Chọn `production` → Build Credentials → set up → đăng nhập Apple ID (2FA) → để EAS tạo Distribution Certificate và App Store provisioning profile cho `com.dodokids.app`.

Cách khác: chạy lần build iOS đầu tiên mà không có `--non-interactive` (`eas build -p ios --profile production`); EAS sẽ hỏi rồi tạo luôn.

Ô "Apple ID" là **email** đăng nhập App Store Connect (xem ở Xcode → Settings → Accounts), không phải Team ID. Gõ nhầm thì EAS lưu mật khẩu vào Keychain dưới cái tên sai. Xoá entry đó bằng `security delete-internet-password -s deliver.<tên đã gõ> -a <tên đã gõ>`.

**Lỗi `Authentication with Apple Developer Portal failed! iTunes service key is empty`** (gặp ngày 2026-09-13):
- Nguyên nhân: eas-cli lấy khoá đăng nhập từ `https://appstoreconnect.apple.com/olympus/v1/app/config?hostname=itunesconnect.apple.com`, và địa chỉ này giờ trả 404.
- eas-cli 24.3.0 (dùng `@expo/apple-utils` 2.2.0) vẫn gọi đúng địa chỉ đó, nên nâng cấp không sửa được.
- Cách vòng qua: truyền khoá qua biến môi trường mà apple-utils hỗ trợ.

  ```bash
  EXPO_APP_STORE_AUTH_SERVICE_KEY=<widgetKey> eas credentials -p ios
  ```

- Khoá này là `widgetKey` trong iframe `idmsa.apple.com/appleauth/auth/signin` của trang https://appstoreconnect.apple.com/login (đọc ngày 2026-09-13). Nếu Apple đổi khoá, mở lại trang đó và đọc `widgetKey` trong `src` của iframe.

**Cách không cần Apple ID:** tạo ASC API key trước (mục dưới), chọn role **Admin** vì key này sẽ tạo chứng chỉ (EAS tự tạo key cũng mặc định Admin). Sau đó chạy:

```bash
EXPO_ASC_API_KEY_PATH=<đường dẫn .p8> EXPO_ASC_KEY_ID=<Key ID> EXPO_ASC_ISSUER_ID=<Issuer ID> EXPO_APPLE_TEAM_ID=T9SMHB8ZL3 EXPO_APPLE_TEAM_TYPE=INDIVIDUAL eas credentials -p ios
```

Khi có các biến này, EAS xác thực bằng API key và tạo Distribution Certificate cùng provisioning profile mà không hỏi mật khẩu hay 2FA. Chỉ push key mới bắt đăng nhập Apple ID, và app hiện không cần push key.

App ID explicit `com.dodokids.app` đã tick In-App Purchase (đăng ký ngày 2026-09-11), nên profile sinh ra sẽ có IAP.

**Đã tạo ngày 2026-09-13:** Distribution Certificate serial `5E9365AA785B3B1B010D4C941D060C23` và provisioning profile App Store `LAWB98SQ34`. Cả hai hết hạn 2027-09-13; gia hạn trước ngày đó bằng cùng lệnh.

### App Store Connect API key (để submit không cần Apple ID)

1. ASC → Users and Access → Integrations → App Store Connect API → Team Keys → "+". Đặt tên `eas-submit`, role **App Manager**. Nếu cũng dùng key này để tạo chứng chỉ theo cách không cần Apple ID ở trên, chọn **Admin**.
2. Tải `AuthKey_<KEYID>.p8` (chỉ tải được một lần) và ghi lại Key ID và Issuer ID. Cất file ngoài repo, ví dụ `~/.appstoreconnect/private_keys/`.
3. `cd mobile && eas credentials -p ios` → `production` → App Store Connect: Manage your API Key → thêm key (file `.p8`, Key ID, Issuer ID) → chọn dùng key đó cho EAS Submit.

Sau bước này, `eas submit` và `--auto-submit` chạy được ở chế độ non-interactive.

**Đã làm ngày 2026-09-13:** EAS tự tạo key `9JN599D5X3` ("[Expo] EAS Submit …", role Admin) và gán cho project.

### TestFlight group

ASC → TestFlight → Internal Testing → tạo group (ví dụ "Team"). Thêm tester (phải là user trong ASC) và bật **Automatic Distribution**. Muốn EAS tự gán build vào group thì thêm `"groups": ["Team"]` vào `submit.production.ios`.

## 4. Kiểm lại

```bash
bash .claude/skills/release-mobile/scripts/preflight.sh
```

Kết quả không được còn `[BLOCK]` nào, trừ working tree bẩn nếu đang có WIP.
