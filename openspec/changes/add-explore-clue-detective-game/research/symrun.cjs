'use strict';
// symrun.cjs — số đo một bậc cho bộ sinh M (T-Lai) hoặc khuôn đối xứng dấu / đóng vai trò,
// gồm thư viện S1–S15 (lib.cjs) + thư viện mù dấu (sym.cjs). Lấy mẫu (mọi chiến lược) + chính xác
// (chiến lược chỉ phụ thuộc chữ ký, từ trọng số khuôn).
// Sửa khi chép vào change (2026-10-21): `level.draw = 'indep'` rút dạng thẻ ĐỘC LẬP đều cho từng bài
// (RNG riêng, không túi ×2), đúng design §5/§9 từ bậc 3; mặc định giữ túi theo `recipe` (để so với
// clue-sim-symmetric.md). Thêm `res.named` (S1…S11, mẹo ghép tiêu biểu) và `res.S1max` cho table.cjs.
const L = require('./lib.cjs');
const G = require('./gen.cjs');
const S = require('./sym.cjs');

const pct = (x) => (x * 100).toFixed(1).replace('.', ',') + '%';
const NB = S.BLIND.length;

function slotsOf(level) { const s = []; level.recipe.forEach(([f, c]) => { for (let i = 0; i < c; i++) s.push(f); }); return s; }
const formsOf = (level) => [...new Set(level.recipe.map(([f]) => f))];
const NAMED = ['S1@1', 'S1@2', 'S1@3', 'S1:P1', 'S1:N1', 'S1:N2', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S8∩S9', 'S9∩S8', 'S2∩S9', 'S3∩S9'];

// Chuẩn hoá kết quả của một bộ sinh về dạng { perForm: {f: [{sigsPos, pvBase(form), fill, w}]}, sample(f,rng) }
function makeGen(level, kind, seed) {
  if (kind === 'M') {
    const g = G.buildGenerator(level, 'M', seed);
    if (g.infeasible) return { infeasible: true };
    const perForm = {};
    for (const f of Object.keys(g.perForm)) perForm[f] = g.perForm[f].rows.map((r, t) => ({ key: S.tKey(r.sigs), pv: r.pv, sigs: r.sigs, fill: null, w: g.perForm[f].weights[t], name: r.sigs.map(S.bits).join(',') }));
    return {
      sets: g.sets, mode: g.mode, perForm,
      sample: (f, rng) => { const z = G.samplePuzzle(g, f, level.m, rng); return { sigs: z.tmpl.sigs, fill: z.fill, pv: z.pv, tries: z.tries, instOk: z.instOk, tname: f + ':' + z.tmpl.noise.join(',') }; },
    };
  }
  const g = S.buildSym(level, seed);
  if (g.infeasible) return { infeasible: true };
  const perForm = {};
  for (const f of g.forms) perForm[f] = g.rows.map((t, k) => { const o = S.orient(f, t.sigs, t.fill); return { key: t.key, pv: t.pv[f], sigs: o.sigs, fill: o.fill, w: g.weights[k], name: t.name }; });
  return {
    sets: g.sets, mode: g.mode + ' | ' + g.rows.map((t, k) => `${t.name} ${(g.weights[k] * 100).toFixed(1)}%`).join(', '), perForm,
    sample: (f, rng) => { const z = S.sampleSym(g, f, level.m, rng); return { sigs: z.sigs, fill: z.fill, pv: z.pv, tries: z.tries, instOk: z.instOk, tname: z.tmpl.name }; },
  };
}

function analyze(level, kind, seed, ROUNDS) {
  const gen = makeGen(level, kind, seed);
  const indep = level.draw === 'indep';
  const res = { K: level.K, m: level.m, kind, forms: indep ? `${formsOf(level).join('/')} rút độc lập` : level.recipe.map(([f, c]) => `${f}×${c}`).join(' '), shapes: level.K * level.m + 3, gate: !!level.gate, draw: indep ? 'indep' : 'túi' };
  if (gen.infeasible) { res.infeasible = true; return res; }
  res.mode = gen.mode;
  const slots = slotsOf(level);
  const share = {}; level.recipe.forEach(([f, c]) => (share[f] = (share[f] || 0) + c / 6));
  const rng = L.makeRng(seed * 7919 + 13);
  // Dạng thẻ rút độc lập: RNG riêng, nên chuỗi khuôn/món đệm không phụ thuộc dạng (như bộ sinh thật).
  const fForms = formsOf(level), formRng = L.makeRng(seed * 104729 + 7);
  const roundSlots = () => (indep ? slots.map(() => fForms[formRng.int(fForms.length)]) : slots);
  const NT = L.NS + NB;
  const sumP = new Float64Array(NT), sumQ = new Float64Array(NT);
  const keysA = new Set(), keysB = new Set(), tmplUsed = new Set();
  let puzzles = 0, tries = 0, instFail = 0, roleOK = 0;
  const formCount = {};
  for (let r = 0; r < ROUNDS; r++) {
    const ps = roundSlots().map((f) => {
      formCount[f] = (formCount[f] || 0) + 1;
      const z = gen.sample(f, rng);
      puzzles++; tries += z.tries; if (!z.instOk) instFail++;
      tmplUsed.add(z.tname);
      (r % 2 ? keysB : keysA).add(L.canonKey(f, z.sigs, z.fill));
      const b = S.blindEval(z.sigs, L.formInfo(f).A, z.fill);
      if (b.roleOK) roleOK++;
      const v = new Float64Array(NT);
      for (let i = 0; i < L.NS; i++) v[i] = z.pv[i];
      S.BLIND.forEach((n, k) => (v[L.NS + k] = b[n]));
      for (let i = 0; i < NT; i++) sumP[i] += v[i];
      return v;
    });
    for (let i = 0; i < NT; i++) sumQ[i] += L.pbAtLeast(ps.map((v) => v[i]), 4);
  }
  const meanP = Array.from(sumP, (x) => x / puzzles), pass = Array.from(sumQ, (x) => L.passOf(x / ROUNDS));
  const nameOf = (i) => (i < L.NS ? L.NAMES[i] : S.BLIND[i - L.NS]);
  const top = (idxs) => { const i = idxs.slice().sort((a, b) => pass[b] - pass[a] || meanP[b] - meanP[a])[0]; return { name: nameOf(i), p: meanP[i], pass: pass[i] }; };
  const at = (n) => { const i = L.IDX[n]; return { p: meanP[i], pass: pass[i] }; };
  const atB = (n) => { const i = L.NS + S.BLIND.indexOf(n); return { p: meanP[i], pass: pass[i] }; };
  const sets = gen.sets;
  res.guess = { p: 1 / level.K, pass: L.passConst(1 / level.K) };
  res.worstNN = top(sets.NNall);
  res.S13max = top(sets.S13);
  res.S13rand = at('S13-rand');
  res.S3 = at('S3'); res.S3S9 = at('S3∩S9'); res.S2S9 = at('S2∩S9'); res.S8S9 = at('S8∩S9');
  res.worstPART = top(sets.PART);
  res.named = Object.fromEntries(NAMED.map((n) => [n, at(n)]));
  res.S1max = top(L.S1L.map((n) => L.IDX[n]));
  res.formCount = formCount;
  // mù dấu: tệ nhất (mọi), và tệ nhất bỏ vị trí (B-pos*) — ở bậc chỉ PNN vị trí đã lộ dấu
  const bIdx = S.BLIND.map((_, k) => L.NS + k);
  res.blindWorst = top(bIdx);
  res.blindWorstNoPos = top(bIdx.filter((i) => !S.BLIND[i - L.NS].startsWith('B-pos')));
  res.blind = Object.fromEntries(S.BLIND.map((n) => [n, atB(n)]));
  res.roleOK = roleOK / puzzles;
  const inter = [...keysA].filter((k) => keysB.has(k)).length;
  res.structSeen = new Set([...keysA, ...keysB]).size;
  res.structLP = inter ? Math.round((keysA.size * keysB.size) / inter) : null;
  res.tmplUsed = tmplUsed.size; res.tries = tries / puzzles; res.instFail = instFail / puzzles;
  // ---- chính xác (chỉ chiến lược mức chữ ký) ----
  // Túi: Poisson–binomial theo đúng các ô của vòng. Rút độc lập: mỗi bài đúng với xác suất trung bình
  // trên các dạng (đều), các bài độc lập ⇒ qua = passConst(trung bình).
  const exactPass = (fnP) => {
    const ps = indep ? slots.map(() => fForms.reduce((a, f) => a + fnP(f), 0) / fForms.length) : slots.map((f) => fnP(f));
    return { p: ps.reduce((a, b) => a + b, 0) / ps.length, pass: L.passOf(L.pbAtLeast(ps, 4)) };
  };
  const expPv = (f, i) => gen.perForm[f].reduce((a, r) => a + r.w * r.pv[i], 0);
  const expBlind = (f, n) => gen.perForm[f].reduce((a, r) => a + r.w * S.blindEval(r.sigs, L.formInfo(f).A, r.fill)[n], 0);
  res.exact = {};
  for (const n of ['S2', 'S3', 'S8', 'S9', 'S8∩S9', 'S2∩S9', 'S3∩S9', ...L.S13L, 'S13-rand']) res.exact[n] = exactPass((f) => expPv(f, L.IDX[n]));
  let w = { pass: -1 }; for (const i of sets.NNsig) { const e = exactPass((f) => expPv(f, i)); if (e.pass > w.pass) w = { ...e, name: L.NAMES[i] }; }
  res.exact.worstNNsig = w;
  let s13 = { pass: -1 }; for (const i of sets.S13) { const e = exactPass((f) => expPv(f, i)); if (e.pass > s13.pass) s13 = { ...e, name: L.NAMES[i] }; }
  res.exact.S13max = s13;
  for (const n of S.BLIND) res.exact[n] = exactPass((f) => expBlind(f, n));
  // Cận trên MỌI chiến lược mù dấu (Bayes, biết bộ sinh): Σ_T max_f share_f·w_f(T) — giả định món đệm
  // không mang tin về dấu (đúng với bộ sinh đóng vai trò: nhận món đệm theo cả ba vai trò).
  const byKey = new Map();
  for (const f of Object.keys(gen.perForm)) for (const r of gen.perForm[f]) { const m = byKey.get(r.key) || {}; m[f] = (m[f] || 0) + share[f] * r.w; byKey.set(r.key, m); }
  let bayes = 0; for (const m of byKey.values()) bayes += Math.max(...Object.values(m));
  res.bayes = { p: bayes, pass: L.passConst(bayes) };
  res.perForm = gen.perForm;
  return res;
}

module.exports = { analyze, pct, makeGen, NAMED };
