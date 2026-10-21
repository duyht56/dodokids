'use strict';
// sym-table.cjs — bảng 6 bậc: T-Lai cũ (bộ sinh M) so với P1 (đối xứng dấu mọi bậc, ĐÃ CHỌN) và
// P2 (M ở bậc 1–2, đối xứng từ bậc 3), kèm thư viện mù dấu. Seed bậc i = SEED + i.
// node sym-table.cjs [rounds=1000] [bảng=all]
//   bảng ∈ T-Lai, P1, P1-túi, P2, B5-310, B13-9x2, P1-10, P2-8x2M, RC9, RC10
// Sửa khi chép vào change (2026-10-21): P1 rút dạng thẻ ĐỘC LẬP mỗi bài từ bậc 3 (design §5, §9);
// P1-túi là P1 của clue-sim-symmetric.md §3 (túi ×2 mỗi dạng), giữ để so.
const { analyze, pct } = require('./symrun.cjs');
const S = require('./sym.cjs');
const ROUNDS = +(process.argv[2] || 1000);
const SEED0 = +(process.env.SEED || 1000);
const PNN6 = [['PNN', 6]], O3 = [['PNN', 2], ['NPN', 2], ['NNP', 2]];
const c = (a, cc, d) => [a, 1, 1, cc, 1, cc, cc, d];
const sym = (K, m, recipe, rows, extra = {}) => ({ kind: 'SYM', K, m, recipe, rows, ...extra });
const ind = { draw: 'indep' }; // dạng thẻ rút độc lập đều mỗi bài
const M = (K, m, recipe, extra = {}) => ({ kind: 'M', K, m, recipe, ...extra });
const MIX9 = [[c(3, 1, 0), 1], [c(2, 1, 1), 1]]; // bậc 5–6: hai khuôn đối xứng 9×3, 50/50

const TABLES = {
  'T-Lai': [M(7, 2, PNN6), M(7, 2, PNN6), M(7, 2, O3), M(7, 3, O3), M(9, 3, O3, { gate: true }), M(9, 3, O3, { gate: true })],
  P1: [sym(8, 2, PNN6, [[c(2, 1, 0), 1]]), sym(8, 2, PNN6, [[c(2, 1, 0), 1]]), sym(8, 2, O3, [[c(2, 1, 0), 1]], ind),
    sym(8, 3, O3, [[c(2, 1, 0), 1]], ind), sym(9, 3, O3, MIX9, ind), sym(9, 3, O3, MIX9, ind)],
  'P1-túi': [sym(8, 2, PNN6, [[c(2, 1, 0), 1]]), sym(8, 2, PNN6, [[c(2, 1, 0), 1]]), sym(8, 2, O3, [[c(2, 1, 0), 1]]),
    sym(8, 3, O3, [[c(2, 1, 0), 1]]), sym(9, 3, O3, MIX9), sym(9, 3, O3, MIX9)],
  P2: [M(7, 2, PNN6), M(7, 2, PNN6), sym(8, 2, O3, [[c(2, 1, 0), 1]]),
    sym(8, 3, O3, [[c(2, 1, 0), 1]]), sym(9, 3, O3, MIX9), sym(9, 3, O3, MIX9)],
  // biến thể bậc 5–6 để so
  'B5-310': [sym(9, 3, O3, [[c(3, 1, 0), 1]])],
  'B13-9x2': [sym(9, 2, PNN6, [[c(3, 1, 0), 1]]), sym(9, 2, O3, [[c(3, 1, 0), 1]])],
  'P1-10': [sym(10, 3, O3, [[c(4, 1, 0), 1]]), sym(10, 3, O3, [[c(4, 1, 0), 1], [c(3, 1, 1), 1]])],
  'P2-8x2M': [M(8, 2, PNN6)],
  // đóng vai trò (không đối xứng) + Hedge hạ S13 ở bậc cổng — hướng nới, ngoài yêu cầu
  RC9: [{ kind: 'SYM', K: 9, m: 3, recipe: O3, rc: true, gate: true }],
  RC10: [{ kind: 'SYM', K: 10, m: 3, recipe: O3, rc: true, gate: true }],
};
const pick = process.argv[3] && process.argv[3] !== 'all' ? process.argv[3].split(',') : Object.keys(TABLES);
const out = {};
for (const t of pick) {
  console.log(`\n=== ${t} (${ROUNDS} vòng × 6 bài mỗi bậc) ===`);
  out[t] = TABLES[t].map((lv, i) => {
    const r = analyze(lv, lv.kind, SEED0 + i, ROUNDS);
    if (r.infeasible) { console.log(`B${i + 1} ${lv.K}×${lv.m}: BẤT KHẢ`); return r; }
    const e = r.exact;
    console.log(`B${i + 1} ${r.kind} ${r.K}×${r.m} [${r.forms}] hình=${r.shapes} | đoán ${pct(r.guess.pass)} | NN tệ ${r.worstNN.name} ${pct(r.worstNN.p)}→${pct(r.worstNN.pass)} (chính xác mức chữ ký ${pct(e.worstNNsig.pass)})`);
    const ex = (names) => names.reduce((a, n) => (e[n].pass > a.pass ? { ...e[n], name: n } : a), { pass: -1 });
    const exAll = ex(S.BLIND), exNoPos = ex(S.BLIND.filter((n) => !n.startsWith('B-pos')));
    console.log(`    mù dấu (lấy mẫu): tệ nhất ${r.blindWorst.name} ${pct(r.blindWorst.pass)}; trừ vị trí ${r.blindWorstNoPos.name} ${pct(r.blindWorstNoPos.p)}→${pct(r.blindWorstNoPos.pass)} | chính xác: kể cả vị trí ${exAll.name} ${pct(exAll.pass)}, trừ vị trí ${exNoPos.name} ${pct(exNoPos.pass)} | Bayes (cận trên) ${pct(r.bayes.p)}→${pct(r.bayes.pass)}; vai trò ok ${pct(r.roleOK)}`);
    console.log(`    ${S.BLIND.map((n) => `${n} ${pct(r.blind[n].p)}→${pct(r.blind[n].pass)}`).join(' | ')}`);
    console.log(`    S13 tệ (chính xác) ${e.S13max.name} ${pct(e.S13max.p)}→${pct(e.S13max.pass)} | S13 rand ${pct(e['S13-rand'].p)}→${pct(e['S13-rand'].pass)} | S3 ${pct(e.S3.p)}→${pct(e.S3.pass)} | S3∩S9 ${pct(e['S3∩S9'].p)}→${pct(e['S3∩S9'].pass)} | S2∩S9 ${pct(e['S2∩S9'].pass)} | S8∩S9 ${pct(e['S8∩S9'].pass)}`);
    console.log(`    khuôn ${r.tmplUsed} | cấu trúc ${r.structSeen} (~${r.structLP}) | xếp ${r.tries.toFixed(2)} | instFail ${pct(r.instFail)} | ${r.mode}`);
    return r;
  });
}
// OUT là file, hoặc thư mục (cùng quy ước với enum.cjs / table-x.cjs) → <OUT>/sym-table.json.
if (process.env.OUT) { const fs = require('fs'), o = process.env.OUT; fs.writeFileSync(fs.existsSync(o) && fs.statSync(o).isDirectory() ? require('path').join(o, 'sym-table.json') : o, JSON.stringify(out, (k, v) => (k === 'perForm' ? undefined : v), 1)); }
