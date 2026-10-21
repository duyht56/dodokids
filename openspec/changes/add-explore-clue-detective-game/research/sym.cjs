'use strict';
// sym.cjs — khuôn ĐỐI XỨNG DẤU (và rộng hơn: ĐÓNG VAI TRÒ) + thư viện chiến lược MÙ DẤU.
// Viết ở scratchpad clue-sym/ (2026-10-21), chép vào research/ cùng ngày (design §9: thiết kế P1).
//
// Chữ ký theo VỊ TRÍ thẻ (bit j = nhà có món của thẻ j, j theo thứ tự đọc), độc lập với dấu.
// Khuôn đóng vai trò = đa tập chữ ký vị trí T hợp lệ (R1–R3) với CẢ BA cách đặt thẻ "có"
// (PNN/NPN/NNP) và bộ sinh dùng CÙNG trọng số cho ba dạng ⇒ P(dạng | bàn) = 1/3 ⇒ mọi chiến
// lược không nhìn dấu đúng ≤ 1/3 khi dạng rút đều. Đối xứng dấu = T bất biến dưới S3 (trường hợp
// riêng). Món đệm được nhận khi bài đạt kiểm mức món đệm với CẢ BA vai trò (không phụ thuộc dấu).
const L = require('./lib.cjs');
const G = require('./gen.cjs');

const FORMS = ['PNN', 'NPN', 'NNP'];
const FI = Object.fromEntries(FORMS.map((f) => [f, L.formInfo(f)]));
const SETS_ALL = G.strategySets({ recipe: FORMS.map((f) => [f, 2]) }); // phân loại khi dạng có thể là bất kỳ
const T13 = 1 / 3 + 1e-9;
const bits = (s) => [0, 1, 2].map((j) => ((s >> j) & 1 ? '1' : '0')).join('');
const E = [1, 2, 4];

// counts[s], s = 0..7 (bit0 = thẻ 1). Khuôn đóng vai trò: e1=e2=e3=1, mọi cặp ≥ 1, 000 ≥ 1.
function rcCounts(K, m) {
  const out = [];
  const dMax = m >= 3 ? K : 0;
  for (let d = 0; d <= dMax; d++)
    for (let c3 = 1; c3 <= K; c3++) for (let c5 = 1; c5 <= K; c5++) for (let c6 = 1; c6 <= K; c6++) {
      const a = K - 3 - c3 - c5 - c6 - d;
      if (a < 1) continue;
      out.push([a, 1, 1, c3, 1, c5, c6, d]);
    }
  return out;
}
const isSym = (c) => c[3] === c[5] && c[5] === c[6];
const symKey = (c) => `(a=${c[0]},c=${c[3]},d=${c[7]})`;
const expand = (c) => { const s = []; c.forEach((n, sig) => { for (let k = 0; k < n; k++) s.push(sig); }); return s; };
const tKey = (sigs) => sigs.slice().sort((a, b) => a - b).map(bits).join(',');

// Bài theo dạng f từ bàn vị trí (sigs, fill): đưa nhà đáp án (chữ ký e_p) lên đầu.
function orient(f, sigs, fill) {
  const fi = FI[f], ans = fi.A;
  const h0 = sigs.indexOf(ans);
  if (h0 < 0 || sigs.indexOf(ans, h0 + 1) >= 0) return null;
  const order = [h0, ...sigs.map((_, h) => h).filter((h) => h !== h0)];
  return { fi, sigs: order.map((h) => sigs[h]), fill: order.map((h) => fill[h]), order };
}
function multOf(fill) { const mult = []; fill.flat().forEach((x) => (mult[x] = (mult[x] || 0) + 1)); return mult; }

function pvAll(sigs, fill) {
  const mult = multOf(fill), pv = {};
  for (const f of FORMS) { const o = orient(f, sigs, fill); pv[f] = o ? L.evalPuzzle(o.fi, o.sigs, o.fill, mult) : null; }
  return pv;
}

