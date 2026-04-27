// Build-time RSS feed generators (v2 pivot, post Step 9).
// Outputs:
//   public/rss.xml          full feed: news + tournaments
//   public/rss/news.xml     original PVPWire news only
//   public/rss/esports.xml  tournament calendar entries
//
// The legacy /rss/legends.xml and /rss/heritage.xml feeds are retired in v2.
// If old files exist on disk from previous builds, this script removes them.

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'node:fs';
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
  kind: 'news' | 'esports';
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function readNews(): Item[] {
  const dir = join(CONTENT, 'news');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((f) => matter(readFileSync(join(dir, f), 'utf8')).data as any)
    .filter((fm) => fm.slug && fm.title)
    .map((fm) => ({
      title: fm.title,
      url: `${BASE}/news/${fm.slug}/`,
      description: fm.description || '',
      author: fm.author || 'editorial',
      publishedAt: fm.published || new Date().toISOString(),
      kind: 'news' as const,
    }));
}

function readTournaments(): Item[] {
  const dir = join(CONTENT, 'tournaments');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((f) => matter(readFileSync(join(dir, f), 'utf8')).data as any)
    .filter((fm) => fm.slug && fm.name)
    .map((fm) => ({
      title: fm.name,
      url: `${BASE}/esports/${fm.slug}/`,
      description: fm.description_short || '',
      author: 'editorial',
      publishedAt: fm.date_start || new Date().toISOString(),
      kind: 'esports' as const,
    }));
}

function authorName(a: string): string {
  switch (a) {
    case 'editorial':
    case 'ripper':
      return 'PVPWire Editorial';
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

const news = readNews();
const tournaments = readTournaments();
const all = [...news, ...tournaments];

mkdirSync(join(PUB, 'rss'), { recursive: true });

writeFileSync(
  join(PUB, 'rss.xml'),
  buildFeed('PVPWire (full feed)', `${BASE}/rss.xml`, 'PVPWire news and esports tournament calendar.', all)
);
writeFileSync(
  join(PUB, 'rss/news.xml'),
  buildFeed('PVPWire News', `${BASE}/rss/news.xml`, 'Original PVPWire news and analysis.', news)
);
writeFileSync(
  join(PUB, 'rss/esports.xml'),
  buildFeed('PVPWire Esports', `${BASE}/rss/esports.xml`, 'PVPWire esports calendar: tournaments by date.', tournaments)
);

// Clean up retired feeds if present.
for (const legacy of ['rss/legends.xml', 'rss/heritage.xml']) {
  const path = join(PUB, legacy);
  if (existsSync(path)) {
    unlinkSync(path);
    console.log(`Removed retired feed: public/${legacy}`);
  }
}

console.log(`RSS feeds built: ${all.length} total items (${news.length} news, ${tournaments.length} tournaments).`);
