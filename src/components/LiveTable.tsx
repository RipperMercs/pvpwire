'use client';

// Live PvP table for /live ("Is it alive? Every PvP Game").
//
// Polls /api/live-now every 60 seconds. Renders a sortable table of every
// catalog game with its current Steam concurrent player count, Twitch
// concurrent viewer count (where available), and editorial scene status.
//
// Anti-staleness contract:
//   - "Last updated Xs ago" timestamp ticks every second
//   - Per-row freshness color: green <5min, amber 5-15min, red >15min
//   - Page-level banner when the snapshot itself is older than 15 min
//   - Falls back to the SSR `fallbackEntries` (catalog metadata only) if the
//     fetch fails, so the table always renders something.

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

interface SnapshotEntry {
  slug: string;
  name: string;
  category: string;
  scene_status?: 'hot' | 'steady' | 'declining' | 'dormant';
  activity_tier?: 'live' | 'casual' | 'fading' | 'dormant' | 'upcoming';
  steam_players?: number;
  steam_fetched_at?: string;
  twitch_viewers?: number;
  twitch_fetched_at?: string;
  has_steam: boolean;
  has_twitch: boolean;
}

interface SnapshotResponse {
  data: {
    entries: SnapshotEntry[];
    fetched_at: string;
    steam_attempted: number;
    steam_succeeded: number;
    twitch_used: boolean;
  } | null;
  fetched_at: string | null;
}

const LIVE_API =
  process.env.NEXT_PUBLIC_LIVE_API ??
  process.env.NEXT_PUBLIC_NEWS_API?.replace(/\/api\/news$/, '/api/live-now') ??
  'https://pvpwire-api.rippertm.workers.dev/api/live-now';

const POLL_INTERVAL_MS = 60_000;
const FRESHNESS_GREEN_MS = 5 * 60_000;
const FRESHNESS_AMBER_MS = 15 * 60_000;

type SortKey = 'players' | 'viewers' | 'name' | 'category';

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

