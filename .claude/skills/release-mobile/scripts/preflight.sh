#!/usr/bin/env bash
# Read-only preflight for a Dodokids mobile release. One line per check:
#   [PASS]  fine    [WARN]  read before continuing    [BLOCK] fix first
# Exits 1 when any BLOCK fired. Runs on macOS bash 3.2.
#
#   bash preflight.sh [all|android|ios]    (default: all)
#   SKIP_TESTS=1 bash preflight.sh          skip lint/tsc/contract tests
#
# The permission baselines are what the shipped app is known to declare. When a
# release adds one on purpose, update the store declarations first (SKILL.md,
# "Quyền mới"), then add it here.

set -o pipefail

PLATFORM="${1:-all}"
case "$PLATFORM" in
  all | android | ios) ;;
  *) echo "usage: preflight.sh [all|android|ios]" >&2; exit 2 ;;
esac

ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
MOBILE="$ROOT/mobile"
PROD_API="https://api.dodokids.vn"
ASC_APP_ID="6811548180"
APPLE_TEAM_ID="T9SMHB8ZL3"
ANDROID_BASELINE="android.permission.INTERNET android.permission.VIBRATE com.android.vending.BILLING"
IOS_BASELINE="NSLocalNetworkUsageDescription NSMicrophoneUsageDescription"
LOG_DIR="${TMPDIR:-/tmp}/dodokids-preflight"
mkdir -p "$LOG_DIR"

BLOCKS=0
pass() { printf '[PASS]  %s\n' "$*"; }
warn() { printf '[WARN]  %s\n' "$*"; }
block() { printf '[BLOCK] %s\n' "$*"; BLOCKS=$((BLOCKS + 1)); }
indent() { sed 's/^/        /'; }
wants() { [ "$PLATFORM" = all ] || [ "$PLATFORM" = "$1" ]; }
# Runs a node check script from stdin; its [BLOCK] lines count toward BLOCKS.
node_checks() {
  local out
  out="$(node - "$@")"
  [ -n "$out" ] && echo "$out"
  BLOCKS=$((BLOCKS + $(grep -c '^\[BLOCK\]' <<<"$out")))
}

echo "== git (mobile/ is its own repo)"
branch="$(git -C "$MOBILE" branch --show-current)"
if [ "$branch" = main ]; then pass "on main"; else warn "on '$branch', not main"; fi
dirty="$(git -C "$MOBILE" status --porcelain)"
if [ -z "$dirty" ]; then
  pass "working tree clean"
else
  block "uncommitted changes: EAS uploads the working tree, so these would ship"
  echo "$dirty" | head -20 | indent
fi
if git -C "$MOBILE" fetch -q origin 2>/dev/null; then
  counts="$(git -C "$MOBILE" rev-list --left-right --count "origin/$branch...HEAD" 2>/dev/null)"
  behind="${counts%%[[:space:]]*}"
  ahead="${counts##*[[:space:]]}"
  if [ -z "$counts" ]; then
    warn "no origin/$branch to compare with"
  elif [ "$behind" = 0 ]; then
    pass "up to date with origin/$branch (ahead $ahead)"
  else
    warn "behind origin/$branch by $behind commit(s): pull before building?"
  fi
else
  warn "git fetch failed (offline?), cannot compare with origin"
fi
echo "        HEAD $(git -C "$MOBILE" log -1 --format='%h %s')"

echo "== EAS"
EAS_OK=0
if ! command -v eas >/dev/null 2>&1; then
  block "eas-cli not installed (npm i -g eas-cli)"
else
  who="$(cd "$MOBILE" && eas whoami 2>&1)"
  rc=$?
  if [ $rc -ne 0 ] || grep -qi 'not logged in' <<<"$who"; then
    block "not logged in: the user runs 'eas login' in their own terminal (references/first-time-setup.md)"
  else
    EAS_OK=1
    # Skip eas-cli's "new version available" banner before the username.
    user="$(grep -v -e 'eas-cli@' -e 'To upgrade' -e 'npm install -g' -e 'Proceeding with outdated' <<<"$who" | sed '/^[[:space:]]*$/d' | head -1)"
    pass "logged in as $user"
  fi
fi

