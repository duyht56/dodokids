'use strict';
// clue-sim/runlevel.cjs — mô phỏng một bậc: R vòng × 6 bài, p từng bài chính xác, Poisson–binomial mỗi vòng.
const L = require('../lib.cjs');
const G = require('../gen.cjs');
function runLevel(level, variant, seed, ROUNDS) {
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

module.exports = { runLevel };
