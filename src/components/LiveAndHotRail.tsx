'use client';

// Live and Hot rail for the home page (Section 22.5).
//
// First paint: renders `fallback` (the manually `trending`-flagged catalog
// games), so SEO crawlers and no-JS users still see a sensible list.
// After mount: fetches /api/trending-now from the Worker, which returns a
// ranked list combining current Twitch viewer counts (preferred signal) and
// Steam concurrent player counts. If the fetch fails or returns nothing,
// the fallback stays in place silently.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GameCover } from '@/components/GameCover';
import type { GameFrontmatter } from '@/lib/schemas';

const TRENDING_API =
  process.env.NEXT_PUBLIC_TRENDING_API ??
  process.env.NEXT_PUBLIC_NEWS_API?.replace(/\/api\/news$/, '/api/trending-now') ??
  'https://pvpwire-api.rippertm.workers.dev/api/trending-now';

interface TrendingItem {
  game_slug: string;
  game_name: string;
  twitch_viewer_count?: number;
  steam_player_count?: number;
  signal: 'twitch' | 'steam' | 'manual';
  rank: number;
}

interface TrendingResponse {
  data: {
    items: TrendingItem[];
    fetched_at: string;
    source: 'twitch' | 'steam' | 'mixed';
    attribution: ('twitch' | 'steam')[];
  } | null;
  fetched_at: string | null;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function LiveAndHotRail({
  fallback,
  catalog,
}: {
  fallback: GameFrontmatter[];
  catalog: GameFrontmatter[];
}) {
  // Resolve TrendingItem.game_slug back to full GameFrontmatter so we can
  // render covers, badges, meta notes, etc. without re-fetching catalog.
  const catalogBySlug = new Map(catalog.map((g) => [g.slug, g]));

  const [items, setItems] = useState<{ game: GameFrontmatter; viewers?: number; players?: number; signal: TrendingItem['signal'] }[]>(
    fallback.map((g) => ({ game: g, signal: 'manual' as const }))
  );
  const [source, setSource] = useState<'twitch' | 'steam' | 'mixed' | 'manual'>('manual');

  useEffect(() => {
    let cancelled = false;
    fetch(TRENDING_API)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: TrendingResponse) => {
        if (cancelled || !data.data || data.data.items.length === 0) return;
        const resolved = data.data.items
          .map((it) => {
            const game = catalogBySlug.get(it.game_slug);
            if (!game) return null;
            return {
              game,
              viewers: it.twitch_viewer_count,
              players: it.steam_player_count,
              signal: it.signal,
            };
          })
          .filter((x): x is NonNullable<typeof x> => x !== null)
          .slice(0, 8);
        if (resolved.length > 0) {
          setItems(resolved);
          setSource(data.data.source);
        }
      })
      .catch(() => { /* silent fall-through to fallback */ });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (items.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(({ game: g, viewers, players, signal }) => (
          <Link key={g.slug} href={`/games/${g.slug}/`} className="group block">
            <div className="relative">
              <GameCover
                game={g}
                variant="poster"
                className="border border-ink/15 group-hover:border-accent transition"
              />
              {g.scene_status && (
                <span className={`absolute top-1.5 left-1.5 badge badge-${g.scene_status === 'hot' ? 'accent' : 'active'} text-[9px]`}>
                  {g.scene_status}
                </span>
              )}
              {(viewers || players) && (
                <span className="absolute bottom-1.5 right-1.5 bg-ink/85 text-paper font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5">
                  {viewers ? `${formatCount(viewers)} watching` : `${formatCount(players!)} playing`}
                </span>
              )}
            </div>
            <div className="mt-2">
              <div className="font-display text-base font-bold text-ink group-hover:text-accent transition leading-tight line-clamp-2">
                {g.name}
              </div>
              {g.activity_tier && (
                <div className="font-mono text-[9px] uppercase tracking-widest text-accent mt-1">
                  {g.activity_tier}
                </div>
              )}
              {g.current_meta_note && (
                <p className="font-serif text-sm text-ink/75 mt-2 leading-snug line-clamp-3">
                  {g.current_meta_note}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
      {source !== 'manual' && (
        <div className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted">
          Live ranking via {source === 'mixed' ? 'Twitch and Steam' : source === 'twitch' ? 'Twitch' : 'Steam'}, refreshed every 30 minutes.
        </div>
      )}
    </div>
  );
}
