'use strict';
// sym-catalog.cjs — liệt kê MỌI khuôn đối xứng dấu K ∈ {7..10}, m ∈ {2,3}; kiểm R1–R5, tầng 1 (R6/R6b
// mọi vai trò), R6 bậc 1–4 (S1 mọi thẻ, S3 ≤ 1/3); đo từng khuôn (dạng PNN/NPN/NNP ×2).
// node sym-catalog.cjs [rounds=400]   (RC=1: thêm khuôn đóng vai trò không đối xứng ở m = 3)
// Dò cả khuôn không xếp được món đệm (vd 7×2), nên đặt `lenient` (sym.cjs sampleSym giữ hành vi cũ).
const L = require('./lib.cjs');
const G = require('./gen.cjs');
const S = require('./sym.cjs');
const { analyze, pct } = require('./symrun.cjs');
const R = +(process.argv[2] || 400);
const O3 = [['PNN', 2], ['NPN', 2], ['NNP', 2]];

console.log('Khuôn đối xứng: K = a + 3 + 3c + d (a = số nhà 000, c = số bản mỗi chữ ký 2 món, d = số nhà 111).');
for (const m of [2, 3]) for (const K of [7, 8, 9, 10]) {
  // mọi (a,c,d) đối xứng về số học, kể cả cái bị R4/R5 loại
  const cand = [];
  for (let c = 1; 3 + 3 * c < K; c++) for (let d = 0; d <= K; d++) { const a = K - 3 - 3 * c - d; if (a >= 1) cand.push([a, 1, 1, c, 1, c, c, d]); }
  const ok = S.rcTemplates(K, m).filter((t) => t.sym);
  for (const counts of cand) {
    const name = S.symKey(counts);
    const t = ok.find((x) => x.key === S.tKey(S.expand(counts)));
    if (!t) {
      const why = (m < 3 && counts[7] > 0) ? 'nhà 111 cần m ≥ 3' : (m === 2 && counts[3] > 1) ? 'm = 2: các bản chữ ký 2 món trùng hệt (R4)' : (m === 3 && counts[7] > 1) ? 'nhiều nhà 111 trùng hệt (R4)' : 'không xếp được món đệm (R4/R5)';
      console.log(`${K}×${m} ${name}: LOẠI — ${why}`);
      continue;
    }
    const level = { K, m, recipe: O3, rows: [[counts, 1]], lenient: true };
    const sets = G.strategySets(level);
    const t1 = S.tier1(t, sets, ['PNN', 'NPN', 'NNP']);
    const r6 = ['PNN', 'NPN', 'NNP'].every((f) => G.maxOver(t.pv[f], sets.Uind) <= 1 / 3 + 1e-9);
    const badNN = sets.NNsig.filter((i) => ['PNN', 'NPN', 'NNP'].some((f) => t.pv[f][i] > 1 / 3 + 1e-9)).map((i) => `${L.NAMES[i]}=${t.pv.PNN[i].toFixed(2)}`);
    const r = analyze(level, 'SYM', 5000 + K * 10 + m, R);
    const e = r.exact;
    console.log(`${K}×${m} ${name} hình=${K * m + 3} | tầng1 ${t1 ? 'ĐẠT' : 'TRƯỢT ' + [...new Set(badNN)].slice(0, 4).join(' ')} | R6 b1–4 ${r6 ? 'đạt' : 'trượt'} | đoán ${pct(r.guess.pass)} | NN tệ ${r.worstNN.name} ${pct(r.worstNN.p)}→${pct(r.worstNN.pass)} | mù dấu tệ (trừ vị trí) ${r.blindWorstNoPos.name} ${pct(r.blindWorstNoPos.p)}→${pct(r.blindWorstNoPos.pass)} | Bayes mù ${pct(r.bayes.p)} | S13 tệ ${e.S13max.name} ${pct(e.S13max.p)}→${pct(e.S13max.pass)} | S13 rand ${pct(e['S13-rand'].p)}→${pct(e['S13-rand'].pass)} | S3 ${pct(e.S3.p)}→${pct(e.S3.pass)} | S3∩S9 ${pct(e['S3∩S9'].p)}→${pct(e['S3∩S9'].pass)} | vai trò ok ${pct(r.roleOK)} | cấu trúc ${r.structSeen} (~${r.structLP}) | xếp ${r.tries.toFixed(2)} instFail ${pct(r.instFail)}`);
  }
}
if (process.env.RC) {
  console.log('\nKhuôn ĐÓNG VAI TRÒ không đối xứng (m = 3; cùng trọng số ba dạng):');
  for (const K of [8, 9, 10]) for (const t of S.rcTemplates(K, 3).filter((x) => !x.sym)) {
    const level = { K, m: 3, recipe: O3, rows: [[t.counts, 1]], lenient: true };
    const sets = G.strategySets(level);
    if (!S.tier1(t, sets, ['PNN', 'NPN', 'NNP'])) continue;
    const r = analyze(level, 'SYM', 6000 + K, R);
    const e = r.exact;
    console.log(`${K}×3 ${t.name} | NN tệ ${r.worstNN.name} ${pct(r.worstNN.pass)} | mù dấu tệ ${r.blindWorstNoPos.name} ${pct(r.blindWorstNoPos.pass)} | S13 tệ ${e.S13max.name} ${pct(e.S13max.p)}→${pct(e.S13max.pass)} | S13 rand ${pct(e['S13-rand'].pass)} | S3 ${pct(e.S3.p)}→${pct(e.S3.pass)} | S3∩S9 ${pct(e['S3∩S9'].pass)}`);
  }
}
