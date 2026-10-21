'use strict';
// research/exact.cjs — số đo CHÍNH XÁC (không lấy mẫu) của P1 (bản trước Codex vòng 7), đọc bảng bậc và bảng
// khuôn chung `CLUE_TEMPLATES` của P1 từ p1-design.md qua design-p1.cjs. Số mức chữ ký (S13, S3, S3∩S9, mù
// dấu, R11) chỉ phụ thuộc khuôn; thiết kế đang chọn P1-X: exact-x.cjs.
// Viết lại 2026-10-21 khi đổi bộ sinh M → khuôn đối xứng dấu (bản cũ cho M: legacy/exact-m.cjs).
//   node exact.cjs          (DESIGN=<file cùng định dạng> để đọc bảng khác)
//   RAW=1 node exact.cjs    (in 3 chữ số thập phân)
// Mô hình: mỗi bài rút khuôn theo trọng số và (từ bậc 3) dạng thẻ đều, độc lập ⇒ mỗi bài đúng với xác
// suất E[p] như nhau, các bài độc lập ⇒ qua = 1 − (1 − P(Bin(6, E[p]) ≥ 4))². Chỉ tính chiến lược mức chữ
// ký (không phụ thuộc món đệm; S11 và phép giao có S11 do table.cjs lấy mẫu) và thư viện mù dấu.
const L = require('./lib.cjs');
const G = require('./gen.cjs');
const S = require('./sym.cjs');
const D = require('./design-p1.cjs');

const RAW = !!process.env.RAW;
const pct = (x) => (RAW ? (x * 100).toFixed(3) : (x * 100).toFixed(1).replace('.', ',')) + '%';
const cell = (p) => `${pct(p)} → ${pct(L.passConst(p))}`;
const { levels, file } = D.readDesign();
console.log(`Nguồn: ${file} (§5 bảng bậc, §9 bảng khuôn chung). Ô = đúng mỗi bài → qua bậc (luật 6/4/1).`);

const out = levels.map((lv) => {
  const sets = G.strategySets({ recipe: lv.forms.map((f) => [f, 6 / lv.forms.length]) });
  const all = S.rcTemplates(lv.K, lv.m);
  const share = 1 / lv.forms.length;
  const items = []; // { w, f, pv, o, fi }
  for (const r of lv.rows) {
    const t = all.find((x) => x.key === S.tKey(r.sigs));
    if (!t) throw new Error(`bậc ${lv.level}: khuôn ${r.text} không xếp được món đệm ở ${lv.K}×${lv.m}`);
    for (const f of lv.forms) {
      const o = S.orient(f, t.sigs, t.fill);
      items.push({ w: r.w * share, f, pv: t.pv[f], o, fi: L.formInfo(f), row: r, t });
    }
  }
  const mean = (fn) => items.reduce((a, it) => a + it.w * fn(it), 0);
  const pOf = (name) => mean((it) => it.pv[L.IDX[name]]);
  const worst = (idxs) => { let b = { p: -1 }; for (const i of idxs) { const p = mean((it) => it.pv[i]); if (p > b.p + 1e-12) b = { p, name: L.NAMES[i] }; } return b; };
  const res = { lv, guess: 1 / lv.K };
  res.NN = worst(sets.NNsig);
  res.S1 = worst(L.S1L.map((n) => L.IDX[n]));
  for (const n of ['S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S8∩S9', 'S2∩S9', 'S3∩S9', 'S13-rand']) res[n] = pOf(n);
  res.S13 = worst(sets.S13);
  // Thư viện mù dấu: chiến lược đoán vị trí thẻ "có" từ bàn không dấu, rồi giải đúng.
  res.blind = Object.fromEntries(S.BLIND.map((n) => [n, mean((it) => S.blindEval(it.o.sigs, it.fi.A, it.o.fill)[n])]));
  const bw = (names) => names.reduce((a, n) => (res.blind[n] > a.p + 1e-12 ? { p: res.blind[n], name: n } : a), { p: -1 });
  res.blindNoPos = bw(S.BLIND.filter((n) => !n.startsWith('B-pos')));
  res.blindAll = bw(S.BLIND);
  // Cận Bayes (mọi chiến lược mù dấu, biết bộ sinh): Σ_khuôn max_dạng P(khuôn, dạng). Khuôn dùng chung
  // cho ba dạng và món đệm nhận theo cả ba vai trò ⇒ = 1/3 khi dạng rút đều; = 1 khi dạng cố định.
  // Bé thấy bàn (khuôn, món đệm) và thứ tự thẻ nhưng không đọc dấu; dạng cố định thì vị trí thẻ "có"
  // chính là thông tin nhìn thấy (bậc 1–2: thẻ "có" luôn đứng đầu ⇒ 100%, giàn đỡ có chủ đích).
  const vis = new Map();
  for (const it of items) { const k = it.t.key + '|' + (lv.draw === 'fixed' ? it.f : '*'); const m = vis.get(k) || {}; m[it.f] = (m[it.f] || 0) + it.w; vis.set(k, m); }
  res.bayes = [...vis.values()].reduce((a, m) => a + Math.max(...Object.values(m)), 0);
  // R11 đổi vai trò: mỗi khuôn, đặt thẻ "có" ở vị trí 1/2/3 đều đạt R1–R3 + mọi mẹo không phủ định ≤ 1/3;
  // ba đáp án là ba nhà chữ ký 100 / 010 / 001, khác nhau.
  res.R11 = lv.rows.every((r) => { const t = all.find((x) => x.key === S.tKey(r.sigs)); return S.blindEval(t.sigs, 1, t.fill).roleOK; });
  // Định lý S13: quên một thẻ "không có" = 1/2 trên MỌI khuôn × dạng.
  res.S13theorem = items.every((it) => it.pv[L.IDX['S13-N1']] === 0.5 && it.pv[L.IDX['S13-N2']] === 0.5);
  // R7 (khép theo thứ tự đọc), R8 (còn mở sau thẻ 1), loại vi phạm đầu tiên trên nhà nhiễu.
  const seq = new Set(); let r8min = Infinity, r8max = 0, forb = 0, miss = 0, multi = 0, nDis = 0;
  for (const it of items) {
    const { sigs } = it.o, fi = it.fi, K = sigs.length;
    const ok = (s, j) => (((s >> j) & 1) === (fi.signs[j] === 'P' ? 1 : 0));
    let open = sigs.map((_, h) => h); const closed = [];
    for (let j = 0; j < 3; j++) { const nx = open.filter((h) => ok(sigs[h], j)); closed.push(open.length - nx.length); open = nx; if (j === 0) { r8min = Math.min(r8min, nx.length); r8max = Math.max(r8max, nx.length); } }
    seq.add(`${it.f} ${it.row.acd.join(',')}: ${closed.join('/')}`);
    for (let h = 1; h < K; h++) {
      const v = [0, 1, 2].filter((j) => !ok(sigs[h], j));
      const first = v[0];
      if (fi.signs[first] === 'P') miss += it.w; else forb += it.w;
      if (v.length > 1) multi += it.w;
      nDis += it.w;
    }
  }
  res.R7 = [...seq]; res.R8 = [r8min, r8max];
  res.forb = forb / nDis; res.miss = miss / nDis; res.multi = multi / nDis;
  return res;
});

