// props:  type="text/x-dc" data-dc-script="" data-props="{"passenger":{"editor":"enum","options":["emoji","vector"],"default":"emoji","tsType":"'emoji'|'vector'","section":"Hành khách"},"species":{"editor":"enum","options":["","🐱","🐶","🐰","🐻","🐼","🐷"],"default":"","tsType":"string","section":"Hành khách"}}"

class Component extends DCLogic {
  renderVals() {
    const kind = this.props.passenger ?? 'emoji';
    const one = this.props.species;
    const B = (em, o) => ({ kind, em: one || em, ...o });
    const PH = { sw: '256px', sh: '541px', sc: 0.62 };
    const SIZE = { phone: PH, se: { sw: '275px', sh: '480px', sc: 0.7 }, ipad: { sw: '363px', sh: '514px', sc: 0.42 }, ipadL: { sw: '514px', sh: '363px', sc: 0.42 } };
    const fr = (no, label, t, a, v, f) => ({ no, label, t, a, v, hasA: !!a, f: { ...f, bus: f.bus }, ...SIZE[f.dev || 'phone'] });
    const MT = (w) => w;

    // B1 board_all
    const ba = o => B('🐰', { lv: 1, sign: 'blank', ...o });
    const baP = 'Bé mời từng bạn lên xe nhé!';
    const S2 = (l, r, o = {}) => [{ n: l, cap: 2, tint: 'low', lit: o.l, hand: o.hl }, { n: r, cap: 1, tint: 'up', lit: o.r }];
    const g1 = { id: 'board_all', tag: 'B1', title: 'board_all · Bé mời từng bạn lên xe', meta: 'L1 · gộp · 2 và 1 · không thể sai', sub: 'Hai nhóm ở hai bến. Bến trái (cam) lên tầng dưới, bến phải (xanh) lên tầng trên. L1 không có numeral, không có thẻ; biển nóc chỉ hiện chấm khi đọc "được 3".', frames: [
      fr('01', 'Xe tới bến', '0 – 1200 ms', '"Xe buýt của Đô Đô tới rồi!"', 'Xe trượt vào từ phải (translateX 420→0, 700 ms). Hai bến đã có bạn. Chưa nhận chạm.', { prog: 1, prompt: baP, bus: ba({}), stops: S2(2, 1), fb: 'Xe buýt của Đô Đô tới rồi!' }),
      fr('02', 'Đô Đô chỉ bến 1', '1200 – 2600 ms', '"Bé mời từng bạn lên xe nhé!" → "một, hai"', 'Bến trái sáng lên. Mỗi tiếng đếm ↔ một bạn nhún nhẹ (scale 1→1.08, 160 ms).', { prog: 1, prompt: baP, bus: ba({}), stops: S2(2, 1, { l: true }), fb: 'Bé mời từng bạn lên xe nhé!', dodo: 'think' }),
      fr('03', 'Đô Đô chỉ bến 2', '2600 – 3400 ms', '"một"', 'Bến trái tắt, bến phải sáng. Bạn duy nhất nhún.', { prog: 1, prompt: baP, bus: ba({}), stops: S2(2, 1, { r: true }), fb: 'Bé mời từng bạn lên xe nhé!', dodo: 'think' }),
      fr('04', 'Gợi ý lần đầu', '3400 – 5900 ms', '', 'Bàn tay mờ chạm lặp vào bạn đầu tiên ở bến trái. Chạm bất kỳ đâu → tay tắt 150 ms.', { prog: 1, prompt: baP, bus: ba({}), stops: S2(2, 1, { hl: true }), fb: 'Bé mời từng bạn lên xe nhé!' }),
      fr('05', 'Chạm bạn thứ nhất', 'chạm + 0 – 520 ms', '"một"', 'Bạn bay theo cung vào ghế đầu tầng dưới (520 ms). Bong bóng "1" bật lên khi chạm ghế.', { prog: 1, prompt: baP, bus: ba({ low: 1, bubLow: 1 }), stops: S2(1, 1), fb: 'Bé mời từng bạn lên xe nhé!' }),
      fr('06', 'Đủ khách', 'chạm thứ 3 + 520 ms', '"ba"', 'Bạn bến phải lên tầng trên. Bong bóng tiếp số 3, không đếm lại từ 1.', { prog: 1, prompt: baP, bus: ba({ low: 2, up: 1, bubLow: 2, bubUp: 1 }), stops: S2(0, 0), fb: 'Bé mời từng bạn lên xe nhé!' }),
      fr('07', 'Chạm lại bạn đã lên', 'chạm + 0 – 480 ms', '(tiếng cười khúc khích, không có số)', 'Bạn nhún vai cười (rotate ±6°, 480 ms). Không có bong bóng mới, số không nhảy.', { prog: 1, prompt: baP, bus: ba({ low: 2, up: 1, shrug: 0 }), stops: S2(0, 0), fb: 'Bé mời từng bạn lên xe nhé!' }),
      fr('08', 'Thần chú: "2"', '+400 ms từ lúc đủ khách', '"Gộp" (0) · "2" (400 ms)', 'Lời "2" ↔ tầng dưới viền đậm. Lời "và 1" (1100 ms) ↔ tầng trên. Tầng trước tắt khi tầng sau sáng.', { prog: 1, prompt: baP, bus: ba({ low: 2, up: 1, hl: 'low' }), mantra: [['Gộp'], ['2', 'low'], ['và'], ['1'], ['được'], ['3']] }),
      fr('09', 'Thần chú: "được 3"', '1900 – 2800 ms', '"được 3"', 'Cả xe sáng, biển nóc hiện 3 chấm (opacity 0→1, 240 ms). L1 vẫn không có numeral.', { prog: 1, prompt: baP, bus: ba({ low: 2, up: 1, hl: 'all', sign: 'dots', signN: 3 }), mantra: [['Gộp'], ['2', 'low'], ['và'], ['1', 'up'], ['được'], ['3', 'total']], dodo: 'cheer' }),
      fr('10', 'Xe chạy', '2800 – 3700 ms', '"Xe chạy nào, bíp bíp!"', 'Xe chạy ra phải (translateX 0→420, 900 ms, ease-in). Tự sang bài sau.', { prog: 1, prompt: baP, bus: ba({ low: 2, up: 1, sign: 'dots', signN: 3 }), drive: true, fb: 'Xe chạy nào, bíp bíp!', dodo: 'cheer' })
    ] };

    // B2 free_split
    const fs = o => B('🐶', { lv: 2, sign: 'dim', total: 5, ...o });
    const fsP = 'Bé chia các bạn lên hai tầng nha!';
    const g2 = { id: 'free_split', tag: 'B2', title: 'free_split · Bé chia các bạn lên hai tầng', meta: 'L2 · tách tự do · N = 5', sub: 'Chạm bạn tầng dưới → lên tầng trên; chạm bạn tầng trên → xuống lại. Sau mỗi lần di chuyển, các bạn trong tầng dồn về trái (200 ms) để luôn đọc được theo five-frame. Mọi cách chia đều đúng.', frames: [
      fr('01', 'Mở bài', '0 – 2500 ms', '"Bé chia các bạn lên hai tầng nha!" → "Chia kiểu nào cũng được đó bé!"', 'Cả 5 bạn ở tầng dưới. Bàn tay chỉ bạn cuối hàng. Nút Xong ở trạng thái chờ.', { prog: 2, prompt: fsP, bus: fs({ low: 5, handLow: 4 }), xong: 'dis', fb: 'Chia kiểu nào cũng được đó bé!' }),
      fr('02', 'Chạm → lên tầng trên', 'chạm + 0 – 420 ms', '(tiếng "hop")', 'Bạn nhảy thẳng lên ghế đầu tầng trên (420 ms). Không có bong bóng số: ở mode này bé không đếm để trả lời.', { prog: 2, prompt: fsP, bus: fs({ low: 4, up: 1 }), xong: 'on', fb: 'Chia kiểu nào cũng được đó bé!' }),
      fr('03', 'Đã chia 2 | 3', '—', '', 'Hai tầng đều có bạn → nút Xong bật (nền coral, 200 ms).', { prog: 2, prompt: fsP, bus: fs({ low: 2, up: 3 }), xong: 'on', fb: 'Chia kiểu nào cũng được đó bé!' }),
      fr('04', 'Xong → thần chú', '0 – 2400 ms', '"5" (0) · "gồm" · "2" (700 ms) · "và" · "3" (1500 ms)', '"5" ↔ biển nóc có vòng coral · "2" ↔ tầng dưới · "3" ↔ tầng trên · kết thúc cả xe sáng.', { prog: 2, prompt: fsP, bus: fs({ low: 2, up: 3, hl: 'all' }), mantra: [['5', 'total'], ['gồm'], ['2', 'low'], ['và'], ['3', 'up']], dodo: 'cheer' }),
      fr('05', 'Lượt 2: mời chia kiểu khác', '2400 – 4000 ms', '"Còn cách chia nào nữa nhỉ?"', 'Bảng giữ nguyên. Xe thu nhỏ thành thẻ "ảnh cách chia" bay vào góc phải (500 ms), xe thật vẫn đứng yên. Các bạn nhún lần lượt (mỗi bạn 120 ms) như sẵn sàng đổi chỗ. Xong chờ cho tới khi cách chia khác các ảnh đã có.', { prog: 2, prompt: fsP, bus: fs({ low: 2, up: 3 }), memo: [[2, 3]], xong: 'dis', fb: 'Còn cách chia nào nữa nhỉ?', dodo: 'think' }),
      fr('06', 'Cách chia mới 4 | 1', '—', '', 'Khác ảnh đã có → Xong bật. Nếu bé dựng lại đúng cách cũ, ảnh tương ứng nhún một cái, Xong vẫn chờ.', { prog: 2, prompt: fsP, bus: fs({ low: 4, up: 1 }), memo: [[2, 3]], xong: 'on', fb: 'Còn cách chia nào nữa nhỉ?' }),
      fr('07', 'Xong khi một tầng trống', 'chạm + 0 – 1600 ms', '"Tầng nào cũng cần có bạn nha!"', 'Không phạt: tầng trống viền xanh đậm 2 nhịp (opacity), bạn gần nhất ở tầng dưới nhún mời. Không có số trong câu nhắc.', { prog: 2, prompt: fsP, bus: fs({ low: 5, hl: 'up', handLow: 4 }), xong: 'on', fb: 'Tầng nào cũng cần có bạn nha!', bulb: true })
    ] };

    // B3 next_number
    const nn = o => B('🐻', { lv: 2, sign: 'num', low: 4, total: 4, ...o });
    const nnP = 'Số nào đứng sau số 4?';
    const C3 = (s) => [3, 6, 5].map(n => ({ n, st: s[n] || 'idle' }));
    const g3 = { id: 'next_number', tag: 'B3', title: 'next_number · Số nào đứng sau số 4?', meta: 'L2 · khởi động · 3 thẻ', sub: 'Xe đỗ với 4 bạn, biển nóc ghi 4. Đúng → một bạn mới lên xe và biển lật sang 5, để "đứng sau" có hình ảnh cụ thể.', frames: [
      fr('01', 'Câu hỏi', '0 – 1800 ms', '"Số nào đứng sau số 4?"', 'Biển nóc sáng vòng coral khi đọc "số 4". Thẻ hiện lần lượt (80 ms mỗi thẻ).', { prog: 1, prompt: nnP, bus: nn({ hl: 'sign' }), cards: C3({}), fb: 'Số nào đứng sau số 4?' }),
      fr('02', 'Nhấn thẻ', '0 – 90 ms', '', 'Thẻ lún 4pt, viền coral. Thả tay mới xử lý.', { prog: 1, prompt: nnP, bus: nn({}), cards: C3({ 5: 'pressed' }), fb: 'Số nào đứng sau số 4?' }),
      fr('03', 'Đúng', '0 – 1400 ms', '"5" → "Có tất cả 5 bạn nhé."', 'Thẻ xanh success. Một bạn bước vào ghế 5 (520 ms), biển lật 4→5 (scaleY 1→0→1, 300 ms).', { prog: 1, prompt: nnP, bus: nn({ low: 5, total: 5, bubLow: 5, bubFrom: 4, lowStart: 1 }), cards: C3({ 5: 'correct', 3: 'dim', 6: 'dim' }), fb: 'Có tất cả 5 bạn nhé.', dodo: 'cheer' }),
      fr('04', 'Chưa đúng (chọn 6)', '0 – 400 ms', '"Bé thử lại nhé."', 'Thẻ 6 lún xuống rồi bật về chỗ (lò xo 400 ms). Trợ giúp mức 1: biển nóc có vòng sáng 3 nhịp.', { prog: 1, prompt: nnP, bus: nn({ hl: 'sign' }), cards: C3({ 6: 'sink' }), fb: 'Bé thử lại nhé.', bulb: true }),
      fr('05', 'Trợ giúp mức 2', 'sau lần thứ 2', '"Bé thử lại nhé."', 'Làm mờ thẻ không thể đúng (3 đứng trước 4). Vẫn còn 2 thẻ để bé chọn.', { prog: 1, prompt: nnP, bus: nn({}), cards: C3({ 3: 'dim' }), fb: 'Bé thử lại nhé.', bulb: true })
    ] };

    // B4 missing_part
    const mp = o => B('🐱', { lv: 3, sign: 'num', total: 7, low: 4, upSil: true, cur: 'closed', ...o });
    const mpP = 'Mấy bạn đang trốn sau rèm nhỉ?';
    const g4 = { id: 'missing_part', tag: 'B4', title: 'missing_part · Mấy bạn đang trốn sau rèm?', meta: 'L3 · 7 gồm 4 và ? · 2×5 mỗi tầng · không thẻ', sub: 'Tầng dưới thấy 4 bạn (khoá). Tầng trên che rèm. Bến chờ luôn có đúng một bạn; chạm bến → bạn trốn sau rèm, chạm bóng mờ → bạn về bến. Phản hồi thừa/thiếu giống hệt nhau dù lệch 1 hay lệch 4.', frames: [
      fr('01', 'Mở bài', '0 – 3200 ms', '"Hôm nay mình chơi với số 7!" → "Có tất cả 7 bạn nhé." → "Mấy bạn đang trốn sau rèm nhỉ?"', 'Lời "7" ↔ biển nóc vòng coral. Bàn tay mờ chỉ bạn ở bến (sau 3200 ms, 2,5 s).', { prog: 3, prompt: mpP, bus: mp({ up: 0, hl: 'sign' }), station: { hand: true }, cta: 'on', fb: 'Có tất cả 7 bạn nhé.' }),
      fr('02', 'Bé thêm 2 bạn', 'mỗi chạm 480 ms', '(tiếng "vút" khi trốn vào rèm)', 'Bạn nhảy theo cung từ bến ra sau rèm, thành bóng mờ ở ghế trống đầu tiên. Bạn mới bước vào bến từ trái (300 ms, trễ 200 ms).', { prog: 3, prompt: mpP, bus: mp({ up: 2 }), station: {}, cta: 'on', fb: 'Có tất cả 7 bạn nhé.' }),
      fr('03', 'Tập tầm vông!', '0 – 900 ms', '"Tập tầm vông, tay không tay có!"', 'Rèm lay 4 nhịp (rotate ±1,4°, 170 ms mỗi nhịp) theo nhịp câu hát. Bến và nút tạm khoá.', { prog: 3, prompt: mpP, bus: mp({ up: 3, cur: 'sway' }), station: { dim: true }, cta: 'dis', fb: 'Tập tầm vông, tay không tay có!' }),
      fr('04', 'Đúng: mở rèm, đếm kiểm chứng', '900 – 5000 ms', '"một, hai… bảy" (450 ms mỗi tiếng)', 'Rèm kéo lên sát thanh ray (420 ms). Bóng mờ hiện màu. Bong bóng 1→4 ở tầng dưới rồi 5→7 ở tầng trên, đồng bộ với tiếng đếm.', { prog: 3, prompt: mpP, bus: mp({ up: 3, upSil: false, cur: 'open', bubLow: 4, bubUp: 3 }), station: { dim: true }, cta: 'dis', fb: 'Có tất cả 7 bạn nhé.', dodo: 'cheer' }),
      fr('05', 'Thần chú, đứng yên', '5000 – 7400 ms, rồi chờ', '"7" · "gồm" · "4" (800 ms) · "và" · "3" (1600 ms)', '"7" ↔ biển · "4" ↔ tầng dưới · "3" ↔ tầng trên. Màn đứng yên tới khi bé bấm mũi tên. Ghế trống còn lại để trung tính.', { prog: 3, prompt: mpP, bus: mp({ up: 3, upSil: false, cur: 'open', hl: 'all' }), next: true, mantra: [['7', 'total'], ['gồm'], ['4', 'low'], ['và'], ['3', 'up']], dodo: 'cheer' }),
      fr('06', 'Thiếu (bé thêm 2)', '900 – 2200 ms', '"Vẫn còn bạn đang trốn kìa, bé thêm bạn nhé."', 'Đúng MỘT cái đuôi ló ra dưới mép rèm (translateY 0→14, 300 ms, giữ 900 ms) rồi thụt vào. Rèm không mở. Các bạn giữ nguyên.', { prog: 3, prompt: mpP, bus: mp({ up: 2, tail: true }), station: {}, cta: 'on', fb: 'Vẫn còn bạn đang trốn kìa, bé thêm bạn nhé.' }),
      fr('07', 'Thừa (bé thêm 5)', '900 – 2000 ms', '"Có chỗ không ai trốn đâu, bé bớt bạn nhé."', 'Đúng MỘT bóng mờ (bạn thêm sau cùng) lắc lư ngơ ngác (rotate −10→10→−6→0°, 900 ms) rồi đứng yên. Chạm bóng mờ nào cũng đưa bạn đó về bến.', { prog: 3, prompt: mpP, bus: mp({ up: 5, wob: true }), station: {}, cta: 'on', fb: 'Có chỗ không ai trốn đâu, bé bớt bạn nhé.' }),
      fr('08', 'Trợ giúp 1 · sau lần thiếu', 'lặp 3 nhịp · 650 ms', '"Bé thử lại nhé."', 'Chỉ trỏ: bến có vòng teal nhấp nháy (scale 1↔1.06). Không đếm hộ.', { prog: 3, prompt: mpP, bus: mp({ up: 2 }), station: { hi: true }, cta: 'on', fb: 'Bé thử lại nhé.', bulb: true }),
      fr('09', 'Trợ giúp 1 · sau lần thừa', 'lặp 3 nhịp · 650 ms', '"Bé thử lại nhé."', 'Chỉ trỏ: rèm có viền xanh đậm nhấp nháy, gợi ý chạm vào bóng mờ.', { prog: 3, prompt: mpP, bus: mp({ up: 5, cur: 'blink' }), station: {}, cta: 'on', fb: 'Bé thử lại nhé.', bulb: true }),
      fr('10', 'Trợ giúp 2', 'sau lần thứ 2', '"Có tất cả 7 bạn nhé."', 'Biển tổng hiện 7 chấm mờ theo hàng 5 (opacity 0→.6, 400 ms). Không đánh dấu chấm nào ứng với bạn đang thấy, không có chấm trong rèm.', { prog: 3, prompt: mpP, bus: mp({ up: 2, signDots: true }), station: {}, cta: 'on', fb: 'Có tất cả 7 bạn nhé.', bulb: true }),
      fr('11', 'Tầng trên đầy', '—', '', 'Đủ 10 bóng mờ → bạn ở bến mờ 40%, chạm bến không phản hồi. Bé vẫn chạm bóng mờ để bớt được.', { prog: 3, prompt: mpP, bus: mp({ up: 10 }), station: { dim: true }, cta: 'on', fb: 'Có tất cả 7 bạn nhé.' })
    ] };

    // B5 count_on
    const co = o => B('🐼', { lv: 3, sign: 'blank', low: 5, door: 5, total: 7, ...o });
    const coP = 'Có tất cả mấy bạn trên xe?';
    const C5 = (s) => [8, 6, 7].map(n => ({ n, st: s[n] || 'idle', hand: s.hand === n }));
    const g5 = { id: 'count_on', tag: 'B5', title: 'count_on · Cửa đóng, đếm thêm', meta: 'L3 (thẻ hiện sau) · L4 (thẻ hiện ngay) · 5 và 2', sub: 'Cửa đóng che tầng dưới, trên cửa chỉ có numeral 5, cố ý không có chấm. Bạn mới lên tầng trên và được đếm tiếp từ 6. Biển nóc để trống cho tới khi bé chọn: tổng không bao giờ lộ trước.', frames: [
      fr('01', 'Mở bài', '0 – 2600 ms', '"Trong xe có 5 bạn rồi nha."', 'Lời "5" ↔ numeral trên cửa có vòng coral. Bàn tay chỉ bạn đầu ở bến.', { prog: 4, prompt: coP, bus: co({ hl: 'door' }), stops: [{ n: 2, cap: 2, tint: 'up', hand: true }], fb: 'Trong xe có 5 bạn rồi nha.' }),
      fr('02', 'Chạm bạn 1', 'chạm + 520 ms', '"sáu"', 'Bạn bay vào ghế đầu tầng trên. Bong bóng "6", không phải "1".', { prog: 4, prompt: coP, bus: co({ up: 1, bubUp: 1 }), stops: [{ n: 1, cap: 2, tint: 'up' }], fb: 'Trong xe có 5 bạn rồi nha.' }),
      fr('03', 'Chạm hết · L3 hiện thẻ', 'chạm + 520 ms → thẻ +300 ms', '"bảy" → "Có tất cả mấy bạn trên xe?"', 'Bến trống thì thu gọn. 3 thẻ trượt lên (80 ms lệch nhau). Luôn có thẻ kém 1 (6).', { prog: 4, prompt: coP, bus: co({ up: 2, bubUp: 2 }), cards: C5({}), fb: 'Có tất cả mấy bạn trên xe?' }),
      fr('04', 'Đúng (7)', '0 – 1600 ms', '"7" → "Có tất cả 7 bạn nhé."', 'Thẻ xanh success. Biển nóc hiện 7 lần đầu tiên (scale 0.6→1, 260 ms).', { prog: 4, prompt: coP, bus: co({ up: 2, sign: 'num', hl: 'sign' }), cards: C5({ 7: 'correct', 6: 'dim', 8: 'dim' }), fb: 'Có tất cả 7 bạn nhé.', dodo: 'cheer' }),
      fr('05', 'Chọn thẻ kém 1 (6)', '0 – 2400 ms', '"Số 5 ở trong xe rồi, mình đếm thêm nha!"', 'Thẻ tạm ẩn thành khe trống (200 ms). Bong bóng cũ tắt. Lời "Số 5" ↔ cửa sáng. Bàn tay chỉ bạn đầu tầng trên.', { prog: 4, prompt: coP, bus: co({ up: 2, hl: 'door', handUp: 0 }), cards: C5({ 8: 'hidden', 6: 'hidden', 7: 'hidden' }), fb: 'Số 5 ở trong xe rồi, mình đếm thêm nha!', dodo: 'think' }),
      fr('06', 'Bé đếm lại', 'mỗi chạm 260 ms', '"sáu" · "bảy"', 'Chạm bạn đã ngồi tầng trên → bong bóng 6, 7. Chạm xong bạn cuối → thẻ hiện lại (200 ms).', { prog: 4, prompt: coP, bus: co({ up: 2, bubUp: 2 }), cards: C5({}), fb: 'Có tất cả mấy bạn trên xe?' }),
      fr('07', 'Trợ giúp 1 (chọn 8)', 'lặp 3 nhịp · 650 ms', '"Bé thử lại nhé."', 'Thẻ 8 lò xo về chỗ. Chỉ trỏ: cửa có vòng sáng nhấp nháy. Không nói tổng.', { prog: 4, prompt: coP, bus: co({ up: 2, hl: 'door' }), cards: C5({}), fb: 'Bé thử lại nhé.', bulb: true }),
      fr('08', 'Trợ giúp 2', 'sau lần thứ 2 · 400 ms', '"Trong xe có 5 bạn rồi nha."', 'Cửa trong dần (opacity 1→.45), hiện 5 chấm mờ ở ghế các bạn trong xe để bé đếm tất cả. Numeral 5 vẫn giữ.', { prog: 4, prompt: coP, bus: co({ up: 2, doorDots: true }), cards: C5({}), fb: 'Trong xe có 5 bạn rồi nha.', bulb: true }),
      fr('09', 'L4 · thẻ hiện ngay', '0 – 2600 ms', '"Trong xe có 5 bạn rồi nha." → "Có tất cả mấy bạn trên xe?"', 'Bến và thẻ cùng lúc. Bé có thể chọn ngay hoặc chạm bạn ở bến để đếm thêm trước.', { prog: 4, prompt: coP, bus: co({ lv: 4 }), stops: [{ n: 2, cap: 2, tint: 'up' }], cards: C5({}), fb: 'Trong xe có 5 bạn rồi nha.' })
    ] };

    // E phase 2
    const g6 = { id: 'phase2', tag: 'E', title: 'Giai đoạn 2', meta: 'ưu tiên thấp · 1 frame mỗi mục', sub: 'make_ten là ngoại lệ duy nhất của quy tắc ghế trống: đọc ô trống của ten-frame chính là chiến lược cần dạy. Đề xuất make_ten dùng xe một tầng (xem câu hỏi mở).', frames: [
      fr('E1', 'five_and', '—', '"Có tất cả mấy bạn trên xe?"', 'Hàng đầu tầng dưới đầy 5, tầng trên 3 bạn. Biển trống. Chọn tổng.', { prog: 2, prompt: coP, bus: B('🐷', { lv: 4, sign: 'blank', low: 5, up: 3 }), cards: [{ n: 7 }, { n: 8 }, { n: 9 }], fb: 'Có tất cả mấy bạn trên xe?' }),
      fr('E2', 'make_ten', '—', '"Còn mấy ghế trống nhỉ?" (câu mới, cần duyệt)', 'Ten-frame có sẵn 7. Biển "10" chỉ numeral. Chọn phần thiếu.', { prog: 3, prompt: 'Còn mấy ghế trống nhỉ?', bus: B('🐸', { lv: 3, single: true, sign: 'num', total: 10, low: 7 }), cards: [{ n: 2 }, { n: 3 }, { n: 4 }], fb: 'Còn mấy ghế trống nhỉ?' }),
      fr('E3', 'make_ten · đúng', '0 – 1800 ms', '"tám, chín, mười"', '3 bạn bay vào từng ghế trống (450 ms mỗi bạn), bong bóng 8, 9, 10.', { prog: 3, prompt: 'Còn mấy ghế trống nhỉ?', bus: B('🐸', { lv: 3, single: true, sign: 'num', total: 10, low: 10, bubLow: 10, bubFrom: 7 }), cards: [{ n: 2, st: 'dim' }, { n: 3, st: 'correct' }, { n: 4, st: 'dim' }], fb: 'Có tất cả 10 bạn nhé.', dodo: 'cheer' }),
      fr('E4', 'L5 · lớp phủ ký hiệu', 'sau khi đúng · giữ tới khi chạm', '"3 cộng 7 bằng 10"', 'Lần duy nhất +/= xuất hiện: lớp phủ tĩnh sau khi bé đã làm đúng.', { prog: 3, prompt: 'Còn mấy ghế trống nhỉ?', bus: B('🐸', { lv: 3, single: true, sign: 'num', total: 10, low: 10 }), overlay: '3 + 7 = 10', next: true, fb: 'Có tất cả 10 bạn nhé.' }),
      fr('E5', 'Cổng chọn nhóm lên trước', '—', '"Bé mời từng bạn lên xe nhé!"', 'Hai nhóm hai bến, chưa gán tầng (viền trung tính). Nhóm được chạm trước lên xe, cửa đóng lại với numeral của nhóm đó.', { prog: 1, prompt: baP, bus: B('🐢', { lv: 3, sign: 'blank', low: 0 }), stops: [{ n: 4, cap: 4, cols: 2, hand: true }, { n: 2, cap: 2 }], fb: 'Bé mời từng bạn lên xe nhé!' }),
      fr('E6', 'Cổng · sau khi chọn', '—', '', 'Nhóm 4 đã vào, cửa đóng hiện 4. Nhóm 2 chờ ở bến để đếm thêm 5, 6.', { prog: 1, prompt: coP, bus: B('🐢', { lv: 3, sign: 'blank', low: 4, door: 4 }), stops: [{ n: 2, cap: 2, tint: 'up' }], fb: 'Trong xe có 4 bạn rồi nha.' })
    ] };

    // Devices
    const g7 = { id: 'devices', tag: 'DEV', title: 'iPad 11" và iPhone SE', meta: 'cột nội dung tối đa 900 · lề 20', sub: 'iPad: cột căn giữa, xe phóng 1,3–1,4× (ghế 78pt). SE 375×667: xe L3–L4 rộng 334pt trong cột 335pt, bước ghế 64pt đúng yêu cầu. missing_part và free_split vừa khít. count_on L4 (bến + thẻ cùng lúc) KHÔNG vừa SE: đề xuất SE dùng nhịp L3 cho mode này.', frames: [
      fr('P1', 'iPad dọc · missing_part', '834×1194', '', 'Cột 794 (máy hẹp hơn 900 + lề). Xe 1,4×.', { dev: 'ipad', prog: 3, prompt: mpP, bus: mp({ up: 2 }), station: {}, cta: 'on', fb: 'Có tất cả 7 bạn nhé.' }),
      fr('P2', 'iPad ngang · count_on L4', '1194×834', '', 'Cột 900 căn giữa, hai bên để nền cream.', { dev: 'ipadL', prog: 4, prompt: coP, bus: co({ lv: 4, up: 1, bubUp: 1 }), stops: [{ n: 1, cap: 2, tint: 'up' }], cards: C5({}), fb: 'Trong xe có 5 bạn rồi nha.' }),
      fr('S1', 'SE · missing_part L3', '375×667 · vừa', '', 'Bước ghế 64 × 64. Bến 88 + CTA 88 cùng một hàng.', { dev: 'se', prog: 3, prompt: mpP, bus: mp({ up: 3 }), station: {}, cta: 'on', fb: 'Có tất cả 7 bạn nhé.' }),
      fr('S2', 'SE · free_split L3, 9 bạn', '375×667 · vừa', '', '9 = 5 + 4, mỗi bạn là một vùng chạm 64 × 64 không chồng nhau.', { dev: 'se', prog: 2, prompt: fsP, bus: B('🐶', { lv: 3, sign: 'num', total: 9, low: 5, up: 4 }), xong: 'on', fb: 'Chia kiểu nào cũng được đó bé!' }),
      fr('S3', 'SE · count_on L4 (đề xuất)', '375×667 · bến + thẻ cùng lúc KHÔNG vừa', '', 'Xe 4 hàng + bến + 3 thẻ cần ~636pt, SE chỉ có ~581pt. Đề xuất: trên SE, L4 dùng nhịp của L3 (thẻ hiện sau khi chạm hết bạn ở bến), ẩn dòng đề. Frame này là trạng thái đã chạm hết. Xem câu hỏi mở số 2.', { dev: 'se', compact: true, prog: 4, prompt: coP, bus: co({ lv: 4, up: 2, bubUp: 2 }), cards: C5({}), fb: 'Có tất cả mấy bạn trên xe?' })
    ] };

    const busCards = [
      { name: 'Xe L1 · ghế rời', size: '300 × 208 · 4 ghế / tầng · khe 18', note: 'Chưa có khung five-frame. Ghế vẫn thẳng hàng để dễ đếm, nhóm ≤ 4 subitize được.', b: B('🐰', { lv: 1, sign: 'dots', low: 2, up: 1 }) },
      { name: 'Xe L2 · five-frame', size: '334 × 212 · 1 × 5 / tầng', note: 'Biển L2: numeral mờ 30% chồng lên chấm.', b: B('🐶', { lv: 2, sign: 'dim', low: 2, up: 3 }) },
      { name: 'Xe L3–L4 · ten-frame mỗi tầng', size: '334 × 340 · 2 × 5 / tầng · lấp hàng đầu trước', note: 'Một phần tối đa 9 (9 = 1 + 8) vẫn đủ chỗ. Bỏ quy tắc "đầy 5 mới lên".', b: B('🐱', { lv: 3, sign: 'num', low: 1, up: 8, total: 9 }) },
      { name: 'Rèm + bóng mờ', size: 'rèm 70% + nếp 11pt · thanh ray 6pt #2B86BF', note: 'Rèm không nhận chạm (pointerEvents none). Bóng mờ phía sau chạm được.', b: B('🐱', { lv: 3, low: 4, up: 2, total: 7, upSil: true, cur: 'closed' }) },
      { name: 'Cửa đóng có numeral', size: 'phủ cả tầng dưới · số 68 tròn · không chấm', note: 'Trợ giúp 2: cửa trong 45%, hiện a chấm mờ tại ghế.', b: B('🐼', { lv: 3, sign: 'blank', low: 5, door: 5, up: 1 }) },
      { name: 'Đuôi ló · bóng mờ lắc lư', size: 'đuôi 10 × 22 · lắc lư ±10°', note: 'Hai tín hiệu duy nhất cho thiếu / thừa. Luôn đúng một cái, không phụ thuộc độ lệch.', b: B('🐱', { lv: 3, low: 4, up: 4, total: 7, upSil: true, cur: 'closed', tail: true, wob: true }) }
    ];
    const cs = (l, o) => ({ l, bg: '#FFFFFF', bd: '#EFE9DF', fg: '#242631', o: 1, t: 'none', vis: true, sh: '0 4px 0 rgba(42,27,16,.08)', ...o });
    const cardStates = [cs('thường'), cs('nhấn', { bd: '#FF6B35', t: 'translateY(3px)', sh: 'none' }), cs('đúng', { bg: '#E4F5EC', bd: '#2FA46A', fg: '#1E7A4C' }), cs('loại (mức 2)', { o: 0.3 }), cs('tạm ẩn', { bg: '#F6F0E6', vis: false, sh: 'none' })];
    const stationStates = [{ l: 'chờ', sh: '0 4px 12px rgba(42,27,16,.08)', o: 1 }, { l: 'trợ giúp 1', sh: '0 0 0 5px #12A79B', o: 1 }, { l: 'tầng trên đầy', sh: 'none', o: 0.4 }];

    const helpRows = [
      { m: 'board_all', a: 'Bạn đầu tiên ở bến trái.', b: 'Không cần (không thể sai). Nếu 8 s không chạm: bạn kế tiếp nhún nhẹ.', c: '—' },
      { m: 'free_split', a: 'Bạn cuối hàng tầng dưới.', b: 'Xong khi một tầng trống: tầng trống viền đậm, một bạn nhún mời.', c: '—' },
      { m: 'next_number', a: 'Không có (thẻ đã rõ).', b: 'Biển nóc vòng sáng 3 nhịp.', c: 'Làm mờ thẻ không thể đúng, còn 2 thẻ.' },
      { m: 'missing_part', a: 'Bạn ở bến.', b: 'Sau thiếu: bến nhấp nháy. Sau thừa: rèm nhấp nháy. Không đếm hộ.', c: 'Biển tổng hiện N chấm mờ hàng 5, không chấm trong rèm.' },
      { m: 'count_on', a: 'Bạn đầu ở bến.', b: 'Cửa có vòng sáng 3 nhịp. Chọn thẻ kém 1 có luồng riêng (B5 · 05).', c: 'Cửa trong dần, hiện a chấm mờ; numeral a giữ nguyên.' }
    ];
    const motion = [
      { n: 'bus_arrive', p: 'translateX 420→0', d: '700', e: 'cubic-bezier(.2,.8,.2,1)', r: 'Xe có sẵn tại chỗ, opacity 0→1 150 ms' },
      { n: 'group_point', p: 'Bến: overlay opacity 0→1; bạn đang đếm scale 1→1.08→1', d: '160 / tiếng', e: 'ease-out', r: 'Bến đổi nền tint, không nhún' },
      { n: 'friend_board', p: 'translateX/Y theo cung (2 Animated.Value), scale 1→.9→1', d: '520', e: 'cubic-bezier(.3,.7,.2,1)', r: 'Bạn biến mất ở bến, hiện ở ghế (opacity 120 ms)' },
      { n: 'count_bubble', p: 'scale .6→1.08→1, translateY 6→0, opacity 0→1', d: '260', e: 'spring(damping 14, stiffness 220)', r: 'opacity 0→1 100 ms' },
      { n: 'friend_shrug', p: 'rotate 0→−6→6→0°, translateY 0→−3→0', d: '480', e: 'ease-in-out', r: 'Không chuyển động; tiếng cười vẫn phát' },
      { n: 'deck_highlight', p: 'Viền overlay opacity 0→1 · giữ · 1→0', d: '180 / 240', e: 'ease-out', r: 'Giữ nguyên (opacity), không nhấp nháy' },
      { n: 'bus_drive', p: 'translateX 0→420; bánh xe rotate 0→720°', d: '900', e: 'ease-in', r: 'opacity 1→0 200 ms' },
      { n: 'split_move', p: 'Bạn translateY giữa hai tầng; các bạn còn lại dồn translateX', d: '420 + 200', e: 'cubic-bezier(.3,.7,.2,1)', r: 'Vào chỗ ngay' },
      { n: 'split_memo', p: 'Bản chụp xe scale 1→.16 + translate về góc phải', d: '500', e: 'cubic-bezier(.2,.8,.2,1)', r: 'Thẻ ảnh hiện ngay ở góc' },
      { n: 'sign_flip', p: 'Biển scaleY 1→0 (đổi số) 0→1', d: '300', e: 'ease-in-out', r: 'Cross-fade 150 ms' },
      { n: 'station_hop', p: 'Bạn translate theo cung bến → ghế + opacity 1→.5 (thành bóng mờ)', d: '480', e: 'cubic-bezier(.3,.7,.2,1)', r: 'Đổi chỗ ngay' },
      { n: 'station_refill', p: 'Bạn mới translateX −40→0, opacity 0→1', d: '300, trễ 200', e: 'ease-out', r: 'Hiện ngay' },
      { n: 'sil_return', p: 'Bóng mờ translate theo cung về bến, opacity .5→1', d: '420', e: 'cubic-bezier(.3,.7,.2,1)', r: 'Đổi chỗ ngay' },
      { n: 'curtain_sway', p: 'rotate ±1.4°, translateX ±3 (origin: thanh ray)', d: '4 × 170', e: 'ease-in-out', r: 'Rèm tĩnh; độ đậm rèm 1→.8→1 một lần' },
      { n: 'curtain_open', p: 'translateY 0→−100% (cắt trong khung tầng) + scaleY', d: '420', e: 'cubic-bezier(.2,.8,.2,1)', r: 'opacity 1→0 ngay' },
      { n: 'tail_peek', p: 'Đuôi translateY −14→0, giữ, 0→−14', d: '300 · 900 · 300', e: 'ease-out / ease-in', r: 'Đuôi hiện tĩnh 1500 ms' },
      { n: 'sil_wobble', p: 'rotate 0→−10→10→−6→0°', d: '900', e: 'ease-in-out', r: 'Bóng mờ đậm lên 1 lần rồi về' },
      { n: 'card_press', p: 'scale 1→.96, translateY 0→4', d: '90', e: 'ease-out', r: 'Giữ nguyên (nhỏ, không gây chóng mặt)' },
      { n: 'card_spring_back', p: 'translateY 0→8→−2→0', d: '400', e: 'spring(damping 10)', r: 'Không chuyển động; viền đổi về thường' },
      { n: 'card_hide / show', p: 'opacity + scale .9↔1', d: '200', e: 'ease-out', r: 'opacity 100 ms' },
      { n: 'ghost_hand', p: 'opacity 0→.85; chạm lặp translate(−6,−8) scale .92', d: '200 + 650 × 3', e: 'ease-in-out', r: 'Tay tĩnh 2,5 s' },
      { n: 'help1_pulse', p: 'scale 1↔1.06 hoặc viền opacity', d: '650 × 3', e: 'ease-in-out', r: 'Viền 4pt đậm tĩnh cho tới lần chạm kế' },
      { n: 'door_reveal', p: 'Cửa opacity 1→.45; chấm opacity 0→.4', d: '400', e: 'ease-out', r: 'Đổi ngay' },
      { n: 'dodo_mood', p: 'cheer translateY 0→−8→0 × 2 · think rotate −10°', d: '600 / 300', e: 'ease-out', r: 'Đổi ảnh tư thế, không nhún' }
    ];
    const lvB = (lv, sign) => B('🐶', { lv, sign, low: 2, up: 3, total: 5 });
    const levels = [
      { l: 'L1', name: 'Ghế rời, không numeral', b: lvB(1, 'dots'), pts: ['4 ghế rời mỗi tầng', 'Biển chỉ có chấm, xuất hiện khi đọc tổng', 'Không thẻ, không số'] },
      { l: 'L2', name: 'Five-frame, numeral mờ trên chấm', b: lvB(2, 'dim'), pts: ['1 hàng × 5 mỗi tầng', 'Numeral 30% chồng lên chấm: làm quen mặt số', 'Thẻ có dải chấm'] },
      { l: 'L3', name: 'Ten-frame, numeral rõ', b: lvB(3, 'num'), pts: ['2 × 5 mỗi tầng, lấp hàng đầu trước', 'Numeral rõ trên biển / cửa', 'count_on: thẻ hiện sau khi chạm hết'] },
      { l: 'L4', name: 'Chấm và numeral song song', b: lvB(4, 'both'), pts: ['Khung giống L3', 'Biển dạng pill: số | chấm', 'count_on: thẻ hiện ngay'] }
    ];
    const cur = 2;
    const parentLv = [1, 2, 3, 4, 5].map(i => ({ l: 'L' + i, bg: i === cur ? '#FFFFFF' : 'transparent', fg: i === cur ? '#B23A16' : i === 5 ? '#B8BAC4' : '#4C5060', sh: i === cur ? '0 2px 6px rgba(42,27,16,.1)' : 'none' }));
    const crit = ['bé nói được tổng ngay sau khi các bạn lên xe, không đếm lại từng bạn.', 'biết một phần, bé đoán ngay phần kia của 4–5.', 'trả lời "5 và mấy" không cần đếm từng ghế, không chọn thẻ kém 1.', 'tự nói tổng mà không đếm lại nhóm trong xe.', 'cặp quen nói ngay, cặp lạ tự đếm thêm.'];
    const criteria = crit.map((t, i) => ({ l: 'L' + (i + 1), t: t.charAt(0).toUpperCase() + t.slice(1), bg: i + 1 === cur ? '#FFEBE1' : 'transparent', fg: i + 1 === cur ? '#B23A16' : '#8C8F9C' }));
    const otherGames = [{ n: 'Khám phá số', l: 'L2' }, { n: 'Chạm và đếm', l: 'L1' }, { n: 'Bên nào nhiều hơn?', l: 'L1' }, { n: 'Lật thẻ tìm cặp', l: 'L3' }];
    const a11y = [
      { c: 'Nút thoát', l: 'Thoát trò chơi', n: 'Mở cổng phụ huynh nếu đang giữa lượt.' },
      { c: 'Nút loa', l: 'Nghe lại câu hỏi', n: 'Phát lại promptVi; không đọc đáp án.' },
      { c: 'Tiến độ', l: 'Bài 3 trên 6', n: 'accessibilityRole="progressbar".' },
      { c: 'Xe buýt', l: 'Xe buýt hai tầng. Trên nóc ghi số 7.', n: 'L1 / count_on trước khi chọn: "Trên nóc chưa có số."' },
      { c: 'Tầng dưới', l: 'Tầng dưới, màu cam, có 4 bạn.', n: 'Nhóm (accessible container) chứa các ghế.' },
      { c: 'Tầng trên có rèm', l: 'Tầng trên, màu xanh, có rèm che. Bé đã cho 2 bạn trốn.', n: 'Chỉ đọc số bé tự thêm, không đọc phần thiếu.' },
      { c: 'Ghế trống', l: '(ẩn)', n: 'importantForAccessibility="no" khi không phải vùng chạm.' },
      { c: 'Bạn ở bến', l: 'Bạn mèo ở bến. Chạm để mời lên xe.', n: 'Tầng trên đầy: "Tầng trên hết chỗ rồi", trạng thái disabled.' },
      { c: 'Bóng mờ sau rèm', l: 'Bạn đang trốn. Chạm để mời về bến.', n: '' },
      { c: 'Bạn ở tầng (free_split)', l: 'Bạn chó ở tầng dưới. Chạm để lên tầng trên.', n: 'Đổi thành "…xuống tầng dưới" khi ở tầng trên.' },
      { c: 'Cửa xe đóng', l: 'Cửa xe đóng. Trong xe có 5 bạn.', n: '' },
      { c: 'Thẻ số', l: 'Số 7', n: 'Trạng thái ẩn: không focus được. Mức 2: thẻ loại vẫn focus, đọc "Số 3, không chọn được".' },
      { c: 'Nút Tập tầm vông', l: 'Tập tầm vông! Mở rèm xem các bạn.', n: 'Trạng thái bận: disabled trong lúc rèm lay.' },
      { c: 'Nút Xong', l: 'Xong, bé đã chia xong.', n: 'Trạng thái chờ đọc "chưa bấm được".' },
      { c: 'Nút tiếp', l: 'Bài tiếp theo', n: 'Nút chỉ có icon.' },
      { c: 'Phản hồi Đô Đô', l: '(nội dung câu)', n: 'accessibilityLiveRegion="polite"; thần chú đọc liền một câu.' }
    ];
    const openQs = [
      { i: '1', t: 'Chọn hướng 1a', d: 'Tôi tự chọn hướng Sơ đồ phẳng vì 4 hàng ghế cần khung tối giản. Nếu muốn 1b (cửa sổ, rèm cuốn) thì Bus component đổi skin, luồng giữ nguyên.' },
      { i: '2', t: 'count_on L4 trên SE', d: 'Bến + 3 thẻ + xe 4 hàng cần ~636pt, SE chỉ có ~581pt, kể cả khi ẩn dòng đề. Bến và thẻ cùng hàng cũng không vừa chiều ngang (364 > 335pt). Đề xuất: trên SE, L4 dùng nhịp L3 (thẻ hiện sau khi chạm hết), ẩn dòng đề (câu vẫn được đọc) như frame S3.' },
      { i: '3', t: 'count_on: cửa che tầng dưới', d: 'Cửa đóng phủ cả tầng dưới (phần a), bạn mới lên tầng trên (phần b). Giữ ẩn dụ hai tầng = hai phần cho cả đếm thêm.' },
      { i: '4', t: 'L1: biển nóc trống, chấm hiện khi đọc tổng', d: 'Giữ "biển = tổng" ngay từ L1 mà không có numeral.' },
      { i: '5', t: 'next_number dùng numeral rõ ở L2', d: 'Câu hỏi nói "số 4" nên biển cần đọc được; ngoại lệ với quy tắc numeral mờ của L2.' },
      { i: '6', t: 'Tín hiệu lượt 2 của free_split', d: 'Ảnh cách chia ở góc + các bạn nhún mời + Xong chờ cho tới khi có cách mới. Dựng lại cách cũ: ảnh cũ nhún, không có lời chê.' },
      { i: '7', t: 'Bóng mờ lắc lư là bạn thêm sau cùng', d: 'Luôn là cùng một vị trí dễ đoán, không phụ thuộc độ lệch nên không lộ số thừa.' },
      { i: '8', t: 'make_ten: xe một tầng', d: 'Một ten-frame duy nhất rõ hơn. Cần câu đề mới, tạm dùng "Còn mấy ghế trống nhỉ?".' },
      { i: '9', t: 'Vị trí câu "Bé rủ ba mẹ chơi tách gộp nha!"', d: 'Đề xuất đặt ở màn kết lượt đã có, dưới "Mình luyện xong rồi!".' },
      { i: '10', t: 'Màu tầng', d: 'Giữ Okabe–Ito cam / xanh. Cam nhạt #FBE8C2 khác đủ xa coral #FF6B35 của nút; tầng phân biệt thêm bằng vị trí cố định trên/dưới.' }
    ];
    return {
      kind, species: ['🐱', '🐶', '🐰', '🐻', '🐼', '🐷'],
      groups: [g1, g2, g3, g4, g5, g6, g7],
      busCards, cardStates, stationStates, helpRows, motion, levels,
      parentLv, criteria, otherGames, a11y, openQs
    };
  }
}
