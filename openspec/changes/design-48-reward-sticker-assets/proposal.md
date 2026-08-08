## Why

Bộ 48 sticker thưởng hiện đã có stable ID và đường dẫn cố định nhưng toàn bộ PNG vẫn là cùng một ảnh placeholder Đô Đô, nên trẻ không thể nhận biết tiến trình theo tuần hoặc cảm nhận bốn thế giới sưu tập. Cần một art system hoàn chỉnh ngay bây giờ để đóng task artwork của `revise-child-reward-system` mà không thay đổi reward identity hay logic server/mobile đã triển khai.

## What Changes

- Thiết kế 48 sticker PNG khác nhau, đúng chủ thể/name/week hiện có và chia thành bốn world, mỗi world 12 sticker.
- Giữ nguyên tuyệt đối `sticker-w01` đến `sticker-w48` và `world-NN/week-WW.png`; chỉ thay nội dung bitmap.
- Dùng một visual system thống nhất với Kido: hình khối tròn, thân thiện trẻ 4-6 tuổi, silhouette rõ ở cell nhỏ, màu pastel có điểm nhấn theo world và độ bóng vừa phải như mascot hiện tại.
- Xuất PNG vuông có alpha thật, padding/silhouette nhất quán, không chữ, không watermark, không background scene và không chi tiết nhỏ khó nhận biết.
- Tạo manifest nguồn gốc/prompt, contact sheet bốn world, kiểm tra tự động về 48 file, kích thước, alpha, uniqueness, asset mapping và visual QA trên phone/tablet.
- Thay 48 placeholder tại đúng path hiện có sau khi anchor style và toàn bộ export vượt quality gate.
- Không thay API, reward calculation, stable catalog identity, tuần/world mapping hoặc Vietnamese display name trong change này.

## Capabilities

### New Capabilities

- `reward-sticker-art-system`: Quy định visual language, subject mapping, deterministic export, alpha/recognizability gates và review artifacts cho bộ 48 sticker thưởng Kido.

### Modified Capabilities

- Không có. Change này hoàn thiện bitmap implementation của reward catalog hiện hành, không đổi requirement runtime/API của các capability khác.

## Impact

- Affected assets: `mobile/src/assets/images/stickers/world-01..04/week-01..48.png`.
- Affected validation/docs: reward contract script, asset manifest/contact sheets, `docs/KIDO_REWARD_SYSTEM.md`, và checklist của change `revise-child-reward-system` sau khi artwork được duyệt.
- Không thêm runtime dependency và không đổi server/wire schema.
- Generation dùng built-in ImageGen; intermediate chroma-key được xử lý cục bộ thành PNG alpha trước khi thay asset project.
