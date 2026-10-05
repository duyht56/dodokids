# Playbook sự cố production — Dodokids

> Cập nhật: 2026-10-05 · Nguồn: code và cấu hình đã commit, dẫn đường dẫn ngay tại từng mục (`kido-server/…` là repo `kido-tth/backend`). Dữ kiện chỉ có trên Play Console hoặc do owner quan sát thì ghi rõ tại chỗ; điều chưa kiểm được ghi UNVERIFIED.
> Phạm vi: Android 1.0.0 trên Google Play (production, chỉ Việt Nam, Managed publishing BẬT theo owner 05/10), `kido-server` trên VPS `/opt/kido-app` (repo `kido-tth/backend`), nội dung tuần 1–8 đang live.
> Mỗi kiểu sự cố chỉ có **một cần gạt**. Gặp tín hiệu ở §3 thì kéo đúng cần gạt ở §4, không ứng biến.

## 0. Người trực

| Vai trò | Người | Ghi chú |
|---|---|---|
| Trực chính | Owner | Nhận email GitHub Actions, xem Play Console, hộp thư support@dodokids.vn |
| Trực thứ hai | _(chưa chỉ định: điền tên + cách liên lạc)_ | Cần có quyền SSH VPS hoặc Play Console để kéo cần gạt khi owner vắng |

Trong 72 giờ đầu sau Publish và suốt tuần ra mắt: mỗi ngày xem Play Console → Android vitals (crash, ANR) và Đánh giá; trả lời support@ trong 02 ngày làm việc. **Không đổi quyền service account `kido-server-play@…` trong tuần này** (owner ghi nhận 11–13/09/2026: sau lần đổi quyền cuối, endpoint tài chính trả 401 khoảng 36 giờ; Google nói có thể tới 48 giờ).

## 1. Giám sát tự động: `kido-server/.github/workflows/monitor.yml`

Chạy mỗi giờ ở phút 23 (một job, khoảng 1 phút Actions mỗi lần). Job đỏ thì GitHub gửi email. Với lịch `schedule`, email đi tới người sửa dòng cron gần nhất, nên owner phải là người push file này. Kiểm thêm GitHub → Settings → Notifications → Actions. Đây là kiểm sâu mỗi giờ, **không** phải cảnh báo nhanh: API sập có thể tới khoảng 1 giờ, cộng độ trễ lịch của GitHub, mới có email (xem "Chưa có").

| Kiểm | Ý nghĩa | Đỏ khi |
|---|---|---|
| `GET https://api.dodokids.vn/health` từ ngoài, 4 lần cách 20 s | Caddy và ít nhất một replica còn sống. Không kiểm Mongo, Redis hay IAP (`kido-server/src/health/health.controller.ts`) | Cả 4 lần không trả 200 |
| Replica `api`, kể cả replica đã thoát | `docker-compose.yml` đặt 4 replica | Replica nào in `KHONG CHAY (<trạng thái>)` hoặc `EXEC_FAIL` (không đọc được env của replica), hoặc 0 replica chạy. Chạy dưới 4 chỉ in CANH BAO |
| `GOOGLE_PLAY_KEY` trên từng replica đọc được | Parse được JSON, có `private_key`, `client_email` đúng `kido-server-play@dodokids-play.iam.gserviceaccount.com`. Nhánh thiếu key trả 503 mà **không ghi log** (`iap.service.ts`, hàm `googlePlay`), nên phải kiểm trực tiếp. Không gọi Google: key bị thu hồi hay mất quyền vẫn ra OK ở đây | Bất kỳ replica nào FAIL |
| `PARENTAL_CONSENT_ENFORCE_ALL` trên từng replica đọc được | In `true` hoặc `false` theo đúng luật của `children.service.ts` (chỉ chuỗi `true` mới bật) | Các replica lệch nhau, hoặc lệch GitHub variable (nếu đã đặt) |
| Đếm log `api` từ lần quét trước | `play_service_account_unusable`, `play_key_invalid`, `play_acknowledge_failed`, `apple_verifier_broken`, `nest_unhandled_exception` (lỗi chưa bắt, trả 500) | Bất kỳ số nào > 0 |
| | `play_unavailable` (Google lỗi tạm, app nhận 503 `store_unavailable`) | ≥ 5 |
| | `nest_client_error_4xx` (client gửi request hỏng: 400 request aborted, 413, 415; Nest vẫn log các lỗi này qua ExceptionsHandler), `play_token_rejected`, `iap_conflict_409`, `child_without_consent_legacy` | Chỉ để theo dõi |

