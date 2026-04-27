// IGDB enrichment job (PIVOT.md Section 22.4 Integration B).
//
// Credentials: IGDB requires Twitch developer client_credentials OAuth.
//   IGDB_CLIENT_ID     <- Twitch developer console "Client ID"
//   IGDB_CLIENT_SECRET <- Twitch developer console "Client Secret"
// Both are injected via `wrangler secret put`. If either is missing the job
// no-ops (logs a warning and returns); deploy stays green.
//
// Token endpoint: POST https://id.twitch.tv/oauth2/token
// Data endpoint:  POST https://api.igdb.com/v4/games (Apicalypse query body)
//
// Cron cadence: weekly. IGDB editorial data (cover, summary, genres, similar
// games) changes infrequently, so a 7-day refresh is plenty.
//
// Storage: NEWS_CACHE under runtimeKeys.igdbGame(slug). Game profile pages
// hydrate via /api/game-runtime/{slug} (same envelope as Steam players).

import type { Env } from './types';
import { runtimeKeys } from './runtime-data-shim';
import steamAppIds from './data/steam-app-ids.json';

const TOKEN_KV_KEY = 'igdb:oauth:token';
const TOKEN_SAFETY_MARGIN_SECONDS = 60 * 60; // refresh 1h before expiry
const IGDB_CACHE_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days
const IGDB_BATCH_SIZE = 10; // IGDB allows up to 500 per query but be polite

interface CatalogGameRef {
  slug: string;
  name: string;
  igdb_id?: number;
}

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface CachedToken {
  access_token: string;
  expires_at: number; // unix seconds
}

export interface IgdbGameRecord {
  game_slug: string;
  igdb_id: number;
  name?: string;
  summary?: string;
  storyline?: string;
  rating?: number;
  rating_count?: number;
  genres?: { id: number; name: string }[];
  themes?: { id: number; name: string }[];
  cover?: { id: number; url: string };
  screenshots?: { id: number; url: string }[];
  videos?: { id: number; video_id: string; name?: string }[];
  websites?: { id: number; url: string; category: number }[];
  similar_games?: { id: number; slug: string; name: string }[];
  fetched_at: string;
  source: 'igdb';
  attribution_required: true;
}

interface IgdbApiGame {
  id: number;
  name?: string;
  summary?: string;
  storyline?: string;
  rating?: number;
  rating_count?: number;
  genres?: { id: number; name: string }[];
  themes?: { id: number; name: string }[];
  cover?: { id: number; url: string };
  screenshots?: { id: number; url: string }[];
  videos?: { id: number; video_id: string; name?: string }[];
  websites?: { id: number; url: string; category: number }[];
  similar_games?: { id: number; slug: string; name: string }[];
}

function hasIgdbCreds(env: Env): boolean {
  return Boolean(env.IGDB_CLIENT_ID && env.IGDB_CLIENT_SECRET);
}

// Bundled at build time. Catalog refreshes require a Worker redeploy.
async function fetchCatalogGames(_env: Env): Promise<CatalogGameRef[]> {
  const games = (steamAppIds as { games?: CatalogGameRef[] }).games ?? [];
  return games.filter((g): g is CatalogGameRef & { igdb_id: number } =>
    typeof g.igdb_id === 'number'
  );
}

async function getAccessToken(env: Env): Promise<string> {
  const cached = await env.NEWS_CACHE.get(TOKEN_KV_KEY, 'json') as CachedToken | null;
  const now = Math.floor(Date.now() / 1000);
  if (cached && cached.expires_at - TOKEN_SAFETY_MARGIN_SECONDS > now) {
    return cached.access_token;
  }
  const params = new URLSearchParams({
    client_id: env.IGDB_CLIENT_ID!,
    client_secret: env.IGDB_CLIENT_SECRET!,
    grant_type: 'client_credentials',
  });
  const res = await fetch(`https://id.twitch.tv/oauth2/token?${params.toString()}`, {
    method: 'POST',
    headers: { 'User-Agent': env.USER_AGENT },
  });
  if (!res.ok) throw new Error(`twitch oauth HTTP ${res.status}`);
  const data = await res.json() as TwitchTokenResponse;
  const token: CachedToken = {
    access_token: data.access_token,
    expires_at: now + data.expires_in,
  };
  await env.NEWS_CACHE.put(TOKEN_KV_KEY, JSON.stringify(token), {
    expirationTtl: data.expires_in,
  });
  return data.access_token;
}

