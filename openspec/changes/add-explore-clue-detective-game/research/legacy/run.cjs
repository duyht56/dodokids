'use strict';
// clue-sim/run.cjs — so sánh bảng bậc trên cùng thư viện chiến lược.
// node run.cjs [rounds=1500] [tables=all] [variants=U,D,M,MD]
const fs = require('fs');
const L = require('../lib.cjs');
const G = require('../gen.cjs');

const O3 = ['PNN', 'NPN', 'NNP'], O6 = ['PPN', 'PNP', 'NPP', 'PNN', 'NPN', 'NNP'];
const rec = (forms) => forms.map((f) => [f, 6 / forms.length]);
const lv = (K, m, forms, note, extra = {}) => ({ K, m, recipe: rec(forms), note, ...extra });

const TABLES = {
  'T-Codex': [
    lv(4, 2, ['PN'], 'PN cố định, làm mẫu + đèn soi'),
    lv(4, 2, ['PN'], 'như B1, bỏ đèn'),
    lv(5, 2, ['PNN'], 'PNN cố định'),
    lv(5, 2, O3, 'PNN đổi thứ tự'),
    lv(6, 3, O6, 'trộn PNN/PPN, 6 thứ tự', { gate: true }),
    lv(6, 3, O6, 'như B5, úp thẻ', { gate: true }),
  ],
  'T-Ped': [
    lv(7, 2, ['PNN'], 'PNN, P đầu, đèn soi'),
    lv(7, 2, O3, 'PNN/NPN/NNP'),
    lv(7, 3, O3, 'nhà 3 món'),
    lv(7, 4, O6, '6 thứ tự, có PPN'),
    lv(9, 3, O3, '9 nhà', { gate: true }),
    lv(9, 3, O3, '9 nhà, úp', { gate: true }),
  ],
  'T-Eng': [
    lv(7, 3, ['PNN'], 'PNN đèn soi'),
    lv(7, 3, O3, 'trộn thứ tự'),
    lv(7, 4, O6, '6 thứ tự'),
    lv(7, 4, O6, 'úp thẻ'),
    lv(9, 3, O3, '9 nhà', { gate: true }),
    lv(9, 3, O3, '9 nhà, úp', { gate: true }),
  ],
};
// Bảng lai (điền sau khi xem catalog) — xem catalog.cjs
if (process.env.HYBRID) Object.assign(TABLES, require('./hybrid.cjs'));

const ROUNDS = +(process.argv[2] || 1500);
const pickTables = (process.argv[3] && process.argv[3] !== 'all') ? process.argv[3].split(',') : Object.keys(TABLES);
const VARIANTS = (process.argv[4] || 'U,D,M,MD').split(',');
const SEED0 = +(process.env.SEED || 1000);

