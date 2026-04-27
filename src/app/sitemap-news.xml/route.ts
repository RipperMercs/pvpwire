// Google News sitemap (PIVOT-adjacent SEO Section 6.2).
// Includes only news articles published in the last 48 hours so Google News
// crawler sees fresh material on each scrape. Empty when nothing recent.

import { getAllArticles } from '@/lib/content';

const BASE = 'https://pvpwire.com';
const PUBLICATION_NAME = 'PVPWire';
const WINDOW_HOURS = 48;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const dynamic = 'force-static';

export async function GET() {
  const cutoff = Date.now() - WINDOW_HOURS * 60 * 60 * 1000;
  const articles = getAllArticles().filter((a) => {
    const t = new Date(a.frontmatter.published).getTime();
    return !isNaN(t) && t >= cutoff;
  });

  const items = articles.map((a) => {
    const fm = a.frontmatter;
    return `  <url>
    <loc>${escapeXml(`${BASE}/news/${fm.slug}/`)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(PUBLICATION_NAME)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(new Date(fm.published).toISOString())}</news:publication_date>
      <news:title>${escapeXml(fm.title)}</news:title>
    </news:news>
  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=1800',
    },
  });
}
