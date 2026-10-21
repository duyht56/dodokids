'use strict';
// Bảng lai đề xuất: mỗi bậc đổi đúng một thứ bé thấy; không dạng 2 thẻ, không dạng PPN.
const O3 = ['PNN', 'NPN', 'NNP'];
const rec = (forms) => forms.map((f) => [f, 6 / forms.length]);
const lv = (K, m, forms, note, extra = {}) => ({ K, m, recipe: rec(forms), note, ...extra });
module.exports = {
  'T-Lai': [
    lv(7, 2, ['PNN'], 'PNN, P đầu, làm mẫu + đèn soi'),
    lv(7, 2, ['PNN'], 'bỏ đèn soi'),
    lv(7, 2, O3, 'đổi thứ tự thẻ'),
    lv(7, 3, O3, 'nhà 3 món'),
    lv(9, 3, O3, '9 nhà (cổng trộn khuôn)', { gate: true }),
    lv(9, 3, O3, '9 nhà, úp thẻ', { gate: true }),
  ],
};
