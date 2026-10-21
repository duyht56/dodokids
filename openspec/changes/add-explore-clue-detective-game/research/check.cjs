'use strict';
// check.cjs — kiểm đầy đủ một bàn có tên món cho cả ba vai trò: R1–R5, R7, R8, R6/R6b (thư viện cũ, phân
// loại theo mọi dạng = SETS_ALL như R11), S1@j/S3 ≤ 1/3, R11; họ mở rộng (NN, bỏ viết lại lời giải);
// mù dấu (sym.cjs blindEval); hoán đổi được chặt (quỹ đạo đáp án dưới Stab(thẻ có), design §9 R12).
const L = require('./lib.cjs');
const S = require('./sym.cjs');
const G = require('./gen.cjs');
const FAM = require('./fam.cjs');
const AU = require('./autom.cjs');
const TAUT = require('./taut.json');
const T13 = 1 / 3 + 1e-9;
const FORMS = ['PNN', 'NPN', 'NNP'];
const tautFor = (m) => new Set([...TAUT.all, ...(m === 2 ? TAUT.m2 : TAUT.m3)]);

function oldLib(houses, cards, form) {
  const fi = L.formInfo(form);
  const sigs = houses.map((x) => [0, 1, 2].reduce((a, j) => a | (x.includes(cards[j]) ? 1 << j : 0), 0));
  const ans = sigs.map((s, h) => h).filter((h) => sigs[h] === fi.A);
  if (ans.length !== 1) return null;
  const order = [ans[0], ...houses.map((_, h) => h).filter((h) => h !== ans[0])];
  const fillers = [...new Set(houses.flat().filter((i) => !cards.includes(i)))];
  const fill = order.map((h) => houses[h].filter((i) => !cards.includes(i)).map((i) => fillers.indexOf(i)));
  const mult = fillers.map((_, k) => fill.filter((f) => f.includes(k)).length);
  return { pv: L.evalPuzzle(fi, order.map((h) => sigs[h]), fill, mult), sigs, ans: ans[0], fill: houses.map((h) => h.filter((i) => !cards.includes(i)).map((i) => fillers.indexOf(i))) };
}
function rules(houses, cards, form, m, r5o = false) {
  const K = houses.length, all = [0, 1, 2], errs = [];
  const sat = (x, js) => js.every((j) => x.includes(cards[j]) === (form[j] === 'P'));
  const sol = houses.map((_, h) => h).filter((h) => sat(houses[h], all));
  if (sol.length !== 1) errs.push('R1');
  for (const j of all) if (houses.filter((x) => sat(x, all.filter((k) => k !== j))).length < 2) errs.push('R2');
  for (const j of all) { const k = houses.filter((x) => x.includes(cards[j])).length; if (k < 1 || k > K - 1) errs.push('R3'); }
  if (houses.some((x) => x.length !== m || new Set(x).size !== m)) errs.push('R4m');
  if (new Set(houses.map((x) => x.slice().sort((a, b) => a - b).join())).size !== K) errs.push('R4dup');
  const freq = {}; houses.flat().forEach((i) => (freq[i] = (freq[i] || 0) + 1));
  // R5 (design): mọi món không được nhắc ở ≥ 2 nhà. R5′ (r5o): chỉ đòi cho món nằm trong nhà có món-thẻ.
  const inCardHouse = new Set(houses.filter((x) => cards.some((c) => x.includes(c))).flat());
  if (Object.entries(freq).some(([i, k]) => !cards.includes(+i) && k < 2 && (!r5o || inCardHouse.has(+i)))) errs.push('R5');
  if (L.hasNear(Object.keys(freq).map(Number))) errs.push('R9');
  let open = houses.map((_, h) => h); let r8 = 0;
  for (const j of all) { const nx = open.filter((h) => sat(houses[h], [j])); if (nx.length === open.length) errs.push('R7'); if (j === 0) r8 = nx.length; open = nx; }
  if (r8 < 3) errs.push('R8');
  return { errs, sol: sol[0] };
}
// opts: {strict: bool (tính quỹ đạo), names: bool (kiểm R9 theo id thật)}
function checkBoard(houses, cards, m, opts = {}) {
  const taut = tautFor(m);
  const out = { ok: true, errs: [], roles: [] };
  const sols = [];
  for (let p = 0; p < 3; p++) {
    const form = FORMS[p];
    const R = rules(houses, cards, form, m, !!opts.r5o);
    const errs = R.errs.filter((e) => opts.names || e !== 'R9');
    const lib = oldLib(houses, cards, form);
    let oldNN = 1, s1s3 = 1;
    if (lib) { oldNN = G.maxOver(lib.pv, S.SETS_ALL.NNall); s1s3 = G.maxOver(lib.pv, [...L.S1L, 'S3'].map((n) => L.IDX[n])); if (oldNN > T13) errs.push('R6/R6b'); if (s1s3 > T13) errs.push('R6(S1,S3)'); }
    const fam = FAM.evalFamily(houses, cards, p);
    let nn = { p: 0 }, nnNoSum = { p: 0 }, part = { p: 0 };
    for (const [k, v] of fam.out) {
      if (taut.has(k)) continue;
      if (v.cat === 'NN') { if (v.p > nn.p) nn = { p: v.p, k }; if (!k.includes('fillSum') && v.p > nnNoSum.p) nnNoSum = { p: v.p, k }; }
      if (v.cat === 'PART' && v.p > part.p) part = { p: v.p, k };
    }
    const role = { form, errs, oldNN, nn, nnNoSum, part, S13: lib ? Math.max(...L.S13L.map((n) => lib.pv[L.IDX[n]])) : null, S3: lib ? lib.pv[L.IDX.S3] : null, S3S9: lib ? lib.pv[L.IDX['S3∩S9']] : null, ans: fam.ans };
    if (opts.strict) { const o = AU.houseOrbit(houses, fam.ans, [cards[p]]); role.orbit = o.size; role.group = o.group; }
    out.roles.push(role); sols.push(R.sol);
    if (errs.length) { out.ok = false; out.errs.push(form + ':' + errs.join(',')); }
  }
  if (new Set(sols).size !== 3) { out.ok = false; out.errs.push('R11'); }
  out.nn = Math.max(...out.roles.map((r) => r.nn.p)); out.nnNoSum = Math.max(...out.roles.map((r) => r.nnNoSum.p));
  out.famOK = out.nnNoSum <= T13; out.famOKsum = out.nn <= T13;
  if (opts.strict) out.minOrbit = Math.min(...out.roles.map((r) => r.orbit));
  // mù dấu (thư viện B) — tính trên vai trò PNN (blindEval tự đổi vai trò)
  const lib0 = oldLib(houses, cards, 'PNN');
  if (lib0) { const b = S.blindEval(lib0.sigs, 1, lib0.fill); out.blind = Math.max(...S.BLIND.filter((n) => !n.startsWith('B-pos')).map((n) => b[n])); out.roleOK = b.roleOK; }
  return out;
}
module.exports = { checkBoard, oldLib, rules, FORMS };
