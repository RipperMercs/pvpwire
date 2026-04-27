// Copy build-time JSON indexes from public/ into worker/src/data/.
// The Worker imports these as bundled assets so it does not depend on a
// publicly reachable Pages site. Run before `wrangler deploy` whenever
// catalog content changes; package.json's worker:deploy script handles
// this automatically.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, 'public');
const DST_DIR = join(ROOT, 'worker', 'src', 'data');

const FILES = [
  'live-catalog.json',
  'steam-app-ids.json',
  'pandascore-ids.json',
  'tournaments.json',
];

if (!existsSync(DST_DIR)) mkdirSync(DST_DIR, { recursive: true });

let copied = 0;
for (const f of FILES) {
  const srcPath = join(SRC_DIR, f);
  if (!existsSync(srcPath)) {
    console.warn(`Skipping ${f}: not found in public/. Run prebuild first.`);
    continue;
  }
  const content = readFileSync(srcPath, 'utf8');
  writeFileSync(join(DST_DIR, f), content);
  copied++;
}

console.log(`Synced ${copied}/${FILES.length} JSON indexes into worker/src/data/.`);
