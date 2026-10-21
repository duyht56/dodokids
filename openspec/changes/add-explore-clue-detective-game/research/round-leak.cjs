'use strict';
// round-leak.cjs — bé "mù dấu" nhưng nhớ dạng thẻ các bài trước trong vòng (biết qua phản hồi đáp án)
// và biết luật vòng "mỗi dạng đúng ×2": đoán dạng còn nhiều nhất. Khuôn đối xứng ⇒ đúng dạng = đúng bài.
const L = require('./lib.cjs');
function dist(counts) { // trả về phân phối số bài đúng
  const memo = new Map();
  const rec = (c) => {
    const k = c.join(','); if (memo.has(k)) return memo.get(k);
    const tot = c[0] + c[1] + c[2]; if (!tot) return [1];
    const mx = Math.max(...c), nmx = c.filter((x) => x === mx).length;
    const out = [];
    for (let f = 0; f < 3; f++) if (c[f]) {
      const pf = c[f] / tot, pc = c[f] === mx ? 1 / nmx : 0; // đoán đều trong các dạng còn nhiều nhất
      const nc = c.slice(); nc[f]--; const sub = rec(nc);
      sub.forEach((v, i) => { out[i] = (out[i] || 0) + pf * (1 - pc) * v; out[i + 1] = (out[i + 1] || 0) + pf * pc * v; });
    }
    for (let i = 0; i < out.length; i++) out[i] = out[i] || 0;
    memo.set(k, out); return out;
  };
  return rec(counts);
}
const d = dist([2, 2, 2]);
const q = d.slice(4).reduce((a, b) => a + b, 0);
const mean = d.reduce((a, v, i) => a + v * i, 0) / 6;
console.log(`túi ×2 mỗi dạng: đúng TB ${(mean * 100).toFixed(1)}%/bài, P(≥4/6) ${(q * 100).toFixed(1)}%, qua ${(L.passOf(q) * 100).toFixed(1)}%`);
console.log(`dạng rút độc lập đều: ${(L.passConst(1 / 3) * 100).toFixed(1)}%`);
