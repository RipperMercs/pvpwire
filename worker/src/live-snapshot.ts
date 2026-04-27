// Live snapshot job for /live ("Is it alive? Every PvP Game").
//
// Cron: every 5 minutes. Hits Steam GetNumberOfCurrentPlayers per catalog
// game with steam_app_id, optionally augments with Twitch viewer counts
// (read from the trending aggregate the same cycle), and writes a single
// combined snapshot at runtimeKeys.liveSnapshot() so the page can hydrate
// off one KV read.
//
// Failure handling: each Steam request times out at 5s. Per-game errors are
// captured but never abort the snapshot. A health record at runtimeKeys
// .liveHealth() tracks the last successful run + consecutive failure count;
// the page banner goes amber/red when it drifts.
//
// Cadence reasoning: Steam updates concurrent counts internally every few
// minutes, so 5-minute polling is the freshness ceiling. Faster polling
// burns Worker requests for zero data benefit and risks Valve soft-throttling.

import type { Env } from './types';
import {
  runtimeKeys,
  type LiveSnapshot,
  type LiveSnapshotEntry,
  type LiveHealth,
  type TrendingPayload,
  type GameRuntimeData,
} from './runtime-data-shim';
import liveCatalog from './data/live-catalog.json';

const SNAPSHOT_TTL_SECONDS = 60 * 60 * 24;   // 24h fallback if cron stalls
const HEALTH_TTL_SECONDS = 60 * 60 * 24 * 7; // 7d fallback
const STEAM_TIMEOUT_MS = 5000;
const STEAM_BATCH_SIZE = 12;                 // concurrent fetches; conservative

interface CatalogGameRef {
  slug: string;
  name: string;
  category?: string;
  scene_status?: LiveSnapshotEntry['scene_status'];
  activity_tier?: LiveSnapshotEntry['activity_tier'];
  steam_app_id?: number;
}

interface SteamPlayerCountResponse {
  response?: { player_count?: number; result?: number };
}

// Bundled-data path: the catalog index is imported at build time so the
// Worker does not depend on a publicly reachable Pages site. To refresh
// after MDX content changes, run `npm run worker:sync-data` (which
// `worker:deploy` invokes automatically).
async function fetchCatalogIndex(_env: Env): Promise<CatalogGameRef[]> {
  return (liveCatalog as { games?: CatalogGameRef[] }).games ?? [];
}

