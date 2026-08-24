# Batch audio Khám phá v2 — gom gen một lần

Pack: `explore-audio-vi-v2` · Tổng inventory: 147 key · Đã có clip trong app: 94 · **Cần gen mới: 53** (generate dùng get-or-create theo transcript nên clip cũ được tái dùng).

## Lệnh chạy một lần (kido-pipeline)

```bash
cd kido-pipeline
npm run explore-audio:generate      # TTS toàn bộ inventory còn thiếu → pending_review
npm run explore-audio:review        # nghe từng clip (afplay <path>)
npm run explore-audio:approve -- --all   # Human Gate
npm run explore-audio:export -- ../mobile   # ghi wav + exploreAudioRegistry.generated.ts (v2)
```

## Clip cần gen mới (53)

| Key | Transcript |
|---|---|
| `phrase:arith_remain_q:v1` | Còn lại bao nhiêu? |
| `phrase:route_fb_edge:v1` | Chỗ này là mép bảng rồi, con thử hướng khác nhé. |
| `phrase:route_fb_locked_door:v1` | Cửa đang khóa, con lấy chìa khóa trước nhé. |
| `phrase:route_fb_obstacle:v1` | Có chướng ngại ở đây, con đi vòng nhé. |
| `phrase:route_fb_passed_home:v1` | Đô Đô đi qua nhà mất rồi, con làm lại nhé. |
| `phrase:route_fb_add_arrow:v1` | Đô Đô chưa tới nhà, con thêm mũi tên nhé. |
| `phrase:route_fb_retry:v1` | Đô Đô chưa về được nhà, con làm lại nhé. |
| `phrase:route_fb_need_star:v1` | Nhớ ghé lấy ngôi sao trước khi về nhà nhé. |
| `phrase:route_fb_need_key:v1` | Con cần lấy chìa khóa trước đã nhé. |
| `phrase:route_fb_order:v1` | Đi qua các điểm theo đúng thứ tự rồi hãy về nhà nhé. |
| `phrase:route_fb_check_arrow:v1` | Xem lại mũi tên thứ |
| `phrase:fb_praise_1:v1` | Đúng rồi! |
| `phrase:fb_praise_2:v1` | Giỏi quá! |
| `phrase:fb_praise_3:v1` | Tuyệt vời! |
| `phrase:fb_praise_4:v1` | Con làm được rồi! |
| `phrase:fb_retry_1:v1` | Con thử lại nhé. |
| `phrase:fb_retry_2:v1` | Mình nhìn kỹ lại nhé. |
| `phrase:fb_hint_listen:v1` | Hãy nghe lại rồi nhìn kỹ từng lựa chọn nhé. |
| `phrase:fb_hint_look:v1` | Hãy nhìn kỹ từng lựa chọn nhé. |
| `phrase:fb_level_up:v1` | Giỏi quá! Mình thử phạm vi |
| `phrase:fb_easier:v1` | Mình thử bài dễ hơn nhé. |
| `phrase:fb_run_complete:v1` | Mình luyện xong rồi! |
| `phrase:fb_play_again:v1` | Con muốn chơi lại không? |
| `phrase:fb_break:v1` | Con chơi được một lúc rồi, nghỉ mắt chút nhé! |
| `phrase:game_tap_count:v1` | Chạm và đếm |
| `phrase:game_quantity_compare:v1` | Bên nào nhiều hơn? |
| `phrase:game_number_explorer:v1` | Khám phá số |
| `phrase:game_pattern_finder:v1` | Tìm quy luật |
| `phrase:game_memory_match:v1` | Lật thẻ tìm cặp |
| `phrase:game_number_bond:v1` | Ngôi nhà tách gộp |
| `phrase:game_arithmetic_machine:v1` | Máy cộng trừ |
| `phrase:game_route_planner:v1` | Dẫn đường cho Đô Đô |
| `phrase:game_tracing_workshop:v1` | Xưởng luyện nét |
| `phrase:game_stack_tower:v1` | Xếp tháp cho Đô Đô |
| `phrase:game_odd_one_out:v1` | Ai lạc đàn? |
| `phrase:bond_room_full:v1` | Ô của bé đã đầy. Con bấm Kiểm tra nhé. |
| `phrase:bond_not_enough:v1` | Chưa đủ để tạo thành |
| `phrase:bond_try_adding:v1` | Con thêm thử nhé. |
| `phrase:bond_too_many:v1` | Nhiều quá rồi. Con chạm vào lá để bớt nhé. |
| `phrase:bond_consists:v1` | gồm |
| `phrase:bond_recombined:v1` | gộp lại thành |
| `phrase:tracing_start_star:v1` | Bắt đầu ở ngôi sao rồi đi theo mũi tên nhé. |
| `phrase:tracing_continue_glow:v1` | Mình tiếp tục từ vùng đang sáng nhé. |
| `phrase:tracing_next_stroke:v1` | Mình sang nét tiếp theo nhé. |
| `phrase:tracing_path_done:v1` | Đường đã hoàn thành! |
| `phrase:tracing_corridor_wider:v1` | Đường đã rộng hơn và có hút nét. |
| `phrase:tracing_follow_dots:v1` | Mình nhìn theo các chấm tím nhé. |
| `phrase:tower_big_to_small:v1` | Xếp từ to đến nhỏ nhé. |
| `phrase:tower_short_to_long:v1` | Xếp từ ngắn đến dài nhé. |
| `phrase:tower_low_to_high:v1` | Xếp từ thấp đến cao nhé. |
| `phrase:tower_few_to_many:v1` | Xếp từ ít đến nhiều nhé. |
| `phrase:tower_which_bigger:v1` | Bạn nào to hơn? |
| `phrase:odd_which_different:v1` | Bạn nào khác với các bạn còn lại? |
