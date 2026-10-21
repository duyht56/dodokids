'use strict';
// fam.cjs — HỌ "lọc rồi xếp hạng" S16 (design §9; mở rộng thư viện S1–S15, Codex vòng 7) trên một bàn có tên món.
// Bàn: houses = [[id món]], cards = [id thẻ 1, thẻ 2, thẻ 3] (theo vị trí đọc); vai trò p = vị trí thẻ "có".
// Chiến lược = (bộ lọc) × (thống kê xếp hạng, chiều min/max) hoặc chọn đều trong bộ lọc.
// Quy tắc chấm như design §9: chọn đều trong tập; tập rỗng → đoán bừa 1/K.
// Phân loại:
//   NN   = KHÔNG dùng phủ định: chỉ đọc thẻ "có" đúng nghĩa; thẻ "không có" bị bỏ qua, đọc như "có",
//          hoặc chỉ dùng làm "món trên thẻ" không dấu (đếm món-thẻ S6/S7/S8, chữ ký S9).
//   PART = suy luận một phần có phủ định: ít nhất một thẻ "không có" đọc đúng nghĩa (S1@N, S3, S13, ...).
// Thống kê nhà (đều không đọc dấu):
//   card-blind: sumF/minF/maxF (tần suất món trên toàn bàn), nUniq (món chỉ 1 nhà), nRare (món có tần
//   suất nhỏ nhất bàn), degSum/degMin/degMax (bậc đồng xuất hiện = số món khác từng cùng nhà),
//   hdeg (số nhà khác chung ≥ 1 món), pairMax/pairSum (số nhà chứa cùng cặp món), f2Sum (Σ f²);
//   card-aware (cần biết món nào nằm trên thẻ, không dấu): fillMean/fillMin/fillMax (tần suất món đệm),
//   fillDegMean (bậc đồng xuất hiện món đệm), fillSum (Σ tần suất món đệm = số món đệm × TB: gắn với
//   "số món-thẻ", xem ghi chú REWRITE).
// Nhà không có món đệm: thống kê món đệm "không xác định" → bị loại khỏi phép xếp hạng (trừ khi cả tập
// đều không xác định → chọn đều).
const STATS = ['sumF', 'minF', 'maxF', 'nUniq', 'nRare', 'degSum', 'degMin', 'degMax', 'hdeg', 'pairMax', 'pairSum', 'f2Sum', 'fillMean', 'fillMin', 'fillMax', 'fillDegMean', 'fillSum'];
const CARD_AWARE = new Set(['fillMean', 'fillMin', 'fillMax', 'fillDegMean', 'fillSum']);

function boardStats(houses, cards) {
  const K = houses.length, f = new Map(), nb = new Map(), pair = new Map();
  for (const h of houses) for (const i of h) { f.set(i, (f.get(i) || 0) + 1); if (!nb.has(i)) nb.set(i, new Set()); }
  for (const h of houses) for (const i of h) for (const j of h) if (i !== j) { nb.get(i).add(j); if (i < j) { const k = i + ',' + j; pair.set(k, (pair.get(k) || 0) + 1); } }
  const fmin = Math.min(...f.values());
  const cardSet = new Set(cards);
  const st = {}; for (const s of STATS) st[s] = new Array(K);
  houses.forEach((h, x) => {
    const fs = h.map((i) => f.get(i)), ds = h.map((i) => nb.get(i).size);
    st.sumF[x] = fs.reduce((a, b) => a + b, 0); st.minF[x] = Math.min(...fs); st.maxF[x] = Math.max(...fs);
    st.nUniq[x] = fs.filter((v) => v === 1).length; st.nRare[x] = fs.filter((v) => v === fmin).length;
    st.degSum[x] = ds.reduce((a, b) => a + b, 0); st.degMin[x] = Math.min(...ds); st.degMax[x] = Math.max(...ds);
    let hd = 0; houses.forEach((g, y) => { if (y !== x && g.some((i) => h.includes(i))) hd++; }); st.hdeg[x] = hd;
    let pm = 0, ps = 0; for (let a = 0; a < h.length; a++) for (let b = a + 1; b < h.length; b++) { const [i, j] = h[a] < h[b] ? [h[a], h[b]] : [h[b], h[a]]; const c = pair.get(i + ',' + j); pm = Math.max(pm, c); ps += c; }
    st.pairMax[x] = pm; st.pairSum[x] = ps; st.f2Sum[x] = fs.reduce((a, b) => a + b * b, 0);
    const fl = h.filter((i) => !cardSet.has(i)), ff = fl.map((i) => f.get(i));
    if (fl.length) { st.fillMean[x] = ff.reduce((a, b) => a + b, 0) / fl.length; st.fillMin[x] = Math.min(...ff); st.fillMax[x] = Math.max(...ff); st.fillDegMean[x] = fl.reduce((a, i) => a + nb.get(i).size, 0) / fl.length; st.fillSum[x] = ff.reduce((a, b) => a + b, 0); }
    else for (const s of ['fillMean', 'fillMin', 'fillMax', 'fillDegMean', 'fillSum']) st[s][x] = null;
  });
  const ncard = houses.map((h) => h.filter((i) => cardSet.has(i)).length);
  const sig = houses.map((h) => cards.reduce((a, c, j) => a | (h.includes(c) ? 1 << j : 0), 0));
  const sigMult = {}; sig.forEach((s) => (sigMult[s] = (sigMult[s] || 0) + 1));
  return { K, f, st, ncard, sig, sigMult };
}

