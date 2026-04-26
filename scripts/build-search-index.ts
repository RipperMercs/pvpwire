// Builds a client-loadable search index across catalog and guilds.
// Output: src/data/search-index.json (loaded by /guilds search and Catalog UI).
// Runs at prebuild via package.json `prebuild` script.

import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const CONTENT = join(ROOT, 'content');
const OUT = join(ROOT, 'src', 'data');

interface IndexedItem {
  kind: 'game' | 'guild' | 'article' | 'legend' | 'heritage';
  slug: string;
  title: string;
  description?: string;
  category?: string;
  era?: string;
  aliases?: string[];
  tags?: string[];
  url: string;
}

function readDir(kind: string): string[] {
  const dir = join(CONTENT, kind);
  if (!existsSync(dir)) return [];
  try {
    return readdirSync(dir)
      .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
      .map((f) => join(dir, f));
  } catch {
    return [];
  }
}

function buildIndex(): IndexedItem[] {
  const items: IndexedItem[] = [];

  for (const f of readDir('catalog')) {
    const fm = matter(readFileSync(f, 'utf8')).data as any;
    if (!fm.slug) continue;
    items.push({
      kind: 'game',
      slug: fm.slug,
      title: fm.name,
      description: fm.description_short,
      category: fm.category,
      aliases: fm.aliases,
      tags: fm.sub_categories,
      url: `/catalog/${fm.slug}/`,
    });
  }

  for (const f of readDir('guilds')) {
    const fm = matter(readFileSync(f, 'utf8')).data as any;
    if (!fm.slug) continue;
    items.push({
      kind: 'guild',
      slug: fm.slug,
      title: fm.name,
      era: fm.era,
      aliases: fm.aliases,
      url: `/guilds/${fm.slug}/`,
    });
  }

  for (const f of readDir('news')) {
    const fm = matter(readFileSync(f, 'utf8')).data as any;
    if (!fm.slug) continue;
    items.push({
      kind: 'article',
      slug: fm.slug,
      title: fm.title,
      description: fm.description,
      category: fm.category,
      tags: fm.tags,
      url: `/news/${fm.slug}/`,
    });
  }

  for (const f of readDir('legends')) {
    const fm = matter(readFileSync(f, 'utf8')).data as any;
    if (!fm.slug) continue;
    items.push({
      kind: 'legend',
      slug: fm.slug,
      title: fm.title,
      description: fm.description,
      era: fm.era,
      url: `/legends/${fm.slug}/`,
    });
  }

  for (const f of readDir('heritage')) {
    const fm = matter(readFileSync(f, 'utf8')).data as any;
    if (!fm.slug) continue;
    items.push({
      kind: 'heritage',
      slug: fm.slug,
      title: fm.title,
      description: fm.description,
      url: `/heritage/${fm.slug}/`,
    });
  }

  return items;
}

const index = buildIndex();
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'search-index.json'), JSON.stringify(index, null, 0), 'utf8');
console.log(`search index built: ${index.length} items`);
