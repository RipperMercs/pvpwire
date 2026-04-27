// Per-page metadata audit per SEO.md Section 13.1.
// Walks the static export and reports any page missing title, meta
// description, og:image, or canonical. Flags duplicates across pages.

import { readdirSync, readFileSync, existsSync } from 'node:fs';
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

function pluck(html, re) {
  const m = html.match(re);
  return m ? m[1].trim() : '';
}

const htmlFiles = walkHtml(OUT_DIR);
console.log(`Auditing meta on ${htmlFiles.length} pages.`);

const titlesSeen = new Map();
const descsSeen = new Map();
const issues = [];

for (const file of htmlFiles) {
  const route = pathToRoute(file);
  const html = readFileSync(file, 'utf8');

  const title = pluck(html, /<title>([^<]+)<\/title>/i);
  const description = pluck(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const ogImage = pluck(html, /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  const canonical = pluck(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);

  if (!title) issues.push({ route, kind: 'no-title' });
  if (!description) issues.push({ route, kind: 'no-description' });
  if (!ogImage) issues.push({ route, kind: 'no-og-image' });
  if (!canonical) issues.push({ route, kind: 'no-canonical' });

  if (title) {
    if (!titlesSeen.has(title)) titlesSeen.set(title, []);
    titlesSeen.get(title).push(route);
  }
  if (description) {
    if (!descsSeen.has(description)) descsSeen.set(description, []);
    descsSeen.get(description).push(route);
  }
}

const dupTitles = Array.from(titlesSeen.entries()).filter(([, routes]) => routes.length > 1);
const dupDescs = Array.from(descsSeen.entries()).filter(([, routes]) => routes.length > 1);

console.log(`\n=== Meta audit ===`);
console.log(`Pages: ${htmlFiles.length}`);
console.log(`Issues: ${issues.length}`);
console.log(`Duplicate titles: ${dupTitles.length}`);
console.log(`Duplicate descriptions: ${dupDescs.length}`);

if (issues.length) {
  console.log('\n--- Missing fields (top 30) ---');
  for (const i of issues.slice(0, 30)) console.log(`  ${i.kind} ${i.route}`);
}
if (dupTitles.length) {
  console.log('\n--- Duplicate titles (top 10) ---');
  for (const [t, routes] of dupTitles.slice(0, 10)) {
    console.log(`  "${t.slice(0, 60)}" used on ${routes.length} pages`);
    for (const r of routes.slice(0, 4)) console.log(`    - ${r}`);
  }
}
if (dupDescs.length) {
  console.log('\n--- Duplicate descriptions (top 10) ---');
  for (const [d, routes] of dupDescs.slice(0, 10)) {
    console.log(`  "${d.slice(0, 60)}..." used on ${routes.length} pages`);
    for (const r of routes.slice(0, 4)) console.log(`    - ${r}`);
  }
}

if (issues.length) {
  console.log('\nFAIL: missing meta fields present.');
  process.exit(1);
}

console.log('\nMeta audit complete.');
