'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { GameFrontmatter } from '@/lib/schemas';
import { GAME_CATEGORIES } from '@/lib/schemas';
import { FilterIcon, SearchIcon } from '@/components/icons';
import { GameCover } from '@/components/GameCover';

type SortKey = 'v2' | 'name' | 'release_year' | 'updated';

// v2 derived activity tier when the field is missing on a frontmatter.
function deriveTier(g: GameFrontmatter): NonNullable<GameFrontmatter['activity_tier']> {
  if (g.activity_tier) return g.activity_tier;
  if (g.status === 'upcoming') return 'upcoming';
  if (g.status === 'sunset') return 'dormant';
  if (g.status === 'active') {
    if (g.release_year >= 2022) return 'live';
    if (g.release_year >= 2015) return 'casual';
    return 'fading';
  }
  return 'fading';
}

const STATUS_ORDER: Record<string, number> = {
  active: 0,
  upcoming: 1,
  classic: 2,
  sunset: 3,
};

const TIER_ORDER: Record<string, number> = {
  live: 0,
  upcoming: 1,
  casual: 2,
  fading: 3,
  dormant: 4,
};

export function GamesBrowser({ games }: { games: GameFrontmatter[] }) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get('category') || 'all';

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [category, setCategory] = useState<string>(initialCategory);
  const [tier, setTier] = useState<string>('all');
  const [proOnly, setProOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>('v2');

  useEffect(() => {
    const c = searchParams?.get('category');
    if (c && c !== category) setCategory(c);
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = games.filter((g) => {
      if (status !== 'all' && g.status !== status) return false;
      if (category !== 'all' && g.category !== category) return false;
      if (tier !== 'all' && deriveTier(g) !== tier) return false;
      if (proOnly && !g.has_pro_scene) return false;
      if (!q) return true;
      return (
        g.name.toLowerCase().includes(q) ||
        (g.aliases || []).some((a) => a.toLowerCase().includes(q)) ||
        (g.sub_categories || []).some((s) => s.toLowerCase().includes(q)) ||
        g.developer.toLowerCase().includes(q) ||
        g.publisher.toLowerCase().includes(q)
      );
    });

    if (sort === 'v2') {
      // status-first, tier-second, priority-third, alphabetical-tiebreaker
      list = list.sort((a, b) => {
        const sa = STATUS_ORDER[a.status] ?? 99;
        const sb = STATUS_ORDER[b.status] ?? 99;
        if (sa !== sb) return sa - sb;
        const ta = TIER_ORDER[deriveTier(a)] ?? 99;
        const tb = TIER_ORDER[deriveTier(b)] ?? 99;
        if (ta !== tb) return ta - tb;
        const pa = a.priority ?? 100;
        const pb = b.priority ?? 100;
        if (pa !== pb) return pa - pb;
        return a.name.localeCompare(b.name);
      });
    }
    if (sort === 'name') list = list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'release_year') list = list.sort((a, b) => b.release_year - a.release_year);
    if (sort === 'updated')
      list = list.sort(
        (a, b) => new Date(b.last_updated || 0).getTime() - new Date(a.last_updated || 0).getTime()
      );
    return list;
  }, [games, search, status, category, tier, proOnly, sort]);

  return (
    <div className="grid lg:grid-cols-[260px,1fr] gap-8">
      <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
        <div className="flex items-center gap-2 text-ink/70 mb-2">
          <FilterIcon size={16} />
          <span className="font-mono text-[11px] uppercase tracking-widest">Filters</span>
        </div>

        <div className="relative">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search games"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-ink/20 bg-paper font-serif text-base focus:outline-none focus:border-accent"
          />
        </div>

        <FilterGroup
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'Any status' },
            { value: 'active', label: 'Active' },
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'classic', label: 'Classic' },
            { value: 'sunset', label: 'Sunset' },
          ]}
        />

        <FilterGroup
          label="Category"
          value={category}
          onChange={setCategory}
          options={[{ value: 'all', label: 'All categories' }, ...GAME_CATEGORIES.map((c) => ({ value: c, label: c }))]}
        />

        <FilterGroup
          label="Activity tier"
          value={tier}
          onChange={setTier}
          options={[
            { value: 'all', label: 'Any tier' },
            { value: 'live', label: 'Live (2022+ active)' },
            { value: 'casual', label: 'Casual (2015 to 2021 active)' },
            { value: 'fading', label: 'Fading (older active)' },
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'dormant', label: 'Dormant / sunset' },
          ]}
        />

        <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink/80 cursor-pointer">
          <input
            type="checkbox"
            checked={proOnly}
            onChange={(e) => setProOnly(e.target.checked)}
            className="accent-accent"
          />
          Has a pro scene
        </label>

        <FilterGroup
          label="Sort"
          value={sort}
          onChange={(v) => setSort(v as SortKey)}
          options={[
            { value: 'v2', label: 'Most contested first' },
            { value: 'name', label: 'Alphabetical' },
            { value: 'release_year', label: 'Newest release' },
            { value: 'updated', label: 'Recently updated' },
          ]}
        />
      </aside>

      <div>
        <div className="flex justify-between items-baseline mb-4">
          <div className="font-mono text-xs uppercase tracking-widest text-muted">
            {filtered.length} of {games.length}
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="border border-ink/15 p-12 text-center">
            <p className="font-serif text-lg text-muted">No games match those filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((g) => (
              <GamePosterCard key={g.slug} game={g} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-widest text-muted block mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-ink/20 bg-paper font-serif text-base focus:outline-none focus:border-accent"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function GamePosterCard({ game }: { game: GameFrontmatter }) {
  const tier = deriveTier(game);
  return (
    <Link
      href={`/games/${game.slug}/`}
      className="group block transition"
    >
      <div className="relative">
        <GameCover
          game={game}
          variant="poster"
          className="border border-ink/15 group-hover:border-accent transition"
        />
        {game.trending && (
          <span className="absolute top-1.5 left-1.5 badge badge-accent text-[9px]">trending</span>
        )}
        {!game.trending && game.scene_status === 'hot' && (
          <span className="absolute top-1.5 left-1.5 badge badge-active text-[9px]">hot</span>
        )}
      </div>
      <div className="mt-2">
        <div className="font-display text-sm font-bold text-ink group-hover:text-accent transition leading-tight line-clamp-2">
          {game.name}
        </div>
        <div className="font-mono text-[9px] uppercase tracking-widest text-muted mt-1 line-clamp-1">
          {game.category}
        </div>
        <div className="font-mono text-[9px] uppercase tracking-widest text-accent mt-0.5">
          {tier}
        </div>
      </div>
    </Link>
  );
}