echo "== config (eas.json, app.json)"
node_checks "$MOBILE" "$PLATFORM" "$ROOT" "$PROD_API" "$ASC_APP_ID" "$APPLE_TEAM_ID" <<'NODE'
const [mobile, platform, root, prodApi, ascAppId, teamId] = process.argv.slice(2);
const fs = require('fs');
const eas = JSON.parse(fs.readFileSync(`${mobile}/eas.json`, 'utf8'));
const app = JSON.parse(fs.readFileSync(`${mobile}/app.json`, 'utf8')).expo;
const wants = (p) => platform === 'all' || platform === p;
const line = (tag, msg) => console.log(`${tag.padEnd(7)} ${msg}`);
const check = (ok, good, bad, level = '[BLOCK]') => line(ok ? '[PASS]' : level, ok ? good : bad);
const prod = eas.build?.production ?? {};

check(/^\d+\.\d+\.\d+$/.test(app.version ?? ''), `expo.version ${app.version}`, `expo.version "${app.version}" is not x.y.z`);
check(eas.cli?.appVersionSource === 'remote', 'appVersionSource remote (EAS owns versionCode/buildNumber)',
  `cli.appVersionSource is "${eas.cli?.appVersionSource}", expected "remote"`);
check(prod.autoIncrement === true, 'production autoIncrement on', 'build.production.autoIncrement must be true');
check(prod.env?.KIDO_API_URL === prodApi, `production KIDO_API_URL ${prodApi}`,
  `build.production.env.KIDO_API_URL is "${prod.env?.KIDO_API_URL}", expected ${prodApi}`);
check(!prod.developmentClient && (prod.distribution ?? 'store') === 'store', 'production is a store build',
  'build.production has developmentClient or a non-store distribution');
if (app.android?.versionCode || app.ios?.buildNumber) {
  line('[WARN]', 'app.json sets versionCode/buildNumber: ignored with the remote version source, remove it');
}

if (wants('android')) {
  const submit = eas.submit?.production?.android ?? {};
  check(app.android?.package === 'com.dodokids.app', 'android package com.dodokids.app', `android.package is ${app.android?.package}`);
  check(prod.android?.buildType === 'app-bundle', 'android buildType app-bundle',
    `build.production.android.buildType is "${prod.android?.buildType}"`);
  const track = submit.track ?? 'internal';
  const status = submit.releaseStatus ? `, releaseStatus ${submit.releaseStatus}` : '';
  line(track === 'internal' ? '[PASS]' : '[WARN]', `android submit track ${track}${status}`);
}

