---
name: release-mobile
description: Phát hành bản mới của app Dodokids (Expo, repo `mobile/`) lên Google Play và App Store bằng EAS. Skill lo preflight, chốt version, build production, tự submit lên Internal testing (Android) và TestFlight (iOS), gắn release notes, ghi release log. Khi được yêu cầu rõ, skill promote lên Closed/Production với staged rollout hoặc chuẩn bị gửi App Review. Dùng skill này bất cứ khi nào người dùng muốn release, phát hành, ra bản mới, lên bản, đẩy bản lên store/Play/TestFlight/App Store, build production (AAB/IPA), bump version, submit app, promote, tăng hoặc dừng rollout, hay hỏi bản nào đang nằm trên track nào, kể cả khi chỉ nhắc một nền tảng hoặc chỉ nói "ship bản mới đi".
---

# Release mobile: Android + iOS

Skill này biến commit đang ở `main` của repo `mobile/` thành bản cài được trên hai store.

**Mặc định (anh chốt 2026-09-13):** build cả hai nền tảng và dừng ở **kênh test**: Android lên Internal testing, iOS lên TestFlight. Đẩy lên Closed/Production hay gửi App Review là **lệnh riêng**, chỉ làm khi người dùng nói rõ (xem mục "Lệnh riêng").

## Bối cảnh cố định

- `mobile/` là **repo git riêng** (`github.com/kido-tth/mobile`), root repo gitignore nó. Commit bump version nằm trong `mobile/`, còn release log nằm ở `docs/` của root.
- `mobile/android` và `mobile/ios` bị gitignore vì EAS prebuild lại từ `app.json` trên cloud. Cấu hình native sửa ở `app.json`, `eas.json` hoặc config plugin, **không** sửa hai thư mục đó.
- `expo.version` trong `mobile/app.json` là versionName của Android và CFBundleShortVersionString của iOS. `versionCode`/`buildNumber` do EAS giữ (`appVersionSource: remote` + `autoIncrement`), đừng tự đặt.
- Profile `production` nhúng `KIDO_API_URL=https://api.dodokids.vn`; `app.config.js` đọc biến này lúc build.
- Android: package `com.dodokids.app`. Upload keystore do EAS giữ (bản versionCode 2 build bằng EAS). Play API đi qua service account `kido-server-play@dodokids-play.iam.gserviceaccount.com`, key nằm ở `GOOGLE_PLAY_KEY` trong `kido-server/.env`. Play vẫn coi app là **draft app** (chưa từng publish qua review), nên API chỉ tạo được release `draft`. Vì vậy `eas.json` đặt `releaseStatus: "draft"`, và mỗi bản Android cần anh bấm phát hành trong Console (bước 8).
- iOS: bundle `com.dodokids.app`, Team `T9SMHB8ZL3`, ASC app id `6811548180`. Số này phải trùng `APPLE_APP_APPLE_ID` trên **server production**; lệch là mọi JWS production verify fail âm thầm.
- Expo: account `duyht56`, project `mobile`. Trang build: `https://expo.dev/accounts/duyht56/projects/mobile/builds/<id>`.

Trạng thái store đổi liên tục. Đọc live (`play.mjs status`, App Store Connect) thay vì tin con số trong tài liệu.

## Công cụ đi kèm

Chạy từ root repo.

| Script | Dùng để |
|---|---|
| `bash .claude/skills/release-mobile/scripts/preflight.sh [all\|android\|ios]` | Kiểm tra chỉ-đọc: git, EAS login, `eas.json`/`app.json`, quyền so với baseline, `/health`, lint + tsc + contract tests (~30 giây), build number remote. Exit 1 nếu có `[BLOCK]`. |
| `node .claude/skills/release-mobile/scripts/play.mjs <lệnh>` | Google Play Developer API, không cần dependency: `status`, `notes`, `promote`, `rollout`, `halt`. Mọi lệnh ghi mặc định là **dry run**: Play validate thay đổi rồi edit bị huỷ. Chỉ khi thêm `--commit` thay đổi mới được áp. |

## Quy trình mặc định

### 1. Chốt phạm vi

Từ câu của người dùng, xác định nền tảng (mặc định cả hai), version, và release notes đã có chưa. Đọc `expo.version` và commit của bản store gần nhất để biết có gì mới:

```bash
cd mobile && eas build:list -p android --limit 1 --json --non-interactive   # trường gitCommitHash
```

