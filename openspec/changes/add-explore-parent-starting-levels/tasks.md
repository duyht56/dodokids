# Tasks — add-explore-parent-starting-levels (GĐ0)

## 1. Config + resolve (mobile)

- [x] 1.1 `mobile/src/explore/parentConfig.ts`: thêm
      `startingLevelByGame?: Partial<Record<ExploreGameCode, number>>`;
      per-game thắng global; cập nhật `sanitizeExploreParentConfig`
      (loại key không phải gameCode, giá trị không phải số nguyên dương) +
      `EXPLORE_PARENT_CONFIG_FIELDS` + privacy check
- [x] 1.2 Sửa `resolveStartingLevel`: clamp về level lớn nhất ≤ giá trị chọn
      (ghi chú tường minh trong PR: ảnh hưởng mọi game; levels liền 1..n
      hành vi không đổi)

## 2. Persistence (mobile)

- [x] 2.1 Persist `startingLevelByGame` qua store cha ngoài Explore play
      store (preference của phụ huynh); khôi phục khi mở app; KHÔNG persist
      bất kỳ play state nào của bé

## 3. Màn phụ huynh (mobile)

- [x] 3.1 UI tối thiểu sau parental gate: picker level per-game + hiển thị
      text tiêu chí "đã vững" từng bậc khi game khai (khung khai text tiêu
      chí per-game — `number_bus` sẽ dùng ở GĐ1)
- [x] 3.2 Đây là đường ghi duy nhất — không luồng nào của trẻ gọi
      `setExploreParentConfig`

## 4. Verify

- [x] 4.1 Unit test sanitize (key rác, giá trị rác, per-game thắng global) +
      test clamp `resolveStartingLevel` (levels thưa/ngắn)
- [x] 4.2 `cd mobile && npm run lint` + `npx tsc --noEmit`; contract script
      explore hiện có không vỡ (GĐ0: `npm run test:explore-parent-config`)
- [x] 4.3 Thử trên simulator: đặt level per-game, kill app, mở lại — giá trị
      còn; run game tương ứng khởi đầu đúng level (2026-09-23: giá trị
      persisted number_bus=3 → mở lại app, lượt khởi đầu L3; chưa bấm qua màn
      phụ huynh vì cần PIN)
