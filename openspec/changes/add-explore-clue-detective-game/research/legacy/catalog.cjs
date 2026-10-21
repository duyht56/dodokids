'use strict';
// clue-sim/catalog.cjs — số đo từng cấu hình (dạng thẻ × K × m) với bộ sinh M, để dựng bảng lai.
const { runLevel } = require('./runlevel.cjs');
const O3 = ['PNN', 'NPN', 'NNP'], O6 = ['PPN', 'PNP', 'NPP', 'PNN', 'NPN', 'NNP'];
const sets = { PN: ['PN'], PNN: ['PNN'], O3, O6 };
const R = +(process.argv[2] || 300);
const pct = (x) => (x * 100).toFixed(1);
const rows = [];
const cfgs = [];
for (const K of [4, 5, 6, 7]) cfgs.push(['PN', K, 2]);
for (const K of [5, 6, 7, 8]) for (const m of [2]) { cfgs.push(['PNN', K, m]); cfgs.push(['O3', K, m]); }
for (const K of [6, 7, 8, 9]) for (const m of [3, 4]) { cfgs.push(['PNN', K, m]); cfgs.push(['O3', K, m]); cfgs.push(['O6', K, m]); }
for (const [fs, K, m] of cfgs) {
  for (const gate of [false, true]) {
    const forms = sets[fs];
    const level = { K, m, recipe: forms.map((f) => [f, 6 / forms.length]), note: '', gate };
    const r = runLevel(level, 'M', 4242, R);
    if (r.infeasible) { console.log(`${fs} ${K}x${m} gate=${gate}: BẤT KHẢ ${r.infeasible}`); break; }
    console.log(`${fs} ${K}x${m} gate=${gate} emoji=${r.emoji} | đoán ${pct(r.guess.pass)} | NN ${r.worstNN.name} ${pct(r.worstNN.p)}→${pct(r.worstNN.pass)} | S13 ${r.S13max.name} ${pct(r.S13max.p)}→${pct(r.S13max.pass)} | S3 ${pct(r.S3.pass)} | khuôn ${r.tmplUsed}/${r.tmplBase} | cấu trúc ${r.structSeen} (~${r.structLP}) | ${r.mode}`);
    rows.push({ fs, K, m, gate, r });
  }
}
// Chỉ ghi file khi đặt OUT=<đường dẫn> (bản gốc ghi catalog.json vào thư mục đang đứng).
// OUT là thư mục (quy ước của enum.cjs / table-x.cjs) → <OUT>/catalog.json.
if (process.env.OUT) { const fs = require('fs'), o = process.env.OUT; fs.writeFileSync(fs.existsSync(o) && fs.statSync(o).isDirectory() ? require('path').join(o, 'catalog.json') : o, JSON.stringify(rows)); }
