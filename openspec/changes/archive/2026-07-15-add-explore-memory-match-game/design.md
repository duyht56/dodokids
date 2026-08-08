## Context

Không có lesson activity tương đương memory board. Game cần quản lý card states, lock input khi hai thẻ đang resolve, board responsive và asset-pair eligibility.

## Goals / Non-Goals

**Goals:** deterministic board 2–8 cặp, không timer/thua, asset rõ ràng và interaction an toàn khi tap nhanh.

**Non-Goals:** competitive scoring, move leaderboard, countdown, online multiplayer hoặc image generation lúc runtime. Một card-back artwork được tạo/review ở build time và bundle tĩnh trong app vẫn nằm trong phạm vi.

## Decisions

### D1 — Exercise chỉ chứa identities và permutation

Generator sample N unique approved asset IDs, duplicate each, rồi Fisher–Yates bằng shared PRNG. Payload lưu ordered card IDs/checksum. Validator xác nhận mỗi identity xuất hiện đúng hai lần và replay permutation.

### D2 — Similarity policy theo level

Asset metadata có `memoryEligible`, theme/object/color/variant. L1–L2 cấm cùng objectCode khác variant và ưu tiên semantic distance; level cao có thể cho controlled similarity nhưng không dùng background/noisy asset.

### D3 — Explicit state machine

Mobile states: `idle -> oneRevealed -> resolving -> matched|idle -> complete`. Khi resolving, tap mới bị ignore; mismatch úp lại sau delay ngắn, không phát ngôn ngữ tiêu cực. Revealed/matched state chỉ tồn tại trong memory của lượt hiện tại; thoát game hủy board và lần vào sau sinh board mới.

### D4 — Board geometry theo pair count

Grid config versioned cho 4/6/8/12/16 cards, với minimum 64pt target, aspect ratio cố định và scroll chỉ khi device nhỏ không đạt target size. Orientation change không shuffle card order.

### D5 — Static reviewed card-back artwork

Mặt sau thẻ dùng một raster artwork không chữ, được tạo một lần theo palette Explore, review rồi bundle bằng static `require`. Game không gọi image-generation service lúc chơi và không phụ thuộc network để hiển thị board.

## Risks / Trade-offs

- [8 cặp quá chật trên phone] → responsive grid/scroll và device snapshot tests.
- [Asset gần giống gây frustration] → metadata constraints, low-level semantic distance và representative review.
- [Double tap race] → reducer/state-machine tests và input lock.

## Migration Plan

1. Thêm asset eligibility audit và generator tests.
2. Ship renderer internal với 2–4 pairs.
3. Canary 6/8 pairs sau tablet/phone QA.
4. Disable game flag để rollback; không ảnh hưởng session runtime khác.

## Open Questions

- Delay mismatch mặc định sẽ được tune bằng usability test và giữ trong game config.
