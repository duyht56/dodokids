'use strict';
// In khuôn đạt tầng 1 (mọi mẹo KHÔNG phủ định ≤ 1/3) cho vài cấu hình; ký hiệu bit theo thứ tự thẻ (như Codex).
const L = require('../lib.cjs'), G = require('../gen.cjs');
const bits = (s, n) => [...Array(n).keys()].map((j) => ((s >> j) & 1 ? '1' : '0')).join('');
const pick = ['S1:N1', 'S1:N2', 'S3', 'S13-@1', 'S13-@2', 'S13-@3', 'S8∩S9', 'S2∩S9', 'S9'];
for (const [f, K, m, forms] of [['PNN', 6, 2, ['PNN']], ['PNN', 7, 2, ['PNN']], ['NPN', 7, 2, ['PNN', 'NPN', 'NNP']], ['PNN', 7, 3, ['PNN']], ['PNN', 8, 3, ['PNN']]]) {
  const level = { K, m, recipe: forms.map((x) => [x, 6 / forms.length]) };
  const sets = G.strategySets(level);
  const rows = G.baseTemplates(f, K, m).templates;
  const t1 = rows.filter((x) => G.maxOver(x.pv, sets.NNsig) <= 1 / 3 + 1e-9);
  console.log(`${f} ${K}x${m}: ${rows.length} khuôn, tầng1 ${t1.length}`);
  for (const x of t1) {
    const t3 = G.maxOver(x.pv, sets.Uind) <= 1 / 3 + 1e-9;
    console.log('  ', x.sigs.map((s) => bits(s, 3)).join(','), t3 ? '[design R6 ok]' : '', pick.map((n) => `${n}=${x.pv[L.IDX[n]].toFixed(2)}`).join(' '));
  }
}
