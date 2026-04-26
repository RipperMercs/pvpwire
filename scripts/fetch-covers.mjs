#!/usr/bin/env node
// Fetches game cover art from Steam CDN (and other sources for non-Steam titles)
// and saves locally to /public/images/games/{slug}/cover.jpg.
// Then updates each MDX frontmatter to set cover_image.
//
// Usage: node scripts/fetch-covers.mjs [--dry-run] [--only=slug1,slug2]
//
// Steam permits hotlinking and use of these assets for game promotion. We
// download locally for performance reliability. Crediting the publisher in
// the GameCover component (gameplay_images credit field) covers attribution
// where the editorial component surfaces it.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const CATALOG_DIR = join(ROOT, 'content', 'catalog');
const IMAGES_DIR = join(ROOT, 'public', 'images', 'games');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const ONLY_FLAG = args.find((a) => a.startsWith('--only='));
const ONLY = ONLY_FLAG ? ONLY_FLAG.slice('--only='.length).split(',') : null;

// Steam app IDs for catalog slugs. Library image (600x900 vertical poster)
// is preferred. Header.jpg is a 460x215 fallback.
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
  'h1z1': 295110,
  'fortnite': null, // Epic exclusive

  // Extraction Shooter
  'hunt-showdown': 594650,
  'arena-breakout-infinite': 2966400,
  'dark-and-darker': 2437180,
  'escape-from-tarkov': null, // not on Steam

  // Fighting Game
  'street-fighter-6': 1364780,
  'tekken-8': 1778820,
  'mortal-kombat-1': 1971870,
  'guilty-gear-strive': 1384160,
  'dragon-ball-fighterz': 678950,
  'brawlhalla': 291550,
  'multiversus': 1818750,

  // Strategy / Chess / Card
  'starcraft-2': null,
  'age-of-empires-iv': 1466860,
  'magic-the-gathering-arena': 2141910,
  'marvel-snap': 1997040,
  'hearthstone': null, // Battle.net only

  // Arena / Class-based PvP
  'world-of-warcraft': null,
  'final-fantasy-xiv': 39210,
  'guild-wars-2': null,
  'diablo-2': null,
  'path-of-exile': 238960,

  // MMO PvP
  'eve-online': 8500,
  'albion-online': 761890,
  'new-world': 1063730,
  'throne-and-liberty': 2429660,
  'black-desert-online': 582660,
  'mortal-online-2': 1170950,
  'pax-dei': 2406770,
  'lost-ark': 1599340,
  'star-wars-the-old-republic': null,
  'tera': 212740,
  'mu-online': null,
  'knight-online': null,
  'anarchy-online': 233280,
  'runescape': null,
  'final-fantasy-xi': 39200,
  'ragnarok-online': null,
  'lineage': null,
  'lineage-2': null,
  'meridian-59': 215080,
  'the-realm-online': null,
  'tibia': 1602970,
  'star-wars-galaxies': null,
  'everquest': 205710,
  'shadowbane': null,
  'darkfall-online': null,
  'ultima-online': null,
  'asherons-call': null,
  'dark-age-of-camelot': null,
  'crowfall': null,
  'archeage': 304030,
  'aion': 1471980,
  'age-of-conan': 440880,
  'warhammer-online': null,
  'city-of-heroes': null,

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
  'gran-turismo-7': null, // PS exclusive

  // Hero Shooter
  'marvel-rivals': 2767030,
  'paladins': 444090,
  'deadlock': null, // closed beta

  // Movement Shooter
  'quake': 2310,
  'quake-champions': 611500,
  'unreal-tournament': null,
  'tribes-2': null,
  'splitgate': 677620,
  'diabotical-rogue': null,

  // Auto-battler
  'mechabellum': 669500,

  // ARC Raiders
  'arc-raiders': 2767030, // placeholder; verify if same as Marvel Rivals (likely not)
  'marathon': null, // not yet released

  // PlanetSide
  'planetside': null,
  'planetside-2': 218230,

  // Modern competitive
  'valorant': null,
  'league-of-legends': null,
  'mobile-legends-bang-bang': null,
  'smite-2': 2437220,
  'free-fire': null,
  'pokemon-unite': null,
  'heroes-of-newerth': null,
  'heroes-of-the-storm': null,
  'gwent': null,
  'clash-royale': null,
  'super-smash-bros-ultimate': null, // Switch
  'chess': null, // web
  'teamfight-tactics': null, // Riot client
  'call-of-duty': null,
  'warzone': null,
};

