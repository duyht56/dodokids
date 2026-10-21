'use strict';
// p1gen.cjs — sinh bàn có tên món từ bộ sinh P1 trước vòng 7 (research/sym.cjs sampleSym), và từ khuôn bất kỳ
// (gen.cjs baseTemplates) để làm tập tham chiếu "viết lại lời giải".
const L = require('./lib.cjs');
const S = require('./sym.cjs');
const G = require('./gen.cjs');
const c = (a, cc, d) => [a, 1, 1, cc, 1, cc, cc, d];
const CONF = {
  '8x2': { K: 8, m: 2, rows: [[c(2, 1, 0), 1]] },
  '8x3': { K: 8, m: 3, rows: [[c(2, 1, 0), 1]] },
  '9x3a': { K: 9, m: 3, rows: [[c(3, 1, 0), 1]] },
  '9x3b': { K: 9, m: 3, rows: [[c(2, 1, 1), 1]] },
  '9x2': { K: 9, m: 2, rows: [[c(3, 1, 0), 1]] },
};
const O3 = [['PNN', 2], ['NPN', 2], ['NNP', 2]];
const genCache = new Map();
function p1Gen(conf) { if (!genCache.has(conf)) genCache.set(conf, S.buildSym({ ...CONF[conf], recipe: O3 }, 7)); return genCache.get(conf); }
// Bàn vị trí (sigs theo vị trí thẻ, fill id món đệm) → houses có id món thật: thẻ j = clue[j], món đệm k = fillIds[k].
function nameIt(sigs, fill, names) {
  const ids = [...new Set(fill.flat())].sort((a, b) => a - b);
  return sigs.map((s, h) => [...[0, 1, 2].filter((j) => (s >> j) & 1).map((j) => names.clue[j]), ...fill[h].map((x) => names.fill[ids.indexOf(x)])]);
}
// Một bài P1: trả về {houses, cards, form, p}
function sampleP1(conf, form, rng, nrng) {
  const g = p1Gen(conf);
  const z = S.sampleSym(g, form, CONF[conf].m, rng);
  const nF = new Set(z.fill.flat()).size;
  const names = L.nameBoard(nF, nrng);
  return { houses: nameIt(z.sigs, z.fill, names), cards: names.clue, form, p: form.indexOf('P'), tries: z.tries, instOk: z.instOk };
}
// Bàn tham chiếu từ mọi khuôn hợp lệ (dạng PNN) K = 6..9, m = 2..3 (cho kiểm "viết lại lời giải").
function refBoards(n, seed = 5) {
  const rng = L.makeRng(seed), nrng = L.makeRng(seed + 1), out = [];
  for (let K = 6; K <= 9; K++) for (let m = 2; m <= 3; m++) {
    const fi = L.formInfo('PNN');
    for (const noise of L.enumTemplates(fi, K, m)) {
      const sigs = [fi.A, ...noise];
      for (let k = 0; k < n; k++) {
        const inst = L.assignFillers(sigs, m, rng); if (!inst) continue;
        const names = L.nameBoard(new Set(inst.fill.flat()).size, nrng); if (!names) continue;
        out.push({ houses: nameIt(sigs, inst.fill, names), cards: names.clue, p: 0 });
      }
    }
  }
  return out;
}
module.exports = { CONF, O3, p1Gen, nameIt, sampleP1, refBoards };
