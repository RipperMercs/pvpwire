// X / Twitter posting for the @PVPWire bot.
// Conservative ramp per spec section 11.1. Worker cron triggers at most once
// per scheduled tick; the post-rate gate decides whether to actually post.
//
// v1: post a curated daily digest pulling top aggregated headlines from cache.
// Original article and Legends posts are triggered manually at v1.

import type { Env, AggregatedArticle } from './types';

const POST_LOG_PREFIX = 'bot:post:';
const POST_RATE_KEY = 'bot:lastpost';

const MAX_DAILY_POSTS = 6; // week 1-2 floor; raised manually in later weeks

async function postsToday(env: Env): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const list = await env.BOT_LOG.list({ prefix: `${POST_LOG_PREFIX}${today}:` });
  return list.keys.length;
}

function buildPostText(a: AggregatedArticle): string {
  const headline = a.title.slice(0, 200);
  const source = a.source;
  // X v2 free tier permits ~280 chars. Keep buffer.
  return `${headline} (via ${source})\n\n${a.url}`;
}

async function callXApi(env: Env, text: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!env.X_BEARER) {
    return { ok: false, error: 'no X bearer configured' };
  }
  try {
    const res = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.X_BEARER}`,
        'Content-Type': 'application/json',
        'User-Agent': env.USER_AGENT,
      },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const json = (await res.json()) as { data?: { id?: string } };
    return { ok: true, id: json.data?.id };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function postScheduled(env: Env): Promise<void> {
  const count = await postsToday(env);
  if (count >= MAX_DAILY_POSTS) return;

  const cached = await env.NEWS_CACHE.get('news:latest', 'json');
  if (!cached) return;
  const articles = (cached as { articles?: AggregatedArticle[] }).articles || [];
  if (articles.length === 0) return;

  // Pick the freshest article we haven't posted yet today.
  const today = new Date().toISOString().slice(0, 10);
  const postedKeys = await env.BOT_LOG.list({ prefix: `${POST_LOG_PREFIX}${today}:` });
  const postedUrls = new Set<string>();
  for (const k of postedKeys.keys) {
    const v = await env.BOT_LOG.get(k.name);
    if (v) {
      try {
        const log = JSON.parse(v) as { url?: string };
        if (log.url) postedUrls.add(log.url);
      } catch {
        // ignore
      }
    }
  }

  const next = articles.find((a) => !postedUrls.has(a.url));
  if (!next) return;

  const text = buildPostText(next);
  const result = await callXApi(env, text);
  await env.BOT_LOG.put(
    `${POST_LOG_PREFIX}${today}:${Date.now()}`,
    JSON.stringify({ ...result, url: next.url, title: next.title, postedAt: new Date().toISOString() }),
    { expirationTtl: 60 * 60 * 24 * 30 }
  );
  await env.RATE_LIMIT.put(POST_RATE_KEY, new Date().toISOString(), { expirationTtl: 60 * 60 * 24 });
}
