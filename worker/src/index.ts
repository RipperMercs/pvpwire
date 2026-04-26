// PVPWire Worker entry.
// Routes:
//   GET  /api/news               aggregated RSS feed (KV-cached, 30 min cron-refreshed)
//   POST /api/ask-flosium        Workers AI chat with locked Flosium system prompt
//   POST /api/submit-guild       community guild submission queue
//   GET  /api/admin/submissions  list pending submissions (admin token required)
//   GET  /healthz                health check
//
// Cron: every 30 minutes refresh news cache, then attempt a paced X post.

import type { Env, NewsCachePayload } from './types';
import { SOURCES } from './sources';
import { fetchSource, dedupeByTitle } from './rss';
import { handleAskFlosium } from './ask-flosium';
import { handleSubmission, listSubmissions } from './submissions';
import { postScheduled } from './twitter';

const NEWS_CACHE_KEY = 'news:latest';
const NEWS_CACHE_TTL_SECONDS = 60 * 60 * 24;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data: unknown, status = 200, cacheSeconds = 60): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${cacheSeconds}`,
    },
  });
}

async function refreshNewsCache(env: Env): Promise<NewsCachePayload> {
  const settled = await Promise.allSettled(SOURCES.map((s) => fetchSource(s, env.USER_AGENT)));
  const errors: { source: string; error: string }[] = [];
  const all = settled.flatMap((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    errors.push({ source: SOURCES[i].name, error: String(r.reason) });
    return [];
  });
  const deduped = dedupeByTitle(all).slice(0, 200);
  const payload: NewsCachePayload = {
    articles: deduped,
    fetchedAt: new Date().toISOString(),
    sources: SOURCES.map((s) => s.name),
    errors,
  };
  await env.NEWS_CACHE.put(NEWS_CACHE_KEY, JSON.stringify(payload), { expirationTtl: NEWS_CACHE_TTL_SECONDS });
  return payload;
}

async function handleNews(env: Env): Promise<Response> {
  const cached = await env.NEWS_CACHE.get(NEWS_CACHE_KEY, 'json');
  if (cached) return json(cached, 200, 60);
  const fresh = await refreshNewsCache(env);
  return json(fresh, 200, 60);
}

function unauthorized(): Response {
  return json({ error: 'unauthorized' }, 401, 0);
}

function checkAdmin(req: Request, env: Env): boolean {
  if (!env.ADMIN_TOKEN) return false;
  const auth = req.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return false;
  return auth.slice(7) === env.ADMIN_TOKEN;
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (url.pathname === '/healthz') {
      return json({ ok: true, time: new Date().toISOString() }, 200, 0);
    }

    if (url.pathname === '/api/news' && req.method === 'GET') {
      return handleNews(env);
    }

    if (url.pathname === '/api/ask-flosium') {
      return handleAskFlosium(req, env);
    }

    if (url.pathname === '/api/submit-guild') {
      return handleSubmission(req, env);
    }

    if (url.pathname === '/api/admin/submissions') {
      if (!checkAdmin(req, env)) return unauthorized();
      return listSubmissions(env);
    }

    return json({ error: 'not found', path: url.pathname }, 404, 0);
  },

  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      (async () => {
        try {
          await refreshNewsCache(env);
        } catch (e) {
          console.error('news refresh failed', e);
        }
        try {
          await postScheduled(env);
        } catch (e) {
          console.error('twitter post failed', e);
        }
      })()
    );
  },
} satisfies ExportedHandler<Env>;