async function fetchOneSteamCount(game: CatalogGameRef, userAgent: string): Promise<number | null> {
  if (!game.steam_app_id) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), STEAM_TIMEOUT_MS);
  try {
    const url = `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${game.steam_app_id}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': userAgent, Accept: 'application/json' },
      signal: ctrl.signal,
      cf: { cacheTtl: 240 } as any, // 4-min CF edge cache; mostly redundant but cheap
    });
    if (!res.ok) return null;
    const data = await res.json() as SteamPlayerCountResponse;
    if (data.response?.result !== 1) return null;
    return typeof data.response.player_count === 'number' ? data.response.player_count : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function readTrendingTwitch(env: Env): Promise<Map<string, number>> {
  const cached = await env.NEWS_CACHE.get(runtimeKeys.trendingNow(), 'json') as TrendingPayload | null;
  const out = new Map<string, number>();
  if (!cached) return out;
  for (const item of cached.items) {
    if (typeof item.twitch_viewer_count === 'number') {
      out.set(item.game_slug, item.twitch_viewer_count);
    }
  }
  return out;
}

export interface LiveSnapshotResult {
  ok: boolean;
  fetched_at: string;
  steam_attempted: number;
  steam_succeeded: number;
  twitch_used: boolean;
  errors: string[];
}

export async function refreshLiveSnapshot(env: Env): Promise<LiveSnapshotResult> {
  const fetched_at = new Date().toISOString();
  const errors: string[] = [];

  let games: CatalogGameRef[];
  try {
    games = await fetchCatalogIndex(env);
  } catch (e) {
    const msg = `catalog: ${String(e)}`;
    errors.push(msg);
    await writeHealth(env, false, msg);
    return { ok: false, fetched_at, steam_attempted: 0, steam_succeeded: 0, twitch_used: false, errors };
  }

  const twitchMap = await readTrendingTwitch(env);
  const twitchUsed = twitchMap.size > 0;

  // Batched Steam fetches so we don't fan out 100+ concurrent requests at once.
  const entries: LiveSnapshotEntry[] = new Array(games.length);
  let steamAttempted = 0;
  let steamSucceeded = 0;

  for (let offset = 0; offset < games.length; offset += STEAM_BATCH_SIZE) {
    const batch = games.slice(offset, offset + STEAM_BATCH_SIZE);
    const counts = await Promise.all(batch.map((g) => {
      if (g.steam_app_id) steamAttempted++;
      return fetchOneSteamCount(g, env.USER_AGENT);
    }));
    for (let i = 0; i < batch.length; i++) {
      const g = batch[i];
      const count = counts[i];
      if (count !== null) steamSucceeded++;
      const twitch = twitchMap.get(g.slug);
      const entry: LiveSnapshotEntry = {
        slug: g.slug,
        name: g.name,
        category: g.category ?? '',
        scene_status: g.scene_status,
        activity_tier: g.activity_tier,
        has_steam: typeof g.steam_app_id === 'number',
        has_twitch: twitch !== undefined,
      };
      if (count !== null) {
        entry.steam_players = count;
        entry.steam_fetched_at = fetched_at;
        // Also refresh the per-game record consumed by game profile pages
        // (LivePlayerCount component reads steam:players:{slug}).
        const perGame: GameRuntimeData = {
          game_slug: g.slug,
          current_player_count: count,
          player_count_fetched_at: fetched_at,
        };
        await env.NEWS_CACHE.put(
          runtimeKeys.steamPlayers(g.slug),
          JSON.stringify(perGame),
          { expirationTtl: SNAPSHOT_TTL_SECONDS }
        ).catch(() => { /* per-game write failure should not abort snapshot */ });
      }
      if (twitch !== undefined) {
        entry.twitch_viewers = twitch;
        entry.twitch_fetched_at = fetched_at;
      }
      entries[offset + i] = entry;
    }
  }

  const payload: LiveSnapshot = {
    entries,
    fetched_at,
    steam_attempted: steamAttempted,
    steam_succeeded: steamSucceeded,
    twitch_used: twitchUsed,
  };

  try {
    await env.NEWS_CACHE.put(
      runtimeKeys.liveSnapshot(),
      JSON.stringify(payload),
      { expirationTtl: SNAPSHOT_TTL_SECONDS }
    );
  } catch (e) {
    const msg = `kv_put: ${String(e)}`;
    errors.push(msg);
    await writeHealth(env, false, msg);
    return { ok: false, fetched_at, steam_attempted: steamAttempted, steam_succeeded: steamSucceeded, twitch_used: twitchUsed, errors };
  }

  // Snapshot considered healthy if at least 50% of attempted Steam fetches succeeded.
  const ok = steamAttempted === 0 || steamSucceeded / steamAttempted >= 0.5;
  await writeHealth(env, ok, ok ? undefined : `low_success_rate ${steamSucceeded}/${steamAttempted}`);

  return { ok, fetched_at, steam_attempted: steamAttempted, steam_succeeded: steamSucceeded, twitch_used: twitchUsed, errors };
}

async function writeHealth(env: Env, ok: boolean, errorMsg?: string): Promise<void> {
  const cur = await env.NEWS_CACHE.get(runtimeKeys.liveHealth(), 'json') as LiveHealth | null;
  const next: LiveHealth = {
    last_successful_run: ok ? new Date().toISOString() : (cur?.last_successful_run ?? new Date(0).toISOString()),
    last_error: ok ? undefined : errorMsg,
    consecutive_failures: ok ? 0 : (cur?.consecutive_failures ?? 0) + 1,
  };
  await env.NEWS_CACHE.put(runtimeKeys.liveHealth(), JSON.stringify(next), { expirationTtl: HEALTH_TTL_SECONDS });
}

export async function getLiveSnapshot(env: Env): Promise<LiveSnapshot | null> {
  const cached = await env.NEWS_CACHE.get(runtimeKeys.liveSnapshot(), 'json');
  return (cached as LiveSnapshot) ?? null;
}

export async function getLiveHealth(env: Env): Promise<LiveHealth | null> {
  const cached = await env.NEWS_CACHE.get(runtimeKeys.liveHealth(), 'json');
  return (cached as LiveHealth) ?? null;
}
