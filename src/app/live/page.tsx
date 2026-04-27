import type { Metadata } from 'next';
import { getAllGames } from '@/lib/content';
import { LiveTable } from '@/components/LiveTable';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Live PvP: Every Game by Concurrent Players',
  description: 'Real-time concurrent player counts across every notable PvP game. Updated every 5 minutes via the Steam Web API and Twitch Helix API. Find out what is being played right now.',
  path: '/live/',
});

export default function LivePage() {
  // Server-rendered fallback: every catalog game with editorial scene
  // metadata, pre-sorted so the SSR baseline doesn't appear alphabetical
  // before the live snapshot loads. Trending and `activity_tier === 'live'`
  // games lead, then everything else by editorial `priority` (lower wins).
  // The client component will re-sort by actual player counts on mount.
  const fallbackEntries = getAllGames()
    .map((g) => g.frontmatter)
    .sort((a, b) => {
      const aRank = (a.trending ? 0 : 1000) + (a.activity_tier === 'live' ? 0 : 100) + (a.priority ?? 500);
      const bRank = (b.trending ? 0 : 1000) + (b.activity_tier === 'live' ? 0 : 100) + (b.priority ?? 500);
      return aRank - bRank;
    })
    .map((g) => ({
      slug: g.slug,
      name: g.name,
      category: g.category,
      scene_status: g.scene_status,
      activity_tier: g.activity_tier,
      has_steam: typeof g.steam_app_id === 'number',
      has_twitch: typeof g.twitch_directory_slug === 'string',
    }));

  return (
    <article>
      <header className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-10 sm:py-14">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent mb-3">
            Live
          </div>
          <h1 className="masthead-title text-4xl sm:text-5xl lg:text-6xl text-ink text-balance max-w-3xl">
            Every PvP game, ranked by concurrent players right now.
          </h1>
          <p className="font-serif text-lg text-ink/80 max-w-3xl mt-4 leading-relaxed">
            Player counts pulled from the Steam Web API and refreshed every 5 minutes. Twitch viewer counts overlay where available. Sortable, filterable, never more than a few minutes stale.
          </p>
        </div>
      </header>

      <section>
        <div className="mx-auto max-w-page px-4 sm:px-6 py-10">
          <LiveTable fallbackEntries={fallbackEntries} />
        </div>
      </section>
    </article>
  );
}
