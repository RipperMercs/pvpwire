// URL convention audit per SEO.md Section 12.
// Walks the static export and reports any page URL that:
//   - Contains uppercase characters
//   - Contains underscores instead of hyphens
//   - Has a trailing-slash inconsistency vs the project convention (always /)
//   - Has a path segment longer than 60 characters

import { readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, 'out');

if (!existsSync(OUT_DIR)) {
  console.error('No /out directory. Run `npm run build` first.');
  process.exit(1);
}

function walkHtml(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) files.push(...walkHtml(p));
    else if (e.isFile() && e.name === 'index.html') files.push(p);
  }
  return files;
}

function pathToRoute(htmlPath) {
  const rel = relative(OUT_DIR, htmlPath).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  return '/' + rel.replace(/\/?index\.html$/, '/');
}

const htmlFiles = walkHtml(OUT_DIR);
console.log(`Auditing ${htmlFiles.length} URL routes.`);

const issues = [];
for (const file of htmlFiles) {
  const route = pathToRoute(file);
  if (/[A-Z]/.test(route)) issues.push({ route, kind: 'uppercase' });
  if (/_/.test(route)) issues.push({ route, kind: 'underscore' });
  if (route !== '/' && !route.endsWith('/')) issues.push({ route, kind: 'no-trailing-slash' });
  for (const segment of route.split('/').filter(Boolean)) {
    if (segment.length > 60) issues.push({ route, kind: 'segment-too-long', segment });
  }
}

console.log(`\n=== URL audit ===`);
console.log(`Pages: ${htmlFiles.length}`);
console.log(`Issues: ${issues.length}`);
if (issues.length) {
  console.log('\n--- Issues (top 30) ---');
  for (const i of issues.slice(0, 30)) console.log(`  ${i.kind} ${i.route}${i.segment ? ' (' + i.segment + ')' : ''}`);
  process.exit(1);
}

console.log('\nURL audit complete.');
