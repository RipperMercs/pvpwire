// Backfill Steam app IDs onto catalog frontmatter (PIVOT.md Section 22.3 Step 6).
// Reads the comprehensive map below and writes `steam_app_id: N` to each
// catalog file's frontmatter where it is missing AND we have an ID.
// Re-runnable: skips files that already have steam_app_id set.

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'content', 'catalog');

const STEAM_APP_IDS = {
  // FPS / Tactical Shooter
  'counter-strike-2': 730,
  'rainbow-six-siege': 359550,
  'overwatch-2': 2357570,
  'team-fortress-2': 440,
  'squad': 393380,
  'hell-let-loose': 686810,
  'battlefield-2042': 1517290,

  // MOBA
  'dota-2': 570,

  // Battle Royale
  'apex-legends': 1172470,
  'pubg-battlegrounds': 578080,
  'naraka-bladepoint': 1203220,

  // Extraction Shooter
  'hunt-showdown': 594650,
  'arena-breakout-infinite': 2966400,
  'dark-and-darker': 2437180,

  // Fighting Game
  'street-fighter-6': 1364780,
  'tekken-8': 1778820,
  'mortal-kombat-1': 1971870,
  'guilty-gear-strive': 1384160,
  'dragon-ball-fighterz': 678950,
  'brawlhalla': 291550,
  'multiversus': 1818750,

  // Strategy / Card
  'age-of-empires-iv': 1466860,
  'magic-the-gathering-arena': 2141910,
  'marvel-snap': 1997040,

  // Arena / Class-based PvP
  'final-fantasy-xiv': 39210,
  'path-of-exile': 238960,
  'mordhau': 629760,
  'for-honor': 304390,
  'chivalry': 219640,
  'chivalry-2': 1824220,
  'stick-fight': 674940,

  // MMO PvP
  'eve-online': 8500,
  'albion-online': 761890,
  'new-world': 1063730,
  'throne-and-liberty': 2429660,
  'black-desert-online': 582660,
  'mortal-online-2': 1170950,
  'pax-dei': 2406770,
  'lost-ark': 1599340,
  'tera': 212740,
  'anarchy-online': 233280,
  'final-fantasy-xi': 39200,
  'meridian-59': 215080,
  'tibia': 1602970,
  'everquest': 205710,
  'archeage': 304030,
  'aion': 1471980,
  'age-of-conan': 440880,
  'realm-of-the-mad-god': 200210,
  'battlerite': 504370,
  'diablo-4': 2344520,
  'diablo-immortal': 2344740,

  // Sandbox / Open World PvP
  'rust': 252490,
  'gta-online': 271590,
  'dayz': 221100,
  'sea-of-thieves': 1172620,
  'conan-exiles': 440900,
  'foxhole': 505460,
  'wurm-online': 1179680,

  // Racing
  'rocket-league': 252950,
  'iracing': 266410,

  // Hero Shooter
  'marvel-rivals': 2767030,
  'paladins': 444090,

  // Movement Shooter
  'quake': 2310,
  'quake-champions': 611500,
  'splitgate': 677620,

  // Auto-battler
  'mechabellum': 669500,

  // Recently launched
  'arc-raiders': 2200520,
  'marathon': 2671250, // Bungie Marathon, live as of 2026

  // PlanetSide
  'planetside-2': 218230,

  // Modern
  'smite-2': 2437220,
};

let updated = 0;
let skipped = 0;
let unknown = 0;
const missing = [];

const files = readdirSync(SRC).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
for (const file of files) {
  const slug = file.replace(/\.mdx?$/, '');
  const path = join(SRC, file);
  const raw = readFileSync(path, 'utf8');

  if (/^steam_app_id:/m.test(raw)) {
    skipped += 1;
    continue;
  }

  const appId = STEAM_APP_IDS[slug];
  if (!appId) {
    unknown += 1;
    missing.push(slug);
    continue;
  }

  // Insert steam_app_id after the `status:` line (or last_updated if present).
  const insertAfter = /^(last_updated:\s*.+)$/m.test(raw) ? 'last_updated' : 'status';
  const re = new RegExp(`^(${insertAfter}:\\s*\\S.*)$`, 'm');
  if (!re.test(raw)) {
    console.warn(`  could not find insertion point in ${slug}`);
    unknown += 1;
    missing.push(slug);
    continue;
  }
  const updatedRaw = raw.replace(re, `$1\nsteam_app_id: ${appId}`);
  writeFileSync(path, updatedRaw, 'utf8');
  updated += 1;
}

console.log(`\nSteam app ID backfill complete.`);
console.log(`  Updated: ${updated}`);
console.log(`  Already had steam_app_id: ${skipped}`);
console.log(`  No app ID known (skipped): ${unknown}`);
if (missing.length > 0) {
  console.log(`  Missing IDs (Steam unavailable or not yet added):`);
  for (const m of missing) console.log(`    - ${m}`);
}
