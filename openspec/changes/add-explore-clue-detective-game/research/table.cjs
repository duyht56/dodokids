'use strict';
// research/table.cjs — bảng số đo của P1 (khuôn đối xứng dấu, món đệm xếp ngẫu nhiên; bản trước Codex vòng 7,
// cột "P1" để so ở design §10; thiết kế đang chọn P1-X: exact-x.cjs / table-x.cjs).
// Viết lại 2026-10-21 (bản cho bộ sinh M: legacy/table.cjs). Đọc bảng bậc + bảng khuôn chung của P1 từ
// p1-design.md (design-p1.cjs), chạy symrun.analyze (seed bậc i = SEED + i, mặc định 1000 + i).
//   node table.cjs [rounds=1000]          SEED=2000 node table.cjs     DESIGN=<file cùng định dạng>
// Ô = đúng mỗi bài → qua bậc (luật 6/4/1, Poisson–binomial). Dòng mù dấu và cận Bayes lấy số CHÍNH XÁC
// (từ khuôn + trọng số, như exact.cjs) vì mẹo "vị trí" chỉ đúng 0 hoặc 1 mỗi bài nên lấy mẫu dao động
// vài điểm; mọi dòng khác lấy mẫu 1.000 vòng × 6 bài.
const D = require('./design-p1.cjs');
const S = require('./sym.cjs');
const { analyze } = require('./symrun.cjs');

const ROUNDS = +(process.argv[2] || 1000);
const SEED0 = +(process.env.SEED || 1000);
const { levels, file } = D.readDesign();
const res = levels.map((lv, i) => analyze(D.toSymLevel(lv), 'SYM', SEED0 + i, ROUNDS));

const pct = (x) => (x * 100).toFixed(1).replace('.', ',') + '%';
const cell = (o) => `${pct(o.p)} → ${pct(o.pass)}`;
const n = (x) => x.toLocaleString('de-DE');
const row = (label, f) => console.log(`| ${label} | ${res.map(f).join(' | ')} |`);
const blindNoPos = (r) => S.BLIND.filter((b) => !b.startsWith('B-pos')).reduce((a, b) => (r.exact[b].pass > a.pass ? { ...r.exact[b], name: b } : a), { pass: -1 });
const blindAll = (r) => S.BLIND.reduce((a, b) => (r.exact[b].pass > a.pass ? { ...r.exact[b], name: b } : a), { pass: -1 });

console.log(`P1 (khuôn đối xứng dấu) — ${ROUNDS} vòng × 6 bài mỗi bậc, seed ${SEED0}+i; bậc + khuôn đọc từ ${file}.`);
console.log('');
console.log(`| Chiến lược | ${res.map((r, i) => `B${i + 1} ${r.K}×${r.m}`).join(' | ')} |`);
console.log(`|---|${res.map(() => '---').join('|')}|`);
row('Dạng thẻ', (r) => (r.draw === 'indep' ? 'PNN/NPN/NNP rút độc lập' : 'PNN'));
row('Đoán bừa / S12 một ô cố định', (r) => cell(r.guess));
row('S1 một thẻ tốt nhất (mọi thẻ)', (r) => cell(r.S1max));
row('S2 bỏ hết thẻ "không có"', (r) => cell(r.named.S2));
row('S4 coi "không có" là "có" / S5 đảo dấu', (r) => `${cell(r.named.S4)} / ${cell(r.named.S5)}`);
row('S6 / S7 nhiều / ít món-thẻ nhất', (r) => `${cell(r.named.S6)} / ${cell(r.named.S7)}`);
row('S8 đúng 1 món-thẻ', (r) => cell(r.named.S8));
row('S9 nhà lẻ tổ hợp', (r) => cell(r.named.S9));
row('S10 món độc nhất / S11 ít trùng nhất', (r) => `${cell(r.named.S10)} / ${cell(r.named.S11)}`);
row('S8∩S9 (mẹo Codex vòng 5)', (r) => cell(r.named['S8∩S9']));
row('S15 = S2∩S9', (r) => cell(r.named['S2∩S9']));
row('**Không phủ định tệ nhất (đơn + 198 phép giao)**', (r) => `**${cell(r.worstNN)}**`);
row('S3 bỏ hết thẻ "có" (phủ định)', (r) => cell(r.S3));
row('**S13 quên 1 thẻ, tệ nhất**', (r) => `**${cell(r.S13max)}**`);
row('S13 quên 1 thẻ ngẫu nhiên', (r) => cell(r.S13rand));
row('**S3∩S9 (suy luận một phần tệ nhất)**', (r) => `**${cell(r.S3S9)}**`);
row('Mù dấu (i) mẹo Codex vòng 6 *', (r) => cell(r.exact['B-codex']));
row('Mù dấu (ii) món-thẻ ở nhiều nhà nhất / (iii) đồng xuất hiện *', (r) => `${cell(r.exact['B-freq'])} / ${cell(r.exact['B-cooc'])}`);
row('Mù dấu (iv) thẻ "có" ở vị trí 1 *', (r) => cell(r.exact['B-pos1']));
row('Mù dấu (v) đổi vai trò, biết luật bộ sinh *', (r) => cell(r.exact['B-rule']));
row('**Mù dấu tệ nhất trừ vị trí / kể cả vị trí** *', (r) => `**${cell(blindNoPos(r))} / ${cell(blindAll(r))}**`);
row('**Cận Bayes mọi mẹo mù dấu** *', (r) => `**${cell(r.bayes)}**`);
row('R11 đổi vai trò (bàn đạt)', (r) => pct(r.roleOK));
row('Khuôn dùng', (r) => String(r.tmplUsed));
row('Cấu trúc thấy trên 6.000 bài (ước tính Lincoln–Petersen)', (r) => `${n(r.structSeen)} (~${n(r.structLP)})`);
row('Lần xếp món đệm mỗi bài', (r) => r.tries.toFixed(2).replace('.', ','));
console.log('');
console.log('\\* số chính xác từ khuôn + trọng số (không lấy mẫu).');
console.log('');
console.log('Bảng 6 bậc (tóm tắt):');
console.log('');
console.log('| Bậc | Cấu hình | Hình | Khuôn (cấu trúc thấy) | Đoán bừa | Không phủ định tệ nhất | Mù dấu tệ nhất (trừ vị trí / kể cả) | S13 tệ / TB | S3 | S3∩S9 |');
console.log('|---|---|---|---|---|---|---|---|---|---|');
res.forEach((r, i) => {
  const lv = levels[i];
  console.log(`| ${lv.level} | ${r.K}×${r.m} ${r.draw === 'indep' ? 'PNN/NPN/NNP độc lập' : 'PNN'} | ${r.shapes} | ${lv.rows.map((x) => `(${x.acd.join(',')})`).join('+')} (${n(r.structSeen)}) | ${pct(r.guess.pass)} | ${pct(r.worstNN.pass)} | ${pct(blindNoPos(r).pass)} / ${pct(blindAll(r).pass)} | ${pct(r.exact.S13max.pass)} / ${pct(r.exact['S13-rand'].pass)} | ${pct(r.exact.S3.pass)} | ${pct(r.exact['S3∩S9'].pass)} |`);
});
console.log('');
const fc = res.slice(2).map((r, i) => `B${i + 3} ${Object.entries(r.formCount).map(([f, c]) => `${f} ${c}`).join(' ')}`).join(' · ');
console.log(`Dạng thẻ đã rút (bậc 3–6): ${fc}`);
