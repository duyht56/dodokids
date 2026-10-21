'use strict';
// clue-sim/gen.cjs — dựng bộ sinh cho một bậc theo 4 biến thể:
//  U  = bộ sinh design (R6: từng chiến lược riêng ≤ 1/3, nới 1/2 → 1 khi bất khả; bậc cổng thêm S13)
//  D  = U + "chữ ký nhà nhiễu đôi một khác nhau khi có thể" (giữ khuôn có nhiều chữ ký nhiễu khác nhau nhất)
//  M  = minimax: mọi chiến lược KHÔNG dùng phủ định trong thư viện (kể cả mẹo ghép) ≤ 1/3 từng bài;
//       bậc cổng thêm S13 ≤ 1/3; rồi (nếu còn khuôn) từng chiến lược design ≤ 1/3.
//       Không đạt 1/3 thì trộn khuôn bằng Hedge (trò chơi tổng không: bộ sinh trộn, bé chọn 1 chiến lược).
//  MD = M + tầng "chữ ký nhiễu khác nhau" (nếu còn khuôn).
const L = require('./lib.cjs');

const T13 = 1 / 3 + 1e-9;
const cache = new Map();

// Khuôn cơ sở của (form, K, m): hợp lệ R1–R5 (kiểm món đệm thật), kèm vector p mức chữ ký.
function baseTemplates(form, K, m) {
  const key = form + K + 'x' + m;
  if (cache.has(key)) return cache.get(key);
  const fi = L.formInfo(form), rng = L.makeRng(12345);
  const out = [];
  for (const noise of L.enumTemplates(fi, K, m)) {
    const sigs = [fi.A, ...noise];
    let inst = null;
    for (let t = 0; t < 30 && !inst; t++) inst = L.assignFillers(sigs, m, rng);
    if (!inst) continue; // không xếp được món đệm (R4/R5)
    const pv = L.evalPuzzle(fi, sigs, inst.fill, inst.mult);
    const distinct = new Set(noise).size;
    out.push({ noise, sigs, pv, distinct });
  }
  const res = { fi, templates: out };
  cache.set(key, res);
  return res;
}

// Chiến lược "≡ luật đúng" trên một dạng thẻ: p = 1 ở MỌI khuôn hợp lệ của dạng đó,
// gộp mọi cấu hình K = 4..9, m = 2..4 (không phụ thuộc bảng bậc).
const tautCache = new Map();
function tautFor(form) {
  if (tautCache.has(form)) return tautCache.get(form);
  const rows = [];
  for (let K = 4; K <= 9; K++) for (let m = 2; m <= 4; m++) rows.push(...baseTemplates(form, K, m).templates);
  const taut = new Set();
  if (rows.length) for (let i = 0; i < L.NS; i++) if (!L.INST[i] && rows.every((t) => t.pv[i] === 1)) taut.add(i);
  tautCache.set(form, taut);
  return taut;
}

