// Steam News aggregator (PIVOT.md Section 22.3).
// Reads /steam-app-ids.json (built from /content/catalog/ frontmatter at
// Next build time) to find catalog games with steam_app_id set, then
// queries Steam's public News API for each. No API key required.
//
// Steam News API:
//   GET https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=N&count=5&format=json

import type { Env } from './types';
import steamAppIds from './data/steam-app-ids.json';

export interface SteamItemPayload {
  source_type: 'steam';
  title: string;
  url: string;
  description?: string;
  posted_at: string;
  hash: string;
  game_slug: string;
  game_name: string;
  steam_app_id: number;
  feed_label: string;
}

interface CatalogGameRef {
  slug: string;
  name: string;
  steam_app_id: number;
}

interface SteamNewsItem {
  gid: string;
  title: string;
  url: string;
  is_external_url?: boolean;
  author?: string;
  contents?: string;
  feedlabel?: string;
  date: number;        // unix seconds
  feedname?: string;
  feed_type?: number;
  appid: number;
}

const PER_GAME_COUNT = 5;

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function hashFor(gid: string): string {
  return `s:${gid}`;
}

// Bundled at build time via scripts/sync-worker-data.mjs (see
// package.json's worker:deploy script). Catalog refreshes require a
// Worker redeploy.
async function fetchCatalogGames(_env: Env): Promise<CatalogGameRef[]> {
  const games = (steamAppIds as { games?: { slug: string; name: string; steam_app_id?: number }[] }).games ?? [];
  return games.filter((g): g is CatalogGameRef => typeof g.steam_app_id === 'number');
}

async function fetchOneGame(game: CatalogGameRef, userAgent: string, timeoutMs = 6000): Promise<SteamItemPayload[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const url = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${game.steam_app_id}&count=${PER_GAME_COUNT}&format=json`;
    const res = await fetch(url, {
      headers: { 'User-Agent': userAgent, Accept: 'application/json' },
      signal: ctrl.signal,
      cf: { cacheTtl: 1500 } as any,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as { appnews?: { newsitems?: SteamNewsItem[] } };
    const items = data.appnews?.newsitems ?? [];
    return items.map((it): SteamItemPayload => ({
      source_type: 'steam',
      title: stripTags(it.title || ''),
      url: it.url,
      description: stripTags(it.contents || '').slice(0, 240) || undefined,
      posted_at: new Date(it.date * 1000).toISOString(),
      hash: hashFor(it.gid),
      game_slug: game.slug,
      game_name: game.name,
      steam_app_id: game.steam_app_id,
      feed_label: it.feedlabel || 'Community Announcements',
    })).filter((it) => it.title && it.url);
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchSteamSources(env: Env): Promise<{
  items: SteamItemPayload[];
  errors: { game_slug: string; error: string }[];
}> {
  let games: CatalogGameRef[];
  try {
    games = await fetchCatalogGames(env);
  } catch (e) {
    return { items: [], errors: [{ game_slug: '_index', error: String(e) }] };
  }

  if (games.length === 0) return { items: [], errors: [] };

  const settled = await Promise.allSettled(games.map((g) => fetchOneGame(g, env.USER_AGENT)));
  const errors: { game_slug: string; error: string }[] = [];
  const all: SteamItemPayload[] = [];
  for (let i = 0; i < settled.length; i++) {
    const r = settled[i];
    if (r.status === 'fulfilled') {
      all.push(...r.value);
    } else {
      errors.push({ game_slug: games[i].slug, error: String(r.reason) });
    }
  }

  // Dedup per family by hash (Steam GID is already unique per news item).
  const seen = new Set<string>();
  const deduped: SteamItemPayload[] = [];
  for (const it of all) {
    if (seen.has(it.hash)) continue;
    seen.add(it.hash);
    deduped.push(it);
  }

  deduped.sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime());
  return { items: deduped, errors };
}