**Cửa sổ quét log.** Quét xong, Monitor ghi thời điểm bắt đầu lần quét vào `~/.kido-monitor/last_scan` trên VPS. Lần sau đọc log từ mốc đó, nên GitHub chạy trễ hay bỏ một lần cũng không lọt dòng nào. Lần đầu (hoặc file hỏng) quét 65 phút. Mốc cũ hơn 6 giờ thì chỉ quét 6 giờ gần nhất và in CANH BAO. `docker compose logs` lỗi thì con trỏ giữ nguyên, lần sau quét lại. Hệ quả cần nhớ:

- **Mỗi dòng log chỉ làm đỏ một lần.** Lần chạy sau xanh **không** có nghĩa lỗi đã hết. Xử lý theo email đỏ đầu tiên (§3).
- `apple_verifier_broken` chỉ được log **một lần lúc container khởi động** (`kido-server/src/modules/iap/apple-jws.verifier.ts`, `onModuleInit`). Vì vậy nó chỉ đỏ ở lần quét đầu sau mỗi lần boot, dù iOS vẫn trả 503 về sau. iOS chưa live; sau khi ra mắt iOS nên đổi sang kiểm trực tiếp.
- **Log mất theo container.** `docker compose logs` chỉ đọc container còn tồn tại. Deploy (`up -d --build`, `--force-recreate` trong `deploy.yml`) xoá container cũ cùng log của nó, nên dòng ghi sau lần quét gần nhất mà trước deploy sẽ không bao giờ được quét. Vì vậy chạy Monitor tay **ngay trước** mỗi lần deploy server. Sửa tận gốc là cho `deploy.yml` quét log trước khi tạo lại container: chưa làm.

Log Actions lưu ngoài Việt Nam, nên workflow **chỉ in OK/FAIL và số đếm**. Nó không in key, dòng log (dòng log có householdId) hay stderr của `docker compose` (lỗi parse `.env` trích nguyên dòng, kể cả key). Muốn đọc dòng log thì SSH vào VPS và chỉ xem ở đó.

**Chạy tay:** GitHub → `kido-tth/backend` → Actions → *Monitor kido-server* → Run workflow (nhánh `main`). Hoặc dùng `gh workflow run monitor.yml -R kido-tth/backend`, rồi `gh run watch -R kido-tth/backend`. Chạy khi:

- **ngay trước** khi push `main` hoặc Run workflow Deploy, để quét log của các container sắp bị thay;
- **ngay sau** mỗi lần deploy server: chạy Monitor, rồi dò 402 bằng household nháp (§4 (B) bước 4), vì Monitor không biết service account còn quyền hay không;
- sau khi đổi secret/variable, hoặc khi nghi có sự cố.

Nếu job đỏ trùng lúc deploy đang tạo lại container, chạy lại một lần trước khi kéo cần gạt.

**Khoá SSH của Monitor.** Monitor dùng cùng `SSH_PRIVATE_KEY` với deploy, mỗi giờ một lần. Action đã được ghim theo commit (`appleboy/ssh-action@0ff4204…`, tức v1.2.5) thay vì tag `v1`; `deploy.yml` vẫn dùng `@v1`. Owner nên:

