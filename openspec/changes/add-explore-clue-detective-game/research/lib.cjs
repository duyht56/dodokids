'use strict';
// clue-sim/lib.cjs — Thám tử Đô Đô: khuôn, bộ sinh (3 biến thể), thư viện chiến lược S1–S15.
// Mô hình: K nhà × m món; n thẻ (2 hoặc 3) có(P)/không(N). Chữ ký nhà = bitmask, bit j bật
// khi nhà có món của thẻ j (j theo thứ tự đọc). Nhà 0 trong mảng nội bộ = đáp án (vị trí thật
// rút đều nên chỉ S12 phụ thuộc vị trí, và S12 = 1/K đúng bằng giải tích).

const POOL = 14; // pool 14 món (design §3); món đệm lấy từ 14 - n món còn lại
// R9 (sửa 2026-10-21, scratchpad clue-sym): cặp gần âm không cùng bàn. Pool 14 có đúng một cặp
// (chú cá / hộp quà) nên món đệm tối đa 10 (một món của cặp là món-thẻ thì món kia bị loại; không
// thì chỉ dùng được một trong hai). NO_R9=1 trả về mô hình cũ (11).
const ITEMS = ['chú mèo', 'chú chó', 'chú cá', 'chú chim', 'chú ếch', 'bông hoa', 'cây xương rồng', 'cây nấm', 'quả táo', 'quả chuối', 'quả dưa hấu', 'hộp quà', 'chiếc ô tô', 'cánh diều'];
const EMOJI = ['🐱', '🐶', '🐟', '🐦', '🐸', '🌼', '🌵', '🍄', '🍎', '🍌', '🍉', '🎁', '🚗', '🪁'];
const NEAR = [[2, 11]]; // CLUE_NEAR_SOUND_PAIRS trên pool 14 (chú rùa / quả dưa hấu chỉ khi dùng món dự phòng)
const R9 = !process.env.NO_R9;
const FILLER_POOL = R9 ? POOL - 3 - 1 : POOL - 3;
const nearOf = (i) => NEAR.flatMap(([a, b]) => (a === i ? [b] : b === i ? [a] : []));
// Đặt tên: 3 món-thẻ khác nhau không gần âm, rồi món đệm loại gần âm NGAY khi chọn (design §9).
function nameBoard(nFill, rng) {
  for (let t = 0; t < 50; t++) {
    const used = new Set(), banned = new Set(), clue = [], fill = [];
    const take = (arr) => { const pool = [...Array(POOL).keys()].filter((i) => !used.has(i) && !banned.has(i)); if (!pool.length) return false; const i = pool[rng.int(pool.length)]; used.add(i); nearOf(i).forEach((x) => banned.add(x)); arr.push(i); return true; };
    let ok = true;
    for (let k = 0; k < 3 && ok; k++) ok = take(clue);
    for (let k = 0; k < nFill && ok; k++) ok = take(fill);
    if (ok) return { clue, fill };
  }
  return null;
}
const hasNear = (items) => NEAR.some(([a, b]) => items.includes(a) && items.includes(b));

// ---------- RNG ----------
function makeRng(seed) {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (n) => Math.floor(next() * n);
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = int(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a) => a[int(a.length)];
  return { next, int, shuffle, pick };
}
const pc = (x) => { let c = 0; while (x) { c += x & 1; x >>>= 1; } return c; };

// ---------- Dạng thẻ ----------
function formInfo(form) {
  const n = form.length, signs = [...form];
  const A = signs.reduce((a, s, j) => (s === 'P' ? a | (1 << j) : a), 0);
  const P = [], N = [];
  signs.forEach((s, j) => (s === 'P' ? P : N).push(j));
  return { form, n, signs, A, P, N };
}

