#!/usr/bin/env node
// Google Play Developer API helper for the release-mobile skill.
// No dependencies: the service-account JWT is signed with node:crypto.
//
//   node play.mjs status [--json]
//   node play.mjs notes   --track internal --version-code 7 --notes-file notes.vi.txt [--commit]
//   node play.mjs promote --from internal --to alpha --version-code 7 [--rollout 0.05] [--draft] [--notes-file f] [--commit]
//   node play.mjs rollout --track production --fraction 0.2 [--commit]   # 1 = complete the rollout
//   node play.mjs halt    --track production [--commit]
//
// Every write happens inside a Play "edit". Without --commit the edit is only
// validated and then deleted, so nothing changes on Play: that is the dry run
// to show the user before repeating with --commit.
//
// Service-account key, first match wins: --key-file, $PLAY_SA_KEY_FILE,
// $GOOGLE_PLAY_KEY (inline JSON), then GOOGLE_PLAY_KEY in <repo>/kido-server/.env.
// The key is never printed.

import { createSign } from 'node:crypto';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PACKAGE_DEFAULT = 'com.dodokids.app';
const NOTES_LANG = 'vi-VN';
const NOTES_MAX = 500; // Play's per-language limit for "What's new".

const HELP = `Usage:
  node play.mjs status [--json]
  node play.mjs notes   --track <t> [--version-code <n>] --notes-file <f> [--commit]
  node play.mjs promote --from <t> --to <t> [--version-code <n>] [--rollout <0..1>] [--draft] [--notes-file <f>] [--commit]
  node play.mjs rollout --track <t> --fraction <0..1> [--commit]
  node play.mjs halt    --track <t> [--commit]
Tracks: internal, alpha (closed testing), beta (open testing), production.
Common flags: --package <id> (default ${PACKAGE_DEFAULT}), --key-file <sa.json>,
  --changes-not-sent-for-review (commit without auto-sending changes for review).`;

function parseArgs(argv) {
  const [cmd, ...rest] = argv;
  const opts = {};
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (!arg.startsWith('--')) throw new Error(`Unexpected argument: ${arg}`);
    const next = rest[i + 1];
    if (next === undefined || next.startsWith('--')) {
      opts[arg.slice(2)] = true;
    } else {
      opts[arg.slice(2)] = next;
      i++;
    }
  }
  return { cmd, opts };
}

function required(opts, name) {
  if (opts[name] === undefined || opts[name] === true) throw new Error(`Missing --${name}`);
  return opts[name];
}

function repoRoot() {
  const here = dirname(fileURLToPath(import.meta.url));
  return execSync('git rev-parse --show-toplevel', { cwd: here }).toString().trim();
}

