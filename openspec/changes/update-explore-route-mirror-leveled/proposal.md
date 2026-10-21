# Đề xuất: Dẫn đường và Soi gương chơi lượt theo bậc (`update-explore-route-mirror-leveled`)

## Why

Review 12 game Khám phá ngày 2026-10-21 (Codex, `tmp/explore-review-2026-10-21/`,
mục A05–A08, A13, E03, E09) chỉ ra ở hai game chưa chơi theo bậc:

- **Dẫn đường cho Đô Đô** chạy "liên tục": xong một chặng là lên chặng (1→5),
  kể cả khi bé chạy hỏng nhiều lần rồi mới đúng; chạy hỏng không báo ra màn chơi
  (renderer chỉ gọi `onAnswer(true)`), nên không thể chơi theo bậc (A06). Đồng
  hồ đi 340 ms/bước không dừng khi tạm dừng và không có nhánh giảm chuyển động
  (A13). Thanh trên ghi "Chặng 1/5" và tô sẵn một đoạn ở bài đầu, khác các game
  theo bậc (E09).
- **Soi gương** chạy mỗi bậc một bài (A06). Sau một lần bấm Xong sai, ô đúng kế
  tiếp được viền, tô xong thì viền nhảy sang ô kế — lần theo viền là xong
  10.000/10.000 bài; mức 2 làm mờ mọi ô không cần tô, nên ô còn sáng chính là
  đáp án (A07). 13,44% bài bậc 1 có nửa trái tự đối xứng, chép nguyên là đúng
  (A08). Ô bậc 5 chỉ 37×37 pt cách 3 pt trên màn 375 pt; contract vẫn qua vì chỉ
  đọc hằng `MIN_CELL = 44` (A05, E03).

Owner chốt ngày 2026-10-21: bật lượt theo bậc cho Dẫn đường (sau khi mọi lần
chạy hỏng được báo) và Soi gương (vòng 4 bài, đúng ngay 3 thì lên bậc, vì mỗi bài
dài). Xếp tháp và Xe buýt chưa bật lần này.

## What Changes

- **Dẫn đường** (`RoutePlannerRenderer.tsx`, `ExplorePlayScreen.tsx`,
  `registry.ts`):
  - Mỗi lần bấm "Đô Đô đi thôi!" mà không về nhà đủ mục tiêu (mép bảng, chướng
    ngại, cửa khoá, chưa tới, qua nhà, thiếu sao, sai thứ tự điểm) gọi
    `onAnswer(false)` sau khi Đô Đô đi xong; bé sửa tiếp trên cùng bảng. Màn chơi
    kêu "try again"; renderer tự nói lời dẫn (`SELF_VOICED_MISS_GAMES`), không
    thêm dòng nào dưới bảng (`BOARD_GUIDANCE_GAMES`); lời khen và lời lên bậc nổi
    trên bong bóng khi bảng đang khoá, nên bảng không co lại.
  - Vào `LEVELED_ROUNDS` với luật chuẩn 6/4/1 và câu giới thiệu bậc 2–5. Bỏ
    nhánh continuous của màn chơi (`routeLevel`, `CONTINUOUS_RUN_TARGET`,
    `nextRoutePlannerLevel`…). Thanh trên: "Bậc x/5" + chấm vòng như các game
    theo bậc. `isContinuousExploreRunGame` giữ lại nhưng luôn `false`.
  - Đồng hồ đi và lời dẫn chạy qua `pausableTimers`, giữ khi tạm dừng. Giảm
    chuyển động: không đi từng bước — hiện cả đường một lần (Đô Đô ở ô cuối, các
    ô đã qua tô nhạt), rồi báo kết quả sau 900 ms. Ô đã đi qua được tô nhạt ở cả
    hai chế độ.
