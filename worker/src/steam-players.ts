// Steam current-player counts (PIVOT.md Section 22.4 Integration A).
//
// For every catalog game with steam_app_id set we hit the public
// ISteamUserStats/GetNumberOfCurrentPlayers endpoint. No API key needed.
// Results are stored in NEWS_CACHE under steam:players:{slug} so the game
// profile pages can read them at request time via /api/game-runtime/{slug}.
//
// Cron cadence: every 6 hours (see worker/wrangler.toml).
//
// Steam endpoint:
//   GET https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=N

import type { Env } from './types';
import { runtimeKeys, type GameRuntimeData } from './runtime-data-shim';

interface CatalogGameRef {
  slug: string;
  name: string;
  steam_app_id: number;
}

interface SteamPlayerCountResponse {
  response?: {
    player_count?: number;
    result?: number;
  };
}

const PLAYER_COUNT_TTL_SECONDS = 60 * 60 * 24; // 24h fallback if cron stalls

async function fetchCatalogGames(env: Env, timeoutMs = 8000): Promise<CatalogGameRef[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${env.SITE_URL}/steam-app-ids.json`, {
      headers: { 'User-Agent': env.USER_AGENT },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`steam-app-ids.json HTTP ${res.status}`);
    const data = await res.json() as { games?: CatalogGameRef[] };
    return data.games ?? [];
  } finally {
    clearTimeout(timer);
  }
}

async function fetchOneCount(game: CatalogGameRef, userAgent: string, timeoutMs = 5000): Promise<number | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const url = `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${game.steam_app_id}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': userAgent, Accept: 'application/json' },
      signal: ctrl.signal,
      cf: { cacheTtl: 600 } as any,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as SteamPlayerCountResponse;
    if (data.response?.result !== 1) return null;
    return typeof data.response.player_count === 'number' ? data.response.player_count : null;
  } finally {
    clearTimeout(timer);
  }
}

export interface SteamPlayersRefreshResult {
  updated: number;
  errors: { game_slug: string; error: string }[];
  fetched_at: string;
}

export async function refreshSteamPlayerCounts(env: Env): Promise<SteamPlayersRefreshResult> {
  const fetched_at = new Date().toISOString();
  let games: CatalogGameRef[];
  try {
    games = await fetchCatalogGames(env);
  } catch (e) {
    return { updated: 0, errors: [{ game_slug: '_index', error: String(e) }], fetched_at };
  }

  if (games.length === 0) return { updated: 0, errors: [], fetched_at };

  const settled = await Promise.allSettled(games.map((g) => fetchOneCount(g, env.USER_AGENT)));
  const errors: { game_slug: string; error: string }[] = [];
  let updated = 0;

  await Promise.all(
    settled.map(async (r, i) => {
      const game = games[i];
      if (r.status !== 'fulfilled') {
        errors.push({ game_slug: game.slug, error: String(r.reason) });
        return;
      }
      const count = r.value;
      if (count === null) {
        errors.push({ game_slug: game.slug, error: 'no_player_count_in_response' });
        return;
      }
      const payload: GameRuntimeData = {
        game_slug: game.slug,
        current_player_count: count,
        player_count_fetched_at: fetched_at,
      };
      try {
        await env.NEWS_CACHE.put(
          runtimeKeys.steamPlayers(game.slug),
          JSON.stringify(payload),
          { expirationTtl: PLAYER_COUNT_TTL_SECONDS }
        );
        updated++;
      } catch (e) {
        errors.push({ game_slug: game.slug, error: `kv_put_failed: ${String(e)}` });
      }
    })
  );

  return { updated, errors, fetched_at };
}

export async function getSteamPlayerCount(env: Env, gameSlug: string): Promise<GameRuntimeData | null> {
  const cached = await env.NEWS_CACHE.get(runtimeKeys.steamPlayers(gameSlug), 'json');
  return (cached as GameRuntimeData) ?? null;
}
