## Why

Tìm quy luật cần grammar và uniqueness validator riêng; nếu ghép vào game toán khác, nguy cơ sinh chuỗi nhiều đáp án hoặc dùng visual clue ngoài ý muốn sẽ khó review. Change riêng giữ construct và test surface rõ ràng.

## What Changes

- Thêm grammar AB, AAB, ABB, ABC, lượng tăng/giảm và dãy số bước 1/2.
- Generator chọn token, lặp grammar, ẩn một vị trí hợp lệ và tính đáp án từ grammar.
- Validator chứng minh đáp án duy nhất, giới hạn số thuộc tính thay đổi theo level và cấm background/position/size làm clue.
- UI hỗ trợ chọn hoặc kéo token vào vị trí trống, với primitive shape/color/number/dot được duyệt.
- Thêm progression, audio templates và property tests với tối thiểu 200 exercise hợp lệ.

## Capabilities

### New Capabilities

- `explore-pattern-game`: Versioned pattern grammar, deterministic generator, uniqueness validator, UI and progression.

### Modified Capabilities


## Impact

- Depends on `add-explore-foundation`.
- `mobile`: pattern row/slot renderer and interactions.
- `mobile`: local grammar configs, generator/validator, primitive tokens and deterministic tests for offline play.
- `kido-server`: optional public config delivery only; no child play persistence.
