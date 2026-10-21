'use strict';
// table-x.cjs — bảng 6 bậc LẤY MẪU, tên món thật (pool 14, R9), cho P1 (bản trước vòng 7, research/sym.cjs),
// thiết kế đang chọn P1-X (danh mục design §9, đọc qua catalog.cjs) và phương án P1-X′ (R5′), cùng một bộ đo:
// đoán bừa; mẹo Codex vòng 7 (P|sumF.min); không phủ định tệ nhất (S1–S15 + 198 phép giao + họ S16 lọc rồi
// xếp hạng, bỏ viết lại lời giải và Σ tần suất món đệm); S16 không dùng thống kê món đệm; mù dấu tệ nhất
// (trừ vị trí / kể cả); S13 tệ nhất / ngẫu nhiên; S3; S3∩S9; S16 có phủ định tệ nhất; cấu trúc thấy; lỗi
// R1–R9 (tên thật) / R11. Qua bậc = 1 − (1 − P(Bin(6, E[p]) ≥ 4))² (bài độc lập cùng phân phối).
//   node table-x.cjs [bài/bậc=6000]      RUN=P1,X,X5 (mặc định P1,X)
// Mẹo mù dấu "vị trí" đúng 0 hoặc 1 mỗi bài nên cột "kể cả" dao động vài điểm; số chính xác ở exact-x.cjs.
const L = require('./lib.cjs');
const S = require('./sym.cjs');
const FAM = require('./fam.cjs');
const C = require('./check.cjs');
const P = require('./p1gen.cjs');
const X = require('./xgen.cjs');
const TAUT = require('./taut.json');
const N = +(process.argv[2] || 6000);
const F3 = ['PNN', 'NPN', 'NNP'];
const CATS = require('./catalog.cjs');
const one = (c) => (c.length === 1 ? c[0] : c);
const DESIGNS = {
  P1: [['8x2', ['PNN']], ['8x2', ['PNN']], ['8x2', F3], ['8x3', F3], [['9x3a', '9x3b'], F3], [['9x3a', '9x3b'], F3]],
  X: CATS.LEVELS.map(([c, f]) => [one(c), f]),
  X5: CATS.LEVELS5.map(([c, f]) => [one(c), f]),
};
const RUN = (process.env.RUN || 'P1,X').split(',');
const pct = (x) => (x * 100).toFixed(1).replace('.', ',') + '%';
const cell = (p) => `${pct(p)} → ${pct(L.passConst(p))}`;
function level(design, li) {
  const [confs, forms] = DESIGNS[design][li];
  const seed = 81800 + li * 17 + (design === 'X' ? 5000 : design === 'X5' ? 9000 : 0);
  const rng = L.makeRng(seed), nrng = L.makeRng(seed + 1), frng = L.makeRng(seed + 2), crng = L.makeRng(seed + 3), prng = L.makeRng(seed + 4);
  const acc = new Map(); const add = (k, v) => acc.set(k, (acc.get(k) || 0) + v);
  const keys = new Set(); let errs = 0, r11 = 0, m = 0, K = 0;
  for (let n = 0; n < N; n++) {
    const conf = Array.isArray(confs) ? confs[crng.int(confs.length)] : confs;
    const form = forms[frng.int(forms.length)];
    const b = design === 'P1' ? P.sampleP1(conf, form, rng, nrng) : X.sampleX(conf, form, rng, nrng, prng, design === 'X5' ? 'CAT5' : 'CAT');
    m = b.houses[0].length; K = b.houses.length;
    const taut = new Set([...TAUT.all, ...(m === 2 ? TAUT.m2 : TAUT.m3)]);
    // luật (tên thật) + R11
    const R5O = design === 'X5';
    const R = C.rules(b.houses, b.cards, form, m, R5O);
    if (R.errs.length) errs++;
    const sols = F3.map((f) => C.rules(b.houses, b.cards, f, m, R5O)).map((x) => (x.errs.filter((e) => !['R7', 'R8'].includes(e)).length ? -1 : x.sol));
    if (sols.includes(-1) || new Set(sols).size !== 3) r11++;
    // thư viện cũ + họ mở rộng (vai trò thật)
    const lib = C.oldLib(b.houses, b.cards, form);
    const fam = FAM.evalFamily(b.houses, b.cards, b.p);
    let nn = 0, nnBlind = 0, part = 0;
    for (const [k, v] of fam.out) { if (taut.has(k) || k.includes('fillSum')) continue; add('F:' + k, v.p); }
    for (const i of S.SETS_ALL.NNall) add('O:' + L.NAMES[i], lib.pv[i]);
    for (const n2 of [...L.S13L, 'S13-rand', 'S3', 'S3∩S9']) add('Q:' + n2, lib.pv[L.IDX[n2]]);
    for (const i of S.SETS_ALL.PART) add('OP:' + L.NAMES[i], lib.pv[i]);
    // mù dấu (chữ ký theo vai trò thật, như symrun)
    const fi = L.formInfo(form);
    const order = [lib.ans, ...b.houses.map((_, h) => h).filter((h) => h !== lib.ans)];
    const bl = S.blindEval(order.map((h) => lib.sigs[h]), fi.A, order.map((h) => lib.fill[h]));
    for (const nB of S.BLIND) add('B:' + nB, bl[nB]);
    // cấu trúc (như table.cjs: canonKey theo dạng, nhà đáp án đầu)
    keys.add(L.canonKey(form, order.map((h) => lib.sigs[h]), order.map((h) => lib.fill[h])));
  }
  const mean = new Map([...acc].map(([k, v]) => [k, v / N]));
  const worst = (pred) => { let b = { p: -1 }; for (const [k, v] of mean) if (pred(k) && v > b.p) b = { p: v, k }; return b; };
  return {
    K, m, conf: [].concat(confs).join('+'), forms: forms.length > 1 ? 'độc lập' : 'PNN',
    guess: 1 / K,
    nn: worst((k) => (k.startsWith('F:') && famCat(k.slice(2)) === 'NN') || k.startsWith('O:')),
    nnBlind: worst((k) => (k.startsWith('F:') && famCat(k.slice(2)) === 'NN' && !k.includes('fill')) || (k.startsWith('O:'))),
    nnNew: worst((k) => k.startsWith('F:') && famCat(k.slice(2)) === 'NN'),
    part: worst((k) => (k.startsWith('F:') && famCat(k.slice(2)) === 'PART') || k.startsWith('OP:')),
    blindNoPos: worst((k) => k.startsWith('B:') && !k.includes('B-pos')), blindAll: worst((k) => k.startsWith('B:')),
    S13: worst((k) => k.startsWith('Q:S13-') && k !== 'Q:S13-rand'), S13r: mean.get('Q:S13-rand'), S3: mean.get('Q:S3'), S3S9: mean.get('Q:S3∩S9'),
    codex: mean.get('F:P|sumF.min'),
    structs: keys.size, errs, r11,
  };
}
const famCatMap = new Map();
function famCat(k) {
  if (!famCatMap.size) { const f = FAM.evalFamily([[0, 3], [1, 4], [2, 3], [0, 1], [0, 2], [1, 2], [3, 4], [3, 4]], [0, 1, 2], 0); for (const [kk, v] of f.out) famCatMap.set(kk, v.cat); }
  return famCatMap.get(k);
}
const out = {};
for (const d of RUN) out[d] = DESIGNS[d].map((_, i) => level(d, i));
for (const d of RUN) {
  console.log(`\n### ${d === 'P1' ? 'P1 trước vòng 7 (research/sym.cjs)' : d === 'X' ? 'P1-X đang chọn (danh mục hoán đổi được design §9, giữ R5)' : 'Phương án P1-X′ (R5′)'} — ${N} bài/bậc`);
  console.log('| Bậc | Cấu hình | Hình | Đoán bừa | Mẹo Codex vòng 7 (P|sumF.min) | Không phủ định tệ nhất (S1–S15 + S16) | S16 không dùng thống kê món đệm | Mù dấu trừ vị trí / kể cả | S13 tệ / ngẫu nhiên | S3 | S3∩S9 | Có phủ định tệ nhất | Cấu trúc thấy | Lỗi R1–R9 / R11 |');
  console.log('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  out[d].forEach((r, i) => console.log(`| ${i + 1} | ${r.conf} ${r.forms} | ${r.K * r.m + 3} | ${cell(r.guess)} | ${cell(r.codex)} | ${cell(r.nn.p)} (${r.nn.k.slice(2)}) | ${cell(r.nnBlind.p)} | ${pct(L.passConst(r.blindNoPos.p))} / ${pct(L.passConst(r.blindAll.p))} | ${pct(L.passConst(r.S13.p))} / ${pct(L.passConst(r.S13r))} | ${cell(r.S3)} | ${pct(L.passConst(r.S3S9))} | ${pct(L.passConst(r.part.p))} | ${r.structs} | ${r.errs} / ${r.r11} |`));
}
if (process.env.OUT) require('fs').writeFileSync(require('path').join(process.env.OUT, 'table-x.json'), JSON.stringify(out, null, 1));