Quy tắc version:
- Version hiện tại **chưa lên production** ở store nào và Apple **chưa duyệt** nó: giữ nguyên được, EAS tự tăng build number. Đây là trường hợp thường gặp khi lặp bản test.
- Apple đã duyệt hoặc phát hành version đó (train đã đóng), hoặc version đã lên Play production: phải bump. Patch cho sửa lỗi, minor cho tính năng mới, major khi thay đổi lớn.
- Người dùng không nói: hỏi một câu (giữ / patch / minor) kèm đề xuất theo quy tắc trên.

### 2. Preflight

```bash
bash .claude/skills/release-mobile/scripts/preflight.sh all
```

- `[BLOCK] uncommitted changes`: EAS upload cả working tree, nên WIP sẽ lọt vào bản build. Đừng tự commit hay stash hộ, vì đó thường là việc dở của phiên khác. Liệt kê file rồi hỏi anh: commit trước, stash, hay build từ worktree sạch (xem Troubleshooting).
- `[BLOCK] not logged in`, lần đầu build iOS, hoặc chưa có key submit: đọc `references/first-time-setup.md`. Đăng nhập EAS và Apple ID + 2FA là việc anh tự gõ trong terminal của mình; Claude không nhập mật khẩu hay tạo credential hộ.
- `[WARN]` quyền mới: xử lý mục "Quyền mới" bên dưới trước khi đi tiếp.
- `[BLOCK]` khác: sửa (lỗi code thì theo `docs/AI_IMPLEMENTATION_FLOW.md`) hoặc dừng và báo.

### 3. Release notes

Viết nháp tiếng Việt từ các commit user-facing (`feat`, `fix`) kể từ bản trước; bỏ `chore`, `docs`, `refactor`, `test`. Người đọc là phụ huynh: câu ngắn, cụ thể, không hứa điều `docs/KIDO_MARKETING_CLAIMS.md` không cho phép. Nhắc tới Đô Đô thì xưng hô theo `docs/KIDO_DODO_PERSONA.md`. Tối đa 500 ký tự (giới hạn của Play). Cùng một nội dung dùng cho Play "Có gì mới" và TestFlight "What to Test". Lưu vào một file trong scratchpad để truyền cho các lệnh.

### 4. Xác nhận kế hoạch trước mọi bước ra ngoài

Tóm tắt rồi chờ anh đồng ý:
- version (giữ, hay bump lên số nào) và commit `mobile` sẽ được build (`git -C mobile log -1 --oneline`)
- nền tảng và đích: Play Internal, TestFlight
- release notes
- việc làm ở local: commit bump `app.json` (nếu bump), thêm một dòng vào release log

Mỗi lần build tốn quota EAS (gói free có trần build mỗi tháng, iOS tính riêng). Nhắc anh khi phải build lại nhiều lần.

### 5. Bump version (nếu có)

Sửa đúng trường `"version"` trong `mobile/app.json` bằng Edit. Đừng chạy `prettier --write`: config lệch source và sẽ format lại cả file. Commit trong `mobile/` với message `chore(release): v<version>`, chỉ gồm `app.json`. Chưa push; hỏi ở bước 9.

### 6. Build và auto-submit

```bash
cd mobile && eas build --platform all --profile production \
  --auto-submit --non-interactive --freeze-credentials --no-wait --json \
  --message "v<version> $(git log -1 --format=%h)" \
  --what-to-test "$(cat <notes-file>)"
```

- `--auto-submit` gắn submission vào build ngay lúc tạo, và EAS tự submit phía server khi build xong. Vì vậy `--no-wait` không làm mất bước submit. Android đi theo `submit.production.android` (track `internal`, `releaseStatus: draft` khi app còn draft); iOS lên App Store Connect/TestFlight.
- `--freeze-credentials` chặn EAS tự tạo hay đổi credential ở chế độ non-interactive. Keystore Android bị đổi thì Play từ chối mọi bản sau.
- stdout là một mảng JSON các build. Lấy `id` và `platform` của từng build rồi dựng link trang build.
- Chỉ một nền tảng: dùng `--platform android` hoặc `--platform ios` (với Android thì bỏ `--what-to-test`).
- Lệnh fail trước khi tạo được build (thiếu credential, thiếu key submit…): đọc `references/first-time-setup.md`.

### 7. Chờ build

Build cloud mất khoảng 15–40 phút, cộng thời gian xếp hàng (gói free có lúc lâu). Vài phút kiểm một lần, đừng poll dày:

