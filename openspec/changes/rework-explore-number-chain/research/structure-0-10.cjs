// Phân tích cấu trúc: với điều kiện thẻ ngược dấu bắt buộc ở ô 1 và (tuỳ chọn) ô 2,
// "đếm k rồi chọn thẻ gần giữa phạm vi" thắng bao nhiêu ở ô 1; ô 2 vắng thẻ ngược dấu bao nhiêu.
const apply = (v, op, k) => (op === 'add' ? v + k : v - k);
function run(min, max, ks, requireSecondMirror, label) {
  const c = (min + max) / 2;
  let n = 0, toward = 0, absent2 = 0, sbCenter2 = 0;
  for (const mode of ['forward', 'reverse'])
  for (let s = min; s <= max; s++) for (const o1 of ['add', 'sub']) for (const k1 of ks) {
    const m = apply(s, o1, k1); if (m < min || m > max) continue;
    for (const o2 of ['add', 'sub']) for (const k2 of ks) {
      const r = apply(m, o2, k2); if (r < min || r > max || r === s) continue;
      const x1 = mode === 'reverse' ? r : s, a1 = m, m1 = 2 * x1 - a1;
      const known = x1;
      const second = mode === 'reverse' ? s : r;
      if (m1 < min || m1 > max || m1 === second) continue;           // ô 1: thẻ ngược dấu bắt buộc
      const x2 = m, a2 = second, m2 = 2 * x2 - a2;
      const m2ok = m2 >= min && m2 <= max && m2 !== known;
      if (requireSecondMirror && !m2ok) continue;
      n++;
      const d = (v) => Math.abs(v - c);
      toward += d(a1) < d(m1) ? 1 : d(a1) === d(m1) ? 0.5 : 0;
      if (!m2ok) absent2++;
      sbCenter2 += !m2ok ? 1 : d(a2) < d(m2) ? 1 : d(a2) === d(m2) ? 0.5 : 0;
    }
  }
  const p = (x) => (100 * x / n).toFixed(1) + '%';
  console.log(`${label}: chains ${n}, ô1 "đếm k + gần giữa" ${p(toward)}, ô2 vắng thẻ ngược dấu ${p(absent2)}, ô2 "đếm k + gần giữa" ${p(sbCenter2)}`);
}
run(0, 10, [2, 3, 4], true, '0–10 k2–4, thẻ ngược dấu cả 2 ô (hiện tại)');
run(0, 10, [2, 3, 4], false, '0–10 k2–4, ô 2 cho vắng khi ra ngoài phạm vi');
run(0, 20, [2, 3, 4], true, '0–20 k2–4 (bậc 5)');
run(0, 10, [1, 2, 3, 4], true, '0–10 k1–4 (nếu có ±1)');
run(0, 15, [2, 3, 4], true, '0–15 k2–4');

// --- Chỉ chọn lại trọng số chuỗi (không đổi phạm vi/máy) có gỡ được không?

const min = 0, max = 10, c = 5, ks = [2, 3, 4];
for (const mode of ['forward', 'reverse']) {
  let n = 0, toward = 0, tie = 0, away = 0; const awayList = [];
  for (let s = min; s <= max; s++) for (const o1 of ['add', 'sub']) for (const k1 of ks) {
    const m = apply(s, o1, k1); if (m < min || m > max) continue;
    for (const o2 of ['add', 'sub']) for (const k2 of ks) {
      const r = apply(m, o2, k2); if (r < min || r > max || r === s) continue;
      const x1 = mode === 'reverse' ? r : s, a1 = m, m1 = 2 * x1 - a1;
      const second = mode === 'reverse' ? s : r, known = x1;
      if (m1 < min || m1 > max || m1 === second) continue;
      const x2 = m, a2 = second, m2 = 2 * x2 - a2;
      if (!(m2 >= min && m2 <= max && m2 !== known)) continue;
      n++;
      const d = (v) => Math.abs(v - c);
      if (d(a1) < d(m1)) toward++; else if (d(a1) === d(m1)) tie++; else { away++; awayList.push(`${s}${o1==='add'?'+':'-'}${k1}=${m}${o2==='add'?'+':'-'}${k2}=${r}`); }
    }
  }
  console.log(`${mode}: chains ${n}, answer nearer 5: ${toward}, tie: ${tie}, mirror nearer 5: ${away}`);
  console.log('  away:', awayList.join('  '));
}