async function fetchIgdbBatch(env: Env, token: string, ids: number[]): Promise<IgdbApiGame[]> {
  const fields = [
    'id', 'name', 'summary', 'storyline', 'rating', 'rating_count',
    'genres.name', 'themes.name',
    'cover.url',
    'screenshots.url',
    'videos.video_id', 'videos.name',
    'websites.url', 'websites.category',
    'similar_games.slug', 'similar_games.name',
  ].join(',');

  const body = `fields ${fields}; where id = (${ids.join(',')}); limit ${ids.length};`;

  const res = await fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers: {
      'Client-ID': env.IGDB_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
      'User-Agent': env.USER_AGENT,
      Accept: 'application/json',
    },
    body,
  });
  if (!res.ok) throw new Error(`igdb HTTP ${res.status}: ${await res.text().catch(() => '')}`);
  return res.json() as Promise<IgdbApiGame[]>;
}

export interface IgdbRefreshResult {
  attempted: number;
  updated: number;
  errors: { game_slug?: string; error: string }[];
  fetched_at: string;
  skipped_reason?: string;
}

export async function refreshIgdbCatalog(env: Env): Promise<IgdbRefreshResult> {
  const fetched_at = new Date().toISOString();
  if (!hasIgdbCreds(env)) {
    return { attempted: 0, updated: 0, errors: [], fetched_at, skipped_reason: 'missing_credentials' };
  }

  let games: CatalogGameRef[];
  try {
    games = await fetchCatalogGames(env);
  } catch (e) {
    return { attempted: 0, updated: 0, errors: [{ error: `catalog_fetch: ${String(e)}` }], fetched_at };
  }

  if (games.length === 0) {
    return { attempted: 0, updated: 0, errors: [], fetched_at, skipped_reason: 'no_games_with_igdb_id' };
  }

  let token: string;
  try {
    token = await getAccessToken(env);
  } catch (e) {
    return { attempted: 0, updated: 0, errors: [{ error: `oauth: ${String(e)}` }], fetched_at };
  }

  const errors: { game_slug?: string; error: string }[] = [];
  let updated = 0;

  for (let offset = 0; offset < games.length; offset += IGDB_BATCH_SIZE) {
    const batch = games.slice(offset, offset + IGDB_BATCH_SIZE);
    const idToGame = new Map(batch.map((g) => [g.igdb_id!, g]));
    let results: IgdbApiGame[];
    try {
      results = await fetchIgdbBatch(env, token, Array.from(idToGame.keys()));
    } catch (e) {
      for (const g of batch) errors.push({ game_slug: g.slug, error: String(e) });
      continue;
    }

    await Promise.all(results.map(async (r) => {
      const game = idToGame.get(r.id);
      if (!game) return;
      const record: IgdbGameRecord = {
        game_slug: game.slug,
        igdb_id: r.id,
        name: r.name,
        summary: r.summary,
        storyline: r.storyline,
        rating: r.rating,
        rating_count: r.rating_count,
        genres: r.genres,
        themes: r.themes,
        cover: r.cover,
        screenshots: r.screenshots,
        videos: r.videos,
        websites: r.websites,
        similar_games: r.similar_games,
        fetched_at,
        source: 'igdb',
        attribution_required: true,
      };
      try {
        await env.NEWS_CACHE.put(
          runtimeKeys.igdbGame(game.slug),
          JSON.stringify(record),
          { expirationTtl: IGDB_CACHE_TTL_SECONDS }
        );
        updated++;
      } catch (e) {
        errors.push({ game_slug: game.slug, error: `kv_put: ${String(e)}` });
      }
    }));
  }

  return { attempted: games.length, updated, errors, fetched_at };
}

export async function getIgdbRecord(env: Env, gameSlug: string): Promise<IgdbGameRecord | null> {
  const cached = await env.NEWS_CACHE.get(runtimeKeys.igdbGame(gameSlug), 'json');
  return (cached as IgdbGameRecord) ?? null;
}