const head = out.map((r) => `B${r.lv.level} ${r.lv.K}×${r.lv.m}`);
const row = (label, f) => console.log(`| ${label} | ${out.map(f).join(' | ')} |`);
console.log('');
console.log(`| Chiến lược (chính xác) | ${head.join(' | ')} |`);
console.log(`|---|${out.map(() => '---').join('|')}|`);
row('Dạng thẻ', (r) => (r.lv.draw === 'fixed' ? 'PNN cố định' : 'rút độc lập'));
row('Khuôn (a, c, d) × trọng số', (r) => r.lv.rows.map((x) => `(${x.acd.join(', ')}) ${Math.round(x.w * 100)}%`).join(' + '));
row('Đoán bừa / S12', (r) => cell(r.guess));
row('Không phủ định tệ nhất (mức chữ ký)', (r) => `${cell(r.NN.p)} (${r.NN.name})`);
row('S1 một thẻ tốt nhất (mọi thẻ)', (r) => `${cell(r.S1.p)} (${r.S1.name})`);
row('S2 / S8 / S9', (r) => `${cell(r.S2)} / ${cell(r.S8)} / ${cell(r.S9)}`);
row('S4 / S5 / S10', (r) => `${cell(r.S4)} / ${cell(r.S5)} / ${cell(r.S10)}`);
row('S8∩S9 / S2∩S9', (r) => `${cell(r['S8∩S9'])} / ${cell(r['S2∩S9'])}`);
row('S3 bỏ hết thẻ "có"', (r) => cell(r.S3));
row('S13 quên 1 thẻ, tệ nhất', (r) => `${cell(r.S13.p)} (${r.S13.name})`);
row('S13 quên 1 thẻ ngẫu nhiên', (r) => cell(r['S13-rand']));
row('S3∩S9', (r) => cell(r['S3∩S9']));
for (const n of S.BLIND) row(`mù dấu ${S.BLIND_NOTE[n]}`, (r) => cell(r.blind[n]));
row('Mù dấu tệ nhất, trừ vị trí', (r) => `${cell(r.blindNoPos.p)} (${r.blindNoPos.name})`);
row('Mù dấu tệ nhất, kể cả vị trí', (r) => `${cell(r.blindAll.p)} (${r.blindAll.name})`);
row('Cận Bayes mọi mẹo mù dấu', (r) => cell(r.bayes));
row('R11 đổi vai trò (mọi khuôn)', (r) => (r.R11 ? 'đạt' : 'TRƯỢT'));
row('Định lý S13: quên thẻ "không có" = 1/2 mọi khuôn × dạng', (r) => (r.S13theorem ? 'đúng' : 'SAI'));
row('R8 còn mở sau thẻ 1 (min–max)', (r) => `${r.R8[0]}–${r.R8[1]}`);
row('Nhà nhiễu: vi phạm đầu là "cấm" / "thiếu"', (r) => `${Math.round(r.forb * 100)}% / ${Math.round(r.miss * 100)}%`);
row('Nhà nhiễu vi phạm > 1 thẻ', (r) => `${Math.round(r.multi * 100)}%`);
console.log('');
console.log('R7 khép theo thứ tự đọc (dạng, (a,c,d): thẻ 1/2/3):');
const seen = new Set();
out.forEach((r) => r.R7.forEach((s) => { if (!seen.has(s)) { seen.add(s); console.log(`  ${s}`); } }));
const bad = out.filter((r) => !r.R11 || !r.S13theorem || r.NN.p > 1 / 3 + 1e-9 || (r.lv.draw === 'indep' && r.bayes > 1 / 3 + 1e-9));
console.log(bad.length ? `KIỂM: TRƯỢT ở ${bad.map((r) => 'B' + r.lv.level).join(', ')}` : 'KIỂM: mọi bậc NN ≤ 1/3, R11 đạt, định lý S13 đúng; bậc rút dạng độc lập có cận Bayes mù dấu ≤ 1/3.');
