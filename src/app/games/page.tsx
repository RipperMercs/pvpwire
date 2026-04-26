import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getAllGames } from '@/lib/content';
import { GAME_CATEGORIES } from '@/lib/schemas';
import { GamesBrowser } from '@/components/GamesBrowser';

export const metadata: Metadata = {
  title: 'Games',
  description:
    'Every notable competitive PvP game, indexed across MMO PvP, MOBA, FPS, fighting games, chess, battle royale, extraction shooters, and more.',
};

export default function GamesPage() {
  const games = getAllGames().map((g) => g.frontmatter);
  return (
    <article>
      <header className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-12 sm:py-16">
          <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-4">Games</div>
          <h1 className="masthead-title text-5xl sm:text-6xl text-ink">The competitive gaming database.</h1>
          <p className="font-serif text-xl text-ink/80 max-w-3xl mt-4 leading-relaxed">
            Every notable PvP game, cross-linked to the guilds, articles, and Legends profiles around it. Filter by category, status, or pro scene presence.
          </p>
          <div className="font-mono text-xs uppercase tracking-widest text-muted mt-6">
            {games.length} games / {GAME_CATEGORIES.length} categories
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-page px-4 sm:px-6 py-10">
        <Suspense fallback={<div className="font-mono text-xs uppercase tracking-widest text-muted">Loading games...</div>}>
          <GamesBrowser games={games} />
        </Suspense>
      </div>
    </article>
  );
}
