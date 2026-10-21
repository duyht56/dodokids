'use strict';
// exact-x.cjs — số CHÍNH XÁC của thiết kế đang chọn P1-X: trung bình đều trên danh mục cấu trúc × dạng thẻ
// của bậc (không lấy mẫu; tên món không đổi số đo nào trừ R9, đã kiểm ở table-x.cjs). Bảng bậc (design §5)
// và danh mục `CLUE_STRUCTURES` (design §9) đọc THẲNG từ design.md (design-x.cjs qua catalog.cjs).
//   node exact-x.cjs                  bảng tóm tắt + bảng đầy đủ design §10
//   CATSET=CAT5 node exact-x.cjs      phương án P1-X′ (R5′, catalog.cjs), chỉ bảng tóm tắt
// Mô hình: mỗi bài rút cấu trúc đều trong danh mục bậc và (từ bậc 3) dạng thẻ đều, độc lập ⇒ mỗi bài đúng
// với xác suất E[p] như nhau ⇒ qua = 1 − (1 − P(Bin(6, E[p]) ≥ 4))².
// Thư viện: S1–S15 (lib.cjs, kể cả 198 phép giao), họ "lọc rồi xếp hạng" S16 (fam.cjs; bỏ viết lại lời
// giải taut.json và Σ tần suất món đệm), thư viện mù dấu (sym.cjs), cận Bayes "chỉ đọc thẻ có" (chặt ⇒
// 1/(số nhà có món thẻ "có") trên từng bàn) và cận Bayes mù dấu (dạng rút độc lập với cấu trúc).
const L = require('./lib.cjs');
const S = require('./sym.cjs');
const FAM = require('./fam.cjs');
const C = require('./check.cjs');
const AU = require('./autom.cjs');
const CATS = require('./catalog.cjs');
const WHICH = process.env.CATSET || 'CAT';
const TAUT = require('./taut.json');
const LV = WHICH === 'CAT' ? CATS.LEVELS : CATS.LEVELS5;
const T13 = 1 / 3 + 1e-9;
const pct = (x) => (x * 100).toFixed(1).replace('.', ',') + '%';
const cell = (p) => `${pct(p)} → ${pct(L.passConst(p))}`;
const rows = [];
for (const [confs, forms, name] of LV) {
  const conf = confs.join('+'), m = CATS[WHICH][confs[0]][0][0].length, K = CATS[WHICH][confs[0]][0].length;
  const taut = new Set([...TAUT.all, ...(m === 2 ? TAUT.m2 : TAUT.m3)]);
  const acc = new Map(); const add = (k, v) => acc.set(k, (acc.get(k) || 0) + v);
  const keys = new Set(); let bad = false, bp = 0, catOK = true;
  const vis = new Map(); // cận Bayes mù dấu: góc nhìn = cấu trúc (+ dạng nếu dạng cố định)
  const seq = new Set(); let r8min = Infinity, r8max = 0, forb = 0, miss = 0, multi = 0, nDis = 0, s13thm = true;
  confs.forEach((cf) => CATS[WHICH][cf].forEach((H, si) => {
    // kiểm danh mục: R1–R11 (ba vai trò), thư viện S1–S15, họ S16 ≤ 1/3 (trừ Σ món đệm), chặt
    const ck = C.checkBoard(H, [0, 1, 2], m, { strict: true, r5o: WHICH !== 'CAT' });
    if (!ck.ok || !ck.famOK || ck.roles.some((r) => r.orbit < H.filter((h) => h.includes(r.form.indexOf('P'))).length)) catOK = false;
    for (const form of forms) {
      const w = 1 / (confs.length * CATS[WHICH][cf].length * forms.length);
      const p = form.indexOf('P'), cards = [0, 1, 2];
      const lib = C.oldLib(H, cards, form);
      const fam = FAM.evalFamily(H, cards, p);
      for (const [k, v] of fam.out) if (!taut.has(k) && !k.includes('fillSum')) add(v.cat + ':' + k, w * v.p);
      for (const i of S.SETS_ALL.NNall) add('NN:old:' + L.NAMES[i], w * lib.pv[i]);
      for (let i = 0; i < L.NAMES.length; i++) add('LIB:' + L.NAMES[i], w * lib.pv[i]);
      const order = [lib.ans, ...H.map((_, h) => h).filter((h) => h !== lib.ans)];
      const bl = S.blindEval(order.map((h) => lib.sigs[h]), L.formInfo(form).A, order.map((h) => lib.fill[h]));
      for (const nB of S.BLIND) add('B:' + nB, w * bl[nB]);
      keys.add(L.canonKey(form, order.map((h) => lib.sigs[h]), order.map((h) => lib.fill[h])));
      { const o = AU.houseOrbit(H, fam.ans, [p]).size; const nP = H.filter((h) => h.includes(p)).length; if (o < nP) bad = true; bp += w / nP; }
      { const k = cf + '#' + si + '|' + (forms.length === 1 ? form : '*'); const mm = vis.get(k) || {}; mm[form] = (mm[form] || 0) + w; vis.set(k, mm); }
      if (lib.pv[L.IDX['S13-N1']] !== 0.5 || lib.pv[L.IDX['S13-N2']] !== 0.5) s13thm = false;
      // R7 / R8 / loại vi phạm đầu tiên của nhà nhiễu
      const ok = (h, j) => H[h].includes(j) === (form[j] === 'P');
      let open = H.map((_, h) => h); const closed = [];
      for (let j = 0; j < 3; j++) { const nx = open.filter((h) => ok(h, j)); closed.push(open.length - nx.length); open = nx; if (j === 0) { r8min = Math.min(r8min, nx.length); r8max = Math.max(r8max, nx.length); } }
      seq.add(`${form} ${K} nhà: ${closed.join('/')}`);
      for (let h = 0; h < K; h++) {
        if (h === lib.ans) continue;
        const v = [0, 1, 2].filter((j) => !ok(h, j));
        if (form[v[0]] === 'P') miss += w; else forb += w;
        if (v.length > 1) multi += w;
        nDis += w;
      }
    }
  }));
  const worst = (pre, ex = () => false) => { let b = { p: -1 }; for (const [k, v] of acc) if (k.startsWith(pre) && !ex(k) && v > b.p + 1e-12) b = { p: v, k: k.slice(pre.length) }; return b; };
  const g = (n) => acc.get('LIB:' + n);
  const nn = worst('NN:'), famNN = worst('NN:', (k) => k.startsWith('NN:old:')), famBlind = worst('NN:', (k) => k.startsWith('NN:old:') || k.includes('fill'));
  const oldNN = worst('NN:old:'), part = worst('PART:');
  const blindNoPos = worst('B:', (k) => k.includes('B-pos')), blindAll = worst('B:');
  const S13 = worst('LIB:S13-', (k) => k === 'LIB:S13-rand');
  const S1 = worst('LIB:S1', (k) => !L.S1L.includes(k.slice(4)));
  const bayesBlind = [...vis.values()].reduce((a, mm) => a + Math.max(...Object.values(mm)), 0);
  const nList = confs.map((cf) => CATS[WHICH][cf].length).join('+');
  rows.push({ name, conf, nList, K, m, forms, guess: 1 / K, nn, famNN, famBlind, oldNN, part, blindNoPos, blindAll, bayesBlind, bayesP: bad ? null : bp, S13, S1, g, acc, structs: keys.size, codex: acc.get('NN:P|sumF.min'), catOK, R7: [...seq], R8: [r8min, r8max], forb: forb / nDis, miss: miss / nDis, multi: multi / nDis, s13thm });
}
const formTxt = (r) => (r.forms.length > 1 ? 'PNN/NPN/NNP độc lập' : 'PNN');
console.log(`P1-X${WHICH === 'CAT' ? ' (design §5 + §9 CLUE_STRUCTURES)' : '′ (R5′, catalog.cjs CAT5)'} — số chính xác. Ô = đúng mỗi bài → qua bậc (luật 6/4/1).`);
console.log('');
console.log('| Bậc | Cấu hình | Hình | Danh mục (cấu trúc) | Đoán bừa | Không phủ định tệ nhất (S1–S15 + S16) | Cận Bayes chỉ đọc thẻ có | Mù dấu trừ vị trí / kể cả | S13 tệ / ngẫu nhiên | S3 | S3∩S9 |');
console.log('|---|---|---|---|---|---|---|---|---|---|---|');
rows.forEach((r, i) => console.log(`| ${i + 1} | ${r.K}×${r.m} ${r.conf.includes('+') ? '(3,1,0)+(2,1,1) ' : ''}${formTxt(r)} | ${r.K * r.m + 3} | ${r.nList} (${r.structs}) | ${pct(L.passConst(r.guess))} | ${pct(L.passConst(r.nn.p))} | ${r.bayesP === null ? 'KHÔNG CHẶT' : pct(L.passConst(r.bayesP))} | ${pct(L.passConst(r.blindNoPos.p))} / ${pct(L.passConst(r.blindAll.p))} | ${pct(L.passConst(r.S13.p))} / ${pct(L.passConst(r.g('S13-rand')))} | ${pct(L.passConst(r.g('S3')))} | ${pct(L.passConst(r.g('S3∩S9')))} |`));
if (WHICH === 'CAT') {
  const row = (label, f) => console.log(`| ${label} | ${rows.map(f).join(' | ')} |`);
  console.log('');
  console.log(`| Chiến lược (chính xác) | ${rows.map((r, i) => `B${i + 1} ${r.K}×${r.m}`).join(' | ')} |`);
  console.log(`|---|${rows.map(() => '---').join('|')}|`);
  row('Dạng thẻ', (r) => (r.forms.length > 1 ? 'PNN/NPN/NNP rút độc lập' : 'PNN'));
  row('Đoán bừa / S12 một ô cố định', (r) => cell(r.guess));
  row('S1 một thẻ tốt nhất (mọi thẻ)', (r) => cell(r.S1.p));
  row('S2 bỏ hết thẻ "không có"', (r) => cell(r.g('S2')));
  row('S4 coi "không có" là "có" / S5 đảo dấu', (r) => `${cell(r.g('S4'))} / ${cell(r.g('S5'))}`);
  row('S6 / S7 nhiều / ít món-thẻ nhất', (r) => `${cell(r.g('S6'))} / ${cell(r.g('S7'))}`);
  row('S8 đúng 1 món-thẻ', (r) => cell(r.g('S8')));
  row('S9 nhà lẻ tổ hợp', (r) => cell(r.g('S9')));
  row('S10 món độc nhất / S11 ít trùng nhất', (r) => `${cell(r.g('S10'))} / ${cell(r.g('S11'))}`);
  row('S8∩S9 (mẹo Codex vòng 5) / S15 = S2∩S9', (r) => `${cell(r.g('S8∩S9'))} / ${cell(r.g('S2∩S9'))}`);
  row('Không phủ định tệ nhất, S1–S15 (đơn + 198 phép giao)', (r) => cell(r.oldNN.p));
  row('Mẹo Codex vòng 7 (có A, tổng tần suất nhỏ nhất)', (r) => cell(r.codex));
  row('**S16 không phủ định tệ nhất (595)**', (r) => `**${cell(r.famNN.p)}**`);
  row('S16 không phủ định, không dùng thống kê món đệm', (r) => cell(r.famBlind.p));
  row('**Cận Bayes "chỉ đọc thẻ có"**', (r) => `**${r.bayesP === null ? 'KHÔNG CHẶT' : cell(r.bayesP)}**`);
  row('S3 bỏ hết thẻ "có" (phủ định)', (r) => cell(r.g('S3')));
  row('**S13 quên 1 thẻ, tệ nhất**', (r) => `**${cell(r.S13.p)}**`);
  row('S13 quên 1 thẻ ngẫu nhiên', (r) => cell(r.g('S13-rand')));
  row('**S3∩S9 (suy luận một phần tệ nhất)**', (r) => `**${cell(r.g('S3∩S9'))}**`);
  row('S16 có phủ định tệ nhất (350)', (r) => cell(r.part.p));
  row('Mù dấu (i) mẹo Codex vòng 6', (r) => cell(r.acc.get('B:B-codex')));
  row('Mù dấu (ii) món-thẻ ở nhiều nhà nhất / (iii) đồng xuất hiện', (r) => `${cell(r.acc.get('B:B-freq'))} / ${cell(r.acc.get('B:B-cooc'))}`);
  row('Mù dấu (iv) thẻ "có" ở vị trí 1', (r) => cell(r.acc.get('B:B-pos1')));
  row('Mù dấu (v) đổi vai trò, biết luật bộ sinh', (r) => cell(r.acc.get('B:B-rule')));
  row('**Mù dấu tệ nhất trừ vị trí / kể cả vị trí**', (r) => `**${cell(r.blindNoPos.p)} / ${cell(r.blindAll.p)}**`);
  row('**Cận Bayes mọi mẹo mù dấu**', (r) => `**${cell(r.bayesBlind)}**`);
  row('Danh mục: R1–R11 ba vai trò, S16 ≤ 1/3, chặt (R12)', (r) => (r.catOK ? 'đạt' : 'TRƯỢT'));
  row('Danh mục / cấu trúc (tính cả dạng thẻ)', (r) => `${r.nList} / ${r.structs}`);
  console.log('');
  console.log('Tên chiến lược tệ nhất: S16 không phủ định ' + rows.map((r, i) => `B${i + 1} ${r.famNN.k}`).join(' · '));
  console.log('                        S16 có phủ định   ' + rows.map((r, i) => `B${i + 1} ${r.part.k}`).join(' · '));
  console.log(`Định lý S13 (quên thẻ "không có" = 1/2 trên mọi cấu trúc × dạng): ${rows.every((r) => r.s13thm) ? 'đúng' : 'SAI'}`);
  console.log('R8 còn mở sau thẻ 1 (min–max): ' + rows.map((r, i) => `B${i + 1} ${r.R8[0]}–${r.R8[1]}`).join(' · '));
  console.log('Nhà nhiễu: vi phạm đầu "cấm" / "thiếu"; vi phạm > 1 thẻ: ' + rows.map((r, i) => `B${i + 1} ${Math.round(r.forb * 100)}/${Math.round(r.miss * 100)}, ${Math.round(r.multi * 100)}%`).join(' · '));
  const seen = new Set(); const r7 = [];
  rows.forEach((r) => r.R7.forEach((s) => { if (!seen.has(s)) { seen.add(s); r7.push(s); } }));
  console.log('R7 khép theo thứ tự đọc (thẻ 1/2/3): ' + r7.join(' · '));
}
const fail = rows.filter((r) => !r.catOK || r.bayesP === null || r.bayesP > T13 || r.nn.p > T13 || (r.forms.length > 1 && r.bayesBlind > T13) || r.blindNoPos.p > T13 || !r.s13thm);
console.log(fail.length ? `KIỂM: TRƯỢT ở ${fail.map((r) => r.name).join(', ')}` : 'KIỂM: mọi cấu trúc của danh mục đạt R1–R12 với cả ba vai trò; mọi bậc: không phủ định (S1–S15 + S16) ≤ 1/3, cận Bayes chỉ đọc thẻ có = 1/(số nhà có món thẻ "có") ≤ 1/3, mù dấu trừ vị trí ≤ 1/3, định lý S13 đúng; bậc rút dạng độc lập có cận Bayes mù dấu = 1/3.');
