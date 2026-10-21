'use strict';
// Cổng "dùng đủ 3 thẻ" (S13) xung đột với S15 (S2∩S9)? Giá trị trò chơi minimax ở K nhà × 3 món.
const L = require('./lib.cjs'), G = require('./gen.cjs');
const O3 = ['PNN', 'NPN', 'NNP'];
const it = +(process.argv[2] || 4000);
const show = (sets, idxs) => idxs.map((i) => L.NAMES[i]);
for (const [K, m, forms] of [[9, 3, O3], [9, 3, ['PNN']], [8, 3, O3], [10, 3, O3]]) {
  const level = { K, m, recipe: forms.map((f) => [f, 6 / forms.length]), gate: true };
  const sets = G.strategySets(level);
  const rng = L.makeRng(99);
  const share = 1 / forms.length;
  const base = forms.map((f) => G.baseTemplates(f, K, m).templates);
  const s2s9 = L.IDX['S2∩S9'];
  // (0) chứng minh: khuôn có mọi S13 ≤ 1/3 thì S2∩S9 ≥ 1/2
  let minS15 = 1; base.forEach((rows) => rows.forEach((x) => { if (G.maxOver(x.pv, sets.S13) <= 1 / 3 + 1e-9) minS15 = Math.min(minS15, x.pv[s2s9]); }));
  const nT1 = base.map((rows) => rows.filter((x) => G.maxOver(x.pv, sets.NNsig) <= 1 / 3 + 1e-9).length);
  // (a) NN ≤ 1/3 từng bài, trộn để hạ S13
  const t1 = base.map((rows) => rows.filter((x) => G.maxOver(x.pv, sets.NNsig) <= 1 / 3 + 1e-9));
  const hedge = require('./gen.cjs').__hedge;
  console.log(`${K}x${m} ${forms.join('/')}: khuôn ${base.map((b) => b.length)} | NN≤1/3: ${nT1} | min S2∩S9 khi S13≤1/3 từng bài = ${minS15.toFixed(3)}`);
  if (hedge) {
    const a = hedge(t1.map((rows) => ({ share, rows: rows.map((x) => x.pv) })), [...sets.NNsig, ...sets.S13], it, rng);
    const b = hedge(base.map((rows) => ({ share, rows: rows.map((x) => x.pv) })), [...sets.NNsig, ...sets.S13], it, rng);
    const c = hedge(base.map((rows) => ({ share, rows: rows.map((x) => x.pv) })), [...sets.S13], it, rng);
    console.log(`   (a) NN≤1/3 từng bài, min max S13: v=${a.value.toFixed(3)} → qua ${(100 * L.passConst(a.value)).toFixed(1)}%`);
    console.log(`   (b) min max(NN ∪ S13) chung:       v=${b.value.toFixed(3)} → qua ${(100 * L.passConst(b.value)).toFixed(1)}%`);
    console.log(`   (c) chỉ min S13:                   v=${c.value.toFixed(3)} → qua ${(100 * L.passConst(c.value)).toFixed(1)}%`);
  }
}
