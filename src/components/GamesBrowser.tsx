'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { GameFrontmatter } from '@/lib/schemas';
import { GAME_CATEGORIES } from '@/lib/schemas';
import { FilterIcon, SearchIcon } from '@/components/icons';
import { GameCover } from '@/components/GameCover';

type SortKey = 'name' | 'release_year' | 'updated';

export function GamesBrowser({ games }: { games: GameFrontmatter[] }) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get('category') || 'all';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>(initialCategory);
  const [status, setStatus] = useState<string>('all');
  const [proOnly, setProOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>('name');

  useEffect(() => {
    const c = searchParams?.get('category');
    if (c && c !== category) setCategory(c);
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = games.filter((g) => {
      if (category !== 'all' && g.category !== category) return false;
      if (status !== 'all' && g.status !== status) return false;
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

    if (sort === 'name') list = list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'release_year') list = list.sort((a, b) => b.release_year - a.release_year);
    if (sort === 'updated')
      list = list.sort(
        (a, b) => new Date(b.last_updated || 0).getTime() - new Date(a.last_updated || 0).getTime()
      );
    return list;
  }, [games, search, category, status, proOnly, sort]);

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
          label="Category"
          value={category}
          onChange={setCategory}
          options={[{ value: 'all', label: 'All categories' }, ...GAME_CATEGORIES.map((c) => ({ value: c, label: c }))]}
        />

        <FilterGroup
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'Any status' },
            { value: 'active', label: 'Active' },
            { value: 'classic', label: 'Classic' },
            { value: 'sunset', label: 'Sunset' },
            { value: 'upcoming', label: 'Upcoming' },
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
            { value: 'name', label: 'Alphabetical' },
            { value: 'release_year', label: 'Newest first' },
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
  return (
    <Link
      href={`/games/${game.slug}/`}
      className="group block transition"
    >
      <GameCover
        game={game}
        variant="poster"
        className="border border-ink/15 group-hover:border-accent transition"
      />
      <div className="mt-2">
        <div className="font-display text-sm font-bold text-ink group-hover:text-accent transition leading-tight line-clamp-2">
          {game.name}
        </div>
        <div className="font-mono text-[9px] uppercase tracking-widest text-muted mt-1 line-clamp-1">
          {game.category}
        </div>
      </div>
    </Link>
  );
}
