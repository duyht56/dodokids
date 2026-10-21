'use strict';
// autom.cjs — nhóm tự đẳng cấu của bàn (siêu đồ thị món–nhà, bỏ tên món): hoán vị món giữ nguyên đa tập
// các nhà. Dùng cho "tính hoán đổi được": quỹ đạo nhà đáp án dưới Stab(món thẻ "có").
function autos(houses, fixed = [], limit = 100000) {
  const items = [...new Set(houses.flat())].sort((a, b) => a - b);
  const idx = new Map(items.map((x, i) => [x, i]));
  const n = items.length;
  const H = houses.map((h) => h.map((x) => idx.get(x)).sort((a, b) => a - b));
  const hkey = (h) => h.slice().sort((a, b) => a - b).join(',');
  const hcount = new Map(); H.forEach((h) => hcount.set(hkey(h), (hcount.get(hkey(h)) || 0) + 1));
  // màu: tinh chỉnh kiểu 1-WL trên đồ thị hai phía món–nhà; món cố định có màu riêng
  let col = items.map((x, i) => (fixed.map((y) => idx.get(y)).includes(i) ? 'F' + fixed.map((y) => idx.get(y)).indexOf(i) : 'x'));
  for (let it = 0; it < 6; it++) {
    const hc = H.map((h) => h.map((i) => col[i]).sort().join('|'));
    const nc = items.map((_, i) => col[i] + '#' + H.map((h, k) => (h.includes(i) ? hc[k] : null)).filter(Boolean).sort().join('/'));
    const m = new Map(); [...new Set(nc)].sort().forEach((c, k) => m.set(c, 'c' + k));
    col = nc.map((c) => m.get(c));
  }
  const inc = items.map((_, i) => H.map((h, k) => (h.includes(i) ? k : -1)).filter((k) => k >= 0));
  const res = []; const img = new Array(n).fill(-1), used = new Array(n).fill(false);
  const order = [...Array(n).keys()].sort((a, b) => inc[b].length - inc[a].length);
  (function rec(d) {
    if (res.length >= limit) return;
    if (d === n) { res.push(img.slice()); return; }
    const i = order[d];
    for (let j = 0; j < n; j++) {
      if (used[j] || col[j] !== col[i]) continue;
      img[i] = j; used[j] = true;
      // kiểm các nhà đã ánh xạ đủ
      let ok = true;
      for (const k of inc[i]) { const h = H[k]; if (h.every((x) => img[x] >= 0)) { if (!hcount.has(hkey(h.map((x) => img[x])))) { ok = false; break; } } }
      if (ok) rec(d + 1);
      img[i] = -1; used[j] = false;
    }
  })(0);
  // ánh xạ về id thật
  return res.map((p) => new Map(items.map((x, i) => [x, items[p[i]]])));
}
// quỹ đạo của nhà h0 (chỉ số) dưới nhóm cố định `fixed`: tập chỉ số nhà
function houseOrbit(houses, h0, fixed) {
  const G = autos(houses, fixed);
  const key = (h) => h.slice().sort((a, b) => a - b).join(',');
  const pos = new Map(); houses.forEach((h, k) => { const kk = key(h); if (!pos.has(kk)) pos.set(kk, []); pos.get(kk).push(k); });
  const orb = new Set();
  for (const g of G) orb.add(key(houses[h0].map((x) => g.get(x))));
  return { size: orb.size, group: G.length };
}
module.exports = { autos, houseOrbit };