- **Soi gương** v2 (`mirrorBuildGame.ts`, `MirrorBuildRenderer.tsx`):
  - Lượt theo bậc với luật riêng 4 bài / đúng ngay 3 / thêm 1 vòng.
  - Gợi ý: lần Xong sai đầu tiên, Đô Đô chỉ MỘT cặp bé đang sai — ô nguồn bên
    trái, đoạn gương và ô cùng khoảng cách bên phải (bóng hình trượt qua gương;
    vòng tĩnh khi giảm chuyển động). Cặp được chọn một lần, chạm ô đó thì gợi ý
    tắt, không nhảy sang ô khác. Lần sai thứ hai: chấm khoảng cách tới gương trên
    mỗi cột (3·2·1 | 1·2·3). Bỏ viền ô kế tiếp và làm mờ ô.
  - Bài nào cũng có phần bất đối xứng: nửa trái không tự đối xứng, chép nguyên
    luôn sai (generator rút lại, validator kiểm). Mỗi bài ≥ 2 ô cần tô.
  - Bậc 5 đổi từ 4 × (2·4) sang 5 × (2·3) (15 ô mỗi bên thay 16, vẫn 6–11 ô
    tô): 8 cột một hàng không giữ được ô 44 pt trên máy 375 pt. Ô tính bằng
    `mirrorBuildCellLayout` từ vùng chơi đo được, không dưới 44 pt; lưới chỉ lấn
    vào lề cột khi màn quá hẹp (320 pt).
  - `mirror-build-v2` cho generator / validator / config / manifest; kido-server
    mirror version 2.
- **Câu mới** (đợt audio v8, chưa render, thiếu clip vẫn chơi được):
  `route_intro_2..5`, `mirror_intro_2..5`, `mirror_hint_pair`.
- **Test**: `test:explore-leveled-rounds` (bảng luật theo game, hai game mới,
  cấm «mình» trong câu giới thiệu), `test:explore-route-planner` (mọi kiểu chạy
  hỏng → đúng một `onAnswer(false)`, tạm dừng giữ bước đi và lời dẫn, giảm chuyển
  động), `test:explore-mirror-build` (chép nguyên 0/10.000 bài mỗi bậc; lần theo
  gợi ý giải 0/150 bảng qua renderer thật; đo ô ở 320/375/430 pt mọi bậc),
  `test:explore-sound`. Harness thêm `knobs.window`.

## Capabilities

### Modified Capabilities

- `explore-session-runtime`: không còn game chạy liên tục; luật lượt theo bậc
  có bảng theo game (mặc định 6/4/1, Soi gương 4/3/1); game có lời dẫn trong
  bảng giữ dải phản hồi gọn.
- `explore-route-planner-game` (spec trong change chưa archive
  `replace-explore-tracing-with-route-planner`): chạy hỏng là một lần sai; lượt
  theo bậc thay tiến trình chặng; tạm dừng và giảm chuyển động.
- `explore-mirror-build-game` (spec trong change chưa archive
  `add-explore-mirror-build-game`): bậc 5, bất đối xứng, gợi ý một cặp thay
  "anchor + làm mờ", ô chạm đo thật.

Delta của hai capability game viết MODIFIED/REMOVED trên các requirement của
change gốc chưa archive; archive change gốc trước rồi mới tới change này.

## Impact

- **mobile** (nhánh `feat/explore-route-mirror-leveled`): `src/explore/registry.ts`,
  `src/explore/promptAudio.ts`, `src/explore/games/mirrorBuildGame.ts`,
  `src/explore/games/routePlannerGame.ts`, `src/explore/renderers/{RoutePlanner,MirrorBuild}Renderer.tsx`,
  `src/screens/child/ExplorePlayScreen.tsx`; script contract leveled-rounds,
  route-planner, mirror-build, sound và harness.
- **kido-server** (nhánh cùng tên, chưa push): `explore.registry.ts`
  (`BundledLocalGameSpec.version`, mirror_build = 2 — cùng cơ chế với nhánh
  `fix/explore-missing-cell-leak`), spec mirror-build và route-planner.
- **kido-pipeline**: nhánh này không có commit pipeline; 9 câu mới đã thêm vào
  `exploreAudioInventory.ts` ở nhánh tích hợp `integrate/explore-2026-10-21`
  (66389c5, local, không push) — kiểm mirror của `test:explore-prompt-audio` đòi
  khi có checkout pipeline cạnh mobile. Còn render trong đợt audio v8.
- **docs**: BRD §6.1, §7 (Dẫn đường), §7.12 (Soi gương), §10; `AI_CONTEXT.md`.
- Không lưu gì (zero history); bậc, số bài đúng lần đầu, số vòng thêm chỉ nằm
  trong màn chơi đang mở.
