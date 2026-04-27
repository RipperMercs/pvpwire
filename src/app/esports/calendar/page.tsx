import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllTournaments, getGameBySlug } from '@/lib/content';
import { formatDate } from '@/lib/format';
import { buildMetadata, SITE_URL } from '@/lib/seo';
import { collectionPageSchema, breadcrumbSchema, jsonLdScript } from '@/lib/jsonld';

export const metadata: Metadata = buildMetadata({
  title: 'Esports Tournament Calendar 2026',
  description:
    'Full filterable tournament calendar across CS2, Valorant, LoL, Dota 2, fighting games, Rainbow Six, Apex, Rocket League, and chess. Schedule, prize pools, broadcast links.',
  path: '/esports/calendar/',
});

export default function EsportsCalendarPage() {
  const tournaments = getAllTournaments();

  const collection = collectionPageSchema({
    name: 'Esports Tournament Calendar 2026',
    description: 'Full filterable tournament calendar across the major competitive PvP scenes.',
    url: `${SITE_URL}/esports/calendar/`,
    itemUrls: tournaments.map((t) => `${SITE_URL}/esports/${t.frontmatter.slug}/`),
  });
  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Esports', url: `${SITE_URL}/esports/` },
    { name: 'Calendar', url: `${SITE_URL}/esports/calendar/` },
  ]);

  // Group by month for chronological scan.
  const byMonth = new Map<string, typeof tournaments>();
  for (const t of tournaments) {
    const d = new Date(t.frontmatter.date_start);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const arr = byMonth.get(monthKey) ?? [];
    arr.push(t);
    byMonth.set(monthKey, arr);
  }
  const sortedMonths = Array.from(byMonth.keys()).sort();

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(collection) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumb) }} />
      <header className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-12 sm:py-16">
          <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-4">Calendar</div>
          <h1 className="masthead-title text-5xl sm:text-6xl text-ink">Tournament calendar.</h1>
          <p className="font-serif text-xl text-ink/80 max-w-3xl mt-4 leading-relaxed">
            {tournaments.length} tournaments scheduled across the active competitive calendar. Click any event for format, prize pool, and broadcast links.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
        {sortedMonths.map((monthKey) => {
          const items = byMonth.get(monthKey)!;
          const sample = items[0];
          const monthLabel = new Date(sample.frontmatter.date_start).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          });
          return (
            <section key={monthKey} className="mb-12">
              <h2 className="masthead-title text-2xl sm:text-3xl text-ink border-b border-ink/15 pb-3 mb-6">
                {monthLabel}
              </h2>
              <ul className="space-y-3">
                {items.map((t) => {
                  const game = getGameBySlug(t.frontmatter.game_slug);
                  return (
                    <li key={t.frontmatter.slug} className="border border-ink/15 surface p-4 flex flex-col sm:flex-row sm:items-baseline sm:gap-6">
                      <div className="font-mono text-[11px] uppercase tracking-widest text-accent shrink-0 sm:w-48">
                        {formatDate(t.frontmatter.date_start)} to {formatDate(t.frontmatter.date_end)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/esports/${t.frontmatter.slug}/`}
                          className="font-display text-lg font-bold text-ink hover:text-accent transition leading-tight"
                        >
                          {t.frontmatter.name}
                        </Link>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-muted mt-1">
                          {game?.frontmatter.name ?? t.frontmatter.game_slug} / {t.frontmatter.tier} / {t.frontmatter.organizer}
                        </div>
                      </div>
                      {t.frontmatter.prize_pool_usd ? (
                        <div className="font-mono text-[10px] uppercase tracking-widest text-signal shrink-0">
                          ${(t.frontmatter.prize_pool_usd / 1000).toLocaleString()}K
                        </div>
                      ) : null}
                      <span className={`badge badge-${t.frontmatter.status === 'live' ? 'active' : 'upcoming'} shrink-0`}>
                        {t.frontmatter.status}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </article>
  );
}