function runLevel(level, variant, seed) {
  const gen = G.buildGenerator(level, variant, seed);
  const n = level.recipe[0][0].length;
  const res = { K: level.K, m: level.m, n, emoji: level.K * level.m + n, forms: level.recipe.map(([f, c]) => `${f}×${c}`).join(' '), note: level.note, gate: !!level.gate, variant };
  if (gen.infeasible) { res.infeasible = gen.infeasible; return res; }
  res.mode = gen.mode;
  const rng = L.makeRng(seed * 7919 + 13);
  const sumP = new Float64Array(L.NS), sumQ = new Float64Array(L.NS);
  const keysA = new Set(), keysB = new Set(), tmplUsed = new Set();
  let puzzles = 0, tries = 0, instFail = 0;
  const slots = []; level.recipe.forEach(([f, c]) => { for (let i = 0; i < c; i++) slots.push(f); });
  for (let r = 0; r < ROUNDS; r++) {
    const ps = slots.map((f) => {
      const z = G.samplePuzzle(gen, f, level.m, rng);
      puzzles++; tries += z.tries; if (!z.instOk) instFail++;
      tmplUsed.add(f + ':' + z.tmpl.noise.join(','));
      (r % 2 ? keysB : keysA).add(L.canonKey(f, z.tmpl.sigs, z.fill));
      for (let i = 0; i < L.NS; i++) sumP[i] += z.pv[i];
      return z.pv;
    });
    for (let i = 0; i < L.NS; i++) sumQ[i] += L.pbAtLeast(ps.map((pv) => pv[i]), 4);
  }
  const meanP = Array.from(sumP, (x) => x / puzzles), pass = Array.from(sumQ, (x) => L.passOf(x / ROUNDS));
  const S = gen.sets;
  const top = (idxs, k = 1) => idxs.slice().sort((a, b) => pass[b] - pass[a] || meanP[b] - meanP[a]).slice(0, k).map((i) => ({ name: L.NAMES[i], p: meanP[i], pass: pass[i] }));
  const guess = L.passConst(1 / level.K);
  res.guess = { p: 1 / level.K, pass: guess };
  // S12 vị trí cố định: đáp án rút đều vị trí → 1/K mỗi bài, độc lập → như đoán bừa
  res.worstNN = top(S.NNall, 1)[0];
  if (guess > res.worstNN.pass) res.worstNN = { name: 'S12', p: 1 / level.K, pass: guess };
  res.top5combosNN = top(S.NNall.filter((i) => L.NAMES[i].includes('∩')), 5);
  res.top5singlesNN = top(S.NNall.filter((i) => !L.NAMES[i].includes('∩')), 5);
  res.taut = [...S.taut].filter((i) => S.cat[i] === 'NN').map((i) => L.NAMES[i]);
  res.extraE = top(L.EXTRA.map((n) => L.IDX[n]).filter((i) => !S.taut.has(i)), 1)[0];
  res.S13max = top(S.S13, 1)[0];
  const r13 = L.IDX['S13-rand']; res.S13rand = { p: meanP[r13], pass: pass[r13] };
  res.S1max = top(L.S1L.map((n) => L.IDX[n]), 1)[0];
  res.S3 = { p: meanP[L.IDX.S3], pass: pass[L.IDX.S3] };
  res.worstPART = top(S.PART, 1)[0];
  res.named = Object.fromEntries(['S2', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S8∩S9', 'S9∩S8', 'S2∩S9'].map((n) => [n, { p: meanP[L.IDX[n]], pass: pass[L.IDX[n]] }]));
  const inter = [...keysA].filter((k) => keysB.has(k)).length;
  res.structSeen = new Set([...keysA, ...keysB]).size;
  res.structLP = inter ? Math.round((keysA.size * keysB.size) / inter) : null;
  res.tmplUsed = tmplUsed.size;
  res.tmplBase = Object.keys(gen.perForm).reduce((a, f) => a + G.baseTemplates(f, level.K, level.m).templates.length, 0);
  res.tries = tries / puzzles; res.instFail = instFail / puzzles;
  return res;
}

const out = {};
for (const t of pickTables) {
  out[t] = {};
  for (const v of VARIANTS) {
    out[t][v] = TABLES[t].map((level, i) => runLevel(level, v, SEED0 + i));
  }
}
const pct = (x) => (x * 100).toFixed(1) + '%';
for (const t of pickTables) for (const v of VARIANTS) {
  console.log(`\n=== ${t} / ${v} ===`);
  out[t][v].forEach((r, i) => {
    if (r.infeasible) { console.log(`B${i + 1} ${r.K}×${r.m} ${r.forms}: BẤT KHẢ (${r.infeasible})`); return; }
    console.log(`B${i + 1} ${r.K}×${r.m} [${r.forms}] emoji=${r.emoji} | đoán ${pct(r.guess.pass)} | NN tệ nhất ${r.worstNN.name} ${pct(r.worstNN.p)}→${pct(r.worstNN.pass)} | S13max ${r.S13max.name} ${pct(r.S13max.p)}→${pct(r.S13max.pass)} (rand ${pct(r.S13rand.pass)}) | S1max ${r.S1max.name} ${pct(r.S1max.pass)} | S3 ${pct(r.S3.pass)} | PART tệ ${r.worstPART.name} ${pct(r.worstPART.pass)} | khuôn ${r.tmplUsed}/${r.tmplBase} | cấu trúc ${r.structSeen} (~${r.structLP}) | ${r.mode}`);
    console.log(`    combos NN: ${r.top5combosNN.map((x) => `${x.name} ${pct(x.p)}→${pct(x.pass)}`).join('; ')}`);
    console.log(`    singles NN: ${r.top5singlesNN.map((x) => `${x.name} ${pct(x.p)}→${pct(x.pass)}`).join('; ')} | E: ${r.extraE ? r.extraE.name + ' ' + pct(r.extraE.pass) : '-'} | S8∩S9 ${pct(r.named['S8∩S9'].pass)} | instFail ${pct(r.instFail)}`);
  });
}
// Chỉ ghi file khi đặt OUT=<đường dẫn> (bản gốc ghi results.json vào thư mục đang đứng).
// OUT là thư mục (quy ước của enum.cjs / table-x.cjs) → <OUT>/results.json.
if (process.env.OUT) { const o = process.env.OUT; fs.writeFileSync(fs.existsSync(o) && fs.statSync(o).isDirectory() ? require('path').join(o, 'results.json') : o, JSON.stringify(out, null, 1)); }