1. Tạo secret `SSH_HOST_FINGERPRINT` để chống MITM. Trên VPS chạy `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub | cut -d' ' -f2` (ra dạng `SHA256:…`), dán vào secret, rồi chạy Monitor tay. Nếu bước SSH đỏ vì sai vân tay, làm lại với `ssh_host_ecdsa_key.pub` (action chọn loại khoá host nào: UNVERIFIED). Chưa đặt secret thì Monitor không kiểm host key, giống `deploy.yml` hiện nay.
2. Về sau: tạo user SSH riêng cho Monitor, chỉ chạy được script kiểm (forced command), để Monitor không cầm khoá deploy. Cho user vào nhóm `docker` không đủ, vì nhóm này tương đương root.

**Chưa có:**

- **Uptime check 5 phút báo về điện thoại.** Owner cần tạo một uptime check bên ngoài cho `https://api.dodokids.vn/health`, 5 phút một lần, có push về điện thoại (dịch vụ miễn phí nào cũng được; gói free có push hay không: UNVERIFIED). Nếu owner chấp nhận chỉ có Monitor mỗi giờ thì ghi waiver vào đây: _(chưa quyết: ngày, người ký)_.
- **Cron trên VPS mỗi 5 phút:** chưa có. Tạm thời Monitor mỗi giờ thay cho nó.
- **Không có gì báo khi chính Monitor ngừng chạy** (hết phút Actions, workflow bị tắt, GitHub Actions sự cố). Trong tuần ra mắt, mỗi ngày mở tab Actions xem có lần chạy trong khoảng 1 giờ qua không.
- **Không kiểm quyền service account Play.** Monitor chỉ parse key. Key bị thu hồi trên GCP hoặc mất quyền trên Play Console chỉ lộ ra khi một phụ huynh thật mua gói (`play_service_account_unusable`). Hiện bù bằng dò 402 sau mỗi lần deploy. Có thể thêm vào Monitor: trong một replica, gọi `purchases.subscriptions.get` với token giả; 400/404 là còn quyền, 401/403 là mất quyền (owner đã kiểm cách đọc này ngày 13/09/2026). Chưa làm.
- Crash reporting trên mobile (chỉ có Android vitals), log cho `rate_limited` (`kido-server/src/common/rate-limit/rate-limit.guard.ts` không log), OTA, min-version gate. `/health` không ping Mongo/Redis.

## 2. Cấu hình server: sửa trên GitHub, không sửa tay `.env`

`kido-server/.github/workflows/deploy.yml` (chạy khi push `main` hoặc Run workflow) ghi hai biến này vào `/opt/kido-app/.env`. Khi `.env` đổi, nó tự `force-recreate` api (khoảng 20 s trả 502).

- **`GOOGLE_PLAY_KEY`:** lấy từ repository secret `GOOGLE_PLAY_KEY_B64` (base64 của dòng JSON key). Deploy giải mã, từ chối nếu không bắt đầu bằng `{`, và chỉ thay đúng dòng `GOOGLE_PLAY_KEY='…'`. Muốn đổi key: sửa secret → Run workflow *Deploy kido-server* → chạy Monitor.
- **`PARENTAL_CONSENT_ENFORCE_ALL`:** lấy từ repository variable (Settings → Secrets and variables → Actions → Variables). Chỉ nhận `true` hoặc `false`; giá trị khác làm deploy dừng trước khi đụng `.env`. Chưa đặt variable thì deploy giữ dòng cũ. Server chỉ đọc biến này lúc boot. Muốn đổi: sửa variable → Run workflow Deploy → Monitor phải in giá trị mới trên cả 4 replica.
- Không mở `.env` bằng trình soạn thảo. Ngày 16/09, dòng key bị gãy khi sửa tay, và IAP trả 503 (xem chú thích ở bước `GOOGLE_PLAY_KEY` trong `deploy.yml`).

## 3. Ngưỡng kích hoạt