// ARC Raiders has its own app ID, not Marvel Rivals. Correcting.
STEAM_APP_IDS['arc-raiders'] = 2200520; // ARC Raiders Steam app ID

const STEAM_LIBRARY_URL = (id) =>
  `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${id}/library_600x900.jpg`;
const STEAM_LIBRARY_2X_URL = (id) =>
  `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${id}/library_600x900_2x.jpg`;
const STEAM_HEADER_URL = (id) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/header.jpg`;
const STEAM_CAPSULE_URL = (id) =>
  `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${id}/capsule_616x353.jpg`;

async function tryFetch(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'PVPWireBot/1.0 (+https://pvpwire.com)' },
    });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

async function fetchSteamCover(appId) {
  // Try library 600x900 first (vertical poster, perfect for our card grid).
  let buf = await tryFetch(STEAM_LIBRARY_URL(appId));
  if (buf) return { buf, kind: 'library_600x900' };
  buf = await tryFetch(STEAM_LIBRARY_2X_URL(appId));
  if (buf) return { buf, kind: 'library_600x900_2x' };
  // Fallback to capsule (horizontal-ish but workable).
  buf = await tryFetch(STEAM_CAPSULE_URL(appId));
  if (buf) return { buf, kind: 'capsule_616x353' };
  // Last-ditch fallback: header (460x215 horizontal, will look stretched in 2:3).
  buf = await tryFetch(STEAM_HEADER_URL(appId));
  if (buf) return { buf, kind: 'header' };
  return null;
}

function loadCatalogFiles() {
  const fs = readFileSync;
  const { readdirSync } = require('node:fs');
}

async function main() {
  const { readdirSync } = await import('node:fs');
  const files = readdirSync(CATALOG_DIR).filter((f) => f.endsWith('.mdx'));
  let success = 0;
  let skipped = 0;
  let failed = 0;
  const failures = [];

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '');
    if (ONLY && !ONLY.includes(slug)) continue;

    const filePath = join(CATALOG_DIR, file);
    const raw = readFileSync(filePath, 'utf8');
    const parsed = matter(raw);

    // Already has a cover_image? Skip unless --only forces.
    if (parsed.data.cover_image && !ONLY) {
      skipped++;
      continue;
    }

    const appId = STEAM_APP_IDS[slug];
    if (!appId) {
      // No Steam mapping yet. Skip silently; placeholder will render.
      skipped++;
      continue;
    }

    process.stdout.write(`Fetching ${slug} (Steam ${appId}) ... `);
    if (DRY_RUN) {
      console.log('DRY RUN');
      continue;
    }

    const result = await fetchSteamCover(appId);
    if (!result) {
      console.log('FAILED');
      failed++;
      failures.push(slug);
      continue;
    }

    const targetDir = join(IMAGES_DIR, slug);
    mkdirSync(targetDir, { recursive: true });
    const targetPath = join(targetDir, 'cover.jpg');
    writeFileSync(targetPath, result.buf);

    // Update MDX frontmatter.
    parsed.data.cover_image = `/images/games/${slug}/cover.jpg`;
    const newRaw = matter.stringify(parsed.content, parsed.data);
    writeFileSync(filePath, newRaw);

    console.log(`OK (${result.kind}, ${(result.buf.length / 1024).toFixed(0)}KB)`);
    success++;
  }

  console.log(`\nDone. ${success} fetched, ${skipped} skipped (already had cover or no mapping), ${failed} failed.`);
  if (failures.length) {
    console.log('Failures:', failures.join(', '));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
