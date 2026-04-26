import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllTournaments, getAllEsportsOrgs, getGameBySlug } from '@/lib/content';
import { formatDate } from '@/lib/format';
import { ArrowRightIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Esports',
  description:
    'Competitive PvP esports hub. Tournament calendar, professional teams, and the live international scene across CS2, Valorant, LoL, Dota 2, fighting games, R6, Apex, Rocket League, and chess.',
};

export default function EsportsPage() {
  const tournaments = getAllTournaments();
  const orgs = getAllEsportsOrgs();
  const now = new Date();

  const live = tournaments.filter((t) => t.frontmatter.status === 'live');
  const upcoming = tournaments
    .filter((t) => t.frontmatter.status === 'upcoming' && new Date(t.frontmatter.date_start) >= now)
    .slice(0, 6);
  const thisWeek = tournaments.filter((t) => {
    if (t.frontmatter.status !== 'upcoming' && t.frontmatter.status !== 'live') return false;
    const start = new Date(t.frontmatter.date_start);
    const diff = (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  // Group tournaments by primary game for the "By game" lane.
  const byGame = new Map<string, typeof tournaments>();
  for (const t of tournaments) {
    const key = t.frontmatter.game_slug;
    const arr = byGame.get(key) ?? [];
    arr.push(t);
    byGame.set(key, arr);
  }

  const featuredOrgs = orgs.slice(0, 8);

  return (
    <article>
      <header className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-12 sm:py-16">
          <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-4">Esports</div>
          <h1 className="masthead-title text-5xl sm:text-6xl text-ink">Live competitive PvP.</h1>
          <p className="font-serif text-xl text-ink/80 max-w-3xl mt-4 leading-relaxed">
            The professional scene across CS2, Valorant, LoL, Dota 2, fighting games, Rainbow Six, Apex, Rocket League, and chess. Tournament calendar, organizations, broadcasts.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-widest text-muted">
            <Link href="/esports/calendar/" className="hover:text-accent transition">
              <span className="text-ink font-semibold">{tournaments.length}</span> tournaments
            </Link>
            <Link href="/esports/orgs/" className="hover:text-accent transition">
              <span className="text-ink font-semibold">{orgs.length}</span> orgs
            </Link>
          </div>
        </div>
      </header>

      {(live.length > 0 || thisWeek.length > 0) && (
        <section className="border-b border-ink/15">
          <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
            <SectionHead
              eyebrow={live.length > 0 ? 'Live now' : 'Starting this week'}
              title={live.length > 0 ? 'Broadcasts live' : 'On the calendar this week'}
              href="/esports/calendar/"
              cta="Full calendar"
            />
            <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(live.length > 0 ? live : thisWeek).map((t) => (
                <TournamentCard key={t.frontmatter.slug} t={t} />
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
          <SectionHead
            eyebrow="Upcoming"
            title="Next on the calendar"
            href="/esports/calendar/"
            cta="Full calendar"
          />
          <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((t) => (
              <TournamentCard key={t.frontmatter.slug} t={t} />
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
          <SectionHead
            eyebrow="Organizations"
            title="Featured orgs"
            href="/esports/orgs/"
            cta="All orgs"
          />
          <ul className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {featuredOrgs.map((o) => (
              <li key={o.frontmatter.slug}>
                <Link
                  href={`/esports/orgs/${o.frontmatter.slug}/`}
                  className="group surface border border-ink/15 hover:border-accent p-4 flex flex-col gap-1 transition h-full"
                >
                  <div className="font-display text-lg font-bold text-ink group-hover:text-accent transition leading-tight">
                    {o.frontmatter.name}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
                    {o.frontmatter.country ?? 'International'} / {o.frontmatter.founded}
                  </div>
                  <p className="font-serif text-sm text-ink/70 leading-snug line-clamp-2 mt-1">
                    {o.frontmatter.description_short}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
          <SectionHead
            eyebrow="By game"
            title="Tournament coverage"
          />
          <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(byGame.entries()).map(([gameSlug, gameTournaments]) => {
              const game = getGameBySlug(gameSlug);
              return (
                <li key={gameSlug} className="border border-ink/15 surface p-4">
                  <Link href={`/games/${gameSlug}/`} className="font-display text-base font-semibold text-ink hover:text-accent transition">
                    {game?.frontmatter.name ?? gameSlug}
                  </Link>
                  <ul className="mt-2 space-y-1">
                    {gameTournaments.map((t) => (
                      <li key={t.frontmatter.slug} className="font-serif text-sm">
                        <Link href={`/esports/${t.frontmatter.slug}/`} className="text-accent hover:text-ink">
                          {t.frontmatter.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </article>
  );
}

function TournamentCard({ t }: { t: ReturnType<typeof getAllTournaments>[number] }) {
  const game = getGameBySlug(t.frontmatter.game_slug);
  return (
    <li className="border border-ink/15 surface p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className={`badge badge-${t.frontmatter.status === 'live' ? 'active' : 'upcoming'}`}>
          {t.frontmatter.status}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          {t.frontmatter.tier}
        </span>
      </div>
      <Link href={`/esports/${t.frontmatter.slug}/`} className="font-display text-lg font-bold text-ink hover:text-accent transition leading-tight">
        {t.frontmatter.name}
      </Link>
      <div className="font-mono text-[11px] uppercase tracking-widest text-accent">
        {game?.frontmatter.name ?? t.frontmatter.game_slug}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
        {formatDate(t.frontmatter.date_start)} to {formatDate(t.frontmatter.date_end)}
      </div>
      {t.frontmatter.prize_pool_usd ? (
        <div className="font-mono text-[10px] uppercase tracking-widest text-signal">
          Prize pool ${(t.frontmatter.prize_pool_usd / 1000).toLocaleString()}K
        </div>
      ) : null}
    </li>
  );
}

function SectionHead({
  eyebrow,
  title,
  href,
  cta = 'See all',
}: {
  eyebrow: string;
  title: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-ink/15 pb-3">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-widest text-accent">{eyebrow}</div>
        <h2 className="masthead-title text-2xl sm:text-3xl text-ink mt-1">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="font-mono text-[11px] uppercase tracking-widest text-ink/70 hover:text-accent flex items-center gap-1 shrink-0"
        >
          {cta} <ArrowRightIcon size={12} />
        </Link>
      )}
    </div>
  );
}