function loadKey(opts) {
  const file = opts['key-file'] || process.env.PLAY_SA_KEY_FILE;
  if (file) return JSON.parse(readFileSync(file, 'utf8'));
  if (process.env.GOOGLE_PLAY_KEY) return JSON.parse(process.env.GOOGLE_PLAY_KEY);
  const envPath = join(repoRoot(), 'kido-server', '.env');
  if (existsSync(envPath)) {
    const line = readFileSync(envPath, 'utf8')
      .split('\n')
      .find((l) => l.startsWith('GOOGLE_PLAY_KEY='));
    if (line) {
      // Read raw, not through dotenv: the private key's \n escapes stay JSON escapes.
      let value = line.slice('GOOGLE_PLAY_KEY='.length).trim();
      const quoted = /^(['"]).*\1$/.test(value);
      if (quoted) value = value.slice(1, -1);
      return JSON.parse(value);
    }
  }
  throw new Error(
    'No service-account key: pass --key-file, set PLAY_SA_KEY_FILE, or keep GOOGLE_PLAY_KEY in kido-server/.env',
  );
}

const b64url = (input) => Buffer.from(input).toString('base64url');

async function accessToken(key) {
  const tokenUri = key.token_uri || 'https://oauth2.googleapis.com/token';
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(
    JSON.stringify({
      iss: key.client_email,
      scope: 'https://www.googleapis.com/auth/androidpublisher',
      aud: tokenUri,
      iat: now,
      exp: now + 3600,
    }),
  );
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  const jwt = `${header}.${claims}.${b64url(signer.sign(key.private_key))}`;
  const res = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Token request failed (${res.status}): ${body.error_description || body.error}`);
  return body.access_token;
}

function client(token, pkg) {
  const base = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${pkg}`;
  return async (method, path, body) => {
    const res = await fetch(base + path, {
      method,
      headers: {
        authorization: `Bearer ${token}`,
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${data.error?.message || text}`);
    return data;
  };
}

// Runs fn inside an edit. Writes are committed only with --commit; otherwise
// the edit is validated (so Play still rejects bad changes) and discarded.
async function withEdit(api, fn, { write, commit, changesNotSentForReview }) {
  const { id } = await api('POST', '/edits', {});
  let committed = false;
  try {
    const result = await fn(id);
    if (write && commit) {
      const query = changesNotSentForReview ? '?changesNotSentForReview=true' : '';
      await api('POST', `/edits/${id}:commit${query}`);
      committed = true;
    } else if (write) {
      await api('POST', `/edits/${id}:validate`);
    }
    return result;
  } finally {
    if (!committed) await api('DELETE', `/edits/${id}`).catch(() => {});
  }
}

function describe(release) {
  const fraction = release.userFraction != null ? ` ${Math.round(release.userFraction * 100)}%` : '';
  const notes = (release.releaseNotes || []).map((n) => n.language).join(',') || 'no notes';
  const codes = (release.versionCodes || []).join(',') || '-';
  return `${release.name || '(unnamed)'} · versionCode ${codes} · ${release.status}${fraction} · ${notes}`;
}

function printTrack(label, track) {
  console.log(`${label}:`);
  const releases = track.releases || [];
  if (!releases.length) console.log('  (no releases)');
  for (const r of releases) console.log(`  ${describe(r)}`);
}

function findRelease(track, versionCode) {
  const releases = track.releases || [];
  if (versionCode !== undefined) {
    const hit = releases.find((r) => (r.versionCodes || []).includes(String(versionCode)));
    if (!hit) throw new Error(`versionCode ${versionCode} is not on track "${track.track}"`);
    return hit;
  }
  const highest = (r) => Math.max(...(r.versionCodes || ['0']).map(Number));
  const sorted = [...releases].sort((a, b) => highest(b) - highest(a));
  if (!sorted.length) throw new Error(`Track "${track.track}" has no releases`);
  return sorted[0];
}

function readNotes(opts) {
  if (!opts['notes-file']) return undefined;
  const text = readFileSync(opts['notes-file'], 'utf8').trim();
  if (!text) throw new Error('Notes file is empty');
  if (text.length > NOTES_MAX) throw new Error(`Notes are ${text.length} chars; Play allows ${NOTES_MAX}`);
  return [{ language: NOTES_LANG, text }];
}

function parseFraction(raw) {
  const value = Number(raw);
  if (!(value > 0 && value <= 1)) throw new Error(`Fraction must be in (0, 1], got ${raw}`);
  return value;
}

// Until an app is first published through review, Play accepts only "draft"
// releases from the API ("draft app"). Probe it inside the throwaway status
// edit: stage a completed release on a track that doesn't carry the newest
// bundle yet and ask Play to validate it.
async function probeDraftApp(api, id, tracks, bundles) {
  const newest = Math.max(0, ...bundles.map((b) => b.versionCode));
  if (!newest) return 'unknown (no bundle uploaded yet)';
  const code = String(newest);
  const probeTrack = ['alpha', 'beta'].find((name) => {
    const track = tracks.find((t) => t.track === name);
    return !(track?.releases || []).some((r) => (r.versionCodes || []).includes(code));
  });
  if (!probeTrack) return 'unknown (no free track to probe)';
  try {
    await updateTrack(api, id, probeTrack, [{ versionCodes: [code], status: 'completed' }]);
    await api('POST', `/edits/${id}:validate`);
    return 'no';
  } catch (err) {
    return /draft app/i.test(err.message) ? 'yes' : `unknown (${err.message})`;
  }
}

async function status(api, id, opts) {
  const { tracks = [] } = await api('GET', `/edits/${id}/tracks`);
  const { bundles = [] } = await api('GET', `/edits/${id}/bundles`);
  const draftApp = await probeDraftApp(api, id, tracks, bundles);
  if (opts.json) {
    console.log(JSON.stringify({ draftApp, tracks, bundles }, null, 2));
    return;
  }
  for (const t of tracks) printTrack(t.track, t);
  const recent = [...bundles].sort((a, b) => b.versionCode - a.versionCode).slice(0, 5);
  console.log('bundles (newest first):');
  for (const b of recent) console.log(`  versionCode ${b.versionCode} · sha256 ${b.sha256}`);
  const hint = {
    yes: ' (API can only create "draft" releases; roll them out in Play Console)',
    no: ' (API can create completed/staged releases)',
  };
  console.log(`draft app: ${draftApp}${hint[draftApp] ?? ''}`);
}

async function updateTrack(api, id, name, releases) {
  return api('PUT', `/edits/${id}/tracks/${name}`, { track: name, releases });
}

async function notes(api, id, opts) {
  const name = required(opts, 'track');
  const releaseNotes = readNotes({ 'notes-file': required(opts, 'notes-file') });
  const track = await api('GET', `/edits/${id}/tracks/${name}`);
  printTrack(`${name} before`, track);
  const release = findRelease(track, opts['version-code']);
  release.releaseNotes = releaseNotes;
  printTrack(`${name} after`, await updateTrack(api, id, name, track.releases));
}

async function promote(api, id, opts) {
  const from = required(opts, 'from');
  const to = required(opts, 'to');
  const fraction = opts.rollout !== undefined ? parseFraction(opts.rollout) : 1;
  const source = await api('GET', `/edits/${id}/tracks/${from}`);
  const release = findRelease(source, opts['version-code']);
  const next = {
    name: release.name,
    versionCodes: release.versionCodes,
    status: opts.draft ? 'draft' : fraction < 1 ? 'inProgress' : 'completed',
    releaseNotes: readNotes(opts) || release.releaseNotes,
  };
  if (next.status === 'inProgress') next.userFraction = fraction;
  const target = await api('GET', `/edits/${id}/tracks/${to}`).catch(() => ({ track: to }));
  printTrack(`${to} before`, target);
  // A staged release only needs itself: Play keeps serving the previous
  // completed release to users outside the fraction.
  printTrack(`${to} after`, await updateTrack(api, id, to, [next]));
}

async function rollout(api, id, opts) {
  const name = required(opts, 'track');
  const fraction = parseFraction(required(opts, 'fraction'));
  const track = await api('GET', `/edits/${id}/tracks/${name}`);
  printTrack(`${name} before`, track);
  const release = (track.releases || []).find((r) => r.status === 'inProgress' || r.status === 'halted');
  if (!release) throw new Error(`No staged (inProgress/halted) release on "${name}"`);
  let releases = track.releases;
  if (fraction === 1) {
    release.status = 'completed';
    delete release.userFraction;
    releases = [release]; // completing replaces the old completed release
  } else {
    release.status = 'inProgress';
    release.userFraction = fraction;
  }
  printTrack(`${name} after`, await updateTrack(api, id, name, releases));
}

async function halt(api, id, opts) {
  const name = required(opts, 'track');
  const track = await api('GET', `/edits/${id}/tracks/${name}`);
  printTrack(`${name} before`, track);
  const release = (track.releases || []).find((r) => r.status === 'inProgress');
  if (!release) throw new Error(`No inProgress release on "${name}" to halt`);
  release.status = 'halted';
  printTrack(`${name} after`, await updateTrack(api, id, name, track.releases));
}

const COMMANDS = { status, notes, promote, rollout, halt };

async function main() {
  const { cmd, opts } = parseArgs(process.argv.slice(2));
  if (!cmd || cmd === 'help' || opts.help || !COMMANDS[cmd]) {
    console.log(HELP);
    if (cmd && cmd !== 'help' && !COMMANDS[cmd]) process.exitCode = 1;
    return;
  }
  const key = loadKey(opts);
  const api = client(await accessToken(key), opts.package || PACKAGE_DEFAULT);
  const write = cmd !== 'status';
  const commit = Boolean(opts.commit);
  await withEdit(api, (id) => COMMANDS[cmd](api, id, opts), {
    write,
    commit,
    changesNotSentForReview: Boolean(opts['changes-not-sent-for-review']),
  });
  if (write) {
    console.log(
      commit
        ? 'COMMITTED to Google Play.'
        : 'DRY RUN: Play validated the change and it was discarded. Re-run with --commit to apply.',
    );
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