if (wants('ios')) {
  const submit = eas.submit?.production?.ios ?? {};
  check(app.ios?.bundleIdentifier === 'com.dodokids.app', 'ios bundle com.dodokids.app', `ios.bundleIdentifier is ${app.ios?.bundleIdentifier}`);
  check(submit.ascAppId === ascAppId, `ios submit ascAppId ${ascAppId}`,
    `submit.production.ios.ascAppId is ${submit.ascAppId ?? 'missing'}, expected "${ascAppId}"`);
  check(submit.appleTeamId === teamId, `ios submit appleTeamId ${teamId}`,
    `submit.production.ios.appleTeamId is ${submit.appleTeamId ?? 'missing'}, expected "${teamId}"`);
  check(app.ios?.config?.usesNonExemptEncryption === false, 'usesNonExemptEncryption false',
    'ios.config.usesNonExemptEncryption is not false: every upload waits on export compliance', '[WARN]');
  check(app.ios?.supportsTablet === true, 'supportsTablet true',
    'ios.supportsTablet is not true: turning iPad off after a release cuts updates for iPad users', '[WARN]');
  const envPath = `${root}/kido-server/.env`;
  const serverId = fs.existsSync(envPath)
    ? (fs.readFileSync(envPath, 'utf8').match(/^APPLE_APP_APPLE_ID=['"]?(\d*)/m) ?? [])[1] ?? ''
    : 'n/a';
  if (serverId === ascAppId) line('[PASS]', 'kido-server/.env APPLE_APP_APPLE_ID matches ascAppId');
  else line('[WARN]', `kido-server/.env APPLE_APP_APPLE_ID is "${serverId}" here; the PRODUCTION server env must be ${ascAppId} or every production JWS verify fails`);
}
NODE

echo "== permissions (config level; libraries add more at merge time, check the AAB for the full list)"
intro_file="$LOG_DIR/introspect.json"
if (cd "$MOBILE" && KIDO_API_URL="$PROD_API" npx expo config --type introspect --json >"$intro_file" 2>"$LOG_DIR/introspect.err"); then
  node_checks "$intro_file" "$PLATFORM" "$PROD_API" "$ANDROID_BASELINE" "$IOS_BASELINE" <<'NODE'
const [file, platform, prodApi, androidBase, iosBase] = process.argv.slice(2);
const config = JSON.parse(require('fs').readFileSync(file, 'utf8'));
const line = (tag, msg) => console.log(`${tag.padEnd(7)} ${msg}`);
const wants = (p) => platform === 'all' || platform === p;
const mods = config._internal?.modResults ?? {};

if (config.extra?.apiUrl === prodApi) line('[PASS]', `embedded apiUrl ${prodApi}`);
else line('[BLOCK]', `embedded apiUrl is "${config.extra?.apiUrl}", expected ${prodApi}`);

if (wants('android')) {
  const perms = (mods.android?.manifest?.manifest?.['uses-permission'] ?? [])
    .filter((p) => p.$['tools:node'] !== 'remove')
    .map((p) => p.$['android:name']);
  const extra = perms.filter((p) => !androidBase.split(' ').includes(p));
  if (extra.length) line('[WARN]', `new Android permission(s): ${extra.join(', ')}. Update Data safety + GOOGLE_PLAY_GOLIVE_CHECKLIST §2.5 (RECORD_AUDIO: §2.4b) before shipping`);
  else line('[PASS]', `Android permissions match baseline (${perms.join(', ')})`);
}
if (wants('ios')) {
  const keys = Object.keys(mods.ios?.infoPlist ?? {}).filter((k) => k.endsWith('UsageDescription'));
  const extra = keys.filter((k) => !iosBase.split(' ').includes(k));
  if (extra.length) line('[WARN]', `new iOS usage description(s): ${extra.join(', ')}. Update App Privacy + APPLE_APP_STORE_GOLIVE_CHECKLIST before shipping`);
  else line('[PASS]', `iOS usage descriptions match baseline (${keys.join(', ') || 'none'})`);
}
NODE
else
  block "expo config introspection failed: see $LOG_DIR/introspect.err"
fi

echo "== production API"
code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$PROD_API/health")"
if [ "$code" = 200 ]; then
  pass "$PROD_API/health 200"
else
  warn "$PROD_API/health returned $code: the build still works, smoke tests will not"
fi

echo "== quality gates (mobile)"
if [ "${SKIP_TESTS:-0}" = 1 ]; then
  warn "skipped (SKIP_TESTS=1)"
else
  gate() {
    local name="$1"
    shift
    if (cd "$MOBILE" && "$@") >"$LOG_DIR/$name.log" 2>&1; then pass "$name"; else block "$name failed: $LOG_DIR/$name.log"; fi
  }
  gate lint npm run -s lint
  gate tsc npx tsc --noEmit
  scripts="$(node -e 'console.log(Object.keys(require(process.argv[1]).scripts).filter((k) => k.startsWith("test:")).join(" "))' "$MOBILE/package.json")"
  failed=""
  total=0
  for s in $scripts; do
    total=$((total + 1))
    (cd "$MOBILE" && npm run -s "$s") >"$LOG_DIR/$s.log" 2>&1 || failed="$failed $s"
  done
  if [ -z "$failed" ]; then pass "contract tests ($total scripts)"; else block "contract tests failed:$failed (logs in $LOG_DIR)"; fi
fi

echo "== remote build numbers (EAS, production)"
if [ "$EAS_OK" = 1 ]; then
  for p in android ios; do
    wants "$p" || continue
    if v="$(cd "$MOBILE" && eas build:version:get -p "$p" -e production --json 2>/dev/null)"; then
      v="$(tr -d '\n ' <<<"$v")"
      if [ "$v" = "{}" ]; then pass "$p: no remote version yet (the first build initializes it)"; else pass "$p $v"; fi
    else
      warn "$p: could not read the remote version"
    fi
  done
else
  warn "skipped: not logged in to EAS"
fi

echo
if [ "$BLOCKS" -gt 0 ]; then
  echo "PREFLIGHT: $BLOCKS blocker(s)."
  exit 1
fi
echo "PREFLIGHT: no blockers."
