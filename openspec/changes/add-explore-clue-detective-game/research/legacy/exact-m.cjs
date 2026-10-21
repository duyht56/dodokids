'use strict';
// legacy/exact-m.cjs — qua bậc CHÍNH XÁC (không lấy mẫu) của bộ sinh M (T-Lai cũ), chỉ để tái lập
// lịch sử. Bản này là `exact.cjs` sửa ngày 2026-10-21 (Codex vòng 6 mục 1.3: đọc ĐÚNG bảng
// CLUE_TEMPLATES 18 dòng đã làm tròn, bậc 5 và 6 chung một bảng, chuẩn hoá lại tổng trọng số mỗi
// dạng = 1). Game nay dùng khuôn đối xứng P1, nên bảng 18 dòng được lưu ở legacy/m-templates.md.
//   node legacy/exact-m.cjs              (bảng legacy/m-templates.md; TEMPLATES=<file> để đổi)
//   MODE=seed node legacy/exact-m.cjs    (cách cũ: buildGenerator(lv,'M',1000+i))
// Mỗi bài đúng với xác suất E[p] (trộn khuôn theo trọng số); các bài độc lập, nên
// q = Poisson–binomial của E[p] từng bài và qua = 1 − (1 − q)².
const fs = require('fs');
const path = require('path');
const L = require('../lib.cjs');
const G = require('../gen.cjs');
const H = require('./hybrid.cjs');

const NAMES = ['S2', 'S3', 'S8', 'S9', 'S8∩S9', 'S2∩S9', 'S3∩S9', 'S13-@1', 'S13-@2', 'S13-@3', 'S13-N1', 'S13-N2', 'S13-rand'];
const pct = (x) => (x * 100).toFixed(1).replace('.', ',') + '%';
const bitsToSig = (b) => [...b].reduce((a, ch, j) => a | (ch === '1' ? 1 << j : 0), 0);
const sortKey = (sigs) => sigs.slice().sort((a, b) => a - b).join(',');

// Đọc bảng "| Bậc | Dạng | Khuôn | Trọng số |" (18 dòng của bộ sinh M).
function designTable() {
  const file = process.env.TEMPLATES || path.join(__dirname, 'm-templates.md');
  const txt = fs.readFileSync(file, 'utf8');
  const rows = [];
  for (const line of txt.split('\n')) {
    const m = line.match(/^\|\s*(1–4|5–6)\s*\|\s*(PNN|NPN|NNP)\s*\|\s*`([01,]+)`\s*\|\s*([\d,]+%?)\s*\|/);
    if (!m) continue;
    const w = m[4].endsWith('%') ? parseFloat(m[4].replace(',', '.')) / 100 : parseFloat(m[4].replace(',', '.'));
    rows.push({ levels: m[1] === '1–4' ? [1, 2, 3, 4] : [5, 6], form: m[2], sigs: m[3].split(',').map(bitsToSig), w });
  }
  if (rows.length !== 18) throw new Error(`bảng khuôn M: đọc được ${rows.length} dòng, cần 18 (${file})`);
  return rows;
}

function perFormFromDesign(lvIdx, lv, rows) {
  const per = {};
  for (const [f] of lv.recipe) {
    const mine = rows.filter((r) => r.form === f && r.levels.includes(lvIdx + 1));
    const base = G.baseTemplates(f, lv.K, lv.m).templates;
    const z = mine.reduce((a, r) => a + r.w, 0);
    per[f] = mine.map((r) => {
      const t = base.find((b) => sortKey(b.sigs) === sortKey(r.sigs) && b.sigs[0] === r.sigs[0]);
      if (!t) throw new Error(`khuôn design không hợp lệ ở ${lv.K}×${lv.m}: ${f} ${r.sigs}`);
      return { pv: t.pv, w: r.w / z };
    });
  }
  return per;
}
function perFormFromSeed(lvIdx, lv) {
  const g = G.buildGenerator(lv, 'M', 1000 + lvIdx);
  const per = {};
  for (const f of Object.keys(g.perForm)) per[f] = g.perForm[f].rows.map((r, t) => ({ pv: r.pv, w: g.perForm[f].weights[t] }));
  return per;
}

const mode = process.env.MODE === 'seed' ? 'seed' : 'design';
const rows = mode === 'design' ? designTable() : null;
console.log(`nguồn trọng số: ${mode === 'design' ? 'legacy/m-templates.md (bảng M 18 dòng, làm tròn, chuẩn hoá lại)' : 'buildGenerator theo seed từng bậc'}`);
console.log(`| Bậc | ${NAMES.join(' | ')} |`);
console.log(`|---|${NAMES.map(() => '---').join('|')}|`);
H['T-Lai'].forEach((lv, i) => {
  const per = mode === 'design' ? perFormFromDesign(i, lv, rows) : perFormFromSeed(i, lv);
  const cells = NAMES.map((n) => {
    const idx = L.IDX[n];
    const ps = [];
    for (const [f, c] of lv.recipe) {
      const e = per[f].reduce((a, r) => a + r.w * r.pv[idx], 0);
      for (let k = 0; k < c; k++) ps.push(e);
    }
    return process.env.RAW ? (L.passOf(L.pbAtLeast(ps, 4)) * 100).toFixed(3) + '%' : pct(L.passOf(L.pbAtLeast(ps, 4)));
  });
  console.log(`| B${i + 1} ${lv.K}×${lv.m} | ${cells.join(' | ')} |`);
});
