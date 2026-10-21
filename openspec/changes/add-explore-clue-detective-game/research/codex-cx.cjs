'use strict';
// codex-cx.cjs — tái lập phản ví dụ Codex vòng 7 (8×2): thẻ có A, không B, không C; nhà AD, EF, FD, BE, AB,
// CE, AC, BC. Với từng vai trò (thẻ "có" = A, B, C): mẹo Codex vòng 7 (P|sumF.min), mẹo không phủ định tệ
// nhất của họ S16 (bỏ viết lại lời giải và Σ tần suất món đệm), quỹ đạo đáp án dưới Stab(món thẻ "có")
// (chặt = 3); rồi thư viện cũ S1–S15 trên ba dạng; cuối cùng R12 (có trong design §9 CLUE_STRUCTURES?).
const FAM = require('./fam.cjs');
const AU = require('./autom.cjs');
const L = require('./lib.cjs');
const S = require('./sym.cjs');
const D = require('./design-x.cjs');
const TAUT = require('./taut.json');
const [A, B, C, Dd, E, F] = [0, 1, 2, 3, 4, 5];
const houses = [[A, Dd], [E, F], [F, Dd], [B, E], [A, B], [C, E], [A, C], [B, C]];
const cards = [A, B, C];
const taut = new Set([...TAUT.all, ...TAUT.m2]);
const nm = 'ABCDEF';
for (const p of [0, 1, 2]) {
  const r = FAM.evalFamily(houses, cards, p);
  const top = [...r.out].filter(([k, v]) => v.cat === 'NN' && !taut.has(k) && !k.includes('fillSum')).sort((a, b) => b[1].p - a[1].p);
  const orb = AU.houseOrbit(houses, r.ans, [cards[p]]);
  console.log(`vai trò thẻ có = ${nm[cards[p]]}: đáp án ${houses[r.ans].map((i) => nm[i]).join('')} | mẹo Codex vòng 7 P|sumF.min = ${r.out.get('P|sumF.min').p.toFixed(3)} | S16 không phủ định tệ nhất ${top[0][1].p.toFixed(3)} (${top.slice(0, 4).map(([k]) => k).join(', ')}) | quỹ đạo đáp án ${orb.size}/3`);
}
const sigs = houses.map((h) => cards.reduce((a, c, j) => a | (h.includes(c) ? 1 << j : 0), 0));
const fillers = [Dd, E, F];
const fill = houses.map((h) => h.filter((i) => !cards.includes(i)).map((i) => fillers.indexOf(i)));
const pv = S.pvAll(sigs, fill);
for (const f of S.FORMS) console.log(`thư viện cũ ${f}: không phủ định tệ nhất ${Math.max(...S.SETS_ALL.NNall.map((i) => pv[f][i])).toFixed(3)}; S2∩S11 = ${pv[f][L.IDX['S2∩S11']].toFixed(3)}`);
const key = D.structKey(houses);
const { levels } = D.readDesign();
const inCat = levels.filter((lv) => lv.structs.some((s) => s.key === key)).map((lv) => lv.level);
console.log(`R12: ${inCat.length ? 'có trong CLUE_STRUCTURES bậc ' + inCat.join(', ') : 'KHÔNG có trong CLUE_STRUCTURES ở bậc nào → validator loại'}`);