function strategySets(level) {
  const forms = level.recipe.map(([f]) => f);
  const taut = new Set();
  for (const f of forms) for (const i of tautFor(f)) taut.add(i);
  const cat = L.NAMES.map((n) => L.category(n, forms));
  const isExtra = (n) => L.EXTRA.includes(n);
  const NNall = [], NNsig = [], NNinst = [], PART = [];
  L.NAMES.forEach((n, i) => {
    if (taut.has(i) || isExtra(n)) return;
    if (cat[i] === 'NN') { NNall.push(i); (L.INST[i] ? NNinst : NNsig).push(i); } else PART.push(i);
  });
  const S13 = L.S13L.map((n) => L.IDX[n]);
  const Uind = [...L.S1L, 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', ...L.EXTRA].map((n) => L.IDX[n]).filter((i) => !taut.has(i));
  const S11 = L.IDX.S11;
  return { forms, taut, cat, NNall, NNsig, NNinst, PART, S13, Uind, S11 };
}

const maxOver = (pv, idxs) => { let m = 0; for (const i of idxs) if (pv[i] > m) m = pv[i]; return m; };

function hedge(parts, sigma, iters, rng) {
  // parts: [{share, rows: [pv]}]; trả về trọng số mỗi hàng và giá trị trò chơi.
  const S = sigma.length; let w = new Float64Array(S).fill(1 / S);
  const eta = Math.sqrt((8 * Math.log(Math.max(S, 2))) / iters);
  const counts = parts.map((p) => new Float64Array(p.rows.length));
  const mats = parts.map((p) => p.rows.map((pv) => Float64Array.from(sigma, (i) => pv[i])));
  for (let it = 0; it < iters; it++) {
    const gains = new Float64Array(S);
    parts.forEach((p, fi) => {
      let best = Infinity, ties = [];
      mats[fi].forEach((row, t) => {
        let sc = 0; for (let s = 0; s < S; s++) sc += w[s] * row[s];
        if (sc < best - 1e-12) { best = sc; ties = [t]; } else if (Math.abs(sc - best) <= 1e-12) ties.push(t);
      });
      const t = ties[rng.int(ties.length)]; counts[fi][t]++;
      const row = mats[fi][t]; for (let s = 0; s < S; s++) gains[s] += p.share * row[s];
    });
    let z = 0; for (let s = 0; s < S; s++) { w[s] *= Math.exp(eta * gains[s]); z += w[s]; }
    for (let s = 0; s < S; s++) w[s] /= z;
  }
  const weights = counts.map((c) => Array.from(c, (x) => x / iters));
  let value = 0;
  for (let s = 0; s < S; s++) {
    let v = 0; parts.forEach((p, fi) => mats[fi].forEach((row, t) => (v += p.share * weights[fi][t] * row[s])));
    if (v > value) value = v;
  }
  return { weights, value };
}

// Dựng bộ sinh: trả về { perForm: {form: {rows, weights, instCap, instIdx}}, mode, sets }
function buildGenerator(level, variant, seed = 7) {
  const sets = strategySets(level);
  const rng = L.makeRng(seed);
  const share = {}; level.recipe.forEach(([f, c]) => (share[f] = (share[f] || 0) + c / 6));
  const forms = Object.keys(share);
  const base = Object.fromEntries(forms.map((f) => [f, baseTemplates(f, level.K, level.m).templates]));
  const perForm = {}; const notes = [];
  if (forms.some((f) => base[f].length === 0)) return { infeasible: forms.filter((f) => base[f].length === 0), sets };

  if (variant === 'U' || variant === 'D') {
    const sig = level.gate ? [...sets.Uind, ...sets.S13] : sets.Uind;
    for (const f of forms) {
      let tau = null, rows = null;
      for (const t of [1 / 3, 1 / 2, 1]) { const r = base[f].filter((x) => maxOver(x.pv, sig) <= t + 1e-9); if (r.length) { tau = t; rows = r; break; } }
      if (variant === 'D') { const md = Math.max(...rows.map((r) => r.distinct)); rows = rows.filter((r) => r.distinct === md); }
      perForm[f] = { rows, weights: rows.map(() => 1 / rows.length), instIdx: [sets.S11], instCap: tau };
      notes.push(`${f}:τ=${fmtT(tau)},${rows.length}k`);
    }
    return { perForm, mode: notes.join(' '), sets };
  }

  // M / MD
  const tier1 = {}; let allT1 = true;
  for (const f of forms) { tier1[f] = base[f].filter((x) => maxOver(x.pv, sets.NNsig) <= T13); if (!tier1[f].length) allT1 = false; }
  if (allT1) {
    let rowsBy = { ...tier1 }; let hedged = false, hv = null;
    if (level.gate) {
      const t2 = {}; let allT2 = true;
      for (const f of forms) { t2[f] = tier1[f].filter((x) => maxOver(x.pv, sets.S13) <= T13); if (!t2[f].length) allT2 = false; }
      if (allT2) rowsBy = t2;
      else {
        const parts = forms.map((f) => ({ share: share[f], rows: tier1[f].map((x) => x.pv) }));
        const h = hedge(parts, [...sets.NNsig, ...sets.S13], 1500, rng);
        hedged = true; hv = h.value;
        forms.forEach((f, k) => { const rs = [], ws = []; tier1[f].forEach((x, t) => { if (h.weights[k][t] > 0) { rs.push(x); ws.push(h.weights[k][t]); } }); perForm[f] = { rows: rs, weights: ws }; });
      }
    }
    if (!hedged) {
      for (const f of forms) {
        let rows = rowsBy[f];
        if (variant !== 'M1') { const r3 = rows.filter((x) => maxOver(x.pv, sets.Uind) <= T13); if (r3.length) rows = r3; }
        if (variant === 'MD') { const md = Math.max(...rows.map((r) => r.distinct)); rows = rows.filter((r) => r.distinct === md); }
        perForm[f] = { rows, weights: rows.map(() => 1 / rows.length) };
      }
    }
    for (const f of forms) { perForm[f].instIdx = sets.NNinst; perForm[f].instCap = 1 / 3; }
    const mode = hedged ? `NN≤1/3 từng bài; S13 trộn Hedge v=${hv.toFixed(3)}` : `thuần ≤1/3${level.gate ? ' (+S13)' : ''}`;
    return { perForm, mode: mode + ' | ' + forms.map((f) => `${f}:${perForm[f].rows.length}k`).join(' '), sets };
  }
  // Không khuôn nào đạt NN ≤ 1/3 → trộn Hedge trên khuôn cơ sở
  // Thứ tự ưu tiên: hạ mẹo KHÔNG dùng phủ định trước; S13 không đưa vào (nếu đưa, S13 ≥ 1/2 ở < 9 nhà
  // sẽ chiếm max và Hedge thôi hạ NN).
  const sigma = sets.NNsig;
  const parts = forms.map((f) => ({ share: share[f], rows: (tier1[f].length ? tier1[f] : base[f]).map((x) => x.pv) }));
  const h = hedge(parts, sigma, 2000, rng);
  forms.forEach((f, k) => {
    const src = tier1[f].length ? tier1[f] : base[f]; const rs = [], ws = [];
    src.forEach((x, t) => { if (h.weights[k][t] > 0) { rs.push(x); ws.push(h.weights[k][t]); } });
    perForm[f] = { rows: rs, weights: ws, instIdx: sets.NNinst, instCap: 1 / 3 };
  });
  return { perForm, mode: `Hedge (NN≤1/3 bất khả) v=${h.value.toFixed(3)} | ` + forms.map((f) => `${f}:${perForm[f].rows.length}k`).join(' '), sets, hedgeValue: h.value };
}
const fmtT = (t) => (t < 0.34 ? '1/3' : t < 0.6 ? '1/2' : '1');

// Sinh một bài từ bộ sinh
// R9 (sửa 2026-10-21): đặt tên món bằng RNG riêng (không đụng chuỗi rng chính, nên số đo chỉ đổi
// nếu R9 làm đổi tập món đệm khả dĩ — tức khi trần món đệm 10 ràng buộc).
const nameRng = L.makeRng(424242);
function samplePuzzle(gen, form, m, rng) {
  const pf = gen.perForm[form];
  const fi = L.formInfo(form);
  let r = rng.next(), t = 0; for (; t < pf.weights.length - 1; t++) { r -= pf.weights[t]; if (r <= 0) break; }
  const tmpl = pf.rows[t];
  let best = null, bestScore = Infinity, tries = 0;
  for (let k = 0; k < 40; k++) {
    tries++;
    const inst = L.assignFillers(tmpl.sigs, m, rng);
    if (!inst) continue;
    const pv = L.evalPuzzle(fi, tmpl.sigs, inst.fill, inst.mult);
    const sc = maxOver(pv, pf.instIdx);
    if (sc < bestScore) { best = { inst, pv }; bestScore = sc; }
    if (sc <= pf.instCap + 1e-9) break;
  }
  if (!best) throw new Error('fill fail ' + form);
  const nFill = new Set(best.inst.fill.flat()).size;
  const names = L.R9 ? L.nameBoard(nFill, nameRng) : null;
  if (L.R9 && !names) throw new Error('R9: không đặt được tên ' + nFill + ' món đệm');
  return { tmpl, fill: best.inst.fill, pv: best.pv, tries, instOk: bestScore <= pf.instCap + 1e-9, names };
}

module.exports = { __hedge: hedge, tautFor, baseTemplates, strategySets, buildGenerator, samplePuzzle, maxOver };
