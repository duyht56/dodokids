'use strict';
// naming-bias.cjs — cận Bayes "chỉ đọc thẻ có" khi bé biết cả CÁCH ĐẶT TÊN MÓN của bộ sinh (design §9 "Đặt tên đều").
// Bé thấy bàn có tên món và món thẻ "có" (cùng vị trí của nó), không dùng hai thẻ kia, biết danh mục
// CLUE_STRUCTURES (đọc từ design qua catalog.cjs) và biết cách đặt tên. Chỉ chú cá / hộp quà (cặp gần âm) phân
// biệt được; 12 món còn lại hoán đổi được, nên góc nhìn = bàn bỏ tên món thường, giữ món thẻ "có" và món X (cá
// hoặc quà) nếu có.
//   seq     = rút tuần tự thẻ 1→3 rồi D, E, …, loại món gần âm NGAY khi chọn (lib.cjs nameBoard, bản trước):
//             món chọn sớm làm các bước sau bớt một món, nên X hay rơi vào chỗ thẻ hơn chỗ đệm.
//   uniform = đều trên mọi phép gán hợp lệ (xgen.cjs nameUniform, đang dùng): cận đúng 1/3.
// Phần 2 lấy mẫu trên bộ sinh thật (xgen.cjs) mẹo đơn giản "né nhà có cá/quà": lọc nhà có món thẻ "có"; nếu
// đúng một nhà trong đó có chú cá hoặc hộp quà (không phải món thẻ "có") thì chọn đều trong các nhà còn lại.
//   node naming-bias.cjs [số bài mẫu mỗi bậc = 30000]
const L = require('./lib.cjs');
const X = require('./xgen.cjs');
const { CAT, LEVELS } = require('./catalog.cjs');

const NS = +(process.argv[2] || 30000);
const pct = (x) => (x * 100).toFixed(1).replace('.', ',') + '%';
const pass = (p) => { const C = [1, 6, 15, 20, 15, 6, 1]; let q = 0; for (let k = 4; k <= 6; k++) q += C[k] * p ** k * (1 - p) ** (6 - k); return 1 - (1 - q) ** 2; };
const P12 = (n) => { let c = 1; for (let k = 0; k < n; k++) c *= 12 - k; return c; };

// Xác suất biến cố "món X cụ thể ở chỗ s, mọi chỗ khác là món thường" (s = -1: không có cá lẫn quà); N chỗ.
function slotProb(N, s, mode) {
  if (mode === 'uniform') { const V = P12(N) + 2 * N * P12(N - 1); return (s >= 0 ? P12(N - 1) : P12(N)) / V; }
  let pr = 1, ways = 1, xChosen = false, ord = 12;
  for (let k = 0; k < N; k++) {
    pr /= 14 - k - (xChosen ? 1 : 0); // trước khi chọn X, cả cá lẫn quà còn trong pool; chọn X rồi thì cấm món kia
    if (k === s) xChosen = true; else { ways *= ord; ord--; }
  }
  return pr * ways;
}

const permCache = new Map();
function perms(n) {
  if (permCache.has(n)) return permCache.get(n);
  const out = [], a = [...Array(n).keys()];
  (function rec(k) { if (k === n) { out.push(a.slice()); return; } for (let i = k; i < n; i++) { [a[k], a[i]] = [a[i], a[k]]; rec(k + 1); [a[k], a[i]] = [a[i], a[k]]; } })(0);
  permCache.set(n, out);
  return out;
}
// Khoá chuẩn của góc nhìn (bỏ tên món thường) + ảnh của đáp án qua mọi phép đổi tên cho khoá nhỏ nhất.
function view(H, pItem, xItem, ans) {
  const items = [...new Set(H.flat())];
  const ord = items.filter((i) => i !== pItem && i !== xItem);
  let best = null, imgs = [];
  for (const pm of perms(ord.length)) {
    const mp = new Map([[pItem, 'P'], [xItem, 'X']]);
    ord.forEach((o, i) => mp.set(o, String.fromCharCode(97 + pm[i])));
    const k = H.map((h) => h.map((i) => mp.get(i)).sort().join('')).sort().join(' ');
    const a = ans.map((i) => mp.get(i)).sort().join('');
    if (best === null || k < best) { best = k; imgs = [a]; } else if (k === best) imgs.push(a);
  }
  return { key: best, imgs };
}

