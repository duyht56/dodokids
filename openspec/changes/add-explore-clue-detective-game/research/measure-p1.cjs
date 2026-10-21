'use strict';
// Đo họ S16 "lọc rồi xếp hạng" trên bộ sinh P1 (bản trước vòng 7, research/sym.cjs), theo bậc của P1.
// node measure-p1.cjs [bài mỗi bậc=6000]
const L = require('./lib.cjs');
const FAM = require('./fam.cjs');
const P = require('./p1gen.cjs');
const TAUT = require('./taut.json');
const N = +(process.argv[2] || 6000);
const LEVELS = [
  { lv: 1, conf: '8x2', forms: ['PNN'] }, { lv: 2, conf: '8x2', forms: ['PNN'] }, { lv: 3, conf: '8x2', forms: ['PNN', 'NPN', 'NNP'] },
  { lv: 4, conf: '8x3', forms: ['PNN', 'NPN', 'NNP'] }, { lv: 5, conf: ['9x3a', '9x3b'], forms: ['PNN', 'NPN', 'NNP'] }, { lv: 6, conf: ['9x3a', '9x3b'], forms: ['PNN', 'NPN', 'NNP'] },
];
const pct = (x) => (x * 100).toFixed(1).replace('.', ',') + '%';
function run(L0, seed) {
  const rng = L.makeRng(seed), nrng = L.makeRng(seed + 1), frng = L.makeRng(seed + 2), crng = L.makeRng(seed + 3);
  const taut = new Set([...TAUT.all, ...(L0.conf === '8x2' ? TAUT.m2 : TAUT.m3)]);
  const sum = new Map(); let n = 0, perfect = 0;
  for (let k = 0; k < N; k++) {
    const conf = Array.isArray(L0.conf) ? L0.conf[crng.int(2)] : L0.conf;
    const form = L0.forms[frng.int(L0.forms.length)];
    const b = P.sampleP1(conf, form, rng, nrng);
    const r = FAM.evalFamily(b.houses, b.cards, b.p);
    let worst = 0;
    for (const [k2, v] of r.out) { if (taut.has(k2) || k2.includes('fillSum')) continue; sum.set(k2, (sum.get(k2) || 0) + v.p); if (v.cat === 'NN' && v.p > worst) worst = v.p; }
    if (worst > 1 / 3 + 1e-9) perfect++;
    n++;
  }
  const rows = [...sum].map(([k, s]) => ({ k, p: s / n, cat: k.startsWith('P∩S8') ? 'RW' : null }));
  return { rows, n, over: perfect / n };
}
const catOf = new Map();
{ // phân loại từ một bàn bất kỳ
  const b = P.sampleP1('8x3', 'PNN', L.makeRng(1), L.makeRng(2));
  for (const [k, v] of FAM.evalFamily(b.houses, b.cards, b.p).out) catOf.set(k, v.cat);
}
console.log(`Họ S16 trên P1 trước vòng 7 (${N} bài/bậc). Ô = đúng TB mỗi bài → qua bậc (6/4/1 + 1 vòng).`);
console.log('| Bậc | Cấu hình | Mẹo Codex vòng 7 (P|sumF.min) | S16 không phủ định tệ nhất (tên) | S16 không dùng thống kê món đệm | Bài có ≥ 1 mẹo không phủ định > 1/3 | S16 có phủ định tệ nhất |');
console.log('|---|---|---|---|---|---|---|');
for (const L0 of LEVELS) {
  const r = run(L0, 71700 + L0.lv);
  const nn = r.rows.filter((x) => catOf.get(x.k) === 'NN').sort((a, b) => b.p - a.p);
  const blind = nn.filter((x) => !/fill/.test(x.k));
  const part = r.rows.filter((x) => catOf.get(x.k) === 'PART').sort((a, b) => b.p - a.p);
  const cx = r.rows.find((x) => x.k === 'P|sumF.min');
  console.log(`| ${L0.lv} | ${[].concat(L0.conf).join('+')} ${L0.forms.length > 1 ? 'indep' : 'PNN'} | ${pct(cx.p)} → ${pct(L.passConst(cx.p))} | ${pct(nn[0].p)} → ${pct(L.passConst(nn[0].p))} (${nn[0].k}) | ${pct(blind[0].p)} → ${pct(L.passConst(blind[0].p))} (${blind[0].k}) | ${pct(r.over)} | ${pct(part[0].p)} → ${pct(L.passConst(part[0].p))} (${part[0].k}) |`);
  if (L0.lv === 4 || L0.lv === 1) console.log('   top không phủ định: ' + nn.slice(0, 8).map((x) => `${x.k} ${x.p.toFixed(3)}`).join(', '));
}
