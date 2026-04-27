// One-shot trim: cap each catalog entry's gameplay_images to 3 entries and
// delete the 04.jpg files from disk. Founder UI call: 4 shots leaves an
// orphan tile in the lg:grid-cols-3 gallery.

import { readdirSync, readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const SRC = join(ROOT, 'content', 'catalog');
const PUBLIC_GAMES_DIR = join(ROOT, 'public', 'images', 'games');

let trimmed = 0;
let deletedFiles = 0;
let skipped = 0;

const files = readdirSync(SRC).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));

for (const file of files) {
  const slug = file.replace(/\.mdx?$/, '');
  const path = join(SRC, file);
  const raw = readFileSync(path, 'utf8');

  const parsed = matter(raw);
  const fm = parsed.data;
  if (!Array.isArray(fm.gameplay_images) || fm.gameplay_images.length <= 3) {
    skipped += 1;
    continue;
  }

  // Trim frontmatter array. Hand-edit the YAML in raw to preserve formatting
  // rather than re-emitting via gray-matter (which can change quoting style).
  const fmEnd = raw.indexOf('\n---', 4);
  if (fmEnd < 0) {
    skipped += 1;
    continue;
  }
  const fmText = raw.slice(0, fmEnd);
  const body = raw.slice(fmEnd);

  // Match the gameplay_images: block and rebuild it with only the first 3
  // - src / credit pairs.
  const blockRe = /^(gameplay_images:\n)((?:[ \t]+-[^\n]*\n(?:[ \t]+[^-\n][^\n]*\n)*)+)/m;
  const m = fmText.match(blockRe);
  if (!m) {
    skipped += 1;
    continue;
  }

  // Split entries: each starts with "  - " at the entry-level indent.
  const entries = m[2].split(/(?=^[ \t]+- )/m).filter((e) => e.trim());
  if (entries.length <= 3) {
    skipped += 1;
    continue;
  }

  const trimmedBlock = m[1] + entries.slice(0, 3).join('');
  const updatedFm = fmText.replace(blockRe, trimmedBlock);
  writeFileSync(path, updatedFm + body, 'utf8');
  trimmed += 1;

  // Delete the 04.jpg file (and any 05+ if they ever exist).
  const shotsDir = join(PUBLIC_GAMES_DIR, slug, 'screenshots');
  for (let i = 4; i <= 10; i++) {
    const idx = String(i).padStart(2, '0');
    for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
      const p = join(shotsDir, `${idx}.${ext}`);
      if (existsSync(p)) {
        unlinkSync(p);
        deletedFiles += 1;
      }
    }
  }
}

console.log(`Trimmed ${trimmed} catalog entries to 3 screenshots, deleted ${deletedFiles} extra image files, skipped ${skipped}.`);
