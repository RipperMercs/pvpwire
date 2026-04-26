'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ExternalLinkIcon, ArrowRightIcon, RssIcon } from '@/components/icons';
import { authorDisplay } from '@/lib/format';

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

type Aggregated = {
  title: string;
  url: string;
  description: string;
  publishedAt: string;
  source: string;
  sourceDomain: string;
};

type FeedResponse = {
  articles: Aggregated[];
  fetchedAt: string;
  sources: string[];
};

type Filter = 'all' | 'original' | 'aggregated';
type AuthorFilter = 'all' | 'editorial' | 'ripper' | 'flosium' | 'og' | 'flipper';

const NEWS_API = process.env.NEXT_PUBLIC_NEWS_API ?? 'https://pvpwire-api.workers.dev/api/news';

export function NewsBrowser({ originals }: { originals: Original[] }) {
  const [agg, setAgg] = useState<Aggregated[]>([]);
  const [aggLoading, setAggLoading] = useState(true);
  const [aggError, setAggError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [author, setAuthor] = useState<AuthorFilter>('all');
  const [source, setSource] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;
    fetch(NEWS_API)
      .then((r) => r.json())
      .then((data: FeedResponse) => {
        if (cancelled) return;
        setAgg(data.articles ?? []);
        setAggLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setAggError(String(e));
        setAggLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sources = useMemo(() => Array.from(new Set(agg.map((a) => a.source))).sort(), [agg]);

  const filteredOriginals = useMemo(() => {
    if (filter === 'aggregated') return [];
    if (author === 'all') return originals;
    return originals.filter((o) => o.author === author);
  }, [filter, author, originals]);

  const filteredAggregated = useMemo(() => {
    if (filter === 'original') return [];
    if (source === 'all') return agg;
    return agg.filter((a) => a.source === source);
  }, [filter, source, agg]);

  const merged = useMemo(() => {
    type FeedItem =
      | { kind: 'original'; date: string; payload: Original }
      | { kind: 'aggregated'; date: string; payload: Aggregated };
    const items: FeedItem[] = [
      ...filteredOriginals.map((o) => ({ kind: 'original' as const, date: o.published, payload: o })),
      ...filteredAggregated.map((a) => ({ kind: 'aggregated' as const, date: a.publishedAt, payload: a })),
    ];
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredOriginals, filteredAggregated]);

  const heroOriginals = filteredOriginals.slice(0, 3);

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
      <div className="flex flex-wrap items-center gap-2 mb-8 sticky top-16 z-30 bg-paper py-3 border-b border-ink/15">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterChip>
        <FilterChip active={filter === 'original'} onClick={() => setFilter('original')}>Original</FilterChip>
        <FilterChip active={filter === 'aggregated'} onClick={() => setFilter('aggregated')}>Aggregated</FilterChip>
        <span className="w-px h-6 bg-ink/15 mx-2" />
        <select
          value={author}
          onChange={(e) => setAuthor(e.target.value as AuthorFilter)}
          className="font-mono text-xs uppercase tracking-widest border border-ink/20 px-3 py-1.5 bg-paper"
        >
          <option value="all">All authors</option>
          <option value="editorial">PVPWire Editorial</option>
          <option value="ripper">Ripper</option>
          <option value="flosium">Flosium (legacy)</option>
          <option value="og">Og (legacy)</option>
          <option value="flipper">Flipper (legacy)</option>
        </select>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="font-mono text-xs uppercase tracking-widest border border-ink/20 px-3 py-1.5 bg-paper"
        >
          <option value="all">All sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <a
          href="/rss/news.xml"
          className="ml-auto inline-flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-accent hover:text-ink transition"
        >
          <RssIcon size={14} /> RSS
        </a>
      </div>

      {/* Feed */}
      {aggLoading && filter !== 'original' && (
        <div className="font-serif text-muted italic mb-6">Loading the feed...</div>
      )}
      {aggError && filter !== 'original' && (
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
          {merged.map((item, i) =>
            item.kind === 'original' ? (
              <OriginalRow key={`o-${item.payload.slug}-${i}`} a={item.payload} />
            ) : (
              <AggregatedRow key={`a-${item.payload.url}-${i}`} a={item.payload} />
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

function AggregatedRow({ a }: { a: Aggregated }) {
  return (
    <li className="py-4">
      <a
        href={a.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block hover:text-accent transition"
      >
        <div className="flex flex-wrap items-baseline gap-3 mb-1">
          <span className="font-mono text-[11px] uppercase tracking-widest text-ink/70">{a.source}</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted ml-auto">
            {new Date(a.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <h3 className="font-serif text-xl text-ink group-hover:text-accent transition flex items-start gap-2">
          {a.title}
          <ExternalLinkIcon size={14} className="mt-1 shrink-0 text-muted group-hover:text-accent" />
        </h3>
        {a.description && (
          <p className="font-serif text-base text-ink/65 mt-1">{a.description}</p>
        )}
      </a>
    </li>
  );
}
