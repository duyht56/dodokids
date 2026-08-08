## 1. Audio — speakCount phát audio thật

- [ ] 1.1 Thêm `COUNT_AUDIO_BASE_URL` constant vào `speech.ts` (placeholder URL, confirm với backend)
- [ ] 1.2 Sửa `speakCount(n)` trong `speech.ts` để gọi `speak(\`${COUNT_AUDIO_BASE_URL}/${n}.mp3\`)` thay vì chỉ log
- [ ] 1.3 Giữ guard: chỉ gọi khi `n >= 1 && n <= 10`

## 2. PatternMatrix — tạo component mới

- [ ] 2.1 Tạo `PatternMatrixActivity.tsx` với question container height 160, cells 36×36, "?" placeholder dashed border
- [ ] 2.2 Render answer options: grid 2 cột, mỗi card 120×120, nền trắng đơn giản (1 lớp background)
- [ ] 2.3 Xử lý tap: correct → `onResult('correct')`, wrong → highlight đỏ 900ms rồi reset → `onResult('wrong')`
- [ ] 2.4 Thêm `isPatternMatrix` type guard vào `mobile/src/types/lesson.ts`
- [ ] 2.5 Import và register `PatternMatrixActivity` trong `ActivityContainer.tsx` với guard `isPatternMatrix`

## 3. SortSequence — redesign bank + slot model

- [ ] 3.1 Rewrite state model trong `SortSequenceActivity.tsx`: `bankItems: string[]` + `slots: (string | null)[]`
- [ ] 3.2 Render bank row: items còn trong bank hiển thị dạng card draggable
- [ ] 3.3 Render slot row: N ô đánh số 1..N, hiển thị số nổi bật khi trống, hiện item + số nhỏ khi có item
- [ ] 3.4 Gesture: drag từ bank card → drop trên slot (dùng `onLayout` + tọa độ để detect drop target)
- [ ] 3.5 Tap item đã đặt trong slot → trả về bank
- [ ] 3.6 Disable "Kiểm tra" button khi còn slot trống (`slots.some(s => s === null)`)
- [ ] 3.7 Logic check: so sánh `slots[i]` với `correctById[id] === i + 1`, gọi `onResult`, shake wrong slots
- [ ] 3.8 "Xáo lại": clear slots, reset bank về scrambled order

## 4. Kiểm tra audio wiring trong ActivityContainer

- [ ] 4.1 Verify `useEffect` đã gọi `speak(activity.audio.question)` on mount (đã có — chỉ confirm không bị overwrite)
- [ ] 4.2 Verify `handleResult` đã cycle hints đúng thứ tự hint1 → hint2 → explain (đã có — chỉ confirm)
- [ ] 4.3 Verify `correct` audio được gọi trước `onCorrect` callback (đã có — chỉ confirm)