// ---------- Tên chiến lược ----------
const F9 = ['S2', 'S3', 'S4', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11'];
const S1L = ['S1@1', 'S1@2', 'S1@3', 'S1:P1', 'S1:P2', 'S1:N1', 'S1:N2'];
const S13L = ['S13-@1', 'S13-@2', 'S13-@3', 'S13-P1', 'S13-P2', 'S13-N1', 'S13-N2'];
const EXTRA = ['E0', 'E1', 'E2', 'E3']; // "đúng c món-thẻ" (design R6 (d)), ngoài thư viện
const SINGLES = [...S1L, 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', ...EXTRA, ...S13L, 'S13-rand'];
const COMBOS = [];
for (const a of F9) for (const b of F9) if (a !== b) COMBOS.push([a, b]);
for (const x of F9) for (const y of S1L) { COMBOS.push([x, y]); COMBOS.push([y, x]); }
const NAMES = [...SINGLES, ...COMBOS.map(([a, b]) => a + '∩' + b)];
const IDX = Object.fromEntries(NAMES.map((n, i) => [n, i]));
const NS = NAMES.length;
const INST = NAMES.map((n) => n.split('∩').includes('S11')); // phụ thuộc món đệm

// Phân loại theo bậc (cần biết các dạng thẻ của bậc cho S1@j).
function partIsNeg(part, forms) {
  if (part === 'S3' || part.startsWith('S1:N') || part.startsWith('S13')) return true;
  if (part.startsWith('S1@')) {
    const j = +part.slice(3) - 1;
    return forms.some((f) => { const jj = Math.min(j, f.length - 1); return f[jj] !== 'P'; });
  }
  return false;
}
function category(name, forms) {
  // 'NN' = không dùng nghĩa phủ định; 'PART' = suy luận một phần có phủ định
  return name.split('∩').some((p) => partIsNeg(p, forms)) ? 'PART' : 'NN';
}

// ---------- Đánh giá một bài ----------
// sigs[h], fill[h] = mảng id món đệm; mult[f] = số nhà có món đệm f (≥ 2 theo R5).
function evalPuzzle(fi, sigs, fill, mult) {
  const K = sigs.length, n = fi.n, all = (1 << K) - 1;
  const out = new Float64Array(NS);
  const p = (set) => (set === 0 ? 1 / K : (set & 1 ? 1 / pc(set) : 0));
  const sat = [];
  for (let j = 0; j < n; j++) {
    const want = fi.signs[j] === 'P' ? 1 : 0;
    let s = 0; for (let h = 0; h < K; h++) if (((sigs[h] >> j) & 1) === want) s |= 1 << h;
    sat.push(s);
  }
  const andOf = (js) => js.reduce((a, j) => a & sat[j], all);
  const pos = (k) => Math.min(k, n - 1);
  const P1 = fi.P[0], P2 = fi.P.length > 1 ? fi.P[1] : fi.P[0];
  const N1 = fi.N[0], N2 = fi.N[fi.N.length - 1];
  const S = {};
  S['S1@1'] = sat[0]; S['S1@2'] = sat[pos(1)]; S['S1@3'] = sat[pos(2)];
  S['S1:P1'] = P1 === undefined ? all : sat[P1]; S['S1:P2'] = P2 === undefined ? all : sat[P2];
  S['S1:N1'] = N1 === undefined ? all : sat[N1]; S['S1:N2'] = N2 === undefined ? all : sat[N2];
  S.S2 = andOf(fi.P); S.S3 = andOf(fi.N);
  const full = (1 << n) - 1;
  let s4 = 0, s5 = 0, s9 = 0, s10 = 0;
  const cnt = sigs.map(pc);
  const sigMult = {}; sigs.forEach((s) => (sigMult[s] = (sigMult[s] || 0) + 1));
  const clueFreq = []; for (let j = 0; j < n; j++) { let c = 0; for (let h = 0; h < K; h++) if ((sigs[h] >> j) & 1) c++; clueFreq.push(c); }
  for (let h = 0; h < K; h++) {
    if (sigs[h] === full) s4 |= 1 << h;
    if (sigs[h] === (full ^ fi.A)) s5 |= 1 << h;
    if (sigMult[sigs[h]] === 1) s9 |= 1 << h;
    for (let j = 0; j < n; j++) if (((sigs[h] >> j) & 1) && clueFreq[j] === 1) s10 |= 1 << h; // R5: món đệm ≥ 2 nhà
  }
  S.S4 = s4; S.S5 = s5; S.S9 = s9; S.S10 = s10;
  const mx = Math.max(...cnt), mn = Math.min(...cnt);
  let s6 = 0, s7 = 0, s8 = 0; const E = [0, 0, 0, 0];
  for (let h = 0; h < K; h++) { if (cnt[h] === mx) s6 |= 1 << h; if (cnt[h] === mn) s7 |= 1 << h; if (cnt[h] === 1) s8 |= 1 << h; E[cnt[h]] |= 1 << h; }
  S.S6 = s6; S.S7 = s7; S.S8 = s8;
  for (let c = 0; c < 4; c++) S['E' + c] = E[c];
  // S11: ít trùng món nhất = min Σ_{món trong nhà} (số nhà có món − 1)
  const ov = sigs.map((s, h) => {
    let o = 0; for (let j = 0; j < n; j++) if ((s >> j) & 1) o += clueFreq[j] - 1;
    for (const f of fill[h]) o += mult[f] - 1; return o;
  });
  const omin = Math.min(...ov); let s11 = 0; for (let h = 0; h < K; h++) if (ov[h] === omin) s11 |= 1 << h;
  S.S11 = s11;
  const drop = (j) => andOf([...Array(n).keys()].filter((k) => k !== j));
  S['S13-@1'] = drop(0); S['S13-@2'] = drop(pos(1)); S['S13-@3'] = drop(pos(2));
  S['S13-P1'] = drop(P1); S['S13-P2'] = drop(P2); S['S13-N1'] = drop(N1); S['S13-N2'] = drop(N2);
  let i = 0;
  for (const name of SINGLES) {
    if (name === 'S13-rand') { let a = 0; for (let j = 0; j < n; j++) a += p(drop(j)); out[i++] = a / n; continue; }
    out[i++] = p(S[name]);
  }
  for (const [a, b] of COMBOS) { const x = S[a] & S[b]; out[i++] = p(x === 0 ? S[a] : x); }
  return out;
}

// ---------- Khuôn ----------
function enumTemplates(fi, K, m) {
  const { n, A } = fi;
  if (pc(A) > m) return [];
  const allowed = [];
  for (let s = 0; s < 1 << n; s++) if (s !== A && pc(s) <= m) allowed.push(s);
  const need = [...Array(n).keys()].map((j) => A ^ (1 << j));
  if (need.some((s) => pc(s) > m)) return [];
  const res = [], cur = [];
  (function rec(i, left) {
    if (left === 0) { if (need.every((s) => cur.includes(s))) res.push(cur.slice()); return; }
    if (i >= allowed.length) return;
    const s = allowed[i], maxc = pc(s) === m ? Math.min(1, left) : left;
    for (let c = maxc; c >= 0; c--) { for (let k = 0; k < c; k++) cur.push(s); rec(i + 1, left - c); for (let k = 0; k < c; k++) cur.pop(); }
  })(0, K - 1);
  return res;
}

// Món đệm: mỗi món ≥ 2 nhà (R5), không lặp trong nhà, không 2 nhà giống hệt (R4).
function assignFillers(sigs, m, rng) {
  const K = sigs.length, cap = sigs.map((s) => m - pc(s));
  const F = cap.reduce((a, b) => a + b, 0);
  if (F === 0) return { fill: sigs.map(() => []), mult: [] };
  const H = cap.filter((c) => c > 0).length;
  const dmin = Math.max(...cap), dmax = Math.min(Math.floor(F / 2), FILLER_POOL);
  if (F === 1 || H < 2 || dmin > dmax) return null;
  for (let t = 0; t < 60; t++) {
    const d = dmin + rng.int(dmax - dmin + 1);
    const mult = new Array(d).fill(2); let rest = F - 2 * d, g = 0;
    while (rest > 0 && g++ < 2000) { const i = rng.int(d); if (mult[i] < H) { mult[i]++; rest--; } }
    if (rest > 0) continue;
    const order = rng.shuffle([...Array(d).keys()]).sort((a, b) => mult[b] - mult[a]);
    const rem = cap.slice(), fill = sigs.map(() => []);
    let ok = true;
    for (const f of order) {
      const pool = []; for (let h = 0; h < K; h++) if (rem[h] > 0) pool.push(h);
      if (pool.length < mult[f]) { ok = false; break; }
      for (let k = 0; k < mult[f]; k++) {
        let tot = 0; for (const h of pool) tot += rem[h];
        let r = rng.next() * tot, idx = 0;
        for (; idx < pool.length - 1; idx++) { r -= rem[pool[idx]]; if (r <= 0) break; }
        const h = pool.splice(idx, 1)[0]; fill[h].push(f); rem[h]--;
      }
    }
    if (!ok || rem.some((r) => r > 0)) continue;
    const keys = new Set(); let dup = false;
    for (let h = 0; h < K; h++) { const k = sigs[h] + '|' + fill[h].slice().sort((a, b) => a - b).join(','); if (keys.has(k)) { dup = true; break; } keys.add(k); }
    if (dup) continue;
    return { fill, mult };
  }
  return null;
}

// Dạng chuẩn chính xác: hoán vị nhà trong cùng nhóm chữ ký + đổi tên món đệm (cột sắp xếp).
function canonKey(form, sigs, fill) {
  const K = sigs.length;
  const fillers = [...new Set(fill.flat())];
  const rows = [...Array(K).keys()].sort((a, b) => sigs[a] - sigs[b]);
  const groups = []; rows.forEach((r) => { const g = groups[groups.length - 1]; if (g && sigs[g[0]] === sigs[r]) g.push(r); else groups.push([r]); });
  const perms = (arr) => (arr.length <= 1 ? [arr] : arr.flatMap((x, i) => perms([...arr.slice(0, i), ...arr.slice(i + 1)]).map((q) => [x, ...q])));
  const sets = fill.map((f) => new Set(f));
  let best = null;
  const rec = (gi, acc) => {
    if (gi === groups.length) {
      const cols = fillers.map((f) => acc.map((r) => (sets[r].has(f) ? '1' : '0')).join('')).sort();
      const key = form + '|' + acc.map((r) => sigs[r]).join(',') + '|' + cols.join('.');
      if (best === null || key < best) best = key;
      return;
    }
    for (const q of perms(groups[gi])) rec(gi + 1, [...acc, ...q]);
  };
  rec(0, []);
  return best;
}

// ---------- Xác suất ----------
function pbAtLeast(ps, k) {
  let dist = [1];
  for (const p of ps) { const nd = new Array(dist.length + 1).fill(0); dist.forEach((v, i) => { nd[i] += v * (1 - p); nd[i + 1] += v * p; }); dist = nd; }
  return dist.slice(k).reduce((a, b) => a + b, 0);
}
const passOf = (q) => 1 - (1 - q) * (1 - q);
const passConst = (p) => passOf(pbAtLeast(new Array(6).fill(p), 4));

module.exports = { ITEMS, EMOJI, NEAR, R9, nameBoard, hasNear, FILLER_POOL, makeRng, pc, formInfo, NAMES, IDX, NS, INST, F9, S1L, S13L, EXTRA, SINGLES, COMBOS, category, evalPuzzle, enumTemplates, assignFillers, canonKey, pbAtLeast, passOf, passConst };
