// JSON-LD schema validation per SEO.md Section 4.3.
// Walks the static export, extracts every <script type="application/ld+json">
// block, parses each as JSON, and checks for required @context and @type.
// Reports parse errors and missing required fields.

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

const REQUIRED_BY_TYPE = {
  Organization: ['name', 'url'],
  WebSite: ['name', 'url'],
  BreadcrumbList: ['itemListElement'],
  CollectionPage: ['name', 'url'],
  VideoGame: ['name', 'description', 'image', 'url'],
  SportsOrganization: ['name', 'url'],
  SportsEvent: ['name', 'startDate', 'endDate'],
  NewsArticle: ['headline', 'datePublished', 'author', 'publisher'],
  Article: ['headline', 'datePublished', 'author', 'publisher'],
};

const htmlFiles = walkHtml(OUT_DIR);
console.log(`Validating JSON-LD across ${htmlFiles.length} pages.`);

let totalBlocks = 0;
let parseErrors = 0;
let missingFields = 0;
const issues = [];

for (const file of htmlFiles) {
  const route = pathToRoute(file);
  const html = readFileSync(file, 'utf8');
  const re = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    totalBlocks += 1;
    let data;
    try {
      data = JSON.parse(m[1]);
    } catch (e) {
      parseErrors += 1;
      issues.push({ route, kind: 'parse', error: String(e).slice(0, 120) });
      continue;
    }
    const type = data['@type'];
    if (!data['@context']) issues.push({ route, kind: 'missing-context', type });
    if (!type) {
      issues.push({ route, kind: 'missing-type' });
      continue;
    }
    const required = REQUIRED_BY_TYPE[type];
    if (required) {
      for (const f of required) {
        if (data[f] === undefined || data[f] === null || data[f] === '') {
          missingFields += 1;
          issues.push({ route, kind: 'missing-field', type, field: f });
        }
      }
    }
  }
}

console.log(`\n=== JSON-LD validation ===`);
console.log(`Total blocks: ${totalBlocks}`);
console.log(`Parse errors: ${parseErrors}`);
console.log(`Missing required fields: ${missingFields}`);

if (issues.length) {
  console.log('\n--- Issues (top 30) ---');
  for (const i of issues.slice(0, 30)) {
    if (i.kind === 'parse') console.log(`  PARSE  ${i.route}: ${i.error}`);
    else if (i.kind === 'missing-field') console.log(`  MISSING ${i.route} ${i.type}.${i.field}`);
    else console.log(`  ${i.kind.toUpperCase()} ${i.route}${i.type ? ' ' + i.type : ''}`);
  }
  if (parseErrors || missingFields) {
    console.log('\nFAIL: schema validation found issues.');
    process.exit(1);
  }
}

console.log('\nSchema validation complete.');
