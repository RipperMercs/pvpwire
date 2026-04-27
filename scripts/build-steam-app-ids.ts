// Build-time generator for public/steam-app-ids.json.
// The Worker /api/news Steam aggregator (PIVOT.md Section 22.3) reads this
// list to know which catalog games to query the Steam News API for.
// Re-runs on every Next build.

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const SRC = join(ROOT, 'content', 'catalog');
const OUT = join(ROOT, 'public', 'steam-app-ids.json');

if (!existsSync(SRC)) {
  console.log('No content/catalog/ directory; writing empty array.');
  writeFileSync(OUT, JSON.stringify({ games: [], generatedAt: new Date().toISOString() }, null, 2));
  process.exit(0);
}

const files = readdirSync(SRC).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
const games = files.map((f) => {
  const raw = readFileSync(join(SRC, f), 'utf8');
  const fm = matter(raw).data as any;
  return fm;
}).filter((fm: any) => fm.slug && fm.name && fm.steam_app_id)
  .map((fm: any) => ({
    slug: fm.slug,
    name: fm.name,
    steam_app_id: fm.steam_app_id,
  }));

const payload = {
  games,
  count: games.length,
  generatedAt: new Date().toISOString(),
};

writeFileSync(OUT, JSON.stringify(payload, null, 2));
console.log(`Wrote ${OUT} with ${games.length} games that have steam_app_id set.`);
