# KIDO — Thông báo đồng ý của ba mẹ, nguyên văn theo phiên bản (CANONICAL)

> Doc canonical, dùng làm bằng chứng về **nội dung** ba mẹ đã đồng ý. Mỗi phiên bản của
> màn đồng ý trong app được lưu ở đây **đúng từng chữ** như trên màn hình. Bản ghi đồng ý
> trên Household chỉ lưu `noticeVersion`; chữ ứng với phiên bản đó nằm ở file này, để in
> hoặc sao chép được khi cần chứng minh (Luật 91/2025/QH15 Điều 9 khoản 3, cần luật sư
> xác nhận).
> Nguồn: change `add-parental-consent` (lập 2026-09-14).

## Quy tắc

- **Đồng bộ phiên bản.** Bảng `PARENTAL_CONSENT_NOTICES` của server
  (`kido-server/src/modules/anonymous-sessions/parental-consent.constants.ts`) và hằng
  `PARENTAL_CONSENT_NOTICE_VERSION` của mobile (`mobile/src/constants/legal.ts`) phải liệt
  kê cùng các phiên bản với file này. Mọi phiên bản server chấp nhận, và phiên bản mobile
  đang hiển thị, đều phải có một mục ở đây với chữ khớp từng ký tự với màn hình.
- **Thêm, không sửa.** Đổi chữ trên màn đồng ý thì tạo phiên bản mới: thêm một mục mới ở
  cuối file. **Không bao giờ sửa mục của phiên bản đã phát hành**, kể cả lỗi chính tả.
  Không xoá mục cũ, kể cả khi đã gỡ phiên bản đó khỏi bảng của server, vì bản ghi đồng ý
  đã lưu vẫn trỏ tới nó.
- **Tên phiên bản** là ngày ISO `YYYY-MM-DD`. `policyVersion` đi kèm là ngày "Cập nhật lần
  cuối" của trang Chính sách bảo mật (`LEGAL_UPDATED` trong
  `landing/src/components/sections/LegalPage.tsx`) lúc phát hành phiên bản đó.
- **Thứ tự khi thêm phiên bản:** thêm mục ở đây → thêm khoá vào bảng server và deploy
  server → đổi hằng của mobile rồi build. Household đã đồng ý phiên bản cũ sẽ được hỏi
  lại khi lên build mang phiên bản mới.

## Danh sách phiên bản

| `noticeVersion` | `policyVersion` | Trạng thái |
|---|---|---|
| `2026-09-15` | `2026-09-15` | Bản nháp, chưa phát hành. |

---

## Phiên bản `2026-09-15`

> **Ngày phát hành dự kiến 15/09/2026**, cùng ngày đăng trang Chính sách bảo mật mới. Nếu
> trang đó lùi sang ngày khác trước lần phát hành đầu tiên, đổi đồng loạt: tên mục này,
> dòng trong bảng trên, khoá trong bảng server, hằng của mobile và `LEGAL_UPDATED` của
> landing. Sau khi phát hành, mục này đóng băng.

| | |
|---|---|
| Màn hình | `ParentConsent` (`mobile/src/screens/auth/ParentConsentScreen.tsx`), hai chế độ: `first_run` (cài mới, trước `SetupScreen`) và `reconsent` (household tạo trước khi có bước này) |
| `policyVersion` | `2026-09-15` (trang Chính sách bảo mật ghi "Cập nhật lần cuối: 15/09/2026") |
| `method` | `in_app_adult_check_checkbox_v1`: câu hỏi người lớn, rồi ô xác nhận không đánh sẵn |
| `declaredRole` | `parent_or_guardian` |
| `purposes` | `learning_service` |

Trong các bảng dưới, cột "Chữ trên màn hình" là nguyên văn. `{n}` và `{dd/mm/yyyy}` là chỗ
app điền giá trị lúc chạy.

### 1. Bong bóng Đô Đô (cả hai chế độ)

> Bé gọi ba mẹ tới giúp Đô Đô nha!

### 2. Bước A — Xác nhận người lớn (cả hai chế độ)

