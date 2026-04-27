// "What is being played" trending signal (Section 22.5).
//
// Combines two live data sources to produce a ranked list of catalog games
// for the home page Live and Hot rail:
//
//   PRIMARY:  Twitch concurrent viewers across the top 100 streams globally,
//             aggregated by game and matched to our catalog by name.
//             Refreshed every 30 minutes via cron. Requires the Twitch
//             developer credentials already used by the IGDB integration
//             (IGDB_CLIENT_ID / IGDB_CLIENT_SECRET). No-ops cleanly if
//             credentials are missing.
//
//   FALLBACK: Steam concurrent player counts, already cached under
//             steam:players:{slug} by Integration A. Used for any game with
//             a steam_app_id when Twitch data is unavailable.
//
// Output: TrendingPayload stored at runtimeKeys.trendingNow(). The home page
// hydrates client-side from /api/trending-now and falls back to the manual
// `trending`-flagged list when the Worker is unreachable.

import type { Env } from './types';
import { runtimeKeys, type TrendingEntry, type TrendingPayload, type GameRuntimeData } from './runtime-data-shim';
import steamAppIds from './data/steam-app-ids.json';

const TRENDING_TTL_SECONDS = 60 * 60 * 24; // 24h fallback if cron stalls
const TOP_N = 12;
const TWITCH_TOP_STREAMS = 100;

interface CatalogGameRef {
  slug: string;
  name: string;
  steam_app_id?: number;
  igdb_id?: number;
}

interface TwitchStream {
  id: string;
  game_id: string;
  game_name: string;
  viewer_count: number;
  type: string;
}

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
}

interface CachedToken {
  access_token: string;
  expires_at: number;
}

const TOKEN_KV_KEY = 'igdb:oauth:token'; // shared with igdb.ts; same OAuth scope
const TOKEN_SAFETY_MARGIN_SECONDS = 60 * 60;

function hasTwitchCreds(env: Env): boolean {
  return Boolean(env.IGDB_CLIENT_ID && env.IGDB_CLIENT_SECRET);
}

// Bundled at build time. Catalog refreshes require a Worker redeploy.
async function fetchCatalogGames(_env: Env): Promise<CatalogGameRef[]> {
  return (steamAppIds as { games?: CatalogGameRef[] }).games ?? [];
}

async function getTwitchToken(env: Env): Promise<string> {
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
  await env.NEWS_CACHE.put(TOKEN_KV_KEY, JSON.stringify(token), { expirationTtl: data.expires_in });
  return data.access_token;
}

async function fetchTopStreams(env: Env, token: string): Promise<TwitchStream[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`https://api.twitch.tv/helix/streams?first=${TWITCH_TOP_STREAMS}`, {
      headers: {
        'Client-ID': env.IGDB_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
        'User-Agent': env.USER_AGENT,
        Accept: 'application/json',
      },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`twitch streams HTTP ${res.status}`);
    const data = await res.json() as { data?: TwitchStream[] };
    return data.data ?? [];
  } finally {
    clearTimeout(timer);
  }
}

// Aggregate stream viewer counts by game_name to get total Twitch viewers per
// game across the top 100 streams (a strong proxy for "how watched/played
// competitively right now").
function aggregateByGame(streams: TwitchStream[]): Map<string, { game_name: string; viewer_count: number }> {
  const totals = new Map<string, { game_name: string; viewer_count: number }>();
  for (const s of streams) {
    if (!s.game_name) continue;
    const key = normalizeName(s.game_name);
    const cur = totals.get(key);
    if (cur) cur.viewer_count += s.viewer_count;
    else totals.set(key, { game_name: s.game_name, viewer_count: s.viewer_count });
  }
  return totals;
}

// Permissive name match between Twitch's canonical game name and our catalog
// frontmatter name. Handles "Counter-Strike 2" vs "Counter Strike 2",
// "VALORANT" vs "Valorant", "League of Legends" vs "League Of Legends", etc.
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .replace(/^the/, '')
    .trim();
}

async function readSteamPlayerCount(env: Env, gameSlug: string): Promise<number | undefined> {
  const cached = await env.NEWS_CACHE.get(runtimeKeys.steamPlayers(gameSlug), 'json') as GameRuntimeData | null;
  return cached?.current_player_count;
}

export interface TrendingRefreshResult {
  source: 'twitch' | 'steam' | 'mixed' | 'none';
  ranked: number;
  errors: string[];
  fetched_at: string;
  twitch_attempted: boolean;
}

