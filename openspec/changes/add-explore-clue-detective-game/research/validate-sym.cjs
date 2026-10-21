'use strict';
// research/validate-sym.cjs — kiểm ĐỘC LẬP bộ sinh đối xứng P1 (bản trước Codex vòng 7) trên đúng 6 bậc của P1
// (p1-design.md, đọc qua design-p1.cjs). Dựng nhà bằng TÊN món thật (pool 14, R9), rồi chỉ từ nhà +
// thẻ (không đọc nội bộ bộ sinh) kiểm:
//   - dạng đang dùng: R1–R5, R9; R6 (mọi chiến lược đơn không phủ định, S1 mọi thẻ, S3 ≤ 1/3) và R6b
//     (mọi phép giao không phủ định ≤ 1/3, kể cả phép giao có S11); R7 (mỗi bước khép ≥ 1 nhà); R8 (≥ 3 mở);
//   - R11 "đổi vai trò": cùng nhà, cùng ba món thẻ theo thứ tự, đặt thẻ "có" ở vị trí 1 / 2 / 3 ⇒ cả ba bài
//     đạt R1–R6b và ba đáp án khác nhau.
// Bản gốc ở scratchpad clue-sym (2026-10-21, 4 cấu hình × 1.500 vòng); sửa khi chép: đọc 6 bậc từ design,
// dạng thẻ rút độc lập từ bậc 3, thêm R6/R6b/R7/R8 và R6/R6b cho cả ba vai trò; MUT_R9=1 đặt tên KHÔNG
// loại cặp gần âm (đột biến) để thấy phép kiểm R9 bắt lỗi thật.
//   node validate-sym.cjs [rounds=1000]
const L = require('./lib.cjs');
const G = require('./gen.cjs');
const S = require('./sym.cjs');
const D = require('./design-p1.cjs');

const ROUNDS = +(process.argv[2] || 1000);
const MUT = !!process.env.MUT_R9;
const T13 = 1 / 3 + 1e-9;
const { levels } = D.readDesign();

// Đột biến: đặt tên không loại gần âm (chỉ để chứng minh validator bắt R9).
function nameNoBan(nFill, rng) {
  const ids = rng.shuffle([...Array(14).keys()]);
  return { clue: ids.slice(0, 3), fill: ids.slice(3, 3 + nFill) };
}

// Đánh giá thư viện trên bàn có tên: houses = [[id món]], clueItem = [id × 3], form.
function libOf(houses, clueItem, form) {
  const fi = L.formInfo(form);
  const sigs = houses.map((x) => [0, 1, 2].reduce((a, j) => a | (x.includes(clueItem[j]) ? 1 << j : 0), 0));
  const ans = sigs.map((s, h) => h).filter((h) => sigs[h] === fi.A);
  if (ans.length !== 1) return null;
  const order = [ans[0], ...houses.map((_, h) => h).filter((h) => h !== ans[0])];
  const fillers = [...new Set(houses.flat().filter((i) => !clueItem.includes(i)))];
  const fill = order.map((h) => houses[h].filter((i) => !clueItem.includes(i)).map((i) => fillers.indexOf(i)));
  const mult = fillers.map((_, k) => fill.filter((f) => f.includes(k)).length);
  return { pv: L.evalPuzzle(fi, order.map((h) => sigs[h]), fill, mult), ans: ans[0] };
}

