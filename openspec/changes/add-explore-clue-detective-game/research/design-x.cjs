'use strict';
// research/design-x.cjs — đọc thiết kế đang chọn (P1-X: khuôn đối xứng dấu + danh mục cấu trúc hoán đổi
// được) THẲNG từ design.md:
//   - design §5 (bảng bậc): số nhà × món và dạng thẻ từng bậc (cột "Dạng thẻ" có NPN ⇒ ba dạng rút độc
//     lập mỗi bài; không có ⇒ chỉ PNN, thẻ "có" đứng đầu);
//   - design §9 (bảng `CLUE_STRUCTURES`): mỗi dòng một cấu trúc cho một dải bậc, viết bằng chữ cái:
//     A, B, C = món của thẻ 1, 2, 3 (theo vị trí đọc, không theo dấu); D, E, … = món đệm. Dùng CHUNG
//     cho ba dạng thẻ; mọi cấu trúc của một bậc có trọng số đều.
// Kiểm khi đọc: mỗi nhà đúng m món khác nhau, số nhà = số nhà của bậc, khuôn chữ ký đối xứng dấu và khớp
// cột (a, c, d), không có hai dòng cùng cấu trúc (khoá chuẩn `canonKey`) trong một bậc.
// Thêm 2026-10-21 (sau Codex vòng 7). DESIGN=<đường dẫn design.md> nếu không chạy từ research/ của change.
const fs = require('fs');
const path = require('path');
const L = require('./lib.cjs');

const FORMS = ['PNN', 'NPN', 'NNP'];
const LETTERS = 'ABCDEFGHIJKLMN';

function section(txt, n) {
  const start = txt.search(new RegExp(`^## ${n}\\. `, 'm'));
  if (start < 0) throw new Error(`design.md: không thấy mục ${n}`);
  const rest = txt.slice(start + 1);
  const end = rest.search(/^## \d+\. /m);
  return end < 0 ? rest : rest.slice(0, end);
}

const sigOf = (h) => [0, 1, 2].reduce((a, j) => a | (h.includes(j) ? 1 << j : 0), 0);
// Khoá chuẩn của một cấu trúc (nhà = mảng id; 0, 1, 2 = món-thẻ theo vị trí; ≥ 3 = món đệm).
function structKey(houses) {
  return L.canonKey('PNN', houses.map(sigOf), houses.map((h) => h.filter((i) => i >= 3)));
}
const parseHouses = (s) => s.trim().split(/\s+/).map((w) => [...w].map((ch) => LETTERS.indexOf(ch)));
const showHouses = (H) => H.map((h) => h.map((i) => LETTERS[i]).join('')).join(' ');
// Tên cấu hình dùng trong script: 9x2, 8x3, 9x3a ((3,1,0)), 9x3b ((2,1,1)), 8x2.
const confName = (K, m, acd) => `${K}x${m}` + (K === 9 && m === 3 ? (acd[2] ? 'b' : 'a') : '');

function readDesign(file = process.env.DESIGN || path.join(__dirname, '..', 'design.md')) {
  const txt = fs.readFileSync(file, 'utf8');
  const levels = [];
  for (const line of section(txt, 5).split('\n')) {
    const m = line.match(/^\|\s*([1-6])\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*(\d+) × (\d+)\s*\|/);
    if (!m) continue;
    if (!m[3].includes('PNN')) throw new Error(`design §5 bậc ${m[1]}: cột dạng thẻ không rõ (${m[3]})`);
    const forms = m[3].includes('NPN') ? FORMS : ['PNN'];
    levels.push({ level: +m[1], name: m[2], K: +m[4], m: +m[5], forms, draw: forms.length > 1 ? 'indep' : 'fixed', structs: [] });
  }
  if (levels.map((l) => l.level).join() !== '1,2,3,4,5,6') throw new Error(`design §5: đọc được bậc ${levels.map((l) => l.level)}`);
  // §9: | 1–3 | 9 × 2 | (3, 1, 0) | `AD BD CD AB AC BC EF EG FG` | K4 ∪ K3 |
  let rows = 0;
  for (const line of section(txt, 9).split('\n')) {
    const m = line.match(/^\|\s*([1-6])(?:–([1-6]))?\s*\|\s*(\d+) × (\d+)\s*\|\s*\((\d+),\s*(\d+),\s*(\d+)\)\s*\|\s*`([A-N ]+)`\s*\|\s*([^|]*?)\s*\|/);
    if (!m) continue;
    rows++;
    const [lo, hi, K, mm] = [+m[1], +(m[2] || m[1]), +m[3], +m[4]];
    const acd = [+m[5], +m[6], +m[7]];
    const houses = parseHouses(m[8]);
    if (houses.length !== K) throw new Error(`design §9: ${m[8]} có ${houses.length} nhà, cột ghi ${K}`);
    if (houses.some((h) => h.length !== mm || new Set(h).size !== mm || h.includes(-1))) throw new Error(`design §9: ${m[8]} có nhà không đúng ${mm} món khác nhau`);
    const counts = new Array(8).fill(0); houses.forEach((h) => counts[sigOf(h)]++);
    const [a, c, d] = acd;
    const sym = counts[1] === 1 && counts[2] === 1 && counts[4] === 1 && counts[3] === c && counts[5] === c && counts[6] === c && counts[0] === a && counts[7] === d;
    if (!sym) throw new Error(`design §9: ${m[8]} không đối xứng dấu hoặc lệch (a, c, d) = (${acd.join(', ')})`);
    const st = { houses, acd, label: m[9], text: m[8].trim(), conf: confName(K, mm, acd), key: structKey(houses) };
    for (let lv = lo; lv <= hi; lv++) {
      const L0 = levels[lv - 1];
      if (L0.K !== K || L0.m !== mm) throw new Error(`design §9: ${st.text} ghi ${K} × ${mm}, bảng bậc §5 bậc ${lv} là ${L0.K} × ${L0.m}`);
      if (L0.structs.some((s) => s.key === st.key)) throw new Error(`design §9: bậc ${lv} có hai dòng cùng cấu trúc (${st.text})`);
      L0.structs.push(st);
    }
  }
  if (!rows) throw new Error('design §9: không đọc được dòng nào của bảng CLUE_STRUCTURES');
  for (const lv of levels) if (!lv.structs.length) throw new Error(`design §9: bậc ${lv.level} không có cấu trúc`);
  return { file, levels };
}

module.exports = { FORMS, LETTERS, readDesign, structKey, parseHouses, showHouses, confName, sigOf };
