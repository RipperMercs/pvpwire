// Internal-link density audit per SEO.md Section 5.3.
// Walks the static export at /out/, extracts internal anchor hrefs, and
// reports:
//   - Pages with fewer than MIN_LINKS internal links (under-linked)
//   - Pages with more than MAX_LINKS internal links (potentially over-linked)
//   - Orphan pages (zero inbound links from any other generated page)
//   - Broken internal links (target page not in the build output)
//
// Run after `npm run build` so the static export exists.

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, 'out');
const MIN_LINKS = 3;
const MAX_LINKS = 100;

if (!existsSync(OUT_DIR)) {
  console.error('No /out directory. Run `npm run build` first.');
  process.exit(1);
}

function walkHtml(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...walkHtml(p));
    } else if (e.isFile() && e.name === 'index.html') {
      files.push(p);
    }
  }
  return files;
}

function pathToRoute(htmlPath) {
  // /out/games/marathon/index.html -> /games/marathon/
  const rel = relative(OUT_DIR, htmlPath).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  return '/' + rel.replace(/\/?index\.html$/, '/');
}

const htmlFiles = walkHtml(OUT_DIR);
console.log(`Auditing ${htmlFiles.length} pages.`);

const allRoutes = new Set(htmlFiles.map(pathToRoute));

// Also accept any non-HTML asset that exists in /out/ (rss.xml, llms.txt,
// sitemap.xml, etc.) so links to those files do not get flagged as broken.
function walkAllFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walkAllFiles(p));
    else if (e.isFile()) out.push(p);
  }
  return out;
}
const allFileUrls = new Set(
  walkAllFiles(OUT_DIR).map((p) => '/' + relative(OUT_DIR, p).replace(/\\/g, '/'))
);

const linkedFrom = new Map(); // route -> Set<source route>
const linksOut = new Map();   // route -> Array<target route>

for (const file of htmlFiles) {
  const route = pathToRoute(file);
  const html = readFileSync(file, 'utf8');
  const internal = [];
  // Match all <a href="..."> with internal targets (start with / and not //).
  const re = /<a\b[^>]*href=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const href = m[1];
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    if (href.startsWith('/api/') || href.startsWith('/_next/')) continue;
    // Strip hash and query; normalize trailing slash to /.
    const cleaned = href.split('#')[0].split('?')[0];
    if (!cleaned) continue;
    // Treat URLs ending in a file extension as file references (don't add slash).
    const looksLikeFile = /\.[a-z0-9]{2,5}$/i.test(cleaned);
    const normalized = looksLikeFile
      ? cleaned
      : cleaned.endsWith('/') || cleaned === '/'
        ? cleaned
        : cleaned + '/';
    internal.push(normalized);
    if (!linkedFrom.has(normalized)) linkedFrom.set(normalized, new Set());
    linkedFrom.get(normalized).add(route);
  }
  linksOut.set(route, internal);
}

const underLinked = [];
const overLinked = [];
const orphans = [];
const broken = [];

for (const [route, links] of linksOut) {
  const unique = new Set(links).size;
  if (unique < MIN_LINKS) underLinked.push({ route, count: unique });
  if (unique > MAX_LINKS) overLinked.push({ route, count: unique });
  for (const target of links) {
    if (!allRoutes.has(target) && !allFileUrls.has(target)) {
      broken.push({ from: route, to: target });
    }
  }
}

for (const route of allRoutes) {
  if (route === '/') continue; // home is always implicitly an entry point
  if (!linkedFrom.has(route) || linkedFrom.get(route).size === 0) {
    orphans.push(route);
  }
}

const uniqueBroken = Array.from(new Set(broken.map((b) => `${b.from} -> ${b.to}`))).map((s) => {
  const [from, to] = s.split(' -> ');
  return { from, to };
});

console.log('\n=== Internal-link audit ===');
console.log(`Pages: ${allRoutes.size}`);
console.log(`Under-linked (<${MIN_LINKS} unique internal links): ${underLinked.length}`);
console.log(`Over-linked (>${MAX_LINKS} unique): ${overLinked.length}`);
console.log(`Orphans (no inbound links): ${orphans.length}`);
console.log(`Broken internal links: ${uniqueBroken.length}`);

if (underLinked.length) {
  console.log('\n--- Under-linked pages (top 20) ---');
  for (const u of underLinked.slice(0, 20)) console.log(`  [${u.count}] ${u.route}`);
}
if (orphans.length) {
  console.log('\n--- Orphan pages (top 20) ---');
  for (const o of orphans.slice(0, 20)) console.log(`  ${o}`);
}
if (uniqueBroken.length) {
  console.log('\n--- Broken internal links (top 20) ---');
  for (const b of uniqueBroken.slice(0, 20)) console.log(`  ${b.from} -> ${b.to}`);
  console.log('\nFAIL: broken internal links present.');
  process.exit(1);
}

console.log('\nLink audit complete.');
