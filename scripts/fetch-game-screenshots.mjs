// Fetch publisher-curated screenshots from the Steam Store API for every
// catalog game with a steam_app_id, write them to
// /public/images/games/{slug}/screenshots/, and populate the
// gameplay_images frontmatter array.
//
// Re-runnable: skips games that already have gameplay_images set.
//
// Editorial / legal note: Steam screenshots are publisher-curated for
// promotional use. Same fair-use framing as the LogoImg work in commit
// e62b8e6 and the trademark attribution in SiteFooter.

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const SRC = join(ROOT, 'content', 'catalog');
const PUBLIC_GAMES_DIR = join(ROOT, 'public', 'images', 'games');
const USER_AGENT = 'PVPWireBot/1.0 (https://pvpwire.com; tips@pvpwire.com)';

const STEAM_API = (appId) =>
  `https://store.steampowered.com/api/appdetails?appids=${appId}&filters=screenshots`;

// Tunable: how many screenshots per game to download. 3 keeps the gallery
// grid (lg:grid-cols-3) at one clean row on desktop with no orphan tile.
const PER_GAME = 3;
// Polite delay between Steam API hits.
const RATE_LIMIT_MS = 800;

function asStr(v) {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t || undefined;
}

async function fetchScreenshots(appId) {
  const res = await fetch(STEAM_API(appId), {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const entry = data?.[String(appId)];
  if (!entry?.success || !entry.data?.screenshots) return [];
  return entry.data.screenshots;
}

async function downloadOne(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'image/*' } });
  if (!res.ok) throw new Error(`download HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
}

function setFrontmatterGameplayImages(raw, entries) {
  // Replace existing gameplay_images block if present, otherwise insert
  // before the closing --- of the frontmatter.
  const lines = entries.map((e) => `  - src: "${e.src}"${e.credit ? `\n    credit: "${e.credit}"` : ''}`).join('\n');
  const block = `gameplay_images:\n${lines}`;

  const fmEnd = raw.indexOf('\n---', 4);
  if (fmEnd < 0) return raw; // malformed, skip

  const fm = raw.slice(0, fmEnd);
  const body = raw.slice(fmEnd);

  if (/^gameplay_images:/m.test(fm)) {
    // Replace existing block (lines starting with `gameplay_images:` until
    // the next top-level key or end of frontmatter).
    const re = /^gameplay_images:[\s\S]*?(?=^\S|\n---)/m;
    return fm.replace(re, block + '\n') + body;
  }

  return fm.trimEnd() + '\n' + block + body;
}

function getField(fm, key) {
  const re = new RegExp(`^${key}:\\s*(.+)$`, 'm');
  const m = fm.match(re);
  if (!m) return undefined;
  return m[1].trim().replace(/^['"]|['"]$/g, '');
}

async function processOne(slug) {
  const path = join(SRC, `${slug}.mdx`);
  if (!existsSync(path)) return { slug, status: 'no-file' };
  const raw = readFileSync(path, 'utf8');
  const parsed = matter(raw);
  const fm = parsed.data;

  if (!fm.steam_app_id) return { slug, status: 'no-app-id' };
  if (Array.isArray(fm.gameplay_images) && fm.gameplay_images.length > 0) {
    return { slug, status: 'has-screenshots-already' };
  }

  let shots;
  try {
    shots = await fetchScreenshots(fm.steam_app_id);
  } catch (e) {
    return { slug, status: 'api-failed', error: String(e) };
  }
  if (shots.length === 0) return { slug, status: 'no-shots-returned' };

  const subset = shots.slice(0, PER_GAME);
  const dir = join(PUBLIC_GAMES_DIR, slug, 'screenshots');
  mkdirSync(dir, { recursive: true });

  const entries = [];
  for (let i = 0; i < subset.length; i++) {
    const s = subset[i];
    const url = s.path_full || s.path_thumbnail;
    if (!url) continue;
    const idx = String(i + 1).padStart(2, '0');
    const dest = join(dir, `${idx}.jpg`);
    try {
      await downloadOne(url, dest);
      entries.push({
        src: `/images/games/${slug}/screenshots/${idx}.jpg`,
        credit: fm.developer || fm.publisher || 'Steam',
      });
    } catch (e) {
      console.warn(`    download failed for ${slug} shot ${idx}: ${e.message}`);
    }
  }

  if (entries.length === 0) return { slug, status: 'all-downloads-failed' };

  const updated = setFrontmatterGameplayImages(raw, entries);
  writeFileSync(path, updated, 'utf8');
  return { slug, status: 'ok', count: entries.length };
}

const files = readdirSync(SRC).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
const slugs = files.map((f) => f.replace(/\.mdx?$/, ''));

console.log(`Processing ${slugs.length} catalog files (only those with steam_app_id will run).`);

let ok = 0, skipped = 0, failed = 0, missing = 0;
for (const slug of slugs) {
  const result = await processOne(slug);
  switch (result.status) {
    case 'ok':
      ok += 1;
      console.log(`  ok                     ${slug} (${result.count} shots)`);
      await new Promise((r) => setTimeout(r, RATE_LIMIT_MS));
      break;
    case 'has-screenshots-already':
      skipped += 1;
      break;
    case 'no-app-id':
      missing += 1;
      break;
    case 'no-shots-returned':
    case 'no-file':
      missing += 1;
      console.log(`  ${result.status.padEnd(22)} ${slug}`);
      break;
    default:
      failed += 1;
      console.log(`  ${result.status.padEnd(22)} ${slug} ${result.error ?? ''}`);
      break;
  }
}

console.log(`\nDone. Populated ${ok}, skipped (already had screenshots) ${skipped}, no Steam ID ${missing}, failed ${failed}.`);