| Tín hiệu | Cần gạt |
|---|---|
| Bất kỳ phụ huynh nào báo "Chưa xác minh được giao dịch"; Monitor đỏ ở `GOOGLE_PLAY_KEY=FAIL` hoặc `play_*`; hoặc dò 402 sau deploy không ra 402 | (B) IAP |
| Ngay sau một lần deploy server: Monitor đỏ ở bước External (`curl -sS https://api.dodokids.vn/health` tay để xác nhận), ở `KHONG CHAY`, `EXEC_FAIL` hoặc `nest_unhandled_exception` | (D) bước 1–4: revert |
| Không có deploy nào trước đó: API sập (Monitor đỏ ở bước External, `curl` tay xác nhận) hoặc replica `KHONG CHAY`/`EXEC_FAIL`. Hiện chỉ biết qua email Monitor, tức chậm tới khoảng 1 giờ cộng độ trễ lịch GitHub (§1 "Chưa có") | (D) bước 5: khởi động lại, không revert |
| `nest_unhandled_exception` > 0 khi không có deploy nào trước đó | Đọc stack trên VPS: `docker compose logs --since 3h api \| grep -A 12 ExceptionsHandler`. Lỗi trong code server → (D) bước 1–4. Lỗi do client gửi request rác mà Monitor chưa loại → không kéo cần gạt; thêm tên lỗi vào danh sách loại trừ trong `monitor.yml` và §1 cùng lúc |
| Crash hay treo tái hiện được ở luồng chính (mở app, tạo hồ sơ bé, học bài, PIN phụ huynh, paywall); hoặc vitals vượt ngưỡng hành vi xấu của Play | (A) Hotfix app |
| Bài sai: đáp án, hình, âm thanh, câu chữ sai hoặc không hợp lứa tuổi | (C) Nội dung |

## 4. Cần gạt

### (A) App lỗi chặn người dùng → hotfix 1.0.x

1. Sửa trong `mobile/`, rồi phát hành **1.0.1 trở lên** qua skill `release-mobile`: preflight → build → Internal → kiểm trên máy thật cài từ Play → promote production.
2. Managed publishing đang **BẬT**. Google duyệt xong, owner phải tự bấm **Publish** trong Console (Publishing overview), nếu không bản sửa nằm chờ mãi. Thời gian review không biết trước.
3. **Không dùng `play.mjs halt` cho bản đầu.** Bản đầu phát hành 100% (`completed`), còn `halt` của `play.mjs` chỉ dừng được release `inProgress` (`.claude/skills/release-mobile/scripts/play.mjs`, hàm `halt`). Dòng "Sự cố: halt" trong `references/android.md` không áp dụng. Halt bản 100% ngay trong Console: UNVERIFIED, kiểm ở Release dashboard khi có sự cố. Staged rollout (và `halt`) dùng được từ bản cập nhật đầu tiên.
4. Nếu lỗi do server trả dữ liệu làm app vỡ thì sửa server bằng (D), nhanh hơn chờ review.
5. Cách cuối cùng: "Unpublish app" trong Console để chặn cài mới. Máy đã cài vẫn chạy (UNVERIFIED).

### (B) IAP hỏng → chẩn đoán, rồi tạm ngừng bán nếu chưa sửa được

1. Chạy Monitor bằng tay. Trên VPS (`cd /opt/kido-app`), chỉ đọc, và chỉ xem trên terminal VPS:
   ```bash
   docker compose ps -a api
   docker compose logs --since 2h api | grep -E 'Google Play|GOOGLE_PLAY_KEY|ExceptionsHandler' | tail -n 30
   ```
2. Đọc kết quả:
   - `KHONG CHAY (…)` hoặc `EXEC_FAIL`: replica chết hoặc đang khởi động lại, **không phải** lỗi key. Đừng sửa secret. Xử lý theo (D): ngay sau deploy thì bước 1–4, không có deploy thì bước 5.
   - `GOOGLE_PLAY_KEY=FAIL` hoặc `play_key_invalid`: key thiếu hoặc hỏng. Sửa secret `GOOGLE_PLAY_KEY_B64` → Deploy → Monitor (§2).
   - `play_service_account_unusable` (401/403, OAuth bị từ chối): service account mất quyền trên Play Console, hoặc key bị thu hồi trên GCP. Kiểm Users and permissions và key trên GCP. Đừng đổi quyền thử: quyền lan mất 36–48 giờ (§0).
   - `play_unavailable` cao: Google hoặc mạng lỗi tạm. App tự thử lại. Chỉ theo dõi, trừ khi kéo dài nhiều giờ.
   - `play_acknowledge_failed`: Google tự hoàn tiền đơn chưa acknowledge sau 3 ngày. App cũng acknowledge qua `finishTransaction`. Theo dõi Console → Order management.
