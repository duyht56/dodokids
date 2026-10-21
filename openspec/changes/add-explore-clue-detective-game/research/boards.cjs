'use strict';
// boards.cjs — bàn mẫu cụ thể (pool 14 thật, R9) cho P1/P2 (bản trước Codex vòng 7; bàn mẫu P1-X: boards-x.cjs)
// + kiểm qua toàn bộ thư viện (kể cả mù dấu).
// node boards.cjs [seed=1]
const L = require('./lib.cjs');
const G = require('./gen.cjs');
const S = require('./sym.cjs');
const seed0 = +(process.argv[2] || 1);
const c = (a, cc, d) => [a, 1, 1, cc, 1, cc, cc, d];
const PNN6 = [['PNN', 6]], O3 = [['PNN', 2], ['NPN', 2], ['NNP', 2]];

function show(title, level, kind, form, seed) {
  const rng = L.makeRng(seed), nrng = L.makeRng(seed + 99), prng = L.makeRng(seed * 31 + 7);
  let z;
  if (kind === 'M') { const g = G.buildGenerator(level, 'M', 1000); z = G.samplePuzzle(g, form, level.m, rng); z = { sigs: z.tmpl.sigs, fill: z.fill, pv: z.pv }; }
  else { const g = S.buildSym(level, 7); z = S.sampleSym(g, form, level.m, rng); }
  const fillIds = [...new Set(z.fill.flat())].sort((a, b) => a - b);
  const names = L.nameBoard(fillIds.length, nrng);
  const nm = (i) => `${L.EMOJI[i]} ${L.ITEMS[i]}`;
  const clueItem = names.clue, fillItem = (x) => names.fill[fillIds.indexOf(x)];
  const fi = L.formInfo(form), K = z.sigs.length;
  // vị trí trên màn: đáp án ô rút đều, nhà khác xáo
  const order = prng.shuffle([...Array(K).keys()]);
  const houses = z.sigs.map((s, h) => ({ h, sig: s, items: [...[0, 1, 2].filter((j) => (s >> j) & 1).map((j) => clueItem[j]), ...z.fill[h].map(fillItem)] }));
  console.log(`\n### ${title} — ${level.K}×${level.m}, dạng ${form}`);
  console.log('Thẻ: ' + [...form].map((s, j) => `${j + 1}. ${s === 'P' ? 'CÓ' : 'KHÔNG CÓ'} ${nm(clueItem[j])}`).join(' · '));
  order.forEach((h, pos) => { const x = houses[h]; console.log(`  ô ${pos + 1}: ${prng.shuffle(x.items).map(nm).join(' + ')}   [${S.bits(x.sig)}]${h === 0 ? ' ★' : ''}`); });
  // kiểm độc lập R1–R5, R9 trên tên
  const sat = (x, js) => js.every((j) => x.items.includes(clueItem[j]) === (form[j] === 'P'));
  const all = [0, 1, 2];
  const sol = houses.filter((x) => sat(x, all));
  const errs = [];
  if (sol.length !== 1 || sol[0].h !== 0) errs.push('R1');
  const drops = all.map((j) => houses.filter((x) => sat(x, all.filter((k) => k !== j))).length);
  if (drops.some((n) => n < 2)) errs.push('R2');
  for (const j of all) { const n = houses.filter((x) => x.items.includes(clueItem[j])).length; if (n < 1 || n > K - 1) errs.push('R3'); }
  if (houses.some((x) => x.items.length !== level.m || new Set(x.items).size !== level.m)) errs.push('R4m');
  if (new Set(houses.map((x) => x.items.slice().sort().join())).size !== K) errs.push('R4dup');
  const freq = {}; houses.forEach((x) => x.items.forEach((i) => (freq[i] = (freq[i] || 0) + 1)));
  if (Object.entries(freq).some(([i, n]) => !clueItem.includes(+i) && n < 2)) errs.push('R5');
  if (L.hasNear(Object.keys(freq).map(Number))) errs.push('R9');
  // R7: khép theo thứ tự đọc
  let open = houses.slice(); const closed = [];
  for (const j of all) { const nx = open.filter((x) => sat(x, [j])); closed.push(open.length - nx.length); open = nx; }
  // thư viện
  const sets = G.strategySets(level);
  const pv = z.pv;
  const worst = (idxs) => { let b = { p: -1 }; for (const i of idxs) if (pv[i] > b.p) b = { p: pv[i], name: L.NAMES[i] }; return b; };
  const nn = worst(sets.NNall), part = worst(sets.PART), s13 = worst(sets.S13);
  const b = S.blindEval(z.sigs, fi.A, z.fill);
  const bw = S.BLIND.filter((n) => !n.startsWith('B-pos')).reduce((a, n) => (b[n] > a.p ? { p: b[n], name: n } : a), { p: -1 });
  const roles = S.FORMS.map((f) => { const o = S.orient(f, z.sigs, z.fill); if (!o) return `${f}: không có nhà ${S.bits(L.formInfo(f).A)} duy nhất`; const pos = order.indexOf(o.order[0]) + 1; const dr = all.map((j) => houses.filter((x) => all.filter((k) => k !== j).every((k) => x.items.includes(clueItem[k]) === (f[k] === 'P'))).length); return `${f}→ô ${pos}${dr.some((n) => n < 2) ? ' (trượt R2)' : ''}`; });
  console.log(`  kiểm R1–R5, R9: ${errs.length ? 'LỖI ' + errs.join(',') : 'đạt'} | bỏ thẻ 1/2/3 còn ${drops.join('/')} nhà | khép ${closed.join('/')}`);
  console.log(`  không phủ định tệ nhất ${nn.name} ${nn.p.toFixed(3)} | S13 tệ ${s13.name} ${s13.p.toFixed(3)} | S3 ${pv[L.IDX.S3].toFixed(3)} | S3∩S9 ${pv[L.IDX['S3∩S9']].toFixed(3)} | phần phủ định tệ ${part.name} ${part.p.toFixed(3)}`);
  console.log(`  mù dấu: ${S.BLIND.map((n) => `${n}=${b[n].toFixed(2)}`).join(' ')} | tệ nhất (trừ vị trí) ${bw.name} ${bw.p.toFixed(3)}`);
  console.log(`  đổi vai trò (cùng bàn): ${roles.join(' · ')} | roleOK=${b.roleOK}`);
}

show('P1 (a) bậc 1', { K: 8, m: 2, recipe: PNN6, rows: [[c(2, 1, 0), 1]] }, 'SYM', 'PNN', seed0);
show('P2 (a) bậc 1 (khuôn M)', { K: 7, m: 2, recipe: PNN6 }, 'M', 'PNN', seed0 + 1);
show('(b) bậc 6, khuôn (3,1,0)', { K: 9, m: 3, recipe: O3, rows: [[c(3, 1, 0), 1]] }, 'SYM', 'NPN', seed0 + 2);
show('(b) bậc 6, khuôn (2,1,1)', { K: 9, m: 3, recipe: O3, rows: [[c(2, 1, 1), 1]] }, 'SYM', 'NPN', seed0 + 3);
show('T-Lai bậc 6 (khuôn M, để so)', { K: 9, m: 3, recipe: O3, gate: true }, 'M', 'NPN', seed0 + 4);