function timeAgo(iso: string, nowMs: number): string {
  const ms = nowMs - new Date(iso).getTime();
  if (ms < 0) return 'just now';
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function freshnessClass(iso: string | undefined, nowMs: number): string {
  if (!iso) return 'text-muted';
  const age = nowMs - new Date(iso).getTime();
  if (age <= FRESHNESS_GREEN_MS) return 'text-signal';
  if (age <= FRESHNESS_AMBER_MS) return 'text-amber-500';
  return 'text-accent';
}

export function LiveTable({ fallbackEntries }: { fallbackEntries: SnapshotEntry[] }) {
  const [snapshot, setSnapshot] = useState<SnapshotResponse['data']>(null);
  const [now, setNow] = useState(() => Date.now());
  const [sortKey, setSortKey] = useState<SortKey>('players');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;
    const fetchOnce = () => {
      fetch(LIVE_API, { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
        .then((data: SnapshotResponse) => {
          if (cancelled) return;
          if (data.data) setSnapshot(data.data);
        })
        .catch(() => { /* keep last snapshot on transient failure */ });
    };
    fetchOnce();
    const id = setInterval(fetchOnce, POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  // Tick the "X seconds ago" timestamps every second so freshness colors
  // and ago-strings stay accurate without re-fetching.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const entries = snapshot?.entries ?? fallbackEntries;
  const snapshotAge = snapshot ? now - new Date(snapshot.fetched_at).getTime() : null;
  const snapshotStale = snapshotAge !== null && snapshotAge > FRESHNESS_AMBER_MS;

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) if (e.category) set.add(e.category);
    return Array.from(set).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter((e) => filterCategory === 'all' || e.category === filterCategory);
  }, [entries, filterCategory]);

  // Editorial activity-tier rank used as the final tiebreaker so the SSR
  // fallback (no live data yet) doesn't appear alphabetical.
  const tierRank: Record<string, number> = { live: 0, casual: 1, fading: 2, dormant: 3, upcoming: 4 };

  const sorted = useMemo(() => {
    const out = [...filtered];
    const dir = sortDir === 'desc' ? -1 : 1;
    out.sort((a, b) => {
      switch (sortKey) {
        case 'players': {
          const av = a.steam_players ?? -1;
          const bv = b.steam_players ?? -1;
          if (av !== bv) return (av - bv) * dir;
          // Both missing live data: fall back to editorial activity tier (live > casual > ...).
          return (tierRank[a.activity_tier ?? 'dormant'] ?? 99) - (tierRank[b.activity_tier ?? 'dormant'] ?? 99);
        }
        case 'viewers': {
          const av = a.twitch_viewers ?? -1;
          const bv = b.twitch_viewers ?? -1;
          if (av !== bv) return (av - bv) * dir;
          return (tierRank[a.activity_tier ?? 'dormant'] ?? 99) - (tierRank[b.activity_tier ?? 'dormant'] ?? 99);
        }
        case 'name': return a.name.localeCompare(b.name) * dir;
        case 'category': return (a.category ?? '').localeCompare(b.category ?? '') * dir;
      }
    });
    return out;
  }, [filtered, sortKey, sortDir]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDir(key === 'name' || key === 'category' ? 'asc' : 'desc');
    }
  }

  return (
    <div>
      {/* Freshness banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-ink/15 pb-3">
        <div className="flex items-center gap-3">
          <span className={`inline-block w-2 h-2 rounded-full ${snapshotStale ? 'bg-accent animate-pulse' : 'bg-signal animate-pulse'}`} />
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
            {snapshot?.fetched_at
              ? `Snapshot updated ${timeAgo(snapshot.fetched_at, now)}`
              : 'Live data loading...'}
          </span>
          {snapshot?.twitch_used && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              + Twitch viewers
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Category:
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="font-mono text-xs uppercase tracking-widest border border-ink/20 px-3 py-1 bg-paper"
          >
            <option value="all">All ({entries.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {snapshotStale && (
        <div className="mb-6 border border-accent/40 bg-accent/5 px-4 py-3 font-serif text-sm text-ink/85">
          Live data is delayed. Last successful snapshot was {snapshot ? timeAgo(snapshot.fetched_at, now) : 'a while ago'}. Player counts shown may not reflect the current state.
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-ink/15 surface">
        <table className="w-full text-left">
          <thead className="border-b border-ink/15 bg-paper-elev">
            <tr className="font-mono text-[10px] uppercase tracking-widest text-muted">
              <th className="px-3 py-2 w-10">#</th>
              <Th onClick={() => toggleSort('name')} active={sortKey === 'name'} dir={sortDir}>Game</Th>
              <Th onClick={() => toggleSort('category')} active={sortKey === 'category'} dir={sortDir} className="hidden sm:table-cell">Category</Th>
              <Th onClick={() => toggleSort('players')} active={sortKey === 'players'} dir={sortDir} align="right">Playing now</Th>
              <Th onClick={() => toggleSort('viewers')} active={sortKey === 'viewers'} dir={sortDir} align="right" className="hidden md:table-cell">Watching</Th>
              <th className="px-3 py-2 hidden lg:table-cell">Scene</th>
              <th className="px-3 py-2 hidden md:table-cell">Source</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e, i) => (
              <tr key={e.slug} className="border-b border-ink/10 last:border-0 hover:bg-paper-elev transition">
                <td className="px-3 py-2.5 font-mono text-[11px] text-muted">{i + 1}</td>
                <td className="px-3 py-2.5">
                  <Link href={`/games/${e.slug}/`} className="font-display text-sm font-bold text-ink hover:text-accent transition">
                    {e.name}
                  </Link>
                </td>
                <td className="px-3 py-2.5 font-mono text-[10px] uppercase tracking-widest text-muted hidden sm:table-cell">
                  {e.category}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-sm tabular-nums">
                  {typeof e.steam_players === 'number' ? (
                    <span className={freshnessClass(e.steam_fetched_at, now)}>
                      {formatCount(e.steam_players)}
                    </span>
                  ) : (
                    <span className="text-muted text-xs">{e.has_steam ? '...' : 'no data'}</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-sm tabular-nums hidden md:table-cell">
                  {typeof e.twitch_viewers === 'number' ? (
                    <span className={freshnessClass(e.twitch_fetched_at, now)}>
                      {formatCount(e.twitch_viewers)}
                    </span>
                  ) : (
                    <span className="text-muted text-xs">-</span>
                  )}
                </td>
                <td className="px-3 py-2.5 hidden lg:table-cell">
                  {e.scene_status && (
                    <span className={`badge text-[9px] badge-${e.scene_status === 'hot' ? 'accent' : 'active'}`}>
                      {e.scene_status}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 hidden md:table-cell">
                  <div className="flex gap-1">
                    {e.has_steam && (
                      <span className="font-mono text-[9px] uppercase tracking-widest text-muted border border-ink/20 px-1.5">Steam</span>
                    )}
                    {e.has_twitch && (
                      <span className="font-mono text-[9px] uppercase tracking-widest text-muted border border-ink/20 px-1.5">Twitch</span>
                    )}
                    {!e.has_steam && !e.has_twitch && (
                      <span className="font-mono text-[9px] uppercase tracking-widest text-muted">editorial</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 font-serif text-xs text-muted leading-relaxed max-w-3xl">
        Concurrent player counts via the Steam Web API, refreshed every 5 minutes. Concurrent viewer counts via the Twitch Helix API, refreshed every 30 minutes. Games without a Steam app id or current Twitch directory show editorial scene status only. Counts include all play modes; PvE and casual play are not separated.
      </p>
    </div>
  );
}

function Th({
  children,
  onClick,
  active,
  dir,
  align,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  dir?: 'asc' | 'desc';
  align?: 'right';
  className?: string;
}) {
  return (
    <th
      className={`px-3 py-2 cursor-pointer select-none ${align === 'right' ? 'text-right' : ''} ${className}`}
      onClick={onClick}
    >
      <span className={active ? 'text-accent' : ''}>
        {children}
        {active && <span className="ml-1">{dir === 'desc' ? 'v' : '^'}</span>}
      </span>
    </th>
  );
}
