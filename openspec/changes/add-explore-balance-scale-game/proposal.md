# Đề xuất: Cân thăng bằng (`balance_scale`) — toán tư duy "đổi" trên cân

## Why

Phiếu "Toán tư duy cân nặng" ở trường mầm non/lớp 1 (cân mẫu "1 quả lê = 2 quả
táo", hỏi "2 quả lê = ? quả táo", chọn A/B/C; bắc cầu ô tô → xe máy → xe đạp)
là dạng bài phụ huynh thấy khó giải thích nhất: trẻ không đọc được cân, nghĩ
"nhiều món hơn là nặng hơn", chép số của cân mẫu và không có chiến lược. Owner
yêu cầu 2026-10-16 thêm game dạng này vào Khám phá, có hướng dẫn để bé tự hiểu
và luyện tới thuần thục.

`balance_scale` từng bị bỏ ở Đợt 3 vì trùng cơ chế so sánh số lượng của
`quantity_compare`. Game đó đã gỡ hẳn ngày 2026-09-22, và dạng bài lần này là
suy luận **thay thế** (đổi một món to lấy k món nhỏ), một construct khác hẳn.
Khám phá hiện chưa có game nào dạy nó.

## What Changes

- **Game local, offline, stateless mới** `balance_scale` ("Cân thăng bằng"),
  một exerciseType, mode qua `params.mode`, 6 bậc:
  - `balance`, `heavier` (L1): cân nghiêng theo từng món; bên chìm là bên nặng.
  - `measure` (L2): tự thả món nhỏ tới khi thăng bằng để tìm ra "1 to = k nhỏ".
  - `exchange` (L3): chạm từng món to để đổi ra k món nhỏ, rồi xếp đĩa kia và
    **Thả cân** để kiểm.
  - `predict` (L4–L5): tự đổi trong đầu, cân được giữ tới khi bé thả.
  - `choose` (L5): dạng phiếu A/B/C, thẻ chép-cân-mẫu là bẫy bắt buộc.
  - `chain`, `reverse` (L6): bắc cầu hai cân mẫu và đổi ngược (nhiều nhỏ → to).
- **Hướng dẫn cài trong game**: lời Đô Đô từng bước, bàn tay gợi ý khi bé chưa
  chạm, cân nghiêng thật khi sai (không nói đáp án), trợ giúp 2 mức (cân mẫu
  nhịp sáng → mở chạm-để-đổi / bóng mờ nhóm), và **diễn lại phép đổi + câu kết
  luận sau mỗi bài đúng**.
- **Run policy authored 6 slot có `levelOffset`**: bé mới đi trọn cung
  balance → heavier → measure → exchange → predict → choose trong một lượt; phụ
  huynh nâng bậc bắt đầu bằng `startingLevelByGame` sẵn có, kèm tiêu chí 6 bậc.
- **Generator deterministic + validator độc lập** (bất biến số học từng mode,
  replay byte-identical, thẻ k bắt buộc ở `choose`).
- **Batch audio một lần → pack `explore-audio-vi-v6`**: ~114 câu liền
  (`bal_ask`, `bal_is`, `bal_tap`) + ~24 clip ngắn, VieNeu `dodo-clone2` temp
  0.7, qua Human Gate.
- `EXPLORE_GAME_CODES` ba nơi thêm `balance_scale` (13 mã); kido-server mirror.

## Capabilities

### New Capabilities

- `explore-balance-scale-game`: puzzle cân thăng bằng 6 bậc dạy suy luận thay
  thế, với cân sống/cân giữ, chạm-để-đổi, generator deterministic + validator
  độc lập, authored run 6 slot có levelOffset và trợ giúp không lộ đáp án.

## Impact

- **Mobile Explore**: `games/balanceScaleGame.ts`,
  `renderers/BalanceScaleRenderer.tsx` + `renderers/balanceScale/*`,
  `registry.ts`, `variety.ts`, `rendererRegistry.tsx`, `promptAudio.ts`,
  `promptLines.ts` + `explorePromptLines.generated.json`, `thumbnails.ts`,
  `masteryCriteria.ts`, `types/explore.ts`, `ExploreCatalogScreen.tsx`
  (nhóm), `exploreAudioCapability.ts` (pack v6), script
  `verify-explore-balance-scale-contracts.cjs` + `test:explore-balance-scale`.
- **kido-server**: `explore.types.ts`, `explore.registry.ts`, spec đếm catalog.
- **kido-pipeline**: mirror `exploreAudioInventory.ts`, pack v6, batch gen.
- **docs**: `kido-explore-contract.ts`, BRD §7.14, `AI_CONTEXT.md`,
  `KIDO_EXPLORE_THUMBNAIL_PROMPTS.md`.
- **Không** đổi schema lesson, curriculum, progress, reward, analytics hay
  `explore-stateless-privacy`: mọi trạng thái chơi chỉ nằm trong bộ nhớ.
  Không đổi shape `ExploreRunSlot`/`ExploreRunPolicy`.
