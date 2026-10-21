# Thiết kế: Dẫn đường và Soi gương theo bậc

## 1. Dẫn đường: chạy hỏng là một lần sai

Luật bậc tính một bài "đúng ngay lần đầu" khi không có `onAnswer(false)` nào
trước `onAnswer(true)`. Renderer Dẫn đường trước đây chỉ kêu `onTryAgainSound`
khi chạy hỏng, nên mọi bảng đều 6/6. Giờ, sau khi Đô Đô đi hết đường (hoặc tới
chỗ bị chặn), mọi kết quả khác `completed` gọi đúng một `onAnswer(false)`; bảng
và hàng lệnh giữ nguyên để bé sửa. Phần "try again" chuyển sang màn chơi (nhánh
sai luôn kêu `try_again`), renderer không kêu lần hai.

Màn chơi coi Dẫn đường là:

- `SELF_VOICED_MISS_GAMES`: renderer nói đúng lỗi («Có chướng ngại ở đây…»), nên
  màn chơi không nói câu chung «nhìn kỹ từng lựa chọn» và không hiện hàng gợi ý.
- `BOARD_GUIDANCE_GAMES` (mới): bảng chiếm hết chiều cao tới nút điều khiển và
  có bong bóng lời dẫn riêng. Màn chơi không đặt chữ "Bé thử lại nhé." dưới
  bảng khi sai; lời khen «Đúng rồi!» và lời lên bậc nổi phía trên bảng (đè lên
  bong bóng) trong lúc bảng khoá (`phase === 'transition'`), nên ô bảng không co
  lại rồi giãn ra. Ngân sách chiều cao của spec layout server vẫn để 90 pt cho
  dải này nên không đổi.

Hỗ trợ leo thang của renderer (sau 2 lần hỏng chỉ bước lỗi / ô mục tiêu còn
thiếu) giữ nguyên; mức hỗ trợ của màn chơi không đổi gì trên bảng này.

## 2. Bỏ chế độ liên tục

Dẫn đường là game cuối cùng chạy liên tục. Màn chơi bỏ `routeLevel`,
`routeVariantKeys`, `runComplete`, `presentNextExercise`, `finishContinuousRun`,
`CONTINUOUS_RUN_TARGET`, `ROUTE_RUN_FINAL_LEVEL`; mobile bỏ
`nextRoutePlannerLevel`/`ROUTE_PLANNER_MAX_LEVEL`. `isContinuousExploreRunGame`
còn lại (luôn `false`) vì contract Xếp tháp — đang làm ở nhánh khác — còn gọi
nó; dọn sau khi gộp.

## 3. Đồng hồ đi tạm dừng được, nhánh tĩnh

Renderer giữ một bộ `createPausableTimers()` riêng: bước đi 340 ms, nhịp kết
thúc, lời dẫn chờ chuông 420 ms. `paused` → `timers.pause()`, hết tạm dừng →
`unpause()`; unmount → `clear()`. Giảm chuyển động (`useReduceMotionSetting()`
là `true`): đặt `stepIndex` thẳng về cuối đường (Đô Đô ở ô cuối, mọi ô đã qua tô
nhạt `#5E8A7E`), giữ 900 ms rồi báo kết quả. Khi chưa biết thiết lập (`null`),
Đô Đô vẫn đi từng bước như cũ.

## 4. Soi gương: vòng 4/3/1

Một bài Soi gương là tô 2–11 ô rồi bấm Xong, dài hơn hẳn một lần chạm chọn. Owner
duyệt vòng 4 bài, đúng ngay 3 thì lên bậc, tối đa 1 vòng thêm.
`LEVELED_ROUNDS.mirror_build = { roundSize: 4, passCount: 3, maxRepeats: 1 }`.
Contract leveled-rounds giữ một bảng luật mong đợi theo game (mặc định 6/4/1,
Soi gương 4/3/1, Cân thăng bằng có pass mark riêng) nên mọi game mới phải khai
báo rõ luật nào. Kho bậc 1 (capacity 30) đủ cho ≥ 3 vòng không lặp.

## 5. Gợi ý một cặp, không lần theo được

`mirrorBuildDemoPair(params, selected)` chọn cặp bé đang sai: trước hết ô cần tô
mà chưa tô, xa gương nhất (chỗ bé chép thay vì soi hay sai), hàng trên trước;
nếu không còn ô thiếu thì một ô tô thừa (nguồn bên trái trống). Renderer gọi nó
MỘT lần mỗi bảng, lúc `supportLevel` lên 1 (lần Xong sai đầu), rồi giữ cặp đó:
vòng cam ở ô nguồn, đoạn gương của hàng đó và ô tương ứng; bóng hình trượt từ ô
nguồn qua gương sang ô đích hai lần (native driver; giảm chuyển động thì chỉ
vòng tĩnh). Bé chạm ô đích thì gợi ý tắt — không có ô nào khác sáng lên.
`supportLevel` 2 (lần sai thứ hai) hiện chấm khoảng cách tới gương trên đầu mỗi
cột (1 = sát gương), không nói ô nào cần tô. Không làm mờ hay khoá ô nào.