```bash
cd mobile && eas build:view <id> --json
```

Các trường cần đọc:
- `status`: `NEW`, `IN_QUEUE`, `IN_PROGRESS` là còn chờ; `FINISHED` là xong; `ERRORED` hoặc `CANCELED` thì mở log trên trang build.
- `appVersion`, và `appBuildVersion` (versionCode/buildNumber mới).
- `gitCommitHash`, `artifacts.buildUrl`.

`build:view` không có trạng thái submission. Kiểm ở store (bước 8).

### 8. Kiểm ở store

Android:

```bash
node .claude/skills/release-mobile/scripts/play.mjs status
```

Thấy `appBuildVersion` mới trên track `internal` là upload xong. Dòng `draft app:` ở cuối output quyết định bước tiếp theo.

1. Gắn release notes: chạy dry run, cho anh xem, rồi chạy lại với `--commit`:

   ```bash
   node .claude/skills/release-mobile/scripts/play.mjs notes --track internal --version-code <N> --notes-file <f>
   node .claude/skills/release-mobile/scripts/play.mjs notes --track internal --version-code <N> --notes-file <f> --commit
   ```

2. `draft app: yes` (đúng tại 2026-09-13): release mới nằm ở trạng thái `draft`, và API không phát hành thay được. Nhờ anh vào Console → Kiểm thử nội bộ → mở bản nháp → xem xét → bấm bắt đầu phát hành (roll out). Claude có thể mở sẵn trang, nhưng cú bấm phát hành là của anh. Xong thì chạy lại `status`: release phải chuyển sang `completed`.
3. `draft app: no`: Play đã cho phát hành qua API. Nếu `submit.production.android` còn `"releaseStatus": "draft"` thì bỏ dòng đó (commit riêng trong `mobile/`) để các bản sau phát hành thẳng. Bản vừa nộp vẫn là nháp, nên anh roll out nó như bước 2.

Submission Android thường xong vài phút sau build. Quá ~15 phút vẫn chưa thấy thì xem tab Submissions trên trang build và mục Troubleshooting.

iOS: Apple xử lý 5–30 phút sau khi upload rồi build mới hiện trong TestFlight (anh nhận email "has completed processing"). Nếu Claude in Chrome đang đăng nhập App Store Connect, mở `https://appstoreconnect.apple.com/apps/6811548180/testflight/ios` để xác nhận; không thì nhờ anh xem. Tester nội bộ chỉ tự nhận bản mới khi group bật Automatic Distribution (hoặc thêm `groups` vào `submit.production.ios`).

### 9. Ghi lại và báo cáo

- Thêm một dòng vào `docs/MOBILE_RELEASE_LOG.md` ở root repo. Chưa có file thì tạo, với header:
  `| Ngày | Version | Android versionCode | iOS build | Commit mobile | Đích | AAB SHA-256 | EAS builds | Ghi chú |`
  SHA-256 lấy từ phần bundles của `play.mjs status`.
- Báo anh một bảng ngắn: version, build number, đích, link.
- Nêu việc còn lại của anh: cài từ link Play Internal hoặc TestFlight để smoke test. IAP chỉ nghiệm thu trên bản cài từ store.
- Hỏi có push commit bump không (`git -C mobile push`). Chỉ push khi anh đồng ý.

## Lệnh riêng: chỉ khi người dùng yêu cầu rõ

Các lệnh dưới đây chạm tới người dùng thật hoặc nội dung công khai. Làm dry run hoặc tóm tắt trước, chờ anh đồng ý **cho đúng bước đó**, rồi mới làm. Đồng ý ở bước này không áp cho bước sau.

- **Android promote / rollout / halt**: xem `references/android.md`. Ví dụ Internal lên Closed: `play.mjs promote --from internal --to alpha --version-code N`. Production cần Production access: tài khoản cá nhân phải qua closed test ≥12 tester trong 14 ngày. Nếu Play từ chối vì chưa có quyền này thì đó không phải lỗi script.
- **iOS gửi App Review / phát hành**: xem `references/ios.md`. Nộp review làm trên ASC web. Claude soát checklist và có thể điều khiển Chrome nếu anh muốn, nhưng cú bấm "Submit for Review" cần anh xác nhận.
- **Tag production**: khi một version lên production ở store nào đó, tag trên đúng commit đã build: `git -C mobile tag -a v<version> <gitCommitHash> -m "v<version>"`. Push tag khi anh đồng ý.