export async function refreshTrending(env: Env): Promise<TrendingRefreshResult> {
  const fetched_at = new Date().toISOString();
  const errors: string[] = [];

  let games: CatalogGameRef[];
  try {
    games = await fetchCatalogGames(env);
  } catch (e) {
    return { source: 'none', ranked: 0, errors: [`catalog: ${String(e)}`], fetched_at, twitch_attempted: false };
  }

  // Twitch primary path. Best signal for competitive-watching activity.
  let twitchAggregate: Map<string, { game_name: string; viewer_count: number }> | null = null;
  let twitchAttempted = false;
  if (hasTwitchCreds(env)) {
    twitchAttempted = true;
    try {
      const token = await getTwitchToken(env);
      const streams = await fetchTopStreams(env, token);
      twitchAggregate = aggregateByGame(streams);
    } catch (e) {
      errors.push(`twitch: ${String(e)}`);
    }
  }

  // Build per-game records combining whichever signals we have.
  const candidates: TrendingEntry[] = [];
  const catalogByNormName = new Map(games.map((g) => [normalizeName(g.name), g]));

  // Steam pass: read every cached player count up front (one KV read per game,
  // cheap; KV is local on the same colo).
  const steamCounts = new Map<string, number>();
  await Promise.all(
    games
      .filter((g) => g.steam_app_id)
      .map(async (g) => {
        const c = await readSteamPlayerCount(env, g.slug);
        if (typeof c === 'number') steamCounts.set(g.slug, c);
      })
  );

  if (twitchAggregate && twitchAggregate.size > 0) {
    // Twitch-led ranking.
    for (const [norm, agg] of twitchAggregate) {
      const game = catalogByNormName.get(norm);
      if (!game) continue;
      candidates.push({
        game_slug: game.slug,
        game_name: game.name,
        twitch_viewer_count: agg.viewer_count,
        steam_player_count: steamCounts.get(game.slug),
        signal: 'twitch',
        rank: 0,
      });
    }
    // Backfill from Steam for catalog games not represented on the Twitch top
    // 100 streams but with strong concurrent player counts.
    for (const [slug, players] of steamCounts) {
      if (candidates.find((c) => c.game_slug === slug)) continue;
      const game = games.find((g) => g.slug === slug);
      if (!game) continue;
      candidates.push({
        game_slug: slug,
        game_name: game.name,
        steam_player_count: players,
        signal: 'steam',
        rank: 0,
      });
    }
  } else {
    // Steam-only fallback ranking.
    for (const [slug, players] of steamCounts) {
      const game = games.find((g) => g.slug === slug);
      if (!game) continue;
      candidates.push({
        game_slug: slug,
        game_name: game.name,
        steam_player_count: players,
        signal: 'steam',
        rank: 0,
      });
    }
  }

  if (candidates.length === 0) {
    return { source: 'none', ranked: 0, errors, fetched_at, twitch_attempted: twitchAttempted };
  }

  // Combined trending score. Twitch viewers carry more weight per unit because
  // a viewer is a stronger competitive-interest signal than a casual player.
  // Log scale prevents one mega-game (CS2, Fortnite) from monopolizing.
  candidates.sort((a, b) => score(b) - score(a));
  const top = candidates.slice(0, TOP_N).map((c, i) => ({ ...c, rank: i + 1 }));

  const sourceTags: ('twitch' | 'steam')[] = [];
  if (twitchAggregate) sourceTags.push('twitch');
  if (steamCounts.size > 0) sourceTags.push('steam');

  const payload: TrendingPayload = {
    items: top,
    fetched_at,
    source: sourceTags.length === 2 ? 'mixed' : (sourceTags[0] ?? 'steam'),
    attribution: sourceTags,
  };

  await env.NEWS_CACHE.put(
    runtimeKeys.trendingNow(),
    JSON.stringify(payload),
    { expirationTtl: TRENDING_TTL_SECONDS }
  );

  return {
    source: payload.source,
    ranked: top.length,
    errors,
    fetched_at,
    twitch_attempted: twitchAttempted,
  };
}

function score(c: TrendingEntry): number {
  const twitch = c.twitch_viewer_count ?? 0;
  const steam = c.steam_player_count ?? 0;
  return Math.log10(twitch + 1) * 2 + Math.log10(steam + 1);
}

export async function getTrending(env: Env): Promise<TrendingPayload | null> {
  const cached = await env.NEWS_CACHE.get(runtimeKeys.trendingNow(), 'json');
  return (cached as TrendingPayload) ?? null;
}