function check(houses, clueItem, form, lv, sets) {
  const K = lv.K, all = [0, 1, 2], errs = [];
  const sat = (x, js) => js.every((j) => x.includes(clueItem[j]) === (form[j] === 'P'));
  const sol = houses.map((_, h) => h).filter((h) => sat(houses[h], all));
  if (sol.length !== 1) errs.push('R1');
  for (const j of all) if (houses.filter((x) => sat(x, all.filter((k) => k !== j))).length < 2) errs.push('R2');
  if ([...form].filter((c) => c === 'P').length !== 1 || new Set(clueItem).size !== 3) errs.push('R3');
  for (const j of all) { const k = houses.filter((x) => x.includes(clueItem[j])).length; if (k < 1 || k > K - 1) errs.push('R3'); }
  if (houses.some((x) => x.length !== lv.m || new Set(x).size !== lv.m)) errs.push('R4m');
  if (new Set(houses.map((x) => x.slice().sort((a, b) => a - b).join())).size !== K) errs.push('R4dup');
  const freq = {}; houses.flat().forEach((i) => (freq[i] = (freq[i] || 0) + 1));
  if (Object.entries(freq).some(([i, k]) => !clueItem.includes(+i) && k < 2)) errs.push('R5');
  if (L.hasNear(Object.keys(freq).map(Number))) errs.push('R9');
  const lib = sol.length === 1 ? libOf(houses, clueItem, form) : null;
  if (lib) {
    if (G.maxOver(lib.pv, sets.NNall) > T13) errs.push('R6/R6b');
    if (G.maxOver(lib.pv, [...L.S1L, 'S3'].map((n) => L.IDX[n])) > T13) errs.push('R6(S1,S3)');
  }
  let open = houses.map((_, h) => h); let r8 = 0;
  for (const j of all) { const nx = open.filter((h) => sat(houses[h], [j])); if (nx.length === open.length) errs.push('R7'); if (j === 0) r8 = nx.length; open = nx; }
  if (r8 < 3) errs.push('R8');
  return { errs: [...new Set(errs)], sol: sol[0] };
}

const nrng = L.makeRng(4242);
let n = 0, bad = 0, roleBad = 0, role78 = 0;
const errCount = {};
levels.forEach((lv, li) => {
  const sl = D.toSymLevel(lv);
  const g = S.buildSym(sl, 7);
  const rng = L.makeRng(900 + li), frng = L.makeRng(77 + li);
  const setsLv = G.strategySets(sl);
  for (let r = 0; r < ROUNDS; r++) for (let k = 0; k < 6; k++) {
    const f = lv.forms.length === 1 ? lv.forms[0] : lv.forms[frng.int(lv.forms.length)];
    const z = S.sampleSym(g, f, lv.m, rng); n++;
    const ids = [...new Set(z.fill.flat())].sort((a, b) => a - b);
    const nm = MUT ? nameNoBan(ids.length, nrng) : L.nameBoard(ids.length, nrng);
    const houses = z.sigs.map((s, h) => [...[0, 1, 2].filter((j) => (s >> j) & 1).map((j) => nm.clue[j]), ...z.fill[h].map((x) => nm.fill[ids.indexOf(x)])]);
    const main = check(houses, nm.clue, f, lv, setsLv);
    if (main.errs.length || main.sol !== 0) { bad++; main.errs.forEach((e) => (errCount[e] = (errCount[e] || 0) + 1)); if (bad < 4 && !MUT) console.log(lv.level, f, main.errs, houses); }
    // R11: cùng bàn, ba vai trò (phân loại "không phủ định" theo mọi dạng có thể, như bộ sinh)
    const roles = S.FORMS.map((ff) => check(houses, nm.clue, ff, lv, S.SETS_ALL));
    if (roles.some((x) => x.errs.some((e) => !['R7', 'R8', 'R9'].includes(e))) || new Set(roles.map((x) => x.sol)).size !== 3) roleBad++;
    if (roles.some((x) => x.errs.includes('R7') || x.errs.includes('R8'))) role78++;
  }
});
const errs = Object.entries(errCount).map(([e, c]) => `${e} ${c}`).join(', ');
console.log(`bộ sinh đối xứng P1 (6 bậc design, ${ROUNDS} vòng × 6 bài mỗi bậc${MUT ? ', ĐỘT BIẾN: đặt tên không loại gần âm' : ''}): kiểm ${n} bài; bài lỗi R1–R9 ${bad}${errs ? ` (${errs})` : ''}; bàn trượt R11 "đổi vai trò" (một trong ba vai trò trượt R1–R6b hoặc trùng đáp án) ${roleBad}; vai trò khác trượt R7/R8 ${role78}`);