// Bộ lọc theo vai trò p. Trả về [{name, cat, set: mảng chỉ số nhà}].
function filters(B, houses, cards, p) {
  const K = B.K, all = [...Array(K).keys()];
  const [q, r] = [0, 1, 2].filter((j) => j !== p);
  const has = (x, j) => houses[x].includes(cards[j]);
  const mx = Math.max(...B.ncard), mn = Math.min(...B.ncard);
  const F = [];
  const add = (name, cat, pred) => F.push({ name, cat, set: all.filter(pred) });
  // --- NN ---
  add('ALL', 'NN', () => true);
  add('P', 'NN', (x) => has(x, p));
  add('ANY', 'NN', (x) => B.ncard[x] >= 1);
  add('S8', 'NN', (x) => B.ncard[x] === 1);
  add('S9', 'NN', (x) => B.sigMult[B.sig[x]] === 1);
  add('S6', 'NN', (x) => B.ncard[x] === mx);
  add('S7', 'NN', (x) => B.ncard[x] === mn);
  add('P∩S9', 'NN', (x) => has(x, p) && B.sigMult[B.sig[x]] === 1);
  add('P∩S6', 'NN', (x) => has(x, p) && B.ncard[x] === Math.max(...all.filter((y) => has(y, p)).map((y) => B.ncard[y])));
  add('asP:q', 'NN', (x) => has(x, q)); add('asP:r', 'NN', (x) => has(x, r));
  add('asP:qr', 'NN', (x) => has(x, q) && has(x, r));
  add('P∩asP:q', 'NN', (x) => has(x, p) && has(x, q)); add('P∩asP:r', 'NN', (x) => has(x, p) && has(x, r));
  add('S4', 'NN', (x) => has(x, p) && has(x, q) && has(x, r));
  add('notP', 'NN', (x) => !has(x, p));
  add('S8∩S9', 'NN', (x) => B.ncard[x] === 1 && B.sigMult[B.sig[x]] === 1);
  // viết lại lời giải (dạng 1 có + 2 không): có món thẻ có + đúng 1 / ít món-thẻ nhất
  add('P∩S8', 'REWRITE', (x) => has(x, p) && B.ncard[x] === 1);
  add('P∩S7', 'REWRITE', (x) => has(x, p) && B.ncard[x] === Math.min(...all.filter((y) => has(y, p)).map((y) => B.ncard[y])));
  // --- PART (đọc đúng ít nhất một thẻ "không có") ---
  add('N:q', 'PART', (x) => !has(x, q)); add('N:r', 'PART', (x) => !has(x, r));
  add('S3', 'PART', (x) => !has(x, q) && !has(x, r));
  add('S13:dropR', 'PART', (x) => has(x, p) && !has(x, q)); add('S13:dropQ', 'PART', (x) => has(x, p) && !has(x, r));
  add('N:q∩asP:r', 'PART', (x) => !has(x, q) && has(x, r)); add('N:r∩asP:q', 'PART', (x) => !has(x, r) && has(x, q));
  add('N:q∩S8', 'PART', (x) => !has(x, q) && B.ncard[x] === 1); add('N:r∩S8', 'PART', (x) => !has(x, r) && B.ncard[x] === 1);
  add('S3∩S9', 'PART', (x) => !has(x, q) && !has(x, r) && B.sigMult[B.sig[x]] === 1);
  return F;
}

// Đánh giá mọi chiến lược của họ cho vai trò p. ans = chỉ số nhà đáp án. Trả về Map tên → {cat, p}.
function evalFamily(houses, cards, p, B = boardStats(houses, cards)) {
  const K = B.K;
  const ans = houses.findIndex((h, x) => h.includes(cards[p]) && [0, 1, 2].every((j) => j === p || !h.includes(cards[j])));
  const out = new Map();
  const score = (set) => (set.length === 0 ? 1 / K : set.includes(ans) ? 1 / set.length : 0);
  for (const F of filters(B, houses, cards, p)) {
    out.set(F.name + '|uni', { cat: F.cat, p: score(F.set) });
    for (const s of STATS) {
      const v = B.st[s];
      const def = F.set.filter((x) => v[x] !== null);
      const base = def.length ? def : F.set;
      for (const dir of ['min', 'max']) {
        let set = base;
        if (def.length) { const ext = dir === 'min' ? Math.min(...def.map((x) => v[x])) : Math.max(...def.map((x) => v[x])); set = def.filter((x) => Math.abs(v[x] - ext) < 1e-9); }
        out.set(`${F.name}|${s}.${dir}`, { cat: F.cat, p: F.set.length === 0 ? 1 / K : score(set) });
      }
    }
  }
  return { ans, out };
}

module.exports = { STATS, CARD_AWARE, boardStats, filters, evalFamily };
