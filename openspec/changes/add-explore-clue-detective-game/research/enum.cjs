'use strict';
// enum.cjs — vét cạn cách gán món đệm cho khuôn đối xứng P1, có cắt tỉa theo ĐIỀU KIỆN CẦN của
// "mọi mẹo NN trong họ mở rộng ≤ 1/3 cho cả ba vai trò":
//   (i)  bộ lọc S8 (đúng 1 món-thẻ) + mọi thống kê, cho ba vai trò ⇒ ba nhà e_A, e_B, e_C bằng nhau trên
//        mọi thống kê ⇒ đa tập tần suất món đệm của ba nhà e bằng nhau ({α, β});
//   (ii) với khuôn (a,1,0) (d = 0, bộ lọc "có A" còn 3 nhà): thêm bộ lọc P cho ba vai trò ⇒ mọi thống kê
//        bằng nhau trên CẢ SÁU nhà có món-thẻ ⇒ món thứ ba của AB/AC/BC cùng tần suất t, và nhà e có
//        món đệm tần suất {3, t} (chứng minh trong README).
// Mỗi món có "đích tần suất" theo chỗ xuất hiện đầu tiên; món chỉ ở nhà 000 tự do (≥ 2, R5).
// node enum.cjs <8x3|9x3a|9x3b|8x2|9x2> [maxFill=10]     T=3 (chỉ t = 3)   R5O=1 (luật R5′)
// Ghi found-<conf>[-t3][-r5o].json (bàn đạt luật cũ, kèm famOK / orbit) vào OUT (mặc định thư mục tạm của
// máy, `clue-detective-research/`) cho bayes-p.cjs / views.cjs; cuối cùng so danh mục chặt vét được với
// design §9 `CLUE_STRUCTURES` (R5) hoặc catalog.cjs CAT5 (R5′).
const L = require('./lib.cjs');
const C = require('./check.cjs');
const fs = require('fs');
const path = require('path');
const OUT = process.env.OUT || path.join(require('os').tmpdir(), 'clue-detective-research');
fs.mkdirSync(OUT, { recursive: true });
const CONF = {
  '8x2': { m: 2, sigs: [1, 2, 4, 3, 5, 6, 0, 0] }, '9x2': { m: 2, sigs: [1, 2, 4, 3, 5, 6, 0, 0, 0] },
  '8x3': { m: 3, sigs: [1, 2, 4, 3, 5, 6, 0, 0] }, '9x3a': { m: 3, sigs: [1, 2, 4, 3, 5, 6, 0, 0, 0] },
  '9x3b': { m: 3, sigs: [1, 2, 4, 3, 5, 6, 7, 0, 0] },
};
const conf = process.argv[2] || '8x3', MAXF = +(process.argv[3] || 10);
const { m, sigs } = CONF[conf];
const K = sigs.length, d = sigs.includes(7) ? 1 : 0;
const pc = (x) => (x & 1) + ((x >> 1) & 1) + ((x >> 2) & 1);
const cardF = 1 + 2 + d; // tần suất mỗi món-thẻ (c = 1)

