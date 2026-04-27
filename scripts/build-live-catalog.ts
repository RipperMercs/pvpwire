// Build-time generator for public/live-catalog.json.
// The Worker live snapshot job reads this every 5 minutes to know which
// catalog games to fetch Steam concurrent counts for, and what editorial
// metadata (category, scene_status, activity_tier) to bake into each row
// of the /live table so the page renders without a separate catalog lookup.

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const SRC = join(ROOT, 'content', 'catalog');
const OUT = join(ROOT, 'public', 'live-catalog.json');

if (!existsSync(SRC)) {
  writeFileSync(OUT, JSON.stringify({ games: [], generatedAt: new Date().toISOString() }, null, 2));
  process.exit(0);
}

const files = readdirSync(SRC).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
const games = files
  .map((f) => matter(readFileSync(join(SRC, f), 'utf8')).data as any)
  .filter((fm: any) => fm.slug && fm.name)
  .map((fm: any) => ({
    slug: fm.slug,
    name: fm.name,
    category: fm.category,
    scene_status: fm.scene_status,
    activity_tier: fm.activity_tier,
    steam_app_id: fm.steam_app_id ?? undefined,
  }));

const payload = {
  games,
  count: games.length,
  with_steam: games.filter((g: any) => g.steam_app_id).length,
  generatedAt: new Date().toISOString(),
};

writeFileSync(OUT, JSON.stringify(payload, null, 2));
console.log(`Wrote ${OUT}: ${games.length} catalog games, ${payload.with_steam} with steam_app_id.`);