// Khuôn đóng vai trò của (K, m): xếp được món đệm (R4/R5), kèm pv mỗi dạng ở một bản món đệm.
const rcCache = new Map();
function rcTemplates(K, m) {
  const key = K + 'x' + m;
  if (rcCache.has(key)) return rcCache.get(key);
  const rng = L.makeRng(4321);
  const out = [];
  for (const counts of rcCounts(K, m)) {
    const sigs = expand(counts);
    let inst = null;
    for (let t = 0; t < 60 && !inst; t++) inst = L.assignFillers(sigs, m, rng);
    if (!inst) continue;
    out.push({ counts, sigs, sym: isSym(counts), key: tKey(sigs), name: isSym(counts) ? symKey(counts) : `rc(a=${counts[0]},c=${counts[3]}/${counts[5]}/${counts[6]},d=${counts[7]})`, pv: pvAll(sigs, inst.fill), fill: inst.fill });
  }
  rcCache.set(key, out);
  return out;
}

// Tầng 1 (như bộ sinh M): mọi chiến lược KHÔNG phủ định (đơn + ghép, mức chữ ký) ≤ 1/3 cho
// mọi dạng của bậc (phân loại theo bậc) VÀ mọi vai trò (phân loại SETS_ALL).
function tier1(t, sets, forms) {
  for (const f of FORMS) if (G.maxOver(t.pv[f], SETS_ALL.NNsig) > T13) return false;
  for (const f of forms) if (G.maxOver(t.pv[f], sets.NNsig) > T13) return false;
  return true;
}