3. Chưa sửa được trong vài giờ: Console → Monetize with Play → Products → Subscriptions, **deactivate base plan `monthly` của `kido_monthly_139k` và base plan `annual` của `kido_annual_999k`** để ngừng thu tiền mới (mỗi gói chỉ có một base plan, theo Console ngày 11/09/2026). Người đang thuê bao vẫn được gia hạn theo tài liệu Google (UNVERIFIED).
4. Sửa xong: bật lại hai base plan, chạy Monitor, rồi **dò 402 bằng household nháp**. Mỗi lệnh ghi cần owner duyệt. Phải chạy đủ năm lệnh theo đúng thứ tự: `verify-android` bắt buộc có `childId` và tìm hồ sơ bé trước khi gọi Google (`kido-server/src/modules/iap/dto/verify-android.dto.ts`, `iap.service.ts`). Thiếu bước 2 thì bước 3 nhận 409 `parental_consent_required`; thiếu bước 3 thì bước 4 nhận 404. Các mã này không phải lỗi IAP.
   1. `POST /anonymous-sessions/register`, body `{deviceId: <UUID v4 mới>, deviceSecret: <43–64 ký tự A-Z a-z 0-9 _ ->}`. Các lệnh sau kèm header `Authorization: Bearer kidods_<deviceId>.<deviceSecret>`.
   2. `POST /anonymous-sessions/parental-consent`, body `{noticeVersion: "2026-09-15"}`.
   3. `POST /children` kèm header `X-Kido-Client-Features: parental-consent-v1`, body `{name: "Probe", age: 5}`. Lấy `childId` trong kết quả.
   4. `POST /iap/verify-android`, body `{childId, purchaseToken: "probe-invalid", productId: "kido_monthly_139k"}`. **402 `token_invalid`** nghĩa là key và quyền đều ổn. 503 `iap_not_configured` nghĩa là key hỏng, hoặc service account bị 401/403.
   5. `POST /anonymous-sessions/household/delete`, body `{confirm: true}`.

   Giao dịch bị lỗi tự lành ở lần mở app tiếp theo.

### (C) Nội dung sai → sửa rồi republish nguyên tuần

1. **Không bao giờ unpublish một activity đang live** (`POST /admin/published/:id/unpublish`). Lệnh này `$pull` activity khỏi lesson; lesson còn 7 activity nên bị bỏ qua, và bé bị kẹt (`kido-server/src/modules/publish/publish.service.ts` hàm `unpublish`, `lessons.service.ts` hàm `findToday`). Nếu lỡ tay, `POST /admin/published/:id/republish` trả activity về nhưng **nối vào cuối** lesson (`$addToSet`). Cả server lẫn app đều không sắp lại theo `activityIndex`, nên thứ tự bài bị đổi. Cách trả lại an toàn là publish lại nguyên tuần như bước 2, vì `publish:week` ghi lại mảng activity theo đúng thứ tự.
2. Sửa trong pipeline và cho qua Human Gate. Sau đó, trong `kido-pipeline/`, chạy `npm run publish:week -- N --dry-run`, rồi `npm run publish:week -- N`. Báo cáo phải là `40/40 written, 0 rejected`. Republish giữ lessonId, nên plan tuần đã chốt vẫn hợp lệ.
3. Server cache bài hôm nay 5 phút (`lesson:today`, `lessons.service.ts`), và app cũng giữ bài 5 phút (`TODAY_LESSON_STALE_MS`, `mobile/src/hooks/useTodayLesson.ts`). Vì vậy bản sửa có thể mất khoảng 10 phút mới tới máy. Bé đang ở trong bài vẫn chơi nội dung cũ cho tới khi mở lại bài.

