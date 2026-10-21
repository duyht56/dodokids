'use strict';
// research/design-p1.cjs — đọc bảng bậc + bảng khuôn của P1 (khuôn đối xứng dấu, món đệm xếp ngẫu nhiên).
// Từ 2026-10-21 (sau Codex vòng 7) thiết kế đang chọn là P1-X (danh mục cấu trúc hoán đổi được, đọc bằng
// design-x.cjs); file này đọc mặc định bản chép P1 ở `p1-design.md` (cùng định dạng mục 5 và mục 9 của
// design.md cũ), để table.cjs / exact.cjs / validate-sym.cjs / boards.cjs in lại đúng số đo P1 cũ:
//   - design §5 (bảng bậc): số nhà × món và dạng thẻ từng bậc (cột "Dạng thẻ" có NPN ⇒ ba dạng
//     rút độc lập mỗi bài; không có ⇒ chỉ PNN, thẻ "có" đứng đầu);
//   - design §9 (bảng khuôn chung `CLUE_TEMPLATES`): mỗi dòng một khuôn cho một dải bậc, dùng CHUNG
//     cho ba dạng thẻ, kèm (a, c, d) và trọng số.
// Kiểm khi đọc: khuôn đối xứng dấu (mỗi chữ ký một món đúng 1 nhà, ba chữ ký hai món cùng c nhà),
// khớp cột (a, c, d), số chữ ký = số nhà của bậc, trọng số mỗi bậc cộng lại > 0 (chuẩn hoá về 1).
// Thêm 2026-10-21. DESIGN=<đường dẫn> để đọc file khác cùng định dạng.
const fs = require('fs');
const path = require('path');

const FORMS = ['PNN', 'NPN', 'NNP'];
const bitsToSig = (b) => [...b].reduce((a, ch, j) => a | (ch === '1' ? 1 << j : 0), 0);

function section(txt, n) {
  const start = txt.search(new RegExp(`^## ${n}\\. `, 'm'));
  if (start < 0) throw new Error(`design.md: không thấy mục ${n}`);
  const rest = txt.slice(start + 1);
  const end = rest.search(/^## \d+\. /m);
  return end < 0 ? rest : rest.slice(0, end);
}

function readDesign(file = process.env.DESIGN || path.join(__dirname, 'p1-design.md')) {
  const txt = fs.readFileSync(file, 'utf8');
  // §5: | Bậc | Tên | Dạng thẻ | Nhà × món | ...
  const levels = [];
  for (const line of section(txt, 5).split('\n')) {
    const m = line.match(/^\|\s*([1-6])\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*(\d+) × (\d+)\s*\|/);
    if (!m) continue;
    const forms = m[3].includes('NPN') ? FORMS : ['PNN'];
    if (!m[3].includes('PNN')) throw new Error(`design §5 bậc ${m[1]}: cột dạng thẻ không rõ (${m[3]})`);
    levels.push({ level: +m[1], name: m[2], K: +m[4], m: +m[5], forms, draw: forms.length > 1 ? 'indep' : 'fixed' });
  }
  if (levels.map((l) => l.level).join() !== '1,2,3,4,5,6') throw new Error(`design §5: đọc được bậc ${levels.map((l) => l.level)}`);
  // §9: | 1–4 | `100,...` | (2, 1, 0) | 1 |
  const rows = [];
  for (const line of section(txt, 9).split('\n')) {
    const m = line.match(/^\|\s*([1-6])–([1-6])\s*\|\s*`([01,]+)`\s*\|\s*\((\d+),\s*(\d+),\s*(\d+)\)\s*\|\s*([\d,]+)\s*(%?)\s*\|/);
    if (!m) continue;
    const sigs = m[3].split(',').map(bitsToSig);
    const counts = new Array(8).fill(0); sigs.forEach((s) => counts[s]++);
    const [a, c, d] = [+m[4], +m[5], +m[6]];
    const sym = counts[1] === 1 && counts[2] === 1 && counts[4] === 1 && counts[3] === c && counts[5] === c && counts[6] === c && counts[0] === a && counts[7] === d;
    if (!sym) throw new Error(`design §9: khuôn ${m[3]} không đối xứng dấu hoặc lệch (a, c, d) = (${a}, ${c}, ${d})`);
    const w = parseFloat(m[7].replace(',', '.')) / (m[8] ? 100 : 1);
    for (let lv = +m[1]; lv <= +m[2]; lv++) rows.push({ level: lv, sigs, counts, acd: [a, c, d], w, text: m[3] });
  }
  if (!rows.length) throw new Error('design §9: không đọc được dòng khuôn nào');
  for (const lv of levels) {
    lv.rows = rows.filter((r) => r.level === lv.level);
    if (!lv.rows.length) throw new Error(`design §9: bậc ${lv.level} không có khuôn`);
    const z = lv.rows.reduce((s, r) => s + r.w, 0);
    lv.rows.forEach((r) => {
      if (r.sigs.length !== lv.K) throw new Error(`bậc ${lv.level}: khuôn ${r.text} có ${r.sigs.length} chữ ký, bảng bậc ghi ${lv.K} nhà`);
      r.w /= z;
    });
  }
  return { file, levels, templateRows: [...new Set(rows.map((r) => r.text))].length };
}

// Dạng dùng cho symrun.analyze / sym.buildSym: túi theo recipe (bậc chỉ PNN) hoặc rút độc lập.
function toSymLevel(lv) {
  return {
    kind: 'SYM', K: lv.K, m: lv.m,
    recipe: lv.forms.map((f) => [f, 6 / lv.forms.length]),
    rows: lv.rows.map((r) => [r.counts, r.w]),
    ...(lv.draw === 'indep' ? { draw: 'indep' } : {}),
  };
}

module.exports = { FORMS, readDesign, toSymLevel, bitsToSig };
