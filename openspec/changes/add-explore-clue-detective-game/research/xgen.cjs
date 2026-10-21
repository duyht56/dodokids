'use strict';
// xgen.cjs — bộ sinh P1-X (thiết kế đang chọn): rút CẤU TRÚC từ danh mục hoán đổi được (design §9 qua
// catalog.cjs), đặt tên món, rút dạng thẻ, xáo nhà.
// Không còn vòng "xếp món đệm ≤ 40 lần": mọi cấu trúc trong danh mục đã đạt mọi kiểm với cả ba vai trò.
//
// Đặt tên (sửa 2026-10-21, kiểm độc lập sau P1-X; design §9 "Đặt tên đều"): rút ĐỀU một phép gán món cho mọi
// chỗ A, B, C, D, … (xáo pool 14, lấy đủ món; có cặp gần âm thì xáo lại phần đặt tên, trước khi dựng bàn).
// Bản trước dùng `nameBoard` của lib.cjs (rút tuần tự thẻ 1→3 rồi D, E, …, loại món gần âm NGAY khi chọn):
// chú cá / hộp quà hay rơi vào chỗ thẻ hơn chỗ đệm, nên cận Bayes "chỉ đọc thẻ có" vượt 1/3 (naming-bias.cjs).
// `naming = 'seq'` giữ cách cũ để tái lập phép đo đó; P1 và legacy vẫn dùng lib.cjs `nameBoard`.
const L = require('./lib.cjs');
const CATS = require('./catalog.cjs');

// Đều trên mọi phép gán hợp lệ (không có cặp trong L.NEAR): k món đầu của một hoán vị đều, loại cả bộ khi có cặp gần âm.
function nameUniform(nFill, nrng) {
  const k = 3 + nFill;
  for (let t = 0; t < 1000; t++) {
    const pick = nrng.shuffle([...Array(L.ITEMS.length).keys()]).slice(0, k);
    if (!L.hasNear(pick)) return { clue: pick.slice(0, 3), fill: pick.slice(3) };
  }
  throw new Error('nameUniform: 1000 lần xáo đều có cặp gần âm');
}

// houses (id cấu trúc) → id món thật
function sampleX(conf, form, rng, nrng, prng, which = 'CAT', naming = 'uniform') {
  const list = CATS[which][conf];
  const H = list[rng.int(list.length)];
  const fillIds = [...new Set(H.flat().filter((i) => i >= 3))].sort((a, b) => a - b);
  const names = naming === 'seq' ? L.nameBoard(fillIds.length, nrng) : nameUniform(fillIds.length, nrng);
  const map = (i) => (i < 3 ? names.clue[i] : names.fill[fillIds.indexOf(i)]);
  const houses = prng.shuffle(H.map((h) => prng.shuffle(h.map(map))));
  return { houses, cards: names.clue, form, p: form.indexOf('P'), struct: H };
}
module.exports = { sampleX, nameUniform };
