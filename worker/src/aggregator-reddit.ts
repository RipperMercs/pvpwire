// Reddit subreddit RSS aggregator (PIVOT.md Section 22.3).
// Each subreddit feed is at https://www.reddit.com/r/{name}/.rss with no
// auth and no API key. We pull in parallel, parse the Atom-style payload,
// extract Reddit-specific fields (subreddit, author, score where present),
// filter NSFW posts, and emit RedditAggregatedItem records.

import redditConfig from '../sources/reddit.json';

export interface RedditItemPayload {
  source_type: 'reddit';
  title: string;
  url: string;            // permalink
  description?: string;
  posted_at: string;
  hash: string;
  subreddit: string;
  author: string;
  score: number;
  flair?: string;
  is_nsfw: boolean;
}

const SUBREDDITS: string[] = (redditConfig as any).subreddits ?? [];
const FILTER_NSFW: boolean = (redditConfig as any).filter_nsfw !== false;

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
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

// Reddit Atom feeds embed the score in the description HTML as
// "[N] points | [M] comments". Regex that out best-effort.
function extractScore(descriptionHtml: string): number {
  const m = descriptionHtml.match(/(\d+)\s*points?/i);
  return m ? parseInt(m[1], 10) : 0;
}

// Reddit Atom feeds include category tags whose @term is the post flair.
function extractFlair(entryXml: string): string | undefined {
  const m = entryXml.match(/<category[^>]*term=["']([^"']+)["']/i);
  return m ? decodeEntities(m[1]) : undefined;
}

// NSFW marker: Reddit uses a category term "nsfw" or includes a "nsfw" label
// in the title. Belt and suspenders.
function isNsfw(entryXml: string, title: string): boolean {
  if (/<category[^>]*term=["']nsfw["']/i.test(entryXml)) return true;
  if (/\bnsfw\b/i.test(title)) return true;
  return false;
}

function hashFor(permalink: string): string {
  let h = 0;
  for (let i = 0; i < permalink.length; i++) h = (Math.imul(31, h) + permalink.charCodeAt(i)) | 0;
  return `r:${String(h)}`;
}

function parseSubreddit(xml: string, subreddit: string): RedditItemPayload[] {
  const entries: string[] = [];
  for (const m of xml.matchAll(/<entry[\s\S]*?<\/entry>/gi)) entries.push(m[0]);

  const out: RedditItemPayload[] = [];
  for (const entry of entries) {
    const title = stripTags(pluck(entry, 'title'));
    const url = pluckAttr(entry, 'link', 'href');
    if (!title || !url) continue;

    const posted = pluck(entry, 'published') || pluck(entry, 'updated');
    const posted_at = posted ? new Date(posted).toISOString() : new Date().toISOString();

    const author = stripTags(pluck(entry, 'name')) || 'unknown';
    const descRaw = pluck(entry, 'content') || pluck(entry, 'summary');
    const score = extractScore(descRaw);
    const flair = extractFlair(entry);
    const nsfw = isNsfw(entry, title);

    out.push({
      source_type: 'reddit',
      title,
      url,
      description: stripTags(descRaw).slice(0, 240) || undefined,
      posted_at,
      hash: hashFor(url),
      subreddit,
      author,
      score,
      flair,
      is_nsfw: nsfw,
    });
  }
  return out;
}

async function fetchOneSubreddit(name: string, userAgent: string, timeoutMs = 8000): Promise<RedditItemPayload[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const url = `https://www.reddit.com/r/${name}/.rss`;
    const res = await fetch(url, {
      headers: { 'User-Agent': userAgent, Accept: 'application/atom+xml, application/rss+xml' },
      signal: ctrl.signal,
      cf: { cacheTtl: 1500 } as any,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    return parseSubreddit(xml, name);
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchRedditSources(userAgent: string): Promise<{
  items: RedditItemPayload[];
  errors: { subreddit: string; error: string }[];
}> {
  const settled = await Promise.allSettled(SUBREDDITS.map((s) => fetchOneSubreddit(s, userAgent)));
  const errors: { subreddit: string; error: string }[] = [];
  const all: RedditItemPayload[] = [];
  for (let i = 0; i < settled.length; i++) {
    const r = settled[i];
    if (r.status === 'fulfilled') {
      all.push(...r.value);
    } else {
      errors.push({ subreddit: SUBREDDITS[i], error: String(r.reason) });
    }
  }

  // NSFW filter at ingest.
  const filtered = FILTER_NSFW ? all.filter((it) => !it.is_nsfw) : all;

  // Dedup per family by hash.
  const seen = new Set<string>();
  const deduped: RedditItemPayload[] = [];
  for (const it of filtered) {
    if (seen.has(it.hash)) continue;
    seen.add(it.hash);
    deduped.push(it);
  }

  // Sort newest-first.
  deduped.sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime());

  return { items: deduped, errors };
}
