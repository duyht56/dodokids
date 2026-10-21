'use strict';
// boards-x.cjs — hai bàn mẫu design §11 (P1-X; pool 14 design §3, R9), kiểm qua toàn bộ họ S16 + thư viện
// S1–S15 + mù dấu + R11 + hoán đổi được chặt (R12). Cấu trúc lấy từ design §9 (catalog.cjs). Vị trí ô xáo
// theo seed (lưới 3–3–3, ô 1 → 9).  node boards-x.cjs [seed=7]
const L = require('./lib.cjs');
const C = require('./check.cjs');
const AU = require('./autom.cjs');
const FAM = require('./fam.cjs');
const { CAT } = require('./catalog.cjs');
const seed = +(process.argv[2] || 7);
const nm = (i) => `${L.EMOJI[i]} ${L.ITEMS[i]}`;
function show(title, H, form, map, wrongCell) {
  const rng = L.makeRng(seed);
  const houses0 = H.map((h) => h.map((i) => map[i]));
  const cards = [map[0], map[1], map[2]];
  const order = rng.shuffle([...houses0.keys()]);
  const houses = order.map((k) => rng.shuffle(houses0[k]));
  const p = form.indexOf('P'), m = houses[0].length;
  const sig = (h) => [0, 1, 2].map((j) => (h.includes(cards[j]) ? '1' : '0')).join('');
  console.log(`\n### ${title} — ${houses.length}×${m}, dạng ${form}`);
  console.log('Thẻ: ' + [...form].map((s, j) => `${j + 1}. ${s === 'P' ? 'CÓ' : 'KHÔNG CÓ'} ${nm(cards[j])}`).join(' · '));
  const r = C.checkBoard(houses, cards, m, { strict: true, names: true });
  const ans = r.roles[p].ans;
  houses.forEach((h, k) => console.log(`  ô ${k + 1}: ${h.map(nm).join(' + ')}   [${sig(h)}]${k === ans ? ' ★' : ''}${k === wrongCell ? '  ← chạm nhầm' : ''}`));
  const sat = (h, js) => js.every((j) => h.includes(cards[j]) === (form[j] === 'P'));
  const drops = [0, 1, 2].map((j) => houses.filter((h) => sat(h, [0, 1, 2].filter((x) => x !== j))).length);
  let open = houses.slice(); const closed = [];
  for (const j of [0, 1, 2]) { const nx = open.filter((h) => sat(h, [j])); closed.push(open.length - nx.length); open = nx; }
  const fr = {}; houses.flat().forEach((i) => (fr[i] = (fr[i] || 0) + 1));
  console.log(`  kiểm luật (R1–R9 tên thật, R11): ${r.ok ? 'đạt' : r.errs.join('; ')} | bỏ thẻ 1/2/3 còn ${drops.join('/')} nhà | diễn lại khép ${closed.join('/')} | tần suất món: ${[...new Set(Object.values(fr))].join(',')} (mọi món ${Object.values(fr).every((v) => v === 3) ? '= 3' : 'không đều'})`);
  const rp = r.roles[p];
  console.log(`  họ mở rộng NN tệ nhất (3 vai trò, trừ viết lại lời giải & Σđệm) ${r.nnNoSum.toFixed(3)} | thư viện cũ NN ${Math.max(...r.roles.map((x) => x.oldNN)).toFixed(3)} | mẹo Codex P|sumF.min ${FAM.evalFamily(houses, cards, p).out.get('P|sumF.min').p.toFixed(3)}`);
  console.log(`  S13 ${rp.S13} | S3 ${rp.S3.toFixed(3)} | S3∩S9 ${rp.S3S9} | PART tệ nhất ${rp.part.k} ${rp.part.p.toFixed(3)} | mù dấu (trừ vị trí) ${r.blind.toFixed(3)} | quỹ đạo đáp án dưới Stab(thẻ có) ${r.roles.map((x) => x.orbit).join('/')} (|Stab| ${r.roles[0].group})`);
  console.log(`  đổi vai trò cùng bàn: ${r.roles.map((x) => `${x.form} → ô ${x.ans + 1}`).join(' · ')}`);
  if (wrongCell !== undefined) { const h = houses[wrongCell]; const v = [0, 1, 2].filter((j) => !sat(h, [j])); console.log(`  ô ${wrongCell + 1} vi phạm thẻ ${v.map((j) => j + 1).join(', ')} (${v.map((j) => (form[j] === 'P' ? 'thiếu món' : 'có món cấm')).join(', ')})`); }
  return { houses, cards };
}
// (a) bậc 1, 9×2 PNN, K4 ∪ K3: CÓ quả chuối · KHÔNG CÓ cây nấm · KHÔNG CÓ hộp quà; món đội lốt = cánh diều;
//     K3 = chiếc ô tô, cây xương rồng, chú mèo (không chú cá vì có hộp quà, R9).
const IT = Object.fromEntries(L.ITEMS.map((x, i) => [x, i]));
const a = CAT['9x2'][0]; // AD BD CD AB AC BC EF EG FG (A,B,C = thẻ; D = đội lốt)
show('(a) bậc 1 "Đèn soi"', a, 'PNN', { 0: IT['quả chuối'], 1: IT['cây nấm'], 2: IT['hộp quà'], 3: IT['cánh diều'], 4: IT['chiếc ô tô'], 5: IT['cây xương rồng'], 6: IT['chú mèo'] });
// (b) bậc 6, 9×3 NPN, cấu hình Pappus (ADE BDF CEF ABG ACH BCI DHI EGI FGH): KHÔNG CÓ chú ếch · CÓ cánh diều ·
//     KHÔNG CÓ chú chó; món đệm táo, hoa, mèo, ô tô, chim, hộp quà (không chú cá, R9).
const b = CAT['9x3a'].find((H) => H.map((h) => h.join('')).join(' ') === '034 135 245 016 027 128 378 468 567');
const B = show('(b) bậc 6 "Nhớ thẻ", Pappus', b, 'NPN', { 0: IT['chú ếch'], 1: IT['cánh diều'], 2: IT['chú chó'], 3: IT['quả táo'], 4: IT['bông hoa'], 5: IT['chú mèo'], 6: IT['chiếc ô tô'], 7: IT['chú chim'], 8: IT['hộp quà'] }, 1);
