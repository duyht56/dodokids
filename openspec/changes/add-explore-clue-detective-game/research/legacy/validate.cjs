'use strict';
// Kiểm độc lập R1–R5 trên bài sinh ra (chỉ đọc nhà + thẻ, dựng lại món thật từ chữ ký + món đệm).
const L = require('../lib.cjs'), G = require('../gen.cjs');
const H = require('./hybrid.cjs');
const O3 = ['PNN', 'NPN', 'NNP'], O6 = ['PPN', 'PNP', 'NPP', 'PNN', 'NPN', 'NNP'];
const rec = (fs) => fs.map((f) => [f, 6 / fs.length]);
const levels = [
  { K: 4, m: 2, recipe: rec(['PN']) }, { K: 5, m: 2, recipe: rec(O3) }, { K: 6, m: 3, recipe: rec(O6), gate: true },
  { K: 7, m: 2, recipe: rec(O3) }, { K: 7, m: 3, recipe: rec(O3) }, { K: 7, m: 4, recipe: rec(O6) }, { K: 9, m: 3, recipe: rec(O3), gate: true },
];
let n = 0, bad = 0;
// Phần 1 (bản gốc): 3 bộ sinh × 7 cấu hình × 400 lượt × mỗi dạng thẻ = 30.000 bài.
// Phần 2 (thêm khi chép vào change): đúng 6 bậc T-Lai với bộ sinh M, 1.000 lượt × 6 bài mỗi bậc.
const jobs = [];
for (const v of ['U', 'D', 'M']) for (const lv of levels) jobs.push({ part: 1, v, lv, seed: 3, reps: 400 });
H['T-Lai'].forEach((lv, i) => jobs.push({ part: 2, v: 'M', lv, seed: 1000 + i, reps: 1000 }));
const tally = { 1: [0, 0], 2: [0, 0] };
for (const { part, v, lv, seed, reps } of jobs) {
  const g = G.buildGenerator(lv, v, seed); const rng = L.makeRng(part === 1 ? 77 : 77 + seed);
  const slots = []; lv.recipe.forEach(([f, c]) => { for (let i = 0; i < (part === 2 ? c : 1); i++) slots.push([f]); });
  for (let k = 0; k < reps; k++) for (const [f] of slots) {
    const z = G.samplePuzzle(g, f, lv.m, rng); n++; tally[part][0]++;
    const nC = f.length;
    // R9 (sửa 2026-10-21): dựng nhà bằng TÊN món thật khi có tên (bộ sinh đặt tên ở gen.cjs)
    const nm = z.names ? { c: (j) => 'i' + z.names.clue[j], f: (x) => 'i' + z.names.fill[[...new Set(z.fill.flat())].sort((a, b) => a - b).indexOf(x)] } : { c: (j) => 'c' + j, f: (x) => 'f' + x };
    const houses = z.tmpl.sigs.map((s, h) => [...[...Array(nC).keys()].filter((j) => (s >> j) & 1).map(nm.c), ...z.fill[h].map(nm.f)]);
    const clues = [...f].map((c, j) => ({ item: nm.c(j), has: c === 'P' }));
    const ok = (h, js) => js.every((j) => houses[h].includes(clues[j].item) === clues[j].has);
    const all = [...Array(nC).keys()];
    const sol = houses.map((_, h) => h).filter((h) => ok(h, all));
    const errs = [];
    if (sol.length !== 1 || sol[0] !== 0) errs.push('R1');
    for (const j of all) if (houses.map((_, h) => h).filter((h) => ok(h, all.filter((x) => x !== j))).length < 2) errs.push('R2');
    for (const j of all) { const c = houses.filter((h) => h.includes(clues[j].item)).length; if (c < 1 || c > houses.length - 1) errs.push('R3'); }
    if (z.names) { const onBoard = [...new Set(houses.flat())].map((x) => +x.slice(1)); if (L.hasNear(onBoard)) errs.push('R9'); if (new Set(z.names.clue).size !== 3) errs.push('R3name'); }
    if (houses.some((h) => h.length !== lv.m || new Set(h).size !== h.length)) errs.push('R4m');
    if (new Set(houses.map((h) => h.slice().sort().join())).size !== houses.length) errs.push('R4dup');
    const freq = {}; houses.flat().forEach((x) => (freq[x] = (freq[x] || 0) + 1));
    const clueItems = new Set(clues.map((c) => c.item));
    if (Object.entries(freq).some(([x, c]) => !clueItems.has(x) && c < 2)) errs.push('R5');
    if (errs.length) { bad++; tally[part][1]++; if (bad < 5) console.log(v, lv.K, lv.m, f, errs, houses); }
  }
}
console.log(`phần 1 (U/D/M × 7 cấu hình): kiểm ${tally[1][0]} bài, lỗi ${tally[1][1]}`);
console.log(`phần 2 (T-Lai, bộ sinh M, 6 bậc): kiểm ${tally[2][0]} bài, lỗi ${tally[2][1]}`);
console.log(`kiểm ${n} bài, lỗi ${bad}${L.R9 ? ' (có R9: tên món thật, pool 14, cặp chú cá / hộp quà)' : ' (NO_R9)'}`);