| Vị trí | Chữ trên màn hình |
|---|---|
| Nhãn nhỏ | DÀNH CHO BA MẸ |
| Tiêu đề | Xác nhận người lớn |
| Mô tả | Trước khi tạo hồ sơ cho bé, ba mẹ nhập kết quả phép tính: |
| Đề (ví dụ; phép cộng viết bằng chữ, sinh ngẫu nhiên, đổi sau mỗi lần sai) | mười bốn cộng bảy |
| Ô nhập, placeholder | ? |
| Ô nhập, nhãn trợ năng | Nhập kết quả phép tính |
| Khi sai | Chưa đúng. Ba mẹ thử phép tính mới nhé. |
| Khi đang khoá (3 lần sai liên tiếp thì khoá 30 giây; `{n}` là số giây còn lại) | Ba mẹ thử lại sau {n} giây nhé. |
| Nút chính | Tiếp tục |
| Nút phụ (chỉ chế độ `first_run`) | Quay lại |

### 3. Bước B — Đồng ý, chế độ lần đầu (`first_run`)

| Vị trí | Chữ trên màn hình |
|---|---|
| Nhãn nhỏ | DÀNH CHO BA MẸ |
| Tiêu đề | Ba mẹ đồng ý để Dodokids tạo hồ sơ cho bé? |
| Lời dẫn | Vì bé còn nhỏ, Dodokids cần ba mẹ hoặc người giám hộ đồng ý trước khi lưu thông tin của bé. |
| Gạch đầu dòng 1 (icon `users`) | **Lưu gì:** tên gọi hoặc biệt danh, tuổi, hình đại diện và tiến độ học của bé. |
| Gạch đầu dòng 2 (icon `target`) | **Để làm gì:** đưa bài học hợp tuổi, lưu tiến độ và làm báo cáo cho ba mẹ. Không quảng cáo, không bán dữ liệu. |
| Gạch đầu dòng 3 (icon `lock`) | **Ai lưu, ở đâu:** Dodokids (do Hoàng Tư Duy vận hành), trên máy chủ đặt tại Việt Nam, cho tới khi ba mẹ xoá. |
| Gạch đầu dòng 4 (icon `settings`) | **Quyền của ba mẹ:** xem, sửa hoặc xoá dữ liệu bất cứ lúc nào trong Khu vực phụ huynh → Cài đặt. |
| Link (mở `https://dodokids.vn/privacy`) | Đọc Chính sách bảo mật đầy đủ |
| Link, nhãn trợ năng | Mở Chính sách bảo mật |
| Ô xác nhận (không đánh sẵn) | Tôi là cha, mẹ hoặc người giám hộ của bé và đồng ý để Dodokids xử lý các thông tin trên cho việc học của bé. |
| Nút chính (mờ, không bấm được cho tới khi tick) | Đồng ý và tiếp tục |
| Nút phụ | Không đồng ý |
| Ghi chú nhỏ | Dodokids ghi lại thời điểm ba mẹ đồng ý và phiên bản nội dung này để làm bằng chứng. Ba mẹ rút lại đồng ý bằng cách xoá dữ liệu gia đình. |
| Khi lưu đồng ý thất bại (mất mạng, 429) | Chưa lưu được. Ba mẹ kiểm tra kết nối rồi thử lại nhé. |

### 4. Bước B — Đồng ý, chế độ household cũ (`reconsent`)

Chỉ tiêu đề và lời dẫn khác chế độ lần đầu. Các dòng còn lại được chép lại nguyên văn để
in riêng được.

