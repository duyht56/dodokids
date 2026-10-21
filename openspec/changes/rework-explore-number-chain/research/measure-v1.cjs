// Đo lối tắt của Máy nối tiếp BẢN CŨ (number-chain-v1) qua planner thật.
// Chạy: node measure-before.cjs <mobileRoot> [rounds]
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
const game = registry.getBundledExploreCatalog().find((g) => g.gameCode === 'number_chain');

// Seeded rng for strategies' tie-breaks.
let s = 12345;
const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
const pickClosest = (options, ref) => {
  const best = Math.min(...options.map((v) => Math.abs(v - ref)));
  const ties = options.filter((v) => Math.abs(v - ref) === best);
  return ties[Math.floor(rnd() * ties.length)];
};
const sorted = (o) => [...o].sort((a, b) => a - b);

function strategies(p) {
  const shown = p.mode === 'reverse' ? p.result : p.start;
  const out = {
    guess: p.options[Math.floor(rnd() * p.options.length)],
    max: Math.max(...p.options),
    min: Math.min(...p.options),
    median_low: sorted(p.options)[Math.floor((p.options.length - 1) / 2)],
    median_high: sorted(p.options)[Math.ceil((p.options.length - 1) / 2)],
    closest_shown_end: pickClosest(p.options, shown),
  };
  if (p.revealMiddle) out.closest_mid = pickClosest(p.options, p.mid);
  for (let i = 0; i < p.options.length; i += 1) out[`pos${i}`] = p.options[i];
  return out;
}

async function main() {
  const provider = new registry.LocalExploreProvider();
  const rows = [];
  for (const level of game.levels) {
    const hits = {};
    const passFirst = {};
    const passWithExtra = {};
    let boards = 0;
    for (let trial = 0; trial < ROUNDS; trial += 1) {
      const r1 = await registry.createExploreRunBatch(provider, game, level, 6, { bucketRotation: trial });
      const r2 = await registry.createExploreRunBatch(provider, game, level, 6, {
        excludeVariantKeys: r1.map((e) => e.variantKey), bucketRotation: trial + 1,
      });
      const score = (round) => {
        const counts = {};
        for (const ex of round) {
          const picks = strategies(ex.params);
          for (const [name, value] of Object.entries(picks)) {
            const ok = value === ex.answer.value ? 1 : 0;
            counts[name] = (counts[name] ?? 0) + ok;
            hits[name] = (hits[name] ?? 0) + ok;
          }
        }
        return counts;
      };
      const c1 = score(r1);
      boards += r1.length;
      const c2 = score(r2);
      for (const name of Object.keys(c1)) {
        const p1 = c1[name] >= 4;
        passFirst[name] = (passFirst[name] ?? 0) + (p1 ? 1 : 0);
        passWithExtra[name] = (passWithExtra[name] ?? 0) + (p1 || c2[name] >= 4 ? 1 : 0);
      }
    }
    boards *= 2;
    for (const name of Object.keys(hits)) {
      rows.push({ level, strategy: name, board: hits[name] / boards, pass: passFirst[name] / ROUNDS, passExtra: passWithExtra[name] / ROUNDS });
    }
  }
  const pct = (x) => `${(x * 100).toFixed(1)}%`;
  for (const level of game.levels) {
    console.log(`\nL${level}`);
    for (const r of rows.filter((row) => row.level === level)) {
      console.log(`  ${r.strategy.padEnd(18)} board ${pct(r.board).padStart(6)}  pass4/6 ${pct(r.pass).padStart(6)}  +extra ${pct(r.passExtra).padStart(6)}`);
    }
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