Vì mỗi bảng cần ≥ 2 ô và chỉ một cặp được chỉ, chiến lược "chỉ chạm ô sáng rồi
Xong" không giải được bảng nào (contract chơi qua renderer thật 150 bảng).

## 6. Bài bất đối xứng

Generator rút mẫu nửa trái tối đa 24 lần (seed con `cells:<n>`) tới khi
`mirrorBuildCopyIsWrong` — nửa trái khác ảnh gương của chính nó. Validator từ
chối bài tự đối xứng. 10.000 seed mỗi bậc: chép nguyên đúng 0 bài (trước: 13,44%
ở bậc 1). `minOn` mọi bậc ≥ 2.

## 7. Ô chạm đo thật, bậc 5 mọc thêm hàng

8 cột một hàng (bậc 5 cũ 4 × (2·4)) cần ≥ 8·44 + gương + khe = 380 pt, quá màn
375 pt kể cả bỏ lề; trên màn 320 pt thì không thể. Bậc 5 thành 5 × (2·3): 15 ô
mỗi bên (cũ 16), vẫn 6–11 ô tô; độ khó tăng bằng số hàng thay vì khoảng cách
tới gương (tối đa 3 thay 4).

`mirrorBuildCellLayout(width, rows, cols, maxGridHeight)`: ô lớn tới 68 pt,
không dưới 44 pt; lưới ở trong cột chơi (lề 20 pt) khi ô 44 pt vừa, nếu không thì
lấn vào lề (cách mép màn 8 pt), rồi mới thu khe 6 → 4 pt. Chiều cao lấy từ vùng
chơi đo bằng `onLayout` (trừ vùng nút Xong 110 pt, khoảng cách, hàng chấm 12 pt
luôn giữ chỗ để mức 2 không làm lưới đổi cỡ); khung đầu ước lượng từ cửa sổ.

Đo trên harness (render renderer thật, đọc style từng ô phải): 320 pt — 44 pt mọi
bậc 2–5 (bậc 1: 63); 375 pt — 49 pt bậc 2–4, 44 pt bậc 5 (theo chiều cao màn
667); 430 pt — 58 pt. Trên iOS Simulator SE 375×667: bậc 5 ô 44 pt, khe 6 pt,
lưới 244/247 pt ngân sách, nút Xong và dải phản hồi vẫn trên màn.

Giới hạn còn lại: máy 320 pt mà cao ≤ 640 pt thì bậc 5 (5 hàng × 44 pt) đẩy nút
Xong xuống dưới mép khoảng 24 pt; giữ ô 44 pt thay vì thu nhỏ.

## 8. Phiên bản và server

`mirror-build-v2` (generator, validator, config, manifest, dependency '2'):
cùng seed giờ ra bài khác. kido-server mirror bằng `BundledLocalGameSpec.version`
— cùng từng dòng với nhánh `fix/explore-missing-cell-leak` để hai nhánh gộp
không xung đột. Dẫn đường không đổi generator nên giữ v1.

## 9. Câu mới (audio v8)

| id | câu |
| --- | --- |
| `route_intro_2` | Bây giờ có chướng ngại, bé dẫn Đô Đô đi vòng nhé! |
| `route_intro_3` | Bây giờ có ngôi sao, bé ghé lấy sao rồi mới về nhà nhé! |
| `route_intro_4` | Bây giờ cửa nhà bị khóa, bé lấy chìa khóa trước nhé! |
| `route_intro_5` | Bây giờ có điểm số một và số hai, bé đi đúng thứ tự nhé! |
| `mirror_intro_2` | Bây giờ mỗi bên có ba cột, bé soi thật kỹ nhé! |
| `mirror_intro_3` | Bây giờ bảng có bốn hàng, bé soi từng hàng nhé! |
| `mirror_intro_4` | Bây giờ có nhiều ô hơn để tô, bé nhìn khoảng cách tới gương nhé! |
| `mirror_intro_5` | Bây giờ bảng có năm hàng, bé soi từng hàng thật kỹ nhé! |
| `mirror_hint_pair` | Bé nhìn nhé, hai ô cách gương bằng nhau. |

`mirror_hint_pair` là dòng hỗ trợ của Soi gương ở cả hai mức
(`supportHintPhraseId`), thay câu chung «Hãy nghe lại rồi nhìn kỹ từng lựa chọn
nhé.» vốn nói về lựa chọn mà bảng này không có.
