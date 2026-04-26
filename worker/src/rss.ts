// Lightweight RSS / Atom parser tuned for the Cloudflare Worker runtime.
// We avoid pulling rss-parser into the Worker bundle (it brings node deps).
// Pattern matches what we ship in TensorFeed Worker, simplified for v1 needs.

import type { AggregatedArticle, RSSSource } from './types';

interface ParsedItem {
  title: string;
  url: string;
  description: string;
  publishedAt: string;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, '&');
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function pluck(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const m = xml.match(re);
  if (!m) return '';
  let v = m[1].trim();
  if (v.startsWith('<![CDATA[')) v = v.slice(9, v.lastIndexOf(']]>')).trim();
  return decodeEntities(v);
}

function pluckAttr(xml: string, tag: string, attr: string): string {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}=["']([^"']+)["'][^>]*/?>`, 'i');
  const m = xml.match(re);
  return m ? m[1] : '';
}

function splitItems(xml: string): string[] {
  const items: string[] = [];
  const itemRe = /<item[\s\S]*?<\/item>/gi;
  const entryRe = /<entry[\s\S]*?<\/entry>/gi;
  for (const m of xml.matchAll(itemRe)) items.push(m[0]);
  for (const m of xml.matchAll(entryRe)) items.push(m[0]);
  return items;
}

export function parseFeed(xml: string): ParsedItem[] {
  const items = splitItems(xml);
  return items
    .map((raw) => {
      const title = stripTags(pluck(raw, 'title'));
      // Atom uses <link href="..."/>; RSS uses <link>...</link>
      let url = pluck(raw, 'link');
      if (!url) url = pluckAttr(raw, 'link', 'href');
      const descRaw = pluck(raw, 'description') || pluck(raw, 'summary') || pluck(raw, 'content:encoded') || pluck(raw, 'content');
      const description = stripTags(descRaw).slice(0, 300);
      const dateRaw = pluck(raw, 'pubDate') || pluck(raw, 'published') || pluck(raw, 'updated') || pluck(raw, 'dc:date');
      const publishedAt = dateRaw ? new Date(dateRaw).toISOString() : new Date().toISOString();
      return { title, url, description, publishedAt };
    })
    .filter((it) => it.title && it.url);
}

export async function fetchSource(source: RSSSource, userAgent: string, timeoutMs = 8000): Promise<AggregatedArticle[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(source.url, {
      headers: { 'User-Agent': userAgent, Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' },
      signal: ctrl.signal,
      cf: { cacheTtl: 1500 } as any,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const items = parseFeed(xml);
    return items.map((it) => ({
      ...it,
      source: source.name,
      sourceDomain: source.domain,
    }));
  } finally {
    clearTimeout(timer);
  }
}

// Title-hash dedup. We hash the lowercased title only since cross-source
// republication is the main duplication mode. Cheap and stable.
function titleHash(title: string): string {
  let h = 0;
  const s = title.toLowerCase().replace(/[^a-z0-9]+/g, '');
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return String(h);
}

export function dedupeByTitle(articles: AggregatedArticle[]): AggregatedArticle[] {
  const seen = new Set<string>();
  const out: AggregatedArticle[] = [];
  for (const a of articles.sort((x, y) => new Date(y.publishedAt).getTime() - new Date(x.publishedAt).getTime())) {
    const k = titleHash(a.title);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(a);
  }
  return out;
}
