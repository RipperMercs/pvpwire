'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ExternalLinkIcon, ArrowRightIcon, RssIcon } from '@/components/icons';
import { authorDisplay } from '@/lib/format';
import type { AggregatedItem, RedditAggregatedItem, SteamAggregatedItem, EditorialAggregatedItem } from '@/lib/aggregated-items';

type Original = {
  slug: string;
  title: string;
  author: string;
  category: string;
  tags?: string[];
  hero_image?: string;
  published: string;
  description: string;
  excerpt: string;
};

interface FeedResponseV2 {
  items: AggregatedItem[];
  counts: { editorial: number; reddit: number; steam: number; total: number };
  fetchedAt: { editorial: string | null; reddit: string | null; steam: string | null };
  // Legacy fields (kept for graceful degradation)
  articles?: Array<{ title: string; url: string; description: string; publishedAt: string; source: string; sourceDomain: string }>;
  sources?: string[];
}

type Filter = 'all' | 'original' | 'aggregated';
type AuthorFilter = 'all' | 'editorial' | 'flosium' | 'og' | 'flipper';

const NEWS_API = process.env.NEXT_PUBLIC_NEWS_API ?? 'https://pvpwire-api.workers.dev/api/news';

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return 'soon';
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function NewsBrowser({ originals }: { originals: Original[] }) {
  const [feed, setFeed] = useState<FeedResponseV2 | null>(null);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [author, setAuthor] = useState<AuthorFilter>('all');

  // Source-family multi-select toggles for the v2.1 mixed feed.
  const [includeEditorial, setIncludeEditorial] = useState(true);
  const [includeReddit, setIncludeReddit] = useState(true);
  const [includeSteam, setIncludeSteam] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(NEWS_API)
      .then((r) => r.json())
      .then((data: FeedResponseV2) => {
        if (cancelled) return;
        setFeed(data);
        setFeedLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setFeedError(String(e));
        setFeedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredOriginals = useMemo(() => {
    if (filter === 'aggregated') return [];
    if (author === 'all') return originals;
    return originals.filter((o) => o.author === author);
  }, [filter, author, originals]);

  const filteredAggregated = useMemo<AggregatedItem[]>(() => {
    if (filter === 'original') return [];
    const items = feed?.items ?? [];
    return items.filter((it) => {
      if (it.source_type === 'editorial') return includeEditorial;
      if (it.source_type === 'reddit') return includeReddit;
      if (it.source_type === 'steam') return includeSteam;
      return false;
    });
  }, [filter, feed, includeEditorial, includeReddit, includeSteam]);

  const merged = useMemo(() => {
    type FeedRow =
      | { kind: 'original'; date: string; payload: Original }
      | { kind: 'aggregated'; date: string; payload: AggregatedItem };
    const items: FeedRow[] = [
      ...filteredOriginals.map((o) => ({ kind: 'original' as const, date: o.published, payload: o })),
      ...filteredAggregated.map((a) => ({ kind: 'aggregated' as const, date: a.posted_at, payload: a })),
    ];
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredOriginals, filteredAggregated]);

  const heroOriginals = filteredOriginals.slice(0, 3);
  const counts = feed?.counts;

  return (
    <div>
      {/* Top hero strip */}
      {heroOriginals.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-6 mb-12 border-b border-ink/15 pb-12">
          {heroOriginals.map((a, i) => (
            <Link
              key={a.slug}
              href={`/news/${a.slug}/`}
              className={`group block ${i === 0 ? 'lg:col-span-2' : ''}`}
            >
              <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-3">
                {authorDisplay(a.author)} / {new Date(a.published).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <h2 className={`masthead-title text-ink group-hover:text-accent transition ${i === 0 ? 'text-3xl sm:text-5xl' : 'text-2xl sm:text-3xl'}`}>
                {a.title}
              </h2>
              <p className="font-serif text-base text-ink/75 mt-3 leading-relaxed">{a.excerpt}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6 sticky top-16 z-30 bg-paper py-3 border-b border-ink/15">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterChip>
        <FilterChip active={filter === 'original'} onClick={() => setFilter('original')}>Original</FilterChip>
        <FilterChip active={filter === 'aggregated'} onClick={() => setFilter('aggregated')}>Aggregated</FilterChip>
        <span className="w-px h-6 bg-ink/15 mx-2" />
        <SourceToggle active={includeEditorial} onClick={() => setIncludeEditorial((v) => !v)} count={counts?.editorial}>
          Editorial
        </SourceToggle>
        <SourceToggle active={includeReddit} onClick={() => setIncludeReddit((v) => !v)} count={counts?.reddit}>
          Reddit
        </SourceToggle>
        <SourceToggle active={includeSteam} onClick={() => setIncludeSteam((v) => !v)} count={counts?.steam}>
          Steam
        </SourceToggle>
        <span className="w-px h-6 bg-ink/15 mx-2" />
        <select
          value={author}
          onChange={(e) => setAuthor(e.target.value as AuthorFilter)}
          className="font-mono text-xs uppercase tracking-widest border border-ink/20 px-3 py-1.5 bg-paper"
        >
          <option value="all">All authors</option>
          <option value="editorial">PVPWire Editorial</option>
          <option value="flosium">Flosium (legacy)</option>
          <option value="og">Og (legacy)</option>
          <option value="flipper">Flipper (legacy)</option>
        </select>
        <a
          href="/rss/news.xml"
          className="ml-auto inline-flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-accent hover:text-ink transition"
        >
          <RssIcon size={14} /> RSS
        </a>
      </div>

      {/* Feed status */}
      {feedLoading && filter !== 'original' && (
        <div className="font-serif text-muted italic mb-6">Loading the feed...</div>
      )}
      {feedError && filter !== 'original' && (
        <div className="font-serif text-muted italic mb-6 border border-ink/15 p-4">
          The aggregated feed could not be reached. Original articles are still available below.
        </div>
      )}

      {merged.length === 0 ? (
        <div className="border border-ink/15 p-12 text-center">
          <p className="font-serif text-lg text-muted">Nothing to show with these filters.</p>
        </div>
      ) : (
        <ul className="divide-y divide-ink/10 border-t border-b border-ink/15">
          {merged.map((row, i) =>
            row.kind === 'original' ? (
              <OriginalRow key={`o-${row.payload.slug}-${i}`} a={row.payload} />
            ) : row.payload.source_type === 'reddit' ? (
              <RedditRow key={`r-${row.payload.hash}-${i}`} item={row.payload as RedditAggregatedItem} />
            ) : row.payload.source_type === 'steam' ? (
              <SteamRow key={`s-${row.payload.hash}-${i}`} item={row.payload as SteamAggregatedItem} />
            ) : (
              <EditorialRow key={`e-${row.payload.hash}-${i}`} item={row.payload as EditorialAggregatedItem} />
            )
          )}
        </ul>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-mono text-[11px] uppercase tracking-widest px-3 py-1.5 border transition ${
        active
          ? 'bg-ink text-paper border-ink'
          : 'bg-paper text-ink/70 border-ink/20 hover:border-accent hover:text-accent'
      }`}
    >
      {children}
    </button>
  );
}

function SourceToggle({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-mono text-[10px] uppercase tracking-widest px-2.5 py-1.5 border transition inline-flex items-center gap-1.5 ${
        active
          ? 'bg-accent/10 text-accent border-accent/40'
          : 'bg-paper text-ink/40 border-ink/15 hover:border-ink/30'
      }`}
    >
      {children}
      {typeof count === 'number' && (
        <span className={`text-[9px] ${active ? 'text-accent/80' : 'text-ink/30'}`}>{count}</span>
      )}
    </button>
  );
}

function OriginalRow({ a }: { a: Original }) {
  return (
    <li className="py-5">
      <Link href={`/news/${a.slug}/`} className="group block hover:text-accent transition">
        <div className="flex flex-wrap items-baseline gap-3 mb-1">
          <span className="font-mono text-[11px] uppercase tracking-widest text-accent">
            {authorDisplay(a.author)}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Original / {a.category}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted ml-auto">
            {new Date(a.published).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <h3 className="font-serif text-2xl text-ink group-hover:text-accent transition">{a.title}</h3>
        <p className="font-serif text-base text-ink/75 mt-1">{a.excerpt}</p>
      </Link>
    </li>
  );
}

function EditorialRow({ item }: { item: EditorialAggregatedItem }) {
  return (
    <li className="py-4">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block hover:text-accent transition"
      >
        <div className="flex flex-wrap items-baseline gap-3 mb-1">
          <span className="font-mono text-[11px] uppercase tracking-widest text-ink/70">
            {item.source_name}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
            {item.source_domain}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted ml-auto">
            {timeAgo(item.posted_at)}
          </span>
        </div>
        <h3 className="font-serif text-xl text-ink group-hover:text-accent transition flex items-start gap-2">
          {item.title}
          <ExternalLinkIcon size={14} className="mt-1 shrink-0 text-muted group-hover:text-accent" />
        </h3>
        {item.description && (
          <p className="font-serif text-base text-ink/65 mt-1">{item.description}</p>
        )}
      </a>
    </li>
  );
}

// Compact card for Reddit. Single-line title, score and subreddit visible,
// no description block. Reddit volume is high so this prevents the feed
// from being visually dominated by Reddit links.
function RedditRow({ item }: { item: RedditAggregatedItem }) {
  return (
    <li className="py-2.5">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block hover:text-accent transition"
      >
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-signal shrink-0">
            Reddit / r/{item.subreddit}
          </span>
          {item.score > 0 && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted shrink-0">
              {item.score} pts
            </span>
          )}
          <span className="font-serif text-base text-ink group-hover:text-accent transition flex-1 min-w-0">
            {item.title}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted shrink-0">
            {timeAgo(item.posted_at)}
          </span>
        </div>
      </a>
    </li>
  );
}

function SteamRow({ item }: { item: SteamAggregatedItem }) {
  return (
    <li className="py-4">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block hover:text-accent transition"
      >
        <div className="flex flex-wrap items-baseline gap-3 mb-1">
          <span className="font-mono text-[11px] uppercase tracking-widest text-signal">
            Steam
          </span>
          <Link
            href={`/games/${item.game_slug}/`}
            className="font-mono text-[10px] uppercase tracking-widest text-accent hover:text-ink"
            onClick={(e) => e.stopPropagation()}
          >
            {item.game_name}
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
            {item.feed_label}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted ml-auto">
            {timeAgo(item.posted_at)}
          </span>
        </div>
        <h3 className="font-serif text-xl text-ink group-hover:text-accent transition flex items-start gap-2">
          {item.title}
          <ExternalLinkIcon size={14} className="mt-1 shrink-0 text-muted group-hover:text-accent" />
        </h3>
        {item.description && (
          <p className="font-serif text-base text-ink/65 mt-1 line-clamp-2">{item.description}</p>
        )}
      </a>
    </li>
  );
}
