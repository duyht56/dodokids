'use strict';
// accept-leak.cjs — vì sao món đệm phải được nhận theo CẢ BA vai trò. Khuôn đối xứng ⇒ phân phối
// món đệm như nhau cho mọi dạng, nên P(dạng | bàn) ∝ [bàn đạt kiểm món đệm với dạng đó].
// Bé mù dấu tối ưu (Bayes) đúng E[1 / số vai trò đạt]. Nhận theo cả ba vai trò ⇒ luôn 3 ⇒ 1/3.
const L = require('./lib.cjs'), G = require('./gen.cjs'), S = require('./sym.cjs');
const c = (a, cc, d) => [a, 1, 1, cc, 1, cc, cc, d];
for (const [K, m, counts] of [[8, 2, c(2, 1, 0)], [8, 3, c(2, 1, 0)], [9, 3, c(3, 1, 0)], [9, 3, c(2, 1, 1)]]) {
  const sigs = S.expand(counts), lv = { K, m, recipe: S.FORMS.map((f) => [f, 2]) }, sets = G.strategySets(lv);
  const rng = L.makeRng(5); let sum = 0, n = 0;
  for (let it = 0; it < 6000; it++) {
    const f = S.FORMS[it % 3];
    for (let k = 0; k < 40; k++) {
      const x = L.assignFillers(sigs, m, rng); if (!x) continue;
      const pv = S.pvAll(sigs, x.fill);
      const acc = S.FORMS.filter((ff) => G.maxOver(pv[ff], sets.NNinst) <= 1 / 3 + 1e-9);
      if (acc.includes(f)) { sum += 1 / acc.length; n++; break; }
    }
  }
  const p = sum / n;
  console.log(`${K}×${m} ${S.symKey(counts)}: nhận món đệm chỉ theo vai trò thật → Bayes mù dấu ${(100 * p).toFixed(1)}%/bài, qua ${(100 * L.passConst(p)).toFixed(1)}%; theo cả ba → 33,3% / 19,0%`);
}
