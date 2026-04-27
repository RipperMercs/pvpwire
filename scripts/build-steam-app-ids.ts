// Build-time generator for public/steam-app-ids.json.
// The Worker reads this list for two jobs:
//   - Section 22.3 Steam News aggregator (uses steam_app_id)
//   - Section 22.4 Integration A: Steam current-player counts (uses steam_app_id)
//   - Section 22.4 Integration B: IGDB enrichment (uses igdb_id)
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
const all = files.map((f) => {
  const raw = readFileSync(join(SRC, f), 'utf8');
  return matter(raw).data as any;
}).filter((fm: any) => fm.slug && fm.name && (fm.steam_app_id || fm.igdb_id))
  .map((fm: any) => ({
    slug: fm.slug,
    name: fm.name,
    steam_app_id: fm.steam_app_id ?? undefined,
    igdb_id: fm.igdb_id ?? undefined,
  }));

const payload = {
  games: all,
  count: all.length,
  with_steam: all.filter((g: any) => g.steam_app_id).length,
  with_igdb: all.filter((g: any) => g.igdb_id).length,
  generatedAt: new Date().toISOString(),
};

writeFileSync(OUT, JSON.stringify(payload, null, 2));
console.log(`Wrote ${OUT}: ${payload.with_steam} with steam_app_id, ${payload.with_igdb} with igdb_id.`);
