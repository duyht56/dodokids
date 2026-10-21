'use strict';
// research/legacy/table.cjs — bảng số đo T-Lai (bộ sinh M, design bản 2026-10-20) theo từng chiến lược.
// Chuyển vào legacy/ ngày 2026-10-21 khi đổi sang khuôn đối xứng P1 (bảng mới: ../table.cjs).
// Thêm khi chép script vào change (2026-10-20). Dùng đúng runLevel() của runlevel.cjs, seed bậc i = SEED + i.
// node table.cjs [rounds=1000]   (SEED mặc định 1000, đổi bằng SEED=2000)
const { runLevel } = require('./runlevel.cjs');
const L = require('../lib.cjs');
const H = require('./hybrid.cjs');

const ROUNDS = +(process.argv[2] || 1000);
const SEED0 = +(process.env.SEED || 1000);
const levels = H['T-Lai'];
const res = levels.map((lv, i) => runLevel(lv, 'M', SEED0 + i, ROUNDS));

const pct = (x) => (x * 100).toFixed(1).replace('.', ',') + '%';
const cell = (o) => `${pct(o.p)} → ${pct(o.pass)}`;
const row = (label, f) => console.log(`| ${label} | ${res.map(f).join(' | ')} |`);

console.log(`T-Lai / bộ sinh M — ${ROUNDS} vòng × 6 bài mỗi bậc, seed ${SEED0}+i. Ô = đúng mỗi bài → qua bậc (luật 6/4/1, Poisson–binomial).`);
console.log('');
console.log(`| Chiến lược | ${res.map((r, i) => `B${i + 1} ${r.K}×${r.m}`).join(' | ')} |`);
console.log(`|---|${res.map(() => '---').join('|')}|`);
row('Đoán bừa / S12 một ô cố định', (r) => cell(r.guess));
row('S1 một thẻ tốt nhất (mọi thẻ)', (r) => `${cell(r.S1max)} (${r.S1max.name})`);
row('S2 bỏ hết thẻ "không có"', (r) => cell(r.named.S2));
row('S3 bỏ hết thẻ "có" (dùng phủ định)', (r) => cell(r.S3));
row('S4 coi "không có" là "có"', (r) => cell(r.named.S4));
row('S5 đảo dấu', (r) => cell(r.named.S5));
row('S6 / S7 nhiều / ít món-thẻ nhất', (r) => `${cell(r.named.S6)} / ${cell(r.named.S7)}`);
row('S8 đúng 1 món-thẻ', (r) => cell(r.named.S8));
row('S9 nhà lẻ tổ hợp', (r) => cell(r.named.S9));
row('S10 món độc nhất / S11 ít trùng nhất', (r) => `${cell(r.named.S10)} / ${cell(r.named.S11)}`);
row('S8∩S9 (mẹo Codex)', (r) => cell(r.named['S8∩S9']));
row('S15 = S2∩S9', (r) => cell(r.named['S2∩S9']));
row('Không phủ định tệ nhất (đơn + ghép)', (r) => `${cell(r.worstNN)} (${r.worstNN.name})`);
row('S13 quên 1 thẻ, tệ nhất', (r) => `${cell(r.S13max)} (${r.S13max.name})`);
row('S13 quên 1 thẻ ngẫu nhiên', (r) => cell(r.S13rand));
row('Suy luận một phần tệ nhất', (r) => `${cell(r.worstPART)} (${r.worstPART.name})`);
row('Khuôn dùng / khuôn hợp lệ', (r) => `${r.tmplUsed} / ${r.tmplBase}`);
row('Cấu trúc thấy (ước tính L–P)', (r) => `${r.structSeen} (~${r.structLP})`);
row('Lần xếp món đệm mỗi bài', (r) => r.tries.toFixed(2).replace('.', ','));
row('Bộ sinh', (r) => r.mode.split(' | ')[0]);
