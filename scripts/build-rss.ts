// Build-time RSS feed generators.
// Outputs: public/rss.xml, public/rss/news.xml, public/rss/legends.xml, public/rss/heritage.xml.
// Includes original news, legends, and heritage content. Aggregated news is served separately via the Worker.

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const CONTENT = join(ROOT, 'content');
const PUB = join(ROOT, 'public');
const BASE = 'https://pvpwire.com';

interface Item {
  title: string;
  url: string;
  description: string;
  author: string;
  publishedAt: string;
  kind: 'news' | 'legends' | 'heritage';
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function readKind(kind: 'news' | 'legends' | 'heritage'): Item[] {
  const dir = join(CONTENT, kind);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((f) => matter(readFileSync(join(dir, f), 'utf8')).data as any)
    .filter((fm) => fm.slug && fm.title)
    .map((fm) => ({
      title: fm.title,
      url: `${BASE}/${kind}/${fm.slug}/`,
      description: fm.description || '',
      author: fm.author || 'flosium',
      publishedAt: fm.published || new Date().toISOString(),
      kind,
    }));
}

function authorName(a: string): string {
  switch (a) {
    case 'editorial': return 'PVPWire Editorial';
    case 'ripper': return 'Ripper';
    case 'flosium': return 'Flosium';
    case 'og': return 'Og';
    case 'flipper': return 'Flipper';
    default: return a;
  }
}

function buildFeed(title: string, link: string, description: string, items: Item[]): string {
  const sorted = [...items].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const itemsXml = sorted.map((it) => `    <item>
      <title>${escapeXml(it.title)}</title>
      <link>${escapeXml(it.url)}</link>
      <description>${escapeXml(it.description)}</description>
      <author>${escapeXml(authorName(it.author))}</author>
      <pubDate>${new Date(it.publishedAt).toUTCString()}</pubDate>
      <guid isPermaLink="true">${escapeXml(it.url)}</guid>
      <category>${escapeXml(it.kind)}</category>
    </item>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(link)}</link>
    <description>${escapeXml(description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(link)}" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;
}

const news = readKind('news');
const legends = readKind('legends');
const heritage = readKind('heritage');
const all = [...news, ...legends, ...heritage];

mkdirSync(join(PUB, 'rss'), { recursive: true });

writeFileSync(
  join(PUB, 'rss.xml'),
  buildFeed('PVPWire (full feed)', `${BASE}/rss.xml`, 'PVPWire news and analysis. A Ripper project.', all)
);
writeFileSync(
  join(PUB, 'rss/news.xml'),
  buildFeed('PVPWire News', `${BASE}/rss/news.xml`, 'Original PVPWire news and analysis.', news)
);
writeFileSync(
  join(PUB, 'rss/legends.xml'),
  buildFeed('PVPWire Legends', `${BASE}/rss/legends.xml`, 'PVPWire Legends, the prestige editorial tier.', legends)
);
writeFileSync(
  join(PUB, 'rss/heritage.xml'),
  buildFeed('PVPWire Heritage', `${BASE}/rss/heritage.xml`, 'PVPWire Heritage, From the Old World.', heritage)
);

console.log(`RSS feeds built: ${all.length} total items (${news.length} news, ${legends.length} legends, ${heritage.length} heritage)`);