// ---------- Chiến lược mù dấu ----------
// Mỗi chiến lược đoán vị trí thẻ "có" j (có thể trộn đều khi hoà), rồi giải ĐÚNG theo dấu đoán:
// ứng viên = nhà có chữ ký e_j (rỗng → đoán bừa 1/K). Đây là bản mạnh nhất của mỗi mẹo.
const BLIND = ['B-codex', 'B-freq', 'B-cooc', 'B-pairmin', 'B-pos1', 'B-pos2', 'B-pos3', 'B-R1', 'B-R1R2', 'B-rule'];
const BLIND_NOTE = {
  'B-codex': '(i) mẹo Codex: món chung của các nhà có đúng 2 món-thẻ',
  'B-freq': '(ii) món-thẻ ở nhiều nhà nhất',
  'B-cooc': '(iii) món-thẻ đồng xuất hiện nhiều nhất',
  'B-pairmin': "(iii') cặp món-thẻ ít đi cùng nhất là hai thẻ \"không có\"",
  'B-pos1': '(iv) thẻ "có" ở vị trí 1', 'B-pos2': '(iv) vị trí 2', 'B-pos3': '(iv) vị trí 3',
  'B-R1': '(v) đổi vai trò, giữ vai cho đúng 1 nhà',
  'B-R1R2': '(v) đổi vai trò, giữ vai đạt R1+R2',
  'B-rule': '(v) đổi vai trò, giữ vai đạt R1–R3 + tầng 1 (biết luật bộ sinh)',
};
function blindEval(sigs, ansSig, fill) {
  const K = sigs.length;
  const cnt = (s) => sigs.filter((x) => x === s).length;
  const pj = (j) => { const c = cnt(E[j]); if (!c) return 1 / K; return E[j] === ansSig ? 1 / c : 0; };
  const mix = (js) => (js.length ? js.reduce((a, j) => a + pj(j), 0) / js.length : 1 / K);
  const argmax = (arr) => { const mx = Math.max(...arr); return [0, 1, 2].filter((j) => arr[j] === mx); };
  const argmin = (arr) => { const mn = Math.min(...arr); return [0, 1, 2].filter((j) => arr[j] === mn); };
  const has = (s, j) => (s >> j) & 1;
  const out = {};
  // (i) Codex
  const H2 = sigs.filter((s) => L.pc(s) === 2);
  if (!H2.length) out['B-codex'] = mix([0, 1, 2]);
  else {
    const common = [0, 1, 2].filter((j) => H2.every((s) => has(s, j)));
    out['B-codex'] = common.length === 1 ? pj(common[0]) : mix(argmax([0, 1, 2].map((j) => H2.filter((s) => has(s, j)).length)));
  }
  out['B-freq'] = mix(argmax([0, 1, 2].map((j) => sigs.filter((s) => has(s, j)).length)));
  out['B-cooc'] = mix(argmax([0, 1, 2].map((j) => sigs.reduce((a, s) => a + (has(s, j) ? L.pc(s) - 1 : 0), 0))));
  // cặp (q,r) ít cùng nhà nhất → j còn lại là "có"; chỉ số theo j còn lại
  out['B-pairmin'] = mix(argmin([0, 1, 2].map((j) => { const [q, r] = [0, 1, 2].filter((x) => x !== j); return sigs.filter((s) => has(s, q) && has(s, r)).length; })));
  out['B-pos1'] = pj(0); out['B-pos2'] = pj(1); out['B-pos3'] = pj(2);
  const r1 = [0, 1, 2].filter((j) => cnt(E[j]) === 1);
  const r2ok = (j) => { const [q, r] = [0, 1, 2].filter((x) => x !== j); return cnt(0) + cnt(E[j]) >= 2 && cnt(E[j]) + cnt(E[j] | E[q]) >= 2 && cnt(E[j]) + cnt(E[j] | E[r]) >= 2; };
  const r12 = r1.filter(r2ok);
  out['B-R1'] = mix(r1); out['B-R1R2'] = mix(r12);
  // biết luật: vai trò j đạt R1–R3 và tầng 1 (mọi chiến lược không phủ định ≤ 1/3) trên bàn này
  const mult = multOf(fill || sigs.map(() => []));
  const rule = r12.filter((j) => {
    const f = FORMS[j], o = orient(f, sigs, fill || sigs.map(() => []));
    if (!o) return false;
    for (let k = 0; k < 3; k++) { const c = sigs.filter((s) => has(s, k)).length; if (c < 1 || c > K - 1) return false; }
    const pv = L.evalPuzzle(o.fi, o.sigs, o.fill, mult);
    return G.maxOver(pv, SETS_ALL.NNsig) <= T13;
  });
  out['B-rule'] = mix(rule);
  out.roleOK = rule.length === 3; // "kiểm đổi vai trò": cả 3 cách đặt thẻ có đều hợp lệ, 3 đáp án khác nhau
  return out;
}

// ---------- Bộ sinh ----------
// level: { K, m, recipe:[[form,count]], gate?, rows?: [[countsArray, weight]] , rc?: true }
// - rows cho trước: dùng đúng các khuôn đó (trọng số chung ba dạng).
// - không cho rows: mọi khuôn đối xứng (hoặc đóng vai trò nếu rc) đạt tầng 1; bậc cổng → Hedge hạ S13.
function buildSym(level, seed = 7) {
  const sets = G.strategySets(level);
  const forms = [...new Set(level.recipe.map(([f]) => f))];
  const all = rcTemplates(level.K, level.m);
  let rows, weights, mode;
  if (level.rows) {
    rows = level.rows.map(([c]) => { const t = all.find((x) => x.key === tKey(expand(c))); if (!t) throw new Error('khuôn không xếp được món đệm ' + c); return t; });
    weights = level.rows.map(([, w]) => w); const z = weights.reduce((a, b) => a + b, 0); weights = weights.map((w) => w / z);
    mode = 'cố định';
  } else {
    let cand = all.filter((t) => (level.rc ? true : t.sym) && tier1(t, sets, forms));
    if (!cand.length) return { infeasible: true, sets, forms };
    if (!level.gate) {
      const r3 = cand.filter((t) => forms.every((f) => G.maxOver(t.pv[f], sets.Uind) <= T13));
      if (r3.length) cand = r3;
      rows = cand; weights = cand.map(() => 1 / cand.length); mode = 'đều';
    } else {
      const share = {}; level.recipe.forEach(([f, c]) => (share[f] = (share[f] || 0) + c / 6));
      const avg = (t) => { const v = new Float64Array(L.NS); for (const f of forms) for (let i = 0; i < L.NS; i++) v[i] += share[f] * t.pv[f][i]; return v; };
      const h = G.__hedge([{ share: 1, rows: cand.map(avg) }], [...sets.NNsig, ...sets.S13], 3000, L.makeRng(seed));
      rows = []; weights = [];
      cand.forEach((t, k) => { if (h.weights[0][k] > 0.0005) { rows.push(t); weights.push(h.weights[0][k]); } });
      const z = weights.reduce((a, b) => a + b, 0); weights = weights.map((w) => w / z);
      mode = `Hedge v=${h.value.toFixed(3)}`;
    }
  }
  return { rows, weights, mode, sets, forms, lenient: !!level.lenient };
}

