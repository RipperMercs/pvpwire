// Heading hierarchy audit per SEO.md Section 10.1.
// Walks the static export at /out/ and reports any page that:
//   - Has zero h1 tags
//   - Has more than one h1 tag
//   - Skips a heading level (e.g., h2 directly to h4)

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

function extractHeadings(html) {
  const re = /<h([1-6])\b/gi;
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    out.push(parseInt(m[1], 10));
  }
  return out;
}

const htmlFiles = walkHtml(OUT_DIR);
console.log(`Auditing ${htmlFiles.length} pages.`);

const issues = [];
for (const file of htmlFiles) {
  const route = pathToRoute(file);
  const html = readFileSync(file, 'utf8');
  const levels = extractHeadings(html);
  const h1Count = levels.filter((l) => l === 1).length;
  if (h1Count === 0) issues.push({ route, kind: 'no-h1' });
  else if (h1Count > 1) issues.push({ route, kind: 'multiple-h1', count: h1Count });

  // Skipped-level check: walk through and flag any jump greater than +1
  // versus the previous level.
  let prev = 0;
  for (const l of levels) {
    if (prev !== 0 && l > prev + 1) {
      issues.push({ route, kind: 'skipped-level', from: prev, to: l });
      break;
    }
    if (l < prev) prev = l;
    else prev = l;
  }
}

console.log(`\n=== Heading hierarchy audit ===`);
console.log(`Pages: ${htmlFiles.length}`);
console.log(`Issues: ${issues.length}`);
const noH1 = issues.filter((i) => i.kind === 'no-h1');
const multiH1 = issues.filter((i) => i.kind === 'multiple-h1');
const skipped = issues.filter((i) => i.kind === 'skipped-level');
console.log(`  no h1: ${noH1.length}`);
console.log(`  multiple h1: ${multiH1.length}`);
console.log(`  skipped levels: ${skipped.length}`);

if (noH1.length) {
  console.log('\n--- Pages with no h1 ---');
  for (const i of noH1.slice(0, 20)) console.log(`  ${i.route}`);
}
if (multiH1.length) {
  console.log('\n--- Pages with multiple h1 ---');
  for (const i of multiH1.slice(0, 20)) console.log(`  [${i.count}] ${i.route}`);
}
if (skipped.length) {
  console.log('\n--- Pages with skipped heading level ---');
  for (const i of skipped.slice(0, 20)) console.log(`  ${i.route}: jumps from h${i.from} to h${i.to}`);
}

if (multiH1.length || noH1.length) {
  console.log('\nFAIL: h1 issues present.');
  process.exit(1);
}

console.log('\nHeading audit complete.');
