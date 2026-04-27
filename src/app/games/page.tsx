import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { getAllGames } from '@/lib/content';
import { GAME_CATEGORIES } from '@/lib/schemas';
import { GamesBrowser } from '@/components/GamesBrowser';
import { GameCover } from '@/components/GameCover';
import { ArrowRightIcon } from '@/components/icons';
import { buildMetadata, SITE_URL } from '@/lib/seo';
import { collectionPageSchema, breadcrumbSchema, jsonLdScript } from '@/lib/jsonld';

export const metadata: Metadata = buildMetadata({
  title: 'PvP Games Catalog: Every Notable Competitive Title',
  description:
    'Cross-genre catalog of every notable competitive PvP game. MMO PvP, MOBA, FPS, fighting games, battle royale, extraction shooters, chess. Sorted by what is currently most contested.',
  path: '/games/',
});

export default function GamesPage() {
  const games = getAllGames().map((g) => g.frontmatter);
  const trending = games.filter((g) => g.trending).sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));
  const comingSoon = games.filter((g) => g.coming_soon || g.status === 'upcoming')
    .sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));

  const collection = collectionPageSchema({
    name: 'PvP Games Catalog',
    description: 'Every notable competitive PvP game indexed across thirteen genres.',
    url: `${SITE_URL}/games/`,
    itemUrls: games.map((g) => `${SITE_URL}/games/${g.slug}/`),
  });
  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Games', url: `${SITE_URL}/games/` },
  ]);

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(collection) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumb) }} />
      <header className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-12 sm:py-16">
          <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-4">Games</div>
          <h1 className="masthead-title text-5xl sm:text-6xl text-ink">The competitive gaming database.</h1>
          <p className="font-serif text-xl text-ink/80 max-w-3xl mt-4 leading-relaxed">
            Every notable PvP game, ordered by what is currently most contested. Filter by status, category, or activity tier.
          </p>
          <div className="font-mono text-xs uppercase tracking-widest text-muted mt-6 flex flex-wrap gap-x-6 gap-y-2 items-center">
            <span>{games.length} games / {GAME_CATEGORIES.length} categories</span>
            <Link href="/games/submit/" className="text-accent hover:text-ink transition">
              Submit a game
            </Link>
          </div>
        </div>
      </header>

      {trending.length > 0 && (
        <section className="border-b border-ink/15">
          <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
            <RailHead eyebrow="Trending now" title="What is being played" />
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {trending.map((g) => (
                <Link key={g.slug} href={`/games/${g.slug}/`} className="group block">
                  <GameCover
                    game={g}
                    variant="poster"
                    className="border border-ink/15 group-hover:border-accent transition"
                  />
                  <div className="mt-2">
                    <div className="font-display text-sm font-semibold text-ink group-hover:text-accent transition leading-tight line-clamp-2">
                      {g.name}
                    </div>
                    {g.scene_status && (
                      <div className="font-mono text-[9px] uppercase tracking-widest text-accent mt-1">
                        {g.scene_status}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {comingSoon.length > 0 && (
        <section className="border-b border-ink/15">
          <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
            <RailHead eyebrow="Coming soon" title="Upcoming PvP releases" />
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {comingSoon.map((g) => (
                <Link key={g.slug} href={`/games/${g.slug}/`} className="group block">
                  <GameCover
                    game={g}
                    variant="poster"
                    className="border border-ink/15 group-hover:border-accent transition"
                  />
                  <div className="mt-2">
                    <div className="font-display text-sm font-semibold text-ink group-hover:text-accent transition leading-tight line-clamp-2">
                      {g.name}
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-signal mt-1">
                      {g.release_year}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-page px-4 sm:px-6 py-10">
        <Suspense fallback={<div className="font-mono text-xs uppercase tracking-widest text-muted">Loading games...</div>}>
          <GamesBrowser games={games} />
        </Suspense>
      </div>
    </article>
  );
}

function RailHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-ink/15 pb-3">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-widest text-accent">{eyebrow}</div>
        <h2 className="masthead-title text-2xl sm:text-3xl text-ink mt-1">{title}</h2>
      </div>
    </div>
  );
}