// Sinh một bài: rút khuôn (trọng số chung), xếp món đệm nhận khi đạt kiểm món đệm với CẢ BA vai trò.
// Sửa 2026-10-21 (sau Codex vòng 7, đúng chữ của bộ sinh P1 ở p1-design.md): trượt 40 lần xếp món đệm thì
// RÚT LẠI (khuôn + món đệm) thay vì trả bản tốt nhất; ≤ 10 lần rút lại rồi báo lỗi. Khi lần rút đầu đạt
// (mọi bài đo được: 0 / 120.000 bài cần tới lần dự phòng), chuỗi RNG giữ nguyên nên số đo giống từng byte
// bản cũ. `level.lenient` (chỉ cho script dò khuôn, vd sym-catalog.cjs với 7×2 trượt 100%): giữ đúng hành
// vi cũ (một lần rút khuôn, trả bản tốt nhất với instOk = false) để đo được khuôn không xếp được.
function sampleSym(gen, form, m, rng, maxRedraw = gen.lenient ? 1 : 10) {
  let tries = 0, best = null, bestScore = Infinity;
  for (let redraw = 0; redraw < maxRedraw; redraw++) {
    let r = rng.next(), t = 0; for (; t < gen.weights.length - 1; t++) { r -= gen.weights[t]; if (r <= 0) break; }
    const tmpl = gen.rows[t];
    for (let k = 0; k < 40; k++) {
      tries++;
      const inst = L.assignFillers(tmpl.sigs, m, rng);
      if (!inst) continue;
      const pv = pvAll(tmpl.sigs, inst.fill);
      let sc = 0;
      for (const f of FORMS) sc = Math.max(sc, G.maxOver(pv[f], SETS_ALL.NNinst));
      for (const f of gen.forms) sc = Math.max(sc, G.maxOver(pv[f], gen.sets.NNinst));
      if (sc < bestScore) { best = { tmpl, inst, pv }; bestScore = sc; }
      if (sc <= T13) {
        const o = orient(form, tmpl.sigs, inst.fill);
        return { tmpl, sigs: o.sigs, fill: o.fill, pv: pv[form], tries, instOk: true, redraw };
      }
    }
  }
  if (gen.lenient && best) {
    const o = orient(form, best.tmpl.sigs, best.inst.fill);
    return { tmpl: best.tmpl, sigs: o.sigs, fill: o.fill, pv: best.pv[form], tries, instOk: false, redraw: maxRedraw - 1 };
  }
  throw new Error(`sampleSym: ${maxRedraw} lần rút lại × 40 lần xếp món đệm đều trượt`);
}

module.exports = { FORMS, FI, SETS_ALL, bits, rcCounts, rcTemplates, isSym, symKey, expand, tKey, orient, pvAll, tier1, BLIND, BLIND_NOTE, blindEval, buildSym, sampleSym, multOf };
