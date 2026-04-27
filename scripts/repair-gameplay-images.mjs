// Regenerate gameplay_images frontmatter from disk for every game.
// Source of truth: actual files in /public/images/games/{slug}/screenshots/.
// Plain text manipulation; never invokes a YAML parser, so the script can
// repair files that gray-matter cannot read.

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'content', 'catalog');
const PUBLIC_GAMES_DIR = join(ROOT, 'public', 'images', 'games');

function getField(fmText, key) {
  const re = new RegExp(`^${key}:\\s*(.+)$`, 'm');
  const m = fmText.match(re);
  if (!m) return undefined;
  return m[1].trim().replace(/^['"]|['"]$/g, '');
}

let updated = 0;
let removed = 0;
let untouched = 0;

const files = readdirSync(SRC).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));

for (const file of files) {
  const slug = file.replace(/\.mdx?$/, '');
  const path = join(SRC, file);
  const raw = readFileSync(path, 'utf8');

  // Locate frontmatter end.
  const fmEndIdx = raw.indexOf('\n---', 4);
  if (fmEndIdx < 0) {
    untouched += 1;
    continue;
  }
  const fmText = raw.slice(0, fmEndIdx);
  const body = raw.slice(fmEndIdx);

  const developer = getField(fmText, 'developer');
  const publisher = getField(fmText, 'publisher');
  const credit = developer || publisher || 'Steam';

  // Strip any existing gameplay_images block. The block starts at the
  // gameplay_images: line and continues through every subsequent indented
  // line (lines starting with whitespace). Stops at the next top-level key
  // or the end of the frontmatter.
  const lines = fmText.split('\n');
  const out = [];
  let i = 0;
  let foundBlock = false;
  while (i < lines.length) {
    if (lines[i].startsWith('gameplay_images:')) {
      foundBlock = true;
      i += 1;
      // Skip continuation lines (start with whitespace) until we hit a
      // top-level key (no leading whitespace) or end of array.
      while (i < lines.length && /^\s/.test(lines[i])) {
        i += 1;
      }
      continue;
    }
    out.push(lines[i]);
    i += 1;
  }
  let cleanedFm = out.join('\n');

  // Discover screenshot files on disk.
  const shotsDir = join(PUBLIC_GAMES_DIR, slug, 'screenshots');
  let entries = [];
  if (existsSync(shotsDir)) {
    entries = readdirSync(shotsDir)
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      .sort()
      .map((f) => `/images/games/${slug}/screenshots/${f}`);
  }

  if (entries.length === 0) {
    if (foundBlock) {
      writeFileSync(path, cleanedFm + body, 'utf8');
      removed += 1;
    } else {
      untouched += 1;
    }
    continue;
  }

  const block = `gameplay_images:\n` + entries.map((src) => `  - src: "${src}"\n    credit: "${credit}"`).join('\n');
  const nextFm = cleanedFm.trimEnd() + '\n' + block;
  writeFileSync(path, nextFm + body, 'utf8');
  updated += 1;
}

console.log(`Repair complete. Updated ${updated}, removed empty blocks ${removed}, left untouched ${untouched}.`);