## Quyền mới / tính năng nhạy cảm

Làm các bước sau khi preflight báo quyền mới, hoặc khi bản này ship mic, camera, analytics hay SDK bên thứ ba:
- Android: `docs/GOOGLE_PLAY_GOLIVE_CHECKLIST.md` §2.5 (permission/SDK inventory) và Data safety; riêng `RECORD_AUDIO` xem §2.4b.
- iOS: `docs/APPLE_APP_STORE_GOLIVE_CHECKLIST.md` mục "Khi ship tính năng Luyện phỏng vấn" và App Privacy label.
- Privacy policy phải được cập nhật **trước** khi release bản có mic, vì policy hiện cam kết "Không ghi âm".
- Khai báo xong thì thêm quyền đó vào `ANDROID_BASELINE` / `IOS_BASELINE` trong `scripts/preflight.sh`.

Internal testing và TestFlight vẫn là bản phát cho người thật, nên làm khai báo trước khi upload bản có quyền mới.

## Guardrails

- Không build từ working tree bẩn. Không commit hộ những thay đổi không thuộc bản release.
- Không in, commit hay dán vào chat các secret: `GOOGLE_PLAY_KEY`, `*.p8`, keystore, `EXPO_TOKEN`. `play.mjs` tự đọc key và không in ra.
- Không đặt tay versionCode/buildNumber. Khi thật sự phải sửa số remote, dùng `eas build:version:set`; số mới phải lớn hơn số lớn nhất đã upload lên store.
- Không đổi `ios.supportsTablet` về `false` khi đã có bản iPad trên store: người dùng iPad sẽ không nhận được bản cập nhật.
- Không sửa quyền của service account Play. Mỗi lần sửa phải chờ lan quyền ~36–48 giờ.

## Troubleshooting

| Triệu chứng | Xử lý |
|---|---|
| `Only releases with status draft may be created on draft app` | App còn là draft app mà release không phải `draft`. Đặt lại `"releaseStatus": "draft"` trong `submit.production.android` (hoặc thêm `--draft` cho `play.mjs promote`), submit lại bằng `eas submit -p android --profile production --id <build-id> --non-interactive`, rồi anh roll out trong Console. |
| `Changes cannot be sent for review automatically` | Console đang có thay đổi chờ gửi review. Đặt `"changesNotSentForReview": true` (eas.json) hoặc thêm `--changes-not-sent-for-review` (play.mjs), rồi anh gửi review trong "Tổng quan về công bố". |
| `Version code N has already been used` | versionCode remote thấp hơn store. Chạy `eas build:version:set -p android` với số lớn hơn versionCode lớn nhất trong `play.mjs status`. |
| Play báo AAB ký sai key | Keystore trên EAS khác upload key của Play. So SHA-1 trong `eas credentials -p android` với Console → App integrity (Tính toàn vẹn của ứng dụng). Không tạo keystore mới. |
| iOS non-interactive fail vì credential, hoặc submit iOS fail xác thực | Chưa có Distribution cert/profile hoặc ASC API key trên EAS: `references/first-time-setup.md`. |
| `The train version 'x' is closed` / `CFBundleShortVersionString must be higher` | Apple đã duyệt version đó. Bump version rồi build lại. |
| Hàng đợi cloud quá lâu hoặc hết quota | Dùng `eas build --local` (xem dưới). |
| Working tree bẩn nhưng cần ship một commit sạch | Tạo worktree detached: `git -C mobile worktree add "$TMPDIR/dodokids-release" <commit>`, rồi `npm ci` và chạy build trong đó. Cần bump thì commit trên nhánh `release/v<version>` trong worktree và hỏi anh cách đưa về `main`. Xong thì `git -C mobile worktree remove`. |

`eas build --local` chạy build trên Mac này, vẫn dùng credentials và số build remote của EAS (nên vẫn cần login) nhưng không tốn quota cloud:
- Android cần `JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home` và `ANDROID_HOME=$HOME/Library/Android/sdk`. Thêm `--output <file>.aab`.
- iOS cần CocoaPods (`/opt/homebrew/bin/pod`, set `LANG=en_US.UTF-8`) và fastlane (máy này chưa có: `brew install fastlane`). Build local dùng Xcode 26.6 trên máy và bỏ qua `image` của cloud.
- Build local không tự submit. Sau khi build xong, chạy `eas submit -p <platform> --profile production --path <file> --non-interactive`.
