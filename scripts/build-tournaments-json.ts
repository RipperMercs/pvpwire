// Build-time generator for public/tournaments.json.
// The Worker /api/tournaments endpoint fetches this static asset and caches it
// in KV. Re-runs on every Next build.

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const SRC = join(ROOT, 'content', 'tournaments');
const OUT = join(ROOT, 'public', 'tournaments.json');

if (!existsSync(SRC)) {
  console.log('No content/tournaments/ directory; writing empty array.');
  writeFileSync(OUT, JSON.stringify({ tournaments: [], generatedAt: new Date().toISOString() }, null, 2));
  process.exit(0);
}

const files = readdirSync(SRC).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
const tournaments = files.map((f) => {
  const raw = readFileSync(join(SRC, f), 'utf8');
  const parsed = matter(raw);
  return parsed.data;
}).filter((fm: any) => fm.slug && fm.name)
  .sort((a: any, b: any) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());

const payload = {
  tournaments,
  count: tournaments.length,
  generatedAt: new Date().toISOString(),
};

writeFileSync(OUT, JSON.stringify(payload, null, 2));
console.log(`Wrote ${OUT} with ${tournaments.length} tournaments.`);
