'use strict';
// Thành phần liên thông (cấu trúc ↔ góc nhìn P-only) của danh mục "đạt họ"; kiểm từng thành phần có cân
// bằng hậu nghiệm (đều trên ba nhà có A) với trọng số đều không — nếu có, thêm cả thành phần vào danh mục
// mà cận Bayes P-only vẫn = 1/3 (hoán đổi được THEO PHÂN PHỐI, không theo từng bàn).
// node views.cjs [conf=9x3a]   (cần `node enum.cjs <conf>` trước; 9x3a: `T=3 node enum.cjs 9x3a`; đọc OUT như enum.cjs)
const fs = require('fs');
const path = require('path');
const OUT = process.env.OUT || path.join(require('os').tmpdir(), 'clue-detective-research');
const src = fs.readFileSync(__dirname + '/bayes-p.cjs', 'utf8');
const conf = process.argv[2] || '9x3a';
const file = [path.join(OUT, `found-${conf}-t3.json`), path.join(OUT, `found-${conf}.json`)].find((f) => fs.existsSync(f));
if (!file) throw new Error(`chưa có found-${conf}*.json trong ${OUT}: chạy node enum.cjs ${conf} trước`);
const cat = JSON.parse(fs.readFileSync(file, 'utf8')).filter((x) => x.famOK);
// lấy isoImages từ bayes-p.cjs
const isoImages = new Function('return ' + src.slice(src.indexOf('function isoImages'), src.indexOf('// gom góc nhìn')).trim())();
const views = []; const contrib = cat.map(() => []);
cat.forEach((e, ei) => { for (let p = 0; p < 3; p++) {
  const H = e.houses, ans = H.findIndex((h) => h.includes(p) && [0, 1, 2].every((j) => j === p || !h.includes(j)));
  let vi = views.findIndex((v) => isoImages(H, p, v.H, v.a, ans).length);
  if (vi < 0) { views.push({ H, a: p }); vi = views.length - 1; }
  const im = isoImages(H, p, views[vi].H, views[vi].a, ans);
  contrib[ei].push({ vi, im });
} });
// union-find theo góc nhìn chung
const par = cat.map((_, i) => i); const find = (x) => (par[x] === x ? x : (par[x] = find(par[x])));
const byView = new Map(); contrib.forEach((cs, ei) => cs.forEach(({ vi }) => { if (byView.has(vi)) par[find(ei)] = find(byView.get(vi)); else byView.set(vi, ei); }));
const comps = new Map(); cat.forEach((_, i) => { const r = find(i); if (!comps.has(r)) comps.set(r, []); comps.get(r).push(i); });
let add = 0;
for (const [, es] of comps) {
  const mass = new Map();
  for (const ei of es) for (const { vi, im } of contrib[ei]) { if (!mass.has(vi)) mass.set(vi, new Map()); const m = mass.get(vi); im.forEach((k) => m.set(k, (m.get(k) || 0) + 1 / im.length)); }
  let bal = true;
  for (const [vi, m] of mass) { const aH = views[vi].H.map((h, k) => (h.includes(views[vi].a) ? k : -1)).filter((k) => k >= 0); const vals = aH.map((k) => m.get(k) || 0); if (Math.max(...vals) - Math.min(...vals) > 1e-9) bal = false; }
  const strict = es.every((ei) => cat[ei].orbit >= 3);
  console.log(`thành phần ${es.length} cấu trúc, ${mass.size} góc nhìn: ${bal ? 'CÂN BẰNG' : 'lệch'}${strict ? ' (chặt)' : ''}`);
  if (bal) add += es.length;
}
console.log(`${conf}: cấu trúc dùng được với cận Bayes P-only = 1/3 (trọng số đều theo thành phần): ${add} / ${cat.length}`);
// Trọng số KHÔNG đều trong từng thành phần lệch: tìm w ≥ 0, Σw = 1 sao cho mọi góc nhìn của thành phần có
// hậu nghiệm đều trên ba nhà có A (min ‖Mw‖² bằng gradient chiếu lên đơn hình, nhiều khởi tạo); báo phần
// dư và số cấu trúc có trọng số > 1%.
function projSimplex(v) { const u = v.slice().sort((a, b) => b - a); let c = 0, th = 0; for (let i = 0; i < u.length; i++) { c += u[i]; const t = (c - 1) / (i + 1); if (u[i] - t > 0) th = t; } return v.map((x) => Math.max(0, x - th)); }
let extra = 0;
for (const [, es] of comps) {
  const rows = [];
  const viewsOf = [...new Set(es.flatMap((ei) => contrib[ei].map((c) => c.vi)))];
  for (const vi of viewsOf) {
    const aH = views[vi].H.map((h, k) => (h.includes(views[vi].a) ? k : -1)).filter((k) => k >= 0);
    for (let x = 1; x < aH.length; x++) rows.push(es.map((ei) => contrib[ei].filter((c) => c.vi === vi).reduce((s, c) => s + (c.im.includes(aH[x]) ? 1 / c.im.length : 0) - (c.im.includes(aH[0]) ? 1 / c.im.length : 0), 0)));
  }
  let best = null;
  for (let rs = 0; rs < 20; rs++) {
    let w = projSimplex(es.map(() => Math.random()));
    for (let it = 0; it < 20000; it++) {
      const r = rows.map((row) => row.reduce((s, a, i) => s + a * w[i], 0));
      const g = es.map((_, i) => rows.reduce((s, row, k) => s + 2 * row[i] * r[k], 0));
      w = projSimplex(w.map((x, i) => x - 0.05 * g[i]));
    }
    const res = Math.sqrt(rows.reduce((s, row) => s + row.reduce((t, a, i) => t + a * w[i], 0) ** 2, 0));
    const sup = w.filter((x) => x > 0.01).length;
    if (!best || res < best.res - 1e-6 || (Math.abs(res - best.res) < 1e-6 && sup > best.sup)) best = { res, sup, w };
  }
  const bal = best.res < 1e-4;
  console.log(`  thành phần ${es.length}: phần dư ${best.res.toExponential(1)} → ${bal ? 'CÂN ĐƯỢC' : 'không cân được'}, cấu trúc có trọng số > 1%: ${best.sup}`);
  if (bal) extra += best.sup;
}
console.log(`${conf}: tối đa ~${extra} cấu trúc dùng được (trọng số tối ưu) với cận Bayes P-only = 1/3 theo phân phối`);
