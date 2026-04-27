// PVPWire Worker entry.
// Routes:
//   GET  /api/news                    aggregated feed: editorial RSS + Reddit + Steam (KV-cached, 30 min cron-refreshed). Optional ?source=editorial|reddit|steam|all.
//   GET  /api/tournaments             curated tournament calendar (proxy of public/tournaments.json with KV cache)
//   GET  /api/esports-news            keyword-filtered subset of editorial articles tagged as esports-relevant
//   GET  /api/game-runtime/{slug}     Section 22.4: live runtime data for a game (Steam current players + IGDB enrichment)
//   GET  /api/org-runtime/{slug}      Section 22.4 Integration C: PandaScore team data (roster, recent + upcoming matches)
//   GET  /api/tournament-runtime/{slug}  Section 22.4 Integration C: PandaScore tournament data (bracket, matches)
//   GET  /api/trending-now               Section 22.5: live ranked list of "what is being played" (Twitch viewers + Steam players, refreshed every 30 min)
//   GET  /api/live-now                   /live page snapshot: every catalog game with concurrent player counts (refreshed every 5 min)
//   GET  /api/live-health                /live page freshness/health record
//   POST /api/submit-guild            community guild submission queue
//   POST /api/submit-game             community game submission queue
//   GET  /api/admin/submissions       list pending submissions (admin token required)
//   GET  /healthz                     health check
//
// Cron schedule:
//   "*/30 * * * *"  every 30 min: refresh news cache (editorial/Reddit/Steam) + paced X post
//   "0 */6 * * *"   every 6 h:    refresh Steam current-player counts (Section 22.4 Integration A)

import type { Env, NewsCachePayload, AggregatedArticle } from './types';
import { SOURCES } from './sources';
import { fetchSource, dedupeByTitle } from './rss';
import { fetchRedditSources, type RedditItemPayload } from './aggregator-reddit';
import { fetchSteamSources, type SteamItemPayload } from './aggregator-steam';
import { handleSubmission, listSubmissions } from './submissions';
import { handleGameSubmission } from './submissions-game';
import { postScheduled } from './twitter';
import { getSteamPlayerCount } from './steam-players';
import { refreshIgdbCatalog, getIgdbRecord } from './igdb';
import { refreshPandascore, getOrgRuntime, getTournamentRuntime } from './pandascore';
import { refreshTrending, getTrending } from './trending';
import { refreshLiveSnapshot, getLiveSnapshot, getLiveHealth } from './live-snapshot';

const NEWS_CACHE_KEY = 'news:editorial:latest';
const REDDIT_CACHE_KEY = 'news:reddit:latest';
const STEAM_CACHE_KEY = 'news:steam:latest';
const NEWS_CACHE_TTL_SECONDS = 60 * 60 * 24;
const TOURNAMENTS_CACHE_KEY = 'tournaments:latest';
const TOURNAMENTS_CACHE_TTL_SECONDS = 60 * 60; // 1 hour

// Keywords used to filter the editorial news feed for esports relevance.
const ESPORTS_KEYWORDS = [
  'esports', 'tournament', 'championship', 'major', 'qualifier', 'playoffs',
  'vct', 'valorant champions', 'lol worlds', 'league of legends world',
  'cs major', 'cs2 major', 'iem', 'esl pro league', 'blast premier',
  'the international', 'ti13', 'ti14', 'ti15',
  'six invitational', 'algs', 'rlcs', 'evo ', 'cdl', 'lec', 'lcs', 'lck', 'lpl',
  'ewc', 'esports world cup',
  'msi', 'mid-season invitational',
];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface RedditCachePayload {
  items: RedditItemPayload[];
  fetchedAt: string;
  errors: { subreddit: string; error: string }[];
}

interface SteamCachePayload {
  items: SteamItemPayload[];
  fetchedAt: string;
  errors: { game_slug: string; error: string }[];
}

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

