'use strict';
// bayes-p.cjs — CẬN BAYES cho mọi mẹo "chỉ đọc thẻ có" (P-only): bé thấy bàn (không nhãn), biết món thẻ
// "có" A, KHÔNG dùng hai thẻ kia, và biết TOÀN BỘ danh mục cấu trúc của bộ sinh (trọng số đều, vai trò
// đều). Với mỗi "góc nhìn" (bàn bỏ tên + A đánh dấu), bé chọn nhà có hậu nghiệm lớn nhất.
// = Σ_góc nhìn max_nhà P(góc nhìn, đáp án = nhà).
//   node bayes-p.cjs <conf> strict   danh mục chặt của thiết kế (design §9 qua catalog.cjs; R5O=1: CAT5)
//   node bayes-p.cjs <conf> fam      mọi cấu trúc "đạt họ" vét được: cần chạy `node enum.cjs <conf>` trước
//                                    (9x3a: `T=3 node enum.cjs 9x3a`), đọc found-<conf>[-t3].json trong OUT
const fs = require('fs');
const path = require('path');
const OUT = process.env.OUT || path.join(require('os').tmpdir(), 'clue-detective-research');
const conf = process.argv[2], mode = process.argv[3] || 'fam';
let cat;
if (mode === 'strict') cat = (process.env.R5O ? require('./catalog.cjs').CAT5 : require('./catalog.cjs').CAT)[conf].map((houses) => ({ houses }));
else {
  const sfx = process.env.R5O ? '-r5o' : '';
  const file = process.env.FILE || [path.join(OUT, `found-${conf}-t3${sfx}.json`), path.join(OUT, `found-${conf}${sfx}.json`)].find((f) => fs.existsSync(f));
  if (!file) throw new Error(`chưa có found-${conf}*.json trong ${OUT}: chạy node enum.cjs ${conf} trước`);
  cat = JSON.parse(fs.readFileSync(file, 'utf8')).filter((x) => x.famOK);
}
// đẳng cấu giữa hai bàn có món đánh dấu: trả về ảnh của nhà h0 (của bàn 1) trong bàn 2 qua mọi đẳng cấu
function isoImages(H1, a1, H2, a2, h0) {
  const items1 = [...new Set(H1.flat())], items2 = [...new Set(H2.flat())];
  if (items1.length !== items2.length || H1.length !== H2.length) return [];
  const sig = (H, it, mk) => { // màu WL
    let col = new Map(it.map((x) => [x, x === mk ? 'M' : 'x']));
    for (let r = 0; r < 5; r++) {
      const hc = H.map((h) => h.map((x) => col.get(x)).sort().join('|'));
      const nc = new Map(it.map((x) => [x, col.get(x) + '#' + H.map((h, k) => (h.includes(x) ? hc[k] : null)).filter(Boolean).sort().join('/')]));
      col = nc;
    }
    return col;
  };
  const c1 = sig(H1, items1, a1), c2 = sig(H2, items2, a2);
  const ms = (c) => [...c.values()].sort().join(';');
  if (ms(c1) !== ms(c2)) return [];
  const key = (h) => h.slice().sort((x, y) => x - y).join(',');
  const set2 = new Map(); H2.forEach((h, k) => set2.set(key(h), k));
  const inc1 = new Map(items1.map((x) => [x, H1.filter((h) => h.includes(x))]));
  const order = items1.slice().sort((x, y) => (x === a1 ? -1 : y === a1 ? 1 : 0));
  const img = new Map(), used = new Set(), out = new Set();
  (function rec(d) {
    if (d === order.length) { out.add(set2.get(key(H1[h0].map((x) => img.get(x))))); return; }
    const x = order[d];
    for (const y of items2) {
      if (used.has(y) || c1.get(x) !== c2.get(y)) continue;
      img.set(x, y); used.add(y);
      let ok = true;
      for (const h of inc1.get(x)) if (h.every((z) => img.has(z)) && !set2.has(key(h.map((z) => img.get(z))))) { ok = false; break; }
      if (ok) rec(d + 1);
      img.delete(x); used.delete(y);
    }
  })(0);
  return [...out];
}
// gom góc nhìn
const views = []; // { H, a, mass: Map(houseIdx → khối lượng) }
const w = 1 / (cat.length * 3);
for (const e of cat) for (let p = 0; p < 3; p++) {
  const H = e.houses, a = p, ans = H.findIndex((h) => h.includes(p) && [0, 1, 2].every((j) => j === p || !h.includes(j)));
  let placed = false;
  for (const v of views) {
    const im = isoImages(H, a, v.H, v.a, ans);
    if (im.length) { im.forEach((k) => v.mass.set(k, (v.mass.get(k) || 0) + w / im.length)); v.n++; placed = true; break; }
  }
  if (!placed) { const im = isoImages(H, a, H, a, ans); views.push({ H, a, mass: new Map(im.map((k) => [k, w / im.length])), n: 1 }); }
}
let bayes = 0, worstView = 0;
for (const v of views) { const tot = [...v.mass.values()].reduce((x, y) => x + y, 0); const mx = Math.max(...v.mass.values()); bayes += mx; worstView = Math.max(worstView, mx / tot); }
console.log(`${conf} danh mục ${mode} ${cat.length} cấu trúc (× 3 vai trò): ${views.length} góc nhìn P-only; cận Bayes P-only = ${(bayes * 100).toFixed(1)}%/bài; góc nhìn tệ nhất ${(worstView * 100).toFixed(1)}%`);
// chi tiết góc nhìn: mỗi góc nhìn, các cặp (cấu trúc, vai trò) và nhà đáp án (chỉ số nhà ở bàn tham chiếu)
if (process.env.DETAIL) {
  const nm = 'ABCDEFGHIJKLMN';
  views.forEach((v, i) => {
    const aH = v.H.map((h, k) => (h.includes(v.a) ? k : -1)).filter((k) => k >= 0);
    const orbits = new Map(); aH.forEach((h) => { const im = isoImages(v.H, v.a, v.H, v.a, h).sort().join(','); orbits.set(im, 1); });
    console.log(`góc nhìn ${i}: ${v.n} cặp; nhà có A ${aH.join(',')}; quỹ đạo ${[...orbits.keys()].map((o) => '{' + o + '}').join(' ')}; khối lượng ${aH.map((h) => ((v.mass.get(h) || 0) / w).toFixed(2)).join('/')} | ${v.H.map((h) => h.map((x) => nm[x]).join('')).join(' ')}`);
  });
}