### (D) Deploy server hỏng → `git revert` trên `main`

1. Trong `kido-server`, chạy `git revert <sha>` trên `main` rồi push. `deploy.yml` tự chạy `git reset --hard origin/main` và tạo lại container (khoảng 20 s 502). Sau đó chạy Monitor bằng tay, rồi dò 402 bằng household nháp ((B) bước 4).
2. **Không bao giờ đưa server về dưới `004c469`** (parental consent; luật rollback ở `openspec/changes/add-parental-consent/design.md`). Dưới mốc này, máy cài mới treo ở màn đồng ý (POST 404). Muốn nới consent thì chỉ đặt variable `PARENTAL_CONSENT_ENFORCE_ALL=false` rồi Deploy.
3. Không `push --force`, không sửa code trực tiếp trên VPS (lần deploy sau sẽ xoá). Lỗi do `.env` thì sửa qua secret/variable (§2).
4. Nếu không gấp, deploy vào giờ thấp điểm, vì mỗi lần deploy gây khoảng 20 s 502 cho mọi người.
5. **Server chết mà không có deploy nào trước đó** (API sập, replica `KHONG CHAY`/`EXEC_FAIL`): không revert. Trên VPS (`cd /opt/kido-app`), xem `docker compose ps -a` và `docker compose logs --tail 50 api` (chỉ xem trên VPS) để tìm nguyên nhân, ví dụ Mongo/Redis dừng, hết RAM hoặc hết đĩa. Service hay replica ở trạng thái `exited` thì chạy `docker compose up -d` để khởi động lại (không đổi code, không đổi `.env`), rồi chạy Monitor. Không SSH được vào VPS thì liên hệ nhà cung cấp VPS.

## 5. Mongo: CHƯA có backup

Backup Mongo production **chưa được thiết lập**; owner đang quyết. Mongo nằm trong một volume duy nhất (`mongo_data`, `kido-server/docker-compose.yml`) trên một VPS. Vì vậy, trước **mọi** lệnh ghi tay vào Mongo (xoá household, sửa purchase binding, sửa activity), phải dump tay và kiểm bản dump:

```bash
cd /opt/kido-app && umask 077
F=~/kido-$(date +%Y%m%d-%H%M).archive.gz
docker compose exec -T mongo mongodump --db kido --archive --gzip > "$F" && echo DUMP_OK
gzip -t "$F" && echo GZIP_OK
docker compose exec -T mongo mongorestore --archive --gzip --dryRun -v < "$F" 2>&1 | grep -E 'archive prelude `kido\.(households|children|purchasebindings)`'
```

Chỉ ghi vào Mongo khi thấy đủ `DUMP_OK`, `GZIP_OK` và ba dòng `archive prelude` cho `kido.households`, `kido.children` và `kido.purchasebindings`. Hai lệnh kiểm không ghi gì vào Mongo. `gzip -t` đọc hết file nên bắt được bản dump bị cắt giữa chừng. `--dryRun` chỉ đọc phần đầu archive (thử ngày 05/10 trên Mongo local: file bị cắt cụt vẫn qua dryRun), nên không thay được `gzip -t`.

Bản dump có dữ liệu trẻ em. Chỉ giữ trên VPS hoặc máy được mã hoá của owner, không gửi qua chat hay email, và xoá khi không còn cần.

## 6. Sau mỗi sự cố

Ghi một dòng gồm thời điểm, tín hiệu, cần gạt đã kéo, kết quả và việc còn nợ. Hotfix mobile ghi thêm vào `docs/MOBILE_RELEASE_LOG.md`. Nếu ngưỡng ở §3 báo nhầm hoặc báo trễ, sửa ngưỡng trong file này và trong `monitor.yml` cùng lúc.