// lớp chỗ: e1/e2 (món đệm của nhà e), z (món thứ ba nhà hai món-thẻ), o (nhà 000)
function slotsFor() {
  const sl = [];
  sigs.forEach((s, h) => { const k = m - pc(s); const cls = pc(s) === 1 ? ['e1', 'e2'] : pc(s) === 2 ? ['z'] : pc(s) === 0 ? ['o', 'o', 'o'] : []; for (let i = 0; i < k; i++) sl.push({ h, cls: cls[i] || 'o' }); });
  return sl;
}
const slots = slotsFor();
// đích tần suất theo lớp: trả về hàm (cls) → đích hoặc null (tự do ≥ 2)
function* targetSchemes() {
  if (d === 0) {
    if (m === 2) { yield { name: 'e=3', e1: 3 }; return; }
    for (let t = 2; t <= K; t++) if (!process.env.T || +process.env.T === t) yield { name: `t=${t}`, e1: 3, e2: t, z: t };
  } else {
    for (let a = 2; a <= K; a++) for (let b = a; b <= K; b++) yield { name: `e={${a},${b}}`, e1: a, e2: b, z: null };
  }
}
const found = new Map(); let raw = 0;
const FREEMIN = process.env.R5O ? 1 : 2; // R5′: món chỉ ở nhà 000 được xuất hiện 1 lần
const t0 = Date.now();
for (const sc of targetSchemes()) {
  const tgt = (cls) => (cls === 'o' ? null : sc[cls] ?? null);
  const fill = sigs.map(() => []), freq = [], target = [], inH = sigs.map(() => new Set());
  let n = 0;
  (function rec(i) {
    // cắt tỉa: nhu cầu còn lại ≤ chỗ còn lại
    let need = 0; for (let k = 0; k < n; k++) need += target[k] !== null ? target[k] - freq[k] : Math.max(0, FREEMIN - freq[k]);
    if (need > slots.length - i) return;
    if (i === slots.length) {
      for (let k = 0; k < n; k++) if (target[k] !== null ? freq[k] !== target[k] : freq[k] < FREEMIN) return;
      const keys = new Set(sigs.map((s, h) => s + '|' + fill[h].slice().sort((a, b) => a - b).join(',')));
      if (keys.size !== K) return;
      raw++;
      const key = L.canonKey('PNN', sigs, fill);
      if (!found.has(key)) found.set(key, { scheme: sc.name, fill: fill.map((f) => f.slice()) });
      return;
    }
    const { h, cls } = slots[i];
    const want = tgt(cls);
    for (let it = 0; it <= n && it < MAXF; it++) {
      if (inH[h].has(it)) continue;
      const isNew = it === n;
      if (!isNew) {
        if (cls !== 'o' && want !== null) { if (target[it] === null || target[it] !== want) continue; }
        if (target[it] !== null && freq[it] >= target[it]) continue;
      } else if (cls !== 'o' && want === null) { /* z tự do (9x3b) */ }
      if (isNew) { freq.push(0); target.push(cls === 'o' ? null : want); n++; }
      freq[it]++; inH[h].add(it); fill[h].push(it);
      rec(i + 1);
      fill[h].pop(); inH[h].delete(it); freq[it]--;
      if (isNew) { freq.pop(); target.pop(); n--; }
    }
  })(0);
}
console.log(`${conf}: gán thô thoả điều kiện cần ${raw}, cấu trúc phân biệt ${found.size} (${Date.now() - t0} ms)`);
// kiểm đầy đủ
const cards = [0, 1, 2];
const res = [];
for (const [key, x] of found) {
  const houses = sigs.map((s, h) => [...[0, 1, 2].filter((j) => (s >> j) & 1), ...x.fill[h].map((f) => 3 + f)]);
  const r = C.checkBoard(houses, cards, m, { strict: false, r5o: !!process.env.R5O });
  const row = { key, scheme: x.scheme, houses, ok: r.ok, errs: r.errs, famOK: r.famOK, famOKsum: r.famOKsum, nn: r.nnNoSum, nnk: r.roles.map((q) => q.nnNoSum.k), blind: r.blind, roleOK: r.roleOK, nFill: new Set(x.fill.flat()).size };
  if (r.ok && r.famOK) { const s = C.checkBoard(houses, cards, m, { strict: true }); row.orbit = s.minOrbit; row.group = s.roles[0].group; }
  res.push(row);
}
const pass = res.filter((r) => r.ok && r.famOK);
const strict = pass.filter((r) => r.orbit >= 3);
const bySch = {}; pass.forEach((r) => (bySch[r.scheme] = (bySch[r.scheme] || 0) + 1));
console.log(`  đạt R1–R11 (trừ R9 tên) + thư viện cũ + họ mở rộng NN ≤ 1/3 (trừ Σđệm): ${pass.length} cấu trúc ${JSON.stringify(bySch)}; trong đó hoán đổi được chặt (quỹ đạo đáp án ≥ 3 ở cả ba vai trò): ${strict.length}; đạt cả Σđệm: ${pass.filter((r) => r.famOKsum).length}`);
const failR = {}; res.filter((r) => !r.ok).forEach((r) => r.errs.forEach((e) => (failR[e.split(':')[1]] = (failR[e.split(':')[1]] || 0) + 1)));
console.log(`  trượt luật cũ: ${JSON.stringify(failR)}; trượt họ mở rộng (đạt luật cũ): ${res.filter((r) => r.ok && !r.famOK).length}`);
const outFile = path.join(OUT, `found-${conf}${process.env.T ? '-t' + process.env.T : ''}${process.env.R5O ? '-r5o' : ''}.json`);
fs.writeFileSync(outFile, JSON.stringify(res.filter((r) => r.ok), null, 0));
console.log(`  ghi ${outFile}`);
const nm = 'ABCDEFGHIJKLMN';
for (const r of strict.slice(0, 12)) console.log(`   ★ ${r.scheme} |Stab(A)|=${r.group} món đệm ${r.nFill}: ${r.houses.map((h) => h.map((i) => nm[i]).join('')).join(' ')}`);
for (const r of pass.filter((x) => !(x.orbit >= 3)).slice(0, 6)) console.log(`   ○ ${r.scheme} quỹ đạo ${r.orbit}: ${r.houses.map((h) => h.map((i) => nm[i]).join('')).join(' ')}`);
// So với danh mục của thiết kế (khoá chuẩn, món-thẻ cố định theo vị trí).
{
  const D = require('./design-x.cjs');
  const CATS = require('./catalog.cjs');
  const want = (process.env.R5O ? CATS.CAT5 : CATS.CAT)[conf];
  const got = new Set(strict.map((r) => D.structKey(r.houses)));
  const ref = new Set((want || []).map((h) => D.structKey(h)));
  const same = got.size === ref.size && [...got].every((k) => ref.has(k));
  const src = process.env.R5O ? 'catalog.cjs CAT5 (R5′)' : 'design §9 CLUE_STRUCTURES';
  if (!want) console.log(`  ${src}: không có cấu hình ${conf} (danh mục vét được: ${strict.length} cấu trúc chặt)`);
  else console.log(`  so với ${src}: ${same ? 'KHỚP' : 'LỆCH'} (vét được ${got.size}, danh mục ${ref.size})`);
}
