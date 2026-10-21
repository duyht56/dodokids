'use strict';
// catalog.cjs — danh mục CẤU TRÚC HOÁN ĐỔI ĐƯỢC (chặt): cấu trúc đạt R1–R11, thư viện S1–S15 (R6/R6b, ba vai
// trò), họ "lọc rồi xếp hạng" S16 không phủ định ≤ 1/3 (ba vai trò) VÀ mọi nhà có món thẻ "có" nằm trong
// một quỹ đạo của Stab(món đó) (cận Bayes "chỉ đọc thẻ có" = 1/(số nhà có món đó) trên TỪNG bàn).
//   CAT  = giữ R5 (mọi món đệm ≥ 2 nhà) → thiết kế đang chọn P1-X, đọc THẲNG từ design §9 `CLUE_STRUCTURES`
//          (design-x.cjs); `node enum.cjs <conf>` vét cạn lại và so khớp với bảng này.
//   CAT5 = R5′ (món chỉ ở nhà 000 được 1 lần) → phương án P1-X′ (design §15, câu hỏi (b)); chép từ vét cạn
//          `R5O=1 node enum.cjs …` (9x3a: tạm dùng 3 cấu trúc của R5, vét R5′ chưa chạy xong).
// Nhà: 0, 1, 2 = món thẻ vị trí 1, 2, 3; ≥ 3 = món đệm. In: node catalog.cjs
const D = require('./design-x.cjs');

const { levels } = D.readDesign();
const CAT = {};
for (const lv of levels) for (const st of lv.structs) {
  CAT[st.conf] = CAT[st.conf] || [];
  if (!CAT[st.conf].some((h) => D.structKey(h) === st.key)) CAT[st.conf].push(st.houses);
}
// Bậc của thiết kế: [cấu hình…], dạng thẻ, tên (cho exact-x / table-x).
const LEVELS = levels.map((lv) => [[...new Set(lv.structs.map((s) => s.conf))], lv.forms, lv.name, lv]);

const P = (list) => list.map(D.parseHouses);
const CAT5 = {
  '8x2': P(['AD BD CD AB AC BC EF EG', 'AD BD CD AB AC BC EF GH']),
  '9x2': P(['AD BD CD AB AC BC EF EG EH', 'AD BD CD AB AC BC EF EG FG', 'AD BD CD AB AC BC EF EG FH', 'AD BD CD AB AC BC EF EG HI', 'AD BD CD AB AC BC EF GH IJ']),
  '8x3': P(['ADE BDF CDG ABG ACF BCE EFG HIJ', 'ADE BDF CEG ABG ACF BCH DGH EFH', 'ADE BDF CFG ABG ACH BCE DGH EFH', 'ADE BFG CDF ABH ACG BCE DGH EFH']),
  '9x3a': P(['ADE BDF CDG ABG ACF BCE EHI FHI GHI', 'ADE BDF CDG ABG ACF BCE EHI FHJ GIJ', 'ADE BDF CEF ABG ACH BCI DHI EGI FGH']),
  '9x3b': P(['ADE BDF CEF ABD ACE BCF ABC DEF GHI']),
};
const F3 = D.FORMS;
const LEVELS5 = [[['8x2'], ['PNN'], 'Đèn soi'], [['8x2'], ['PNN'], 'Tự soi'], [['8x2'], F3, 'Đổi chỗ thẻ'], [['8x3'], F3, 'Nhà ba món'], [['9x3a', '9x3b'], F3, 'Nhiều nhà hơn'], [['9x3a', '9x3b'], F3, 'Nhớ thẻ']];

if (require.main === module) {
  for (const [name, C] of [['CAT (R5, design §9 CLUE_STRUCTURES)', CAT], ['CAT5 (R5′, phương án P1-X′)', CAT5]]) {
    console.log(name);
    for (const [k, list] of Object.entries(C)) { console.log(`  ${k}: ${list.length} cấu trúc`); list.forEach((h) => console.log('     ' + D.showHouses(h))); }
  }
  console.log('Bậc (design §5 + §9): ' + LEVELS.map(([c, f], i) => `B${i + 1} ${c.join('+')} ${f.length > 1 ? 'PNN/NPN/NNP' : 'PNN'}`).join(' · '));
}
module.exports = { CAT, CAT5, LEVELS, LEVELS5 };