function exactBayes(conf, forms, mode) {
  const rows = CAT[conf];
  const views = new Map();
  for (const H of rows) {
    const slots = [0, 1, 2, ...[...new Set(H.flat().filter((i) => i >= 3))].sort((a, b) => a - b)];
    const N = slots.length;
    for (const form of forms) {
      const p = form.indexOf('P');
      const ans = H.find((h) => h.includes(p) && [0, 1, 2].every((j) => j === p || !h.includes(j)));
      for (let s = -1; s < N; s++) {
        const w = (1 / rows.length) * (1 / forms.length) * slotProb(N, s, mode) * (s >= 0 ? 2 : 1);
        const v = view(H, p, s >= 0 ? slots[s] : null, ans);
        const vk = v.key + '|p' + p; // bé thấy vị trí thẻ "có"
        if (!views.has(vk)) views.set(vk, new Map());
        const V = views.get(vk);
        for (const a of v.imgs) V.set(a, (V.get(a) || 0) + w / v.imgs.length);
      }
    }
  }
  let tot = 0, best = 0, worst = 0;
  for (const V of views.values()) { const vals = [...V.values()], t = vals.reduce((x, y) => x + y, 0); tot += t; best += Math.max(...vals); worst = Math.max(worst, Math.max(...vals) / t); }
  return { p: best / tot, worst, n: views.size, tot };
}

function avoidTrick(conf, forms, naming, seed) {
  const rng = L.makeRng(seed), nrng = L.makeRng(seed + 1), frng = L.makeRng(seed + 2), prng = L.makeRng(seed + 3);
  const SPECIAL = new Set(L.NEAR.flat());
  let sum = 0;
  for (let t = 0; t < NS; t++) {
    const form = forms[frng.int(forms.length)];
    const b = X.sampleX(conf, form, rng, nrng, prng, 'CAT', naming);
    const P = b.cards[b.p];
    const ph = b.houses.map((_, i) => i).filter((i) => b.houses[i].includes(P));
    const ans = b.houses.findIndex((h) => h.includes(P) && b.cards.every((c, j) => j === b.p || !h.includes(c)));
    const xh = ph.filter((i) => b.houses[i].some((it) => it !== P && SPECIAL.has(it)));
    const cand = xh.length === 1 ? ph.filter((i) => i !== xh[0]) : ph;
    sum += cand.includes(ans) ? 1 / cand.length : 0;
  }
  return sum / NS;
}

console.log('Cận Bayes "chỉ đọc thẻ có" khi bé biết cả cách đặt tên (chính xác; ô = đúng mỗi bài → qua bậc 6/4/1):');
console.log('| Bậc | Cấu hình | Rút tuần tự, loại gần âm ngay khi chọn (bản trước) | Đặt tên đều (đang dùng) | Mẹo "né nhà có cá/quà", lấy mẫu: tuần tự / đều |');
console.log('|---|---|---|---|---|');
let allOk = true;
LEVELS.forEach(([confs, forms], i) => {
  if (i === 1 || i === 5) return; // bậc 2 = bậc 1, bậc 6 = bậc 5
  const conf = confs[0];
  const s = exactBayes(conf, forms, 'seq'), u = exactBayes(conf, forms, 'uniform');
  if (Math.abs(u.tot - 1) > 1e-9 || Math.abs(s.tot - 1) > 1e-9) throw new Error('xác suất không cộng về 1');
  if (Math.abs(u.p - 1 / 3) > 1e-9 || Math.abs(u.worst - 1 / 3) > 1e-9) allOk = false;
  const as = avoidTrick(conf, forms, 'seq', 9100 + i), au = avoidTrick(conf, forms, 'uniform', 9100 + i);
  const lv = i === 0 ? '1–2' : i === 4 ? '5–6' : String(i + 1);
  console.log(`| ${lv} | ${conf} ${forms.length > 1 ? 'độc lập' : 'PNN'} | ${pct(s.p)} → ${pct(pass(s.p))} (góc nhìn tệ nhất ${pct(s.worst)}) | ${pct(u.p)} → ${pct(pass(u.p))} (tệ nhất ${pct(u.worst)}) | ${pct(as)} → ${pct(pass(as))} / ${pct(au)} → ${pct(pass(au))} |`);
});
console.log(allOk ? 'KIỂM: đặt tên đều → cận Bayes "chỉ đọc thẻ có" đúng 1/3 trên mọi góc nhìn, mọi bậc.' : 'KIỂM: TRƯỢT — đặt tên đều vẫn lệch 1/3');
