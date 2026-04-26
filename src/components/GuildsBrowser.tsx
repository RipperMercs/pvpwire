'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { GuildFrontmatter } from '@/lib/schemas';
import { guildStatusDisplay } from '@/lib/format';
import { FilterIcon, SearchIcon } from '@/components/icons';

export function GuildsBrowser({
  guilds,
  gameMap,
}: {
  guilds: GuildFrontmatter[];
  gameMap: Record<string, string>;
}) {
  const [search, setSearch] = useState('');
  const [era, setEra] = useState<string>('all');
  const [game, setGame] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');

  const allGameSlugs = useMemo(() => {
    const set = new Set<string>();
    for (const g of guilds) for (const e of g.games || []) set.add(e.game_slug);
    return Array.from(set).sort((a, b) => (gameMap[a] || a).localeCompare(gameMap[b] || b));
  }, [guilds, gameMap]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return guilds.filter((g) => {
      if (era !== 'all' && g.era !== era) return false;
      if (status !== 'all' && g.status !== status) return false;
      if (game !== 'all' && !(g.games || []).some((e) => e.game_slug === game)) return false;
      if (!q) return true;
      return (
        g.name.toLowerCase().includes(q) ||
        (g.aliases || []).some((a) => a.toLowerCase().includes(q)) ||
        (g.notable_members || []).some((m) => m.handle.toLowerCase().includes(q))
      );
    });
  }, [guilds, search, era, game, status]);

  return (
    <div>
      <div className="grid lg:grid-cols-[280px,1fr] gap-8">
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <div className="flex items-center gap-2 text-ink/70 mb-2">
            <FilterIcon size={16} />
            <span className="font-mono text-[11px] uppercase tracking-widest">Filters</span>
          </div>

          <div className="relative">
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder="Search guilds, members"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-ink/20 bg-paper font-serif text-base focus:outline-none focus:border-accent"
            />
          </div>

          <Select label="Era" value={era} onChange={setEra} options={[
            { value: 'all', label: 'Any era' },
            { value: 'og', label: 'OG (1990s, early 2000s)' },
            { value: 'classic', label: 'Classic' },
            { value: 'modern', label: 'Modern' },
            { value: 'active', label: 'Currently active' },
          ]}/>

          <Select label="Game" value={game} onChange={setGame} options={[
            { value: 'all', label: 'Any game' },
            ...allGameSlugs.map((s) => ({ value: s, label: gameMap[s] || s })),
          ]}/>

          <Select label="Status" value={status} onChange={setStatus} options={[
            { value: 'all', label: 'Any status' },
            { value: 'active', label: 'Active' },
            { value: 'dormant', label: 'Dormant' },
            { value: 'dissolved', label: 'Dissolved' },
            { value: 'reformed', label: 'Reformed' },
            { value: 'retired', label: 'Actively Retired' },
          ]}/>

          <Link
            href="/guilds/submit/"
            className="block text-center bg-accent text-paper px-4 py-3 font-mono text-xs uppercase tracking-widest hover:bg-ink transition"
          >
            Submit a guild
          </Link>
        </aside>

        <div>
          <div className="flex justify-between items-baseline mb-4">
            <div className="font-mono text-xs uppercase tracking-widest text-muted">
              {filtered.length} of {guilds.length}
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="border border-ink/15 p-12 text-center">
              <p className="font-serif text-lg text-muted">No guilds match these filters. Submit one if it should be here.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((g) => (
                <GuildCard key={g.slug} guild={g} gameMap={gameMap} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Select({
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

function GuildCard({ guild, gameMap }: { guild: GuildFrontmatter; gameMap: Record<string, string> }) {
  const primaryGame = guild.games?.[0];
  const gameLabel = primaryGame ? gameMap[primaryGame.game_slug] || primaryGame.game_slug : '';
  return (
    <Link
      href={`/guilds/${guild.slug}/`}
      className="group border border-ink/15 hover:border-accent p-5 flex flex-col gap-3 transition bg-paper"
    >
      <div className="flex justify-between items-start gap-3">
        <span className={`badge badge-${guild.era}`}>{guild.era}</span>
        <span className={`badge badge-${guild.status}`}>{guildStatusDisplay(guild.status)}</span>
      </div>
      <div>
        <h3 className="masthead-title text-2xl text-ink group-hover:text-accent transition">{guild.name}</h3>
        {guild.aliases && guild.aliases[0] && (
          <div className="font-serif text-sm text-muted italic mt-0.5">also: {guild.aliases.join(', ')}</div>
        )}
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted mt-2">
          {gameLabel}{primaryGame?.server ? ` / ${primaryGame.server}` : ''} / {guild.era_active.start}, {guild.era_active.end === 'active' ? 'active' : guild.era_active.end}
        </div>
      </div>
      {guild.status_note && (
        <p className="font-serif text-sm text-ink/75 leading-relaxed">{guild.status_note}</p>
      )}
    </Link>
  );
}