| Vị trí | Chữ trên màn hình |
|---|---|
| Nhãn nhỏ | DÀNH CHO BA MẸ |
| Tiêu đề | Ba mẹ xác nhận giúp Dodokids |
| Lời dẫn | Hồ sơ của bé được tạo trước khi Dodokids thêm bước xin phép ba mẹ. Ba mẹ xem và xác nhận một lần để bé học tiếp. |
| Gạch đầu dòng 1 (icon `users`) | **Lưu gì:** tên gọi hoặc biệt danh, tuổi, hình đại diện và tiến độ học của bé. |
| Gạch đầu dòng 2 (icon `target`) | **Để làm gì:** đưa bài học hợp tuổi, lưu tiến độ và làm báo cáo cho ba mẹ. Không quảng cáo, không bán dữ liệu. |
| Gạch đầu dòng 3 (icon `lock`) | **Ai lưu, ở đâu:** Dodokids (do Hoàng Tư Duy vận hành), trên máy chủ đặt tại Việt Nam, cho tới khi ba mẹ xoá. |
| Gạch đầu dòng 4 (icon `settings`) | **Quyền của ba mẹ:** xem, sửa hoặc xoá dữ liệu bất cứ lúc nào trong Khu vực phụ huynh → Cài đặt. |
| Link (mở `https://dodokids.vn/privacy`) | Đọc Chính sách bảo mật đầy đủ |
| Link, nhãn trợ năng | Mở Chính sách bảo mật |
| Ô xác nhận (không đánh sẵn) | Tôi là cha, mẹ hoặc người giám hộ của bé và đồng ý để Dodokids xử lý các thông tin trên cho việc học của bé. |
| Nút chính (mờ, không bấm được cho tới khi tick) | Đồng ý và tiếp tục |
| Nút phụ | Không đồng ý |
| Ghi chú nhỏ | Dodokids ghi lại thời điểm ba mẹ đồng ý và phiên bản nội dung này để làm bằng chứng. Ba mẹ rút lại đồng ý bằng cách xoá dữ liệu gia đình. |
| Khi lưu đồng ý thất bại (mất mạng, 429) | Chưa lưu được. Ba mẹ kiểm tra kết nối rồi thử lại nhé. |

### 5. Bước C — Chưa đồng ý

**Chế độ lần đầu (`first_run`)**

| Vị trí | Chữ trên màn hình |
|---|---|
| Nhãn nhỏ | DÀNH CHO BA MẸ |
| Tiêu đề | Ba mẹ chưa đồng ý |
| Nội dung | Dodokids chưa lưu thông tin nào của bé. Khi sẵn sàng, ba mẹ quay lại bước này nhé. |
| Nút (về bước B) | Xem lại |
| Nút (về slide giới thiệu) | Về trang giới thiệu |

**Chế độ household cũ (`reconsent`)**

| Vị trí | Chữ trên màn hình |
|---|---|
| Nhãn nhỏ | DÀNH CHO BA MẸ |
| Tiêu đề | Ba mẹ chưa đồng ý |
| Nội dung | Chưa có đồng ý của ba mẹ, Dodokids không thể tiếp tục lưu dữ liệu của bé. Ba mẹ có thể xem lại, hoặc xoá dữ liệu gia đình. Gói đăng ký (nếu có) không bị huỷ theo, ba mẹ cần huỷ riêng trong cửa hàng ứng dụng. |
| Nút (về bước B) | Xem lại |
| Nút (xoá household bằng `deleteHouseholdData()`) | Xoá dữ liệu gia đình |

Hộp thoại xác nhận xoá dùng lại nguyên các chuỗi đang có trong `confirmDelete` của
`mobile/src/components/ParentGateModal.tsx`:

| Vị trí | Chữ trên màn hình |
|---|---|
| Tiêu đề | Xoá vĩnh viễn? |
| Nội dung | Thao tác này không thể hoàn tác. |
| Nút huỷ | Huỷ |
| Nút xác nhận | Xoá vĩnh viễn |
| Khi xoá lỗi (máy chủ chưa xoá), tiêu đề | Chưa xoá được |
| Khi xoá lỗi (máy chủ chưa xoá), nội dung | Không kết nối được máy chủ. Dữ liệu của bé vẫn còn nguyên. Vui lòng thử lại. |

### 6. Cài đặt → Dữ liệu gia đình

Dòng chỉ đọc, đặt trên "Xoá dữ liệu gia đình", chỉ hiện khi household có bản ghi đồng ý.
`{dd/mm/yyyy}` là ngày của `grantedAt`.

| Vị trí | Chữ trên màn hình |
|---|---|
| Dòng | Ba mẹ đã đồng ý ngày {dd/mm/yyyy} |
| Chú thích | Muốn rút lại đồng ý, ba mẹ xoá dữ liệu gia đình. |
