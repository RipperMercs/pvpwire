// Build-time generator for public/pandascore-ids.json.
// The Worker (PIVOT.md Section 22.4 Integration C) reads this list to know
// which orgs and tournaments to mirror from PandaScore. Re-runs on every
// Next build.

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const ORGS_DIR = join(ROOT, 'content', 'esports-orgs');
const TOURNAMENTS_DIR = join(ROOT, 'content', 'tournaments');
const OUT = join(ROOT, 'public', 'pandascore-ids.json');

function readFrontmatters(dir: string): any[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((f) => matter(readFileSync(join(dir, f), 'utf8')).data as any);
}

const teams = readFrontmatters(ORGS_DIR)
  .filter((fm) => fm.slug && fm.name && typeof fm.pandascore_team_id === 'number')
  .map((fm) => ({
    slug: fm.slug,
    name: fm.name,
    pandascore_team_id: fm.pandascore_team_id,
  }));

const tournaments = readFrontmatters(TOURNAMENTS_DIR)
  .filter((fm) => fm.slug && fm.name && typeof fm.pandascore_tournament_id === 'number')
  .map((fm) => ({
    slug: fm.slug,
    name: fm.name,
    pandascore_tournament_id: fm.pandascore_tournament_id,
  }));

const payload = {
  teams,
  tournaments,
  team_count: teams.length,
  tournament_count: tournaments.length,
  generatedAt: new Date().toISOString(),
};

writeFileSync(OUT, JSON.stringify(payload, null, 2));
console.log(`Wrote ${OUT}: ${teams.length} teams, ${tournaments.length} tournaments with pandascore ids.`);
