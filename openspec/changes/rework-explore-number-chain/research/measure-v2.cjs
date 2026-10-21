// Đo lối tắt của Máy nối tiếp v2 (hai ô) qua planner thật.
// Chạy: node measure-after.cjs <mobileRoot> [rounds]
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

const root = path.resolve(process.argv[2]);
const ROUNDS = Number(process.argv[3] ?? 3000);
globalThis.__DEV__ = false;
for (const extension of ['.wav', '.mp3', '.m4a', '.png', '.jpg', '.json']) {
  Module._extensions[extension] = (module) => { module.exports = 0; };
}
for (const extension of ['.ts', '.tsx']) {
  Module._extensions[extension] = (module, filename) => {
    const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      fileName: filename,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true, jsx: ts.JsxEmit.React },
    });
    module._compile(outputText, filename);
  };
}
const registry = require(path.join(root, 'src/explore/registry.ts'));
const chainGame = require(path.join(root, 'src/explore/games/numberChainGame.ts'));
const game = registry.getBundledExploreCatalog().find((g) => g.gameCode === 'number_chain');

let s = 12345;
const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
const any = (list) => list[Math.floor(rnd() * list.length)];
const closest = (options, refs) => {
  const d = (v) => Math.min(...refs.map((r) => Math.abs(v - r)));
  const best = Math.min(...options.map(d));
  return any(options.filter((v) => d(v) === best));
};
const sorted = (o) => [...o].sort((a, b) => a - b);
const cellValue = (p, cell) => (cell === 'start' ? p.start : cell === 'mid' ? p.mid : p.result);

function picks(p, index, seenFirst) {
  const options = p.blanks[index].options;
  const inputCell = index === 0 ? (p.mode === 'reverse' ? 'end' : 'start') : 'mid';
  const input = cellValue(p, inputCell);
  const shown = index === 0 ? [p.mode === 'reverse' ? p.result : p.start] : [p.mode === 'reverse' ? p.result : p.start, p.mid];
  const machine = p.mode === 'reverse' ? (index === 0 ? 2 : 1) : index === 0 ? 1 : 2;
  const op = machine === 1 ? p.op1 : p.op2;
  // Chiều số đi: xuôi theo dấu; ngược thì gỡ máy nên ngược dấu.
  const up = p.mode === 'reverse' ? op === 'sub' : op === 'add';
  const sideCards = options.filter((v) => (up ? v > input : v < input));
  const out = {
    guess: any(options),
    max: Math.max(...options),
    min: Math.min(...options),
    median_low: sorted(options)[1],
    median_high: sorted(options)[2],
    closest_input: closest(options, [input]),
    closest_shown: closest(options, shown),
    farthest_input: (() => { const d = (v) => Math.abs(v - input); const m = Math.max(...options.map(d)); return any(options.filter((v) => d(v) === m)); })(),
    dir_closest: sideCards.length ? closest(sideCards, [input]) : any(options),
    dir_any: sideCards.length ? any(sideCards) : any(options),
    center: closest(options, [(p.range.min + p.range.max) / 2]),
  };
  const k = machine === 1 ? p.k1 : p.k2;
  const kAway = options.filter((v) => Math.abs(v - input) === k);
  out.sign_blind = kAway.length ? any(kAway) : any(options);
  const forwardRun = p.mode === 'reverse' ? (op === 'add' ? input + k : input - k) : null;
  const correct = index === 0 ? (p.mode === 'reverse' ? p.mid : p.mid) : (p.mode === 'reverse' ? p.start : p.result);
  out.no_undo = p.mode === 'reverse' ? (options.includes(forwardRun) ? forwardRun : any(options)) : correct;
  out.fwd_ok_rev_signblind = p.mode === 'reverse' ? out.sign_blind : correct;
  const nb = (v, list) => list.filter((w) => Math.abs(w - v) === 1).length;
  const most = (list) => { const best = Math.max(...list.map((v) => nb(v, options))); return any(list.filter((v) => nb(v, options) === best)); };
  out.most_neighbours = most(options);
  out.dir_most_neighbours = sideCards.length ? most(sideCards) : most(options);
  out.fewest_neighbours = (() => { const best = Math.min(...options.map((v) => nb(v, options))); return any(options.filter((v) => nb(v, options) === best)); })();
  for (let i = 0; i < options.length; i += 1) out[`pos${i}`] = options[i];
  if (index === 1) {
    const fresh = options.filter((v) => !seenFirst.includes(v));
    const seen = options.filter((v) => seenFirst.includes(v));
    out.avoid_seen = fresh.length ? any(fresh) : any(options);
    out.prefer_seen = seen.length ? any(seen) : any(options);
  } else {
    out.avoid_seen = out.guess;
    out.prefer_seen = out.guess;
  }
  return out;
}