async function refreshEditorialCache(env: Env): Promise<NewsCachePayload> {
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

async function refreshRedditCache(env: Env): Promise<RedditCachePayload> {
  const { items, errors } = await fetchRedditSources(env.USER_AGENT);
  const payload: RedditCachePayload = {
    items: items.slice(0, 250),
    fetchedAt: new Date().toISOString(),
    errors,
  };
  await env.NEWS_CACHE.put(REDDIT_CACHE_KEY, JSON.stringify(payload), { expirationTtl: NEWS_CACHE_TTL_SECONDS });
  return payload;
}

async function refreshSteamCache(env: Env): Promise<SteamCachePayload> {
  const { items, errors } = await fetchSteamSources(env);
  const payload: SteamCachePayload = {
    items: items.slice(0, 200),
    fetchedAt: new Date().toISOString(),
    errors,
  };
  await env.NEWS_CACHE.put(STEAM_CACHE_KEY, JSON.stringify(payload), { expirationTtl: NEWS_CACHE_TTL_SECONDS });
  return payload;
}

async function getEditorialPayload(env: Env): Promise<NewsCachePayload> {
  const cached = await env.NEWS_CACHE.get(NEWS_CACHE_KEY, 'json');
  if (cached) return cached as NewsCachePayload;
  return refreshEditorialCache(env);
}

async function getRedditPayload(env: Env): Promise<RedditCachePayload> {
  const cached = await env.NEWS_CACHE.get(REDDIT_CACHE_KEY, 'json');
  if (cached) return cached as RedditCachePayload;
  return refreshRedditCache(env);
}

async function getSteamPayload(env: Env): Promise<SteamCachePayload> {
  const cached = await env.NEWS_CACHE.get(STEAM_CACHE_KEY, 'json');
  if (cached) return cached as SteamCachePayload;
  return refreshSteamCache(env);
}

// Convert legacy editorial AggregatedArticle into the v2.1 unified shape.
function editorialToUnified(a: AggregatedArticle) {
  let hash = '';
  const t = a.title.toLowerCase().replace(/[^a-z0-9]+/g, '');
  let h = 0;
  for (let i = 0; i < t.length; i++) h = (Math.imul(31, h) + t.charCodeAt(i)) | 0;
  hash = `e:${h}`;
  return {
    source_type: 'editorial' as const,
    title: a.title,
    url: a.url,
    description: a.description,
    posted_at: a.publishedAt,
    hash,
    source_name: a.source,
    source_domain: a.sourceDomain,
  };
}

async function handleNews(env: Env, sourceFilter: string | null): Promise<Response> {
  const includeEditorial = sourceFilter === null || sourceFilter === 'all' || sourceFilter === 'editorial';
  const includeReddit = sourceFilter === null || sourceFilter === 'all' || sourceFilter === 'reddit';
  const includeSteam = sourceFilter === null || sourceFilter === 'all' || sourceFilter === 'steam';

  const [editorial, reddit, steam] = await Promise.all([
    includeEditorial ? getEditorialPayload(env) : Promise.resolve(null),
    includeReddit ? getRedditPayload(env) : Promise.resolve(null),
    includeSteam ? getSteamPayload(env) : Promise.resolve(null),
  ]);

  const editorialItems = editorial ? editorial.articles.map(editorialToUnified) : [];
  const redditItems = reddit ? reddit.items : [];
  const steamItems = steam ? steam.items : [];

  const merged = [...editorialItems, ...redditItems, ...steamItems].sort(
    (a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime()
  );

  return json({
    items: merged,
    counts: {
      editorial: editorialItems.length,
      reddit: redditItems.length,
      steam: steamItems.length,
      total: merged.length,
    },
    fetchedAt: {
      editorial: editorial?.fetchedAt ?? null,
      reddit: reddit?.fetchedAt ?? null,
      steam: steam?.fetchedAt ?? null,
    },
    // Legacy field for any v2.0 client that has not migrated yet. Keep in sync
    // with the editorial portion of items. Drop in v2.2 once NewsBrowser ships
    // the unified consumer.
    articles: editorial?.articles ?? [],
    sources: editorial?.sources ?? [],
    errors: {
      editorial: editorial?.errors ?? [],
      reddit: reddit?.errors ?? [],
      steam: steam?.errors ?? [],
    },
  }, 200, 60);
}

async function handleEsportsNews(env: Env): Promise<Response> {
  const payload = await getEditorialPayload(env);
  const filtered = payload.articles.filter((a) => {
    const haystack = `${a.title} ${a.description}`.toLowerCase();
    return ESPORTS_KEYWORDS.some((kw) => haystack.includes(kw));
  });
  return json({
    articles: filtered,
    fetchedAt: payload.fetchedAt,
    sources: payload.sources,
    count: filtered.length,
    totalConsidered: payload.articles.length,
  }, 200, 60);
}

async function handleTournaments(env: Env): Promise<Response> {
  const cached = await env.NEWS_CACHE.get(TOURNAMENTS_CACHE_KEY, 'json');
  if (cached) return json(cached, 200, 300);

  // Fetch the static JSON published with the Pages site at /tournaments.json.
  try {
    const res = await fetch(`${env.SITE_URL}/tournaments.json`, {
      headers: { 'User-Agent': env.USER_AGENT },
    });
    if (!res.ok) {
      return json({ error: 'tournaments_unavailable', status: res.status }, 502, 0);
    }
    const data = await res.json();
    await env.NEWS_CACHE.put(
      TOURNAMENTS_CACHE_KEY,
      JSON.stringify(data),
      { expirationTtl: TOURNAMENTS_CACHE_TTL_SECONDS }
    );
    return json(data, 200, 300);
  } catch (e) {
    return json({ error: 'tournaments_fetch_failed', message: String(e) }, 502, 0);
  }
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
      return handleNews(env, url.searchParams.get('source'));
    }

    if (url.pathname === '/api/esports-news' && req.method === 'GET') {
      return handleEsportsNews(env);
    }

    if (url.pathname === '/api/tournaments' && req.method === 'GET') {
      return handleTournaments(env);
    }

    if (url.pathname.startsWith('/api/game-runtime/') && req.method === 'GET') {
      const slug = url.pathname.slice('/api/game-runtime/'.length).replace(/\/$/, '');
      if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
        return json({ error: 'invalid_slug' }, 400, 0);
      }
      const [data, igdb] = await Promise.all([
        getSteamPlayerCount(env, slug),
        getIgdbRecord(env, slug),
      ]);
      return json({
        game_slug: slug,
        data,
        igdb,
        fetched_at: data?.player_count_fetched_at ?? null,
      }, 200, 300);
    }

    if (url.pathname.startsWith('/api/org-runtime/') && req.method === 'GET') {
      const slug = url.pathname.slice('/api/org-runtime/'.length).replace(/\/$/, '');
      if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
        return json({ error: 'invalid_slug' }, 400, 0);
      }
      const data = await getOrgRuntime(env, slug);
      return json({ org_slug: slug, data, fetched_at: data?.fetched_at ?? null }, 200, 300);
    }

    if (url.pathname.startsWith('/api/tournament-runtime/') && req.method === 'GET') {
      const slug = url.pathname.slice('/api/tournament-runtime/'.length).replace(/\/$/, '');
      if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
        return json({ error: 'invalid_slug' }, 400, 0);
      }
      const data = await getTournamentRuntime(env, slug);
      return json({ tournament_slug: slug, data, fetched_at: data?.fetched_at ?? null }, 200, 300);
    }

    if (url.pathname === '/api/trending-now' && req.method === 'GET') {
      const data = await getTrending(env);
      return json({ data, fetched_at: data?.fetched_at ?? null }, 200, 60);
    }

    if (url.pathname === '/api/live-now' && req.method === 'GET') {
      const data = await getLiveSnapshot(env);
      // Cache 30s at the edge: client polls every 60s anyway.
      return json({ data, fetched_at: data?.fetched_at ?? null }, 200, 30);
    }

    if (url.pathname === '/api/live-health' && req.method === 'GET') {
      const data = await getLiveHealth(env);
      return json({ data }, 200, 30);
    }

    if (url.pathname === '/api/submit-guild') {
      return handleSubmission(req, env);
    }

    if (url.pathname === '/api/submit-game') {
      return handleGameSubmission(req, env);
    }

    if (url.pathname === '/api/admin/submissions') {
      if (!checkAdmin(req, env)) return unauthorized();
      return listSubmissions(env);
    }

    return json({ error: 'not found', path: url.pathname }, 404, 0);
  },

  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    const cron = event.cron;
    ctx.waitUntil(
      (async () => {
        // 5-minute job: refresh /live snapshot. Also refreshes per-game
        // Steam player KV records as a side effect, so the 6h cron that used
        // to do that is retired.
        if (cron === '*/5 * * * *') {
          try {
            const result = await refreshLiveSnapshot(env);
            console.log('live snapshot refresh', JSON.stringify(result));
          } catch (e) {
            console.error('live snapshot refresh failed', e);
          }
          return;
        }

        // Weekly Mon 4am: refresh IGDB enrichment.
        if (cron === '0 4 * * 1') {
          try {
            const result = await refreshIgdbCatalog(env);
            console.log('igdb refresh', JSON.stringify(result));
          } catch (e) {
            console.error('igdb refresh failed', e);
          }
          return;
        }

        // Daily 5am: refresh PandaScore tournaments + teams.
        if (cron === '0 5 * * *') {
          try {
            const result = await refreshPandascore(env);
            console.log('pandascore refresh', JSON.stringify(result));
          } catch (e) {
            console.error('pandascore refresh failed', e);
          }
          return;
        }

        // Default 30-minute job: news caches + trending refresh + paced X post.
        try {
          await refreshEditorialCache(env);
        } catch (e) {
          console.error('editorial refresh failed', e);
        }
        try {
          await refreshRedditCache(env);
        } catch (e) {
          console.error('reddit refresh failed', e);
        }
        try {
          await refreshSteamCache(env);
        } catch (e) {
          console.error('steam refresh failed', e);
        }
        try {
          const result = await refreshTrending(env);
          console.log('trending refresh', JSON.stringify(result));
        } catch (e) {
          console.error('trending refresh failed', e);
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
