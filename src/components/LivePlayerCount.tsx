'use client';

// Renders the current Steam player count for a game, fetched at request time
// from the Worker (PIVOT.md Section 22.4 Integration A).
// Falls back silently if the game has no Steam app id, no cached value, or
// the Worker is unreachable. Never blocks the static render.

import { useEffect, useState } from 'react';

const RUNTIME_API =
  process.env.NEXT_PUBLIC_GAME_RUNTIME_API ??
  process.env.NEXT_PUBLIC_NEWS_API?.replace(/\/api\/news$/, '/api/game-runtime') ??
  'https://pvpwire-api.rippertm.workers.dev/api/game-runtime';

interface RuntimeResponse {
  game_slug: string;
  data: {
    current_player_count?: number;
    player_count_fetched_at?: string;
  } | null;
  fetched_at: string | null;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export function LivePlayerCount({ gameSlug }: { gameSlug: string }) {
  const [count, setCount] = useState<number | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${RUNTIME_API}/${gameSlug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: RuntimeResponse) => {
        if (cancelled) return;
        if (typeof data.data?.current_player_count === 'number') {
          setCount(data.data.current_player_count);
          setFetchedAt(data.data.player_count_fetched_at ?? data.fetched_at);
        }
      })
      .catch(() => {
        if (!cancelled) setErrored(true);
      });
    return () => {
      cancelled = true;
    };
  }, [gameSlug]);

  if (errored || count === null) return null;

  return (
    <div className="flex justify-between items-baseline gap-2 py-1 border-b border-ink/10 last:border-0">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Live on Steam</span>
      <span className="font-mono text-[11px] uppercase tracking-widest text-ink/85">
        {formatCount(count)}
        {fetchedAt && (
          <span className="ml-2 text-muted normal-case tracking-normal">{timeAgo(fetchedAt)}</span>
        )}
      </span>
    </div>
  );
}