function boardHits(ex) {
  const p = ex.params;
  const a = picks(p, 0, []);
  const b = picks(p, 1, p.blanks[0].options);
  const hits = {};
  for (const name of Object.keys(a)) {
    hits[name] = (a[name] === ex.answer.values[0] && b[name] === ex.answer.values[1]) ? 1 : 0;
    hits[`${name}@cell`] = (a[name] === ex.answer.values[0] ? 1 : 0) + (b[name] === ex.answer.values[1] ? 1 : 0);
    hits[`${name}@c0`] = a[name] === ex.answer.values[0] ? 1 : 0;
    hits[`${name}@c1`] = b[name] === ex.answer.values[1] ? 1 : 0;
  }
  return hits;
}

async function main() {
  const provider = new registry.LocalExploreProvider();
  const kinds = {};
  for (const level of game.levels) {
    const hits = {};
    const passFirst = {};
    const passExtra = {};
    let boards = 0;
    const rank = [0, 0, 0, 0];
    for (let trial = 0; trial < ROUNDS; trial += 1) {
      const r1 = await registry.createExploreRunBatch(provider, game, level, 6, { bucketRotation: trial });
      const r2 = await registry.createExploreRunBatch(provider, game, level, 6, { excludeVariantKeys: r1.map((e) => e.variantKey), bucketRotation: trial + 1 });
      const score = (round) => {
        const c = {};
        for (const ex of round) {
          const h = boardHits(ex);
          for (const [n, v] of Object.entries(h)) {
            c[n] = (c[n] ?? 0) + v;
            hits[n] = (hits[n] ?? 0) + v;
          }
          ex.params.blanks.forEach((blank, i) => {
            rank[sorted(blank.options).indexOf(ex.answer.values[i])] += 1;
            for (const v of blank.options) {
              if (v === ex.answer.values[i]) continue;
              const k = chainGame.numberChainErrorKind(ex.params, i, v) ?? 'NONE';
              kinds[`L${level}:${k}`] = (kinds[`L${level}:${k}`] ?? 0) + 1;
            }
          });
        }
        return c;
      };
      const c1 = score(r1);
      const c2 = score(r2);
      boards += 12;
      for (const n of Object.keys(c1)) {
        if (n.includes('@')) continue;
        passFirst[n] = (passFirst[n] ?? 0) + (c1[n] >= 4 ? 1 : 0);
        passExtra[n] = (passExtra[n] ?? 0) + (c1[n] >= 4 || c2[n] >= 4 ? 1 : 0);
      }
    }
    const pct = (x) => `${(x * 100).toFixed(2)}%`;
    console.log(`\nL${level}  answer rank among sorted cards: ${rank.map((r) => pct(r / (boards * 2))).join(' / ')}`);
    for (const n of Object.keys(passFirst)) {
      console.log(`  ${n.padEnd(14)} c0 ${pct(hits[`${n}@c0`] / boards).padStart(7)} c1 ${pct(hits[`${n}@c1`] / boards).padStart(7)} cell ${pct(hits[`${n}@cell`] / (boards * 2)).padStart(7)}  board ${pct(hits[n] / boards).padStart(7)}  pass4/6 ${pct(passFirst[n] / ROUNDS).padStart(7)}  +extra ${pct(passExtra[n] / ROUNDS).padStart(7)}`);
    }
  }
  console.log('\nerror kinds', kinds);
}
main().catch((e) => { console.error(e); process.exit(1); });
