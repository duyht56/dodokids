'use strict';
// Chiến lược "viết lại lời giải" của họ mở rộng: p = 1 trên MỌI bàn tham chiếu (mọi khuôn hợp lệ K 6–9,
// m 2–3, dạng PNN, món đệm ngẫu nhiên) — cùng định nghĩa design §9 (vét theo khuôn). Ghi taut.json (check.cjs đọc).
const FAM = require('./fam.cjs');
const P = require('./p1gen.cjs');
const ref = P.refBoards(+(process.argv[2] || 3));
let taut = null; const byM = { 2: null, 3: null };
for (const b of ref) {
  const r = FAM.evalFamily(b.houses, b.cards, b.p);
  const ones = new Set([...r.out].filter(([, v]) => v.p === 1).map(([k]) => k));
  taut = taut ? new Set([...taut].filter((k) => ones.has(k))) : ones;
  const m = b.houses[0].length; byM[m] = byM[m] ? new Set([...byM[m]].filter((k) => ones.has(k))) : ones;
}
const fs = require('fs');
fs.writeFileSync(__dirname + '/taut.json', JSON.stringify({ all: [...taut], m2: [...byM[2]], m3: [...byM[3]] }, null, 1));
console.log(`bàn tham chiếu ${ref.length}; viết lại lời giải (mọi m): ${taut.size}: ${[...taut].join(' ')}`);
console.log(`chỉ ở m=2 thêm: ${[...byM[2]].filter((k) => !taut.has(k)).join(' ')}`);
console.log(`chỉ ở m=3 thêm: ${[...byM[3]].filter((k) => !taut.has(k)).join(' ')}`);
