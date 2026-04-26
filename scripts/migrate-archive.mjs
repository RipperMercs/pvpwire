// One-shot migration for PIVOT.md Step 2.
// Flattens content/legends/ and content/heritage/ into content/archive/
// keyed by slug, with `original_section` frontmatter added for provenance.
// After running, the source dirs are emptied; the caller removes them via git.

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync, rmdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const ARCHIVE = join(ROOT, 'content', 'archive');

if (!existsSync(ARCHIVE)) mkdirSync(ARCHIVE, { recursive: true });

function migrateDir(sectionName) {
  const src = join(ROOT, 'content', sectionName);
  if (!existsSync(src)) {
    console.log(`Source dir ${src} does not exist, skipping.`);
    return 0;
  }
  const files = readdirSync(src).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
  let moved = 0;
  for (const file of files) {
    const srcPath = join(src, file);
    const destPath = join(ARCHIVE, file);
    if (existsSync(destPath)) {
      console.error(`COLLISION: ${destPath} already exists. Aborting to avoid overwrite.`);
      process.exit(1);
    }
    const raw = readFileSync(srcPath, 'utf8');
    // Insert `original_section: <section>` immediately after the opening --- line.
    // Frontmatter format: ---\n...\n---\n
    const updated = raw.replace(/^---\n/, `---\noriginal_section: ${sectionName}\n`);
    writeFileSync(destPath, updated, 'utf8');
    unlinkSync(srcPath);
    moved += 1;
    console.log(`  moved ${sectionName}/${file} -> archive/${file}`);
  }
  // Try to remove the now-empty source dir
  try {
    rmdirSync(src);
    console.log(`  removed empty dir ${src}`);
  } catch (e) {
    console.warn(`  could not remove ${src}: ${e.message}`);
  }
  return moved;
}

const legendsCount = migrateDir('legends');
const heritageCount = migrateDir('heritage');

console.log(`\nLegends moved: ${legendsCount}`);
console.log(`Heritage moved: ${heritageCount}`);
console.log(`Total: ${legendsCount + heritageCount}`);
