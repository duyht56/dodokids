## Context

Mobile hiện đã map `audioFiles.question/correct/hint1/hint2/explain` vào `activity.audio.files` và phát URL qua `expo-audio`. `speech.ts` dùng một module-level player và sequence guard, nhưng `speak()` trả về `void`, nên UI không biết clip đã kết thúc, bị hủy hay lỗi.

`ActivityContainer` gọi `onCorrect` ngay sau khi bắt đầu feedback. Hai parent screen sau đó dùng timer 1,2 giây để đổi activity. Khi activity mới mount, cleanup gọi `stop()` rồi question mới bắt đầu; vì vậy audio thường bị **cắt**, và một implementation Continue không có state guard có thể tạo race hoặc hai lần advance.

## Goals / Non-Goals

**Goals:**

- Chỉ một audio session tồn tại tại một thời điểm.
- Đúng lần đầu phát `correct`; đúng sau khi đã sai phát `explain`.
- `hint1`, `hint2`, `explain` được dùng theo attempt khi sai.
- Không lặp `explain` nếu nó đã phát ở lần sai thứ ba.
- Auto-advance sau khi success feedback kết thúc.
- Bé có thể bấm **Tiếp tục** để skip success feedback mà không chồng với question mới.
- Bubble text đồng bộ với clip feedback.
- Missing URL, URL lỗi, unmount và double-tap đều fail-safe.

**Non-Goals:**

- Không thêm TTS text-to-speech.
- Không thay đổi server/pipeline schema hoặc upload audio.
- Không thay đổi `speakCount()`.
- Không refactor mechanics riêng của từng activity component.

## Decisions

### 1. `speech.ts` cung cấp completion contract

`speak(url)` trả về `Promise<PlaybackResult>`:

```ts
type PlaybackResult = 'finished' | 'cancelled' | 'skipped' | 'failed';
```

- `finished`: nhận `didJustFinish`.
- `cancelled`: một `speak()` mới hoặc `stop()` hủy session hiện tại.
- `skipped`: URL thiếu/rỗng.
- `failed`: resolve cache, create player hoặc playback status báo lỗi.

Session giữ player, resolver và settled flag. `settle()` chỉ chạy một lần, release player và resolve Promise. Mọi phát mới settle session cũ bằng `cancelled` trước khi tạo player mới. Một timeout phòng vệ settle `failed` nếu native event không bao giờ kết thúc.

### 2. `ActivityContainer` sở hữu feedback lifecycle

Container dùng state/ref đồng bộ:

```text
answering
  ├─ wrong   → feedbackPlaying(wrong)   → answering
  └─ correct → feedbackPlaying(success) → advancing → parent onCorrect
```

`locked=true` khi không ở `answering`, nên component con không nhận thêm đáp án. Replay bị disable trong feedback. Ref phase chặn hai handler chạy trong cùng render trước khi React commit state.

### 3. Chọn feedback theo attempt

| Event | Clip |
|---|---|
| Correct ở attempt 1 | `correct` |
| Wrong attempt 1 | `hint1` |
| Correct ở attempt 2 | `explain` |
| Wrong attempt 2 | `hint2` |
| Correct ở attempt 3 | `explain`, trừ khi đã phát explain ở wrong attempt 3 |
| Wrong attempt 3+ | `explain` |
| Correct sau khi explain đã phát | `correct` |

`attempt` vẫn được report cho parent để tính first-try score.

### 4. Continue là skip có thứ tự, không phải player thứ hai

Nút **Tiếp tục** chỉ hiện trong success feedback. Khi bấm:

1. Chuyển phase sang `advancing` và tăng feedback token để callback async cũ mất hiệu lực.
2. Gọi `stop()` để cancel/release player hiện tại.
3. Gọi `onCorrect(attempt)` đúng một lần.
4. Parent đổi activity; unmount cleanup gọi `stop()` idempotently.
5. Activity mới mount và phát question.

Nếu audio tự kết thúc trước, completion callback thực hiện bước 3. Double-tap bị phase/ref guard loại bỏ.

### 5. Parent screens không điều khiển thời lượng audio

`LessonPlayerScreen` và `PracticeBankScreen` bỏ `ADVANCE_DELAY_MS`. `handleCorrect` ghi attempt (Lesson) rồi gọi `advance()` ngay. Thời điểm callback đã được container quyết định sau feedback, nên cả hai flow có cùng semantics.

Các timer bubble generic ở parent được bỏ; container hiển thị text feedback từ `audioScript` để bubble và audio URL luôn cùng moment.

## Risks / Trade-offs

- `AudioPlayer.remove()` là imperative; timeout phòng vệ tránh Promise treo nếu native status không về.
- Bấm Tiếp tục có chủ ý cắt feedback, nhưng cắt xong mới chuyển activity nên không đè tiếng.
- Nếu URL thiếu/lỗi, success advance ngay thay vì khóa trẻ ở màn hình lỗi.
- Existing `explain` có thể chưa bắt đầu bằng lời xác nhận tích cực; change này dùng đúng field hiện có nhưng không regenerate content cũ.

## Verification

- Unit test speech service: finished, cancelled bởi speak mới, cancelled bởi stop, skipped, failed.
- Component test/state test: correct lần đầu, wrong→correct, wrong×3→correct không lặp explain, Continue double-tap.
- Screen test: parent không còn timer 1,2 giây và advance đúng một lần.
- Mobile lint/typecheck; runtime dev-client check với bucket URL thật vẫn là manual gate.
