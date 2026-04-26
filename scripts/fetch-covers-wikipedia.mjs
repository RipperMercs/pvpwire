#!/usr/bin/env node
// Wikipedia-sourced cover art fetcher.
// Uses the MediaWiki Pageimages API to retrieve the main image (typically
// the infobox box art) for each catalog slug that has no Steam cover yet.
//
// Wikipedia infobox box-art images for commercial games are usually marked
// non-free / fair-use on Wikipedia. We use them as editorial/promotional
// thumbnails for PVPWire, which falls within standard fair-use practice
// for game-coverage publications.
//
// Usage: node scripts/fetch-covers-wikipedia.mjs [--dry-run] [--only=slug1,slug2]

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const CATALOG_DIR = join(ROOT, 'content', 'catalog');
const IMAGES_DIR = join(ROOT, 'public', 'images', 'games');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const ONLY_FLAG = args.find((a) => a.startsWith('--only='));
const ONLY = ONLY_FLAG ? ONLY_FLAG.slice('--only='.length).split(',') : null;

// Slug to Wikipedia article title (used as ?titles= parameter, URL-encoded by API).
// Article titles use Wikipedia's exact casing and punctuation.
const WIKIPEDIA_TITLES = {
  // Old MMOs without Steam coverage
  'asherons-call': "Asheron's Call",
  'dark-age-of-camelot': 'Dark Age of Camelot',
  'darkfall-online': 'Darkfall (video game)',
  'ultima-online': 'Ultima Online',
  'shadowbane': 'Shadowbane',
  'lineage': 'Lineage (video game)',
  'lineage-2': 'Lineage II',
  'mu-online': 'Mu Online',
  'knight-online': 'Knight Online',
  'runescape': 'RuneScape',
  'ragnarok-online': 'Ragnarok Online',
  'meridian-59': 'Meridian 59',
  'the-realm-online': 'The Realm Online',
  'planetside': 'PlanetSide',
  'star-wars-galaxies': 'Star Wars Galaxies',
  'city-of-heroes': 'City of Heroes',
  'warhammer-online': 'Warhammer Online: Age of Reckoning',
  'crowfall': 'Crowfall',
  'star-wars-the-old-republic': 'Star Wars: The Old Republic',
  'world-of-warcraft': 'World of Warcraft',
  'starcraft-2': 'StarCraft II: Wings of Liberty',
  'guild-wars-2': 'Guild Wars 2',
  'tabula-rasa': 'Tabula Rasa (video game)',

  // Blizzard-published, no Steam
  'hearthstone': 'Hearthstone',
  'heroes-of-the-storm': 'Heroes of the Storm',
  'diablo-2': 'Diablo II',
  'warzone': 'Call of Duty: Warzone',

  // Riot, no Steam
  'league-of-legends': 'League of Legends',
  'valorant': 'Valorant',
  'teamfight-tactics': 'Teamfight Tactics',

  // CDPR
  'gwent': 'Gwent: The Witcher Card Game',

  // FPS / shooter not on Steam (Epic etc.)
  'fortnite': 'Fortnite Battle Royale',
  'call-of-duty': 'Call of Duty: Modern Warfare III (2023 video game)',
  'diabotical-rogue': 'Diabotical',
  'unreal-tournament': 'Unreal Tournament (1999 video game)',
  'tribes-2': 'Tribes 2',
  'escape-from-tarkov': 'Escape from Tarkov',
  'marathon': 'Marathon (2026 video game)',
  'deadlock': 'Deadlock (video game)',

  // Re-target after Steam misses
  'darkfall-online': 'Darkfall: Unholy Wars',
  'runescape': 'Old School RuneScape',
  'planetside': 'PlanetSide (video game)',
  'teamfight-tactics': 'Teamfight Tactics',
  'arc-raiders': 'ARC Raiders',
  'arena-breakout-infinite': 'Arena Breakout Infinite',
  'aion': 'Aion (video game)',
  'age-of-conan': 'Age of Conan',
  'dark-and-darker': 'Dark and Darker',
  'final-fantasy-xi': 'Final Fantasy XI',
  'smite-2': 'Smite 2',
  'tibia': 'Tibia (video game)',

  // Mobile only
  'mobile-legends-bang-bang': 'Mobile Legends: Bang Bang',
  'pokemon-unite': 'Pokémon Unite',
  'free-fire': 'Garena Free Fire',
  'clash-royale': 'Clash Royale',

  // Console / platform-exclusive
  'super-smash-bros-ultimate': 'Super Smash Bros. Ultimate',
  'gran-turismo-7': 'Gran Turismo 7',

  // MOBA not on Steam
  'heroes-of-newerth': 'Heroes of Newerth',

  // MMOs sunset / niche / not on Steam
  'anarchy-online': 'Anarchy Online',
};

