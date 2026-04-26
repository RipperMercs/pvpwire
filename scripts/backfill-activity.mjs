// One-shot backfill for PIVOT.md Step 6.
// Adds `activity_tier` to every catalog frontmatter that does not already have it.
// Derivation rules:
//   status === 'upcoming'                              -> 'upcoming'
//   status === 'sunset'                                -> 'dormant'
//   status === 'active' && release_year >= 2022        -> 'live'
//   status === 'active' && release_year >= 2015        -> 'casual'
//   status === 'active' && release_year < 2015         -> 'fading'
//   status === 'classic'                               -> 'fading'
//
// Inserts the new field after the `status:` line so the YAML stays readable.
// Skips any file that already has activity_tier.

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'content', 'catalog');

function deriveTier(status, releaseYear) {
  if (status === 'upcoming') return 'upcoming';
  if (status === 'sunset') return 'dormant';
  if (status === 'active') {
    if (releaseYear >= 2022) return 'live';
    if (releaseYear >= 2015) return 'casual';
    return 'fading';
  }
  if (status === 'classic') return 'fading';
  return 'fading';
}

function parseSimpleField(text, key) {
  const re = new RegExp(`^${key}:\\s*(.+)$`, 'm');
  const m = text.match(re);
  if (!m) return null;
  return m[1].trim().replace(/^['"]|['"]$/g, '');
}

const files = readdirSync(SRC).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
let updated = 0;
let skipped = 0;
let missing = 0;

for (const file of files) {
  const path = join(SRC, file);
  const raw = readFileSync(path, 'utf8');

  if (/^activity_tier:/m.test(raw)) {
    skipped += 1;
    continue;
  }

  const status = parseSimpleField(raw, 'status');
  const releaseYearRaw = parseSimpleField(raw, 'release_year');
  if (!status || !releaseYearRaw) {
    console.warn(`  skip ${file}: missing status or release_year`);
    missing += 1;
    continue;
  }
  const releaseYear = parseInt(releaseYearRaw, 10);
  const tier = deriveTier(status, releaseYear);

  // Insert activity_tier directly after the status: line.
  const re = /^(status:\s*\S.*)$/m;
  const updatedRaw = raw.replace(re, `$1\nactivity_tier: ${tier}`);
  if (updatedRaw === raw) {
    console.warn(`  skip ${file}: could not find status line for insertion`);
    missing += 1;
    continue;
  }

  writeFileSync(path, updatedRaw, 'utf8');
  updated += 1;
}

console.log(`Backfill complete. Updated ${updated}, already had field ${skipped}, could not process ${missing}.`);