async function fetchWikipediaImage(title) {
  // Try REST page/summary first (returns the infobox lead image for most articles).
  const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`;
  let res = await fetch(summaryUrl, {
    headers: {
      'User-Agent': 'PVPWireBot/1.0 (https://pvpwire.com; editorial coverage)',
      Accept: 'application/json',
    },
  });
  if (res.ok) {
    const data = await res.json();
    const orig = data?.originalimage?.source;
    const thumb = data?.thumbnail?.source;
    if (orig) return orig;
    if (thumb) return thumb;
  }
  // Fallback to the action API pageimages property.
  const params = new URLSearchParams({
    action: 'query',
    titles: title,
    prop: 'pageimages',
    pithumbsize: '900',
    format: 'json',
    formatversion: '2',
    redirects: '1',
  });
  const url = `https://en.wikipedia.org/w/api.php?${params}`;
  res = await fetch(url, {
    headers: { 'User-Agent': 'PVPWireBot/1.0 (https://pvpwire.com; editorial coverage)' },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const page = data?.query?.pages?.[0];
  const thumb = page?.thumbnail?.source;
  return thumb || null;
}

async function downloadImage(imageUrl) {
  const res = await fetch(imageUrl, {
    headers: { 'User-Agent': 'PVPWireBot/1.0 (https://pvpwire.com)' },
  });
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
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

    if (parsed.data.cover_image && !ONLY) {
      skipped++;
      continue;
    }

    const wikiTitle = WIKIPEDIA_TITLES[slug];
    if (!wikiTitle) {
      skipped++;
      continue;
    }

    process.stdout.write(`Fetching ${slug} (Wikipedia: ${wikiTitle}) ... `);
    if (DRY_RUN) {
      console.log('DRY RUN');
      continue;
    }

    let imageUrl;
    try {
      imageUrl = await fetchWikipediaImage(wikiTitle);
    } catch (e) {
      console.log(`FAILED (api error: ${e.message})`);
      failed++;
      failures.push(slug);
      continue;
    }

    if (!imageUrl) {
      console.log('FAILED (no pageimage)');
      failed++;
      failures.push(slug);
      continue;
    }

    const imgBuf = await downloadImage(imageUrl);
    if (!imgBuf) {
      console.log(`FAILED (download error)`);
      failed++;
      failures.push(slug);
      continue;
    }

    const targetDir = join(IMAGES_DIR, slug);
    mkdirSync(targetDir, { recursive: true });
    const targetPath = join(targetDir, 'cover.jpg');
    writeFileSync(targetPath, imgBuf);

    parsed.data.cover_image = `/images/games/${slug}/cover.jpg`;
    const newRaw = matter.stringify(parsed.content, parsed.data);
    writeFileSync(filePath, newRaw);

    console.log(`OK (${(imgBuf.length / 1024).toFixed(0)}KB)`);
    success++;

    // Be polite to Wikipedia: 250ms between requests.
    await new Promise((r) => setTimeout(r, 250));
  }

  console.log(`\nDone. ${success} fetched, ${skipped} skipped, ${failed} failed.`);
  if (failures.length) {
    console.log('Failures:', failures.join(', '));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
