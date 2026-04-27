import Link from 'next/link';
import {
  getAllArticles,
  getAllGames,
  getAllTournaments,
  getAllEsportsOrgs,
  getGameBySlug,
} from '@/lib/content';
import { formatDate, authorDisplay } from '@/lib/format';
import { ArrowRightIcon } from '@/components/icons';
import { GameCover } from '@/components/GameCover';
import { LogoImg } from '@/components/LogoImg';

export const dynamic = 'force-static';

export default function HomePage() {
  const games = getAllGames().map((g) => g.frontmatter);
  const tournaments = getAllTournaments().map((t) => t.frontmatter);
  const orgs = getAllEsportsOrgs().map((o) => o.frontmatter);
  const articles = getAllArticles();

  const now = new Date();

  // Featured game: pinned via the `featured` frontmatter flag, with a fallback
  // to the most recently updated trending game so the slot never sits empty.
  const featured = (() => {
    const explicit = games.find((g) => g.featured);
    if (explicit) return explicit;
    return [...games]
      .filter((g) => g.trending)
      .sort((a, b) => new Date(b.last_updated || 0).getTime() - new Date(a.last_updated || 0).getTime())[0];
  })();

  // Section: Live and Hot rail. Trending-flagged games, ordered by priority.
  // Excludes the featured game so it does not appear twice on the home page.
  const liveAndHot = games
    .filter((g) => g.trending && g.slug !== featured?.slug)
    .sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))
    .slice(0, 8);

  // Section 3: Running This Week. Live now or upcoming within 14 days, then
  // any other upcoming. Cap at 7.
  const runningThisWeek = (() => {
    const inWindow = tournaments.filter((t) => {
      const start = new Date(t.date_start);
      const end = new Date(t.date_end);
      const inLiveWindow = t.status === 'live';
      const startsSoon = t.status === 'upcoming' && (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 14;
      const stillRunning = end >= now;
      return (inLiveWindow || startsSoon) && stillRunning;
    });
    if (inWindow.length >= 7) return inWindow.slice(0, 7);
    const otherUpcoming = tournaments
      .filter((t) => !inWindow.includes(t) && t.status === 'upcoming' && new Date(t.date_start) >= now);
    return [...inWindow, ...otherUpcoming].slice(0, 7);
  })();

  // Section 4: News rail. The original PVPWire articles for now (aggregated
  // feed needs the live Worker; the home rail keeps it static).
  const newsRail = [...articles]
    .sort((a, b) => new Date(b.frontmatter.published).getTime() - new Date(a.frontmatter.published).getTime())
    .slice(0, 6);

  // Section 5: Coming Soon. Games flagged coming_soon, plus any other upcoming.
  const comingSoon = (() => {
    const flagged = games.filter((g) => g.coming_soon);
    const others = games.filter((g) => g.status === 'upcoming' && !flagged.includes(g));
    return [...flagged, ...others].sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));
  })();

  // Section 6: Esports Orgs strip. Eight active orgs, biased toward priority
  // brands by sorting on a curated list, then alphabetical fill.
  const ORG_STRIP_PRIORITY = [
    'team-liquid', 'fnatic', 'g2-esports', 't1', 'cloud9', 'navi',
    'gen-g', 'sentinels', 'faze-clan', 'vitality',
  ];
  const orgsStrip = (() => {
    const active = orgs.filter((o) => o.status === 'active');
    const ordered: typeof active = [];
    for (const slug of ORG_STRIP_PRIORITY) {
      const o = active.find((x) => x.slug === slug);
      if (o) ordered.push(o);
      if (ordered.length >= 8) break;
    }
    return ordered.slice(0, 8);
  })();

  // Section 7: Catalog teaser. Six live games not already featured in the
  // Live and Hot rail.
  const catalogTeaser = games
    .filter((g) => (g.activity_tier === 'live' || (!g.activity_tier && g.status === 'active' && g.release_year >= 2022)))
    .filter((g) => !liveAndHot.includes(g))
    .sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))
    .slice(0, 6);

  return (
    <>
      <div className="home-bg" aria-hidden />

      {/* Section 1: Featured game showcase. Pinned via the `featured` flag on
          GameFrontmatter; rotates as the founder pins different titles. */}
      {featured && (
        <section className="border-b border-ink/15">
          <div className="mx-auto max-w-page px-4 sm:px-6 py-12 sm:py-16">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent mb-4">
              Featured game
            </div>
            <Link href={`/games/${featured.slug}/`} className="group block">
              <div className="grid lg:grid-cols-[1fr,360px] gap-8 lg:gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`badge badge-${featured.status}`}>{featured.status}</span>
                    {featured.activity_tier && (
                      <span className="badge badge-active">{featured.activity_tier}</span>
                    )}
                    {featured.scene_status === 'hot' && (
                      <span className="badge badge-accent">scene: hot</span>
                    )}
                    <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
                      {featured.category}
                    </span>
                  </div>
                  <h1 className="masthead-title text-5xl sm:text-6xl lg:text-7xl text-ink group-hover:text-accent transition text-balance">
                    {featured.name}
                  </h1>
                  {featured.current_meta_note && (
                    <p className="font-serif italic text-lg sm:text-xl text-accent/95 mt-5 leading-relaxed border-l-2 border-accent/40 pl-4">
                      {featured.current_meta_note}
                    </p>
                  )}
                  <p className="font-serif text-lg text-ink/85 mt-5 leading-relaxed max-w-2xl">
                    {featured.description_short}
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ink group-hover:text-accent transition">
                    Open profile <ArrowRightIcon size={12} />
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <GameCover
                    game={featured}
                    variant="poster"
                    priority
                    className="border border-ink/15 group-hover:border-accent transition shadow-2xl"
                  />
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Section 2: Lede band, demoted from top per founder direction. The
          framing copy and stats ribbon now sit under the featured game. */}
      <section className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-10 sm:py-12">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent mb-3">
            The hub for competitive PvP and esports
          </div>
          <h2 className="masthead-title text-3xl sm:text-4xl text-ink text-balance max-w-3xl">
            Live competitive PvP. The professional scene across CS2, Valorant, LoL, Dota 2, fighting games, Rainbow Six, Apex, Rocket League, and chess.
          </h2>
          <p className="font-serif text-lg text-ink/80 max-w-3xl mt-4 leading-relaxed">
            Every notable PvP game tracked, the tournament calendar in one place, and a depth archive going back to the late 1990s.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/games/"
              className="inline-flex items-center gap-2 bg-ink text-paper px-5 py-3 font-mono text-[11px] uppercase tracking-widest hover:bg-accent hover:text-paper transition"
            >
              Browse the games <ArrowRightIcon size={12} />
            </Link>
            <Link
              href="/esports/"
              className="inline-flex items-center gap-2 border border-ink/30 hover:border-accent text-ink hover:text-accent px-5 py-3 font-mono text-[11px] uppercase tracking-widest transition"
            >
              See what is running this week <ArrowRightIcon size={12} />
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-widest text-muted">
            <Link href="/games/" className="hover:text-accent transition">
              <span className="text-ink font-semibold">{games.length}</span> games
            </Link>
            <Link href="/esports/" className="hover:text-accent transition">
              <span className="text-ink font-semibold">{tournaments.length}</span> tournaments
            </Link>
            <Link href="/esports/orgs/" className="hover:text-accent transition">
              <span className="text-ink font-semibold">{orgs.length}</span> orgs
            </Link>
          </div>
        </div>
      </section>

      {/* Section 2: Live and Hot rail */}
      {liveAndHot.length > 0 && (
        <section className="border-b border-ink/15">
          <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
            <SectionHead
              eyebrow="Live and hot"
              title="What is being played"
              href="/games/"
              cta="All games"
            />
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {liveAndHot.map((g) => (
                <Link key={g.slug} href={`/games/${g.slug}/`} className="group block">
                  <div className="relative">
                    <GameCover
                      game={g}
                      variant="poster"
                      className="border border-ink/15 group-hover:border-accent transition"
                    />
                    {g.scene_status && (
                      <span className={`absolute top-1.5 left-1.5 badge badge-${g.scene_status === 'hot' ? 'accent' : 'active'} text-[9px]`}>
                        {g.scene_status}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="font-display text-base font-bold text-ink group-hover:text-accent transition leading-tight line-clamp-2">
                      {g.name}
                    </div>
                    {g.activity_tier && (
                      <div className="font-mono text-[9px] uppercase tracking-widest text-accent mt-1">
                        {g.activity_tier}
                      </div>
                    )}
                    {g.current_meta_note && (
                      <p className="font-serif text-sm text-ink/75 mt-2 leading-snug line-clamp-3">
                        {g.current_meta_note}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 3: Running This Week tournament strip */}
      {runningThisWeek.length > 0 && (
        <section className="border-b border-ink/15">
          <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
            <SectionHead
              eyebrow="Running this week"
              title="On the broadcast schedule"
              href="/esports/calendar/"
              cta="Full calendar"
            />
            <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {runningThisWeek.map((t) => {
                const game = getGameBySlug(t.game_slug);
                return (
                  <li key={t.slug} className="border border-ink/15 surface p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`badge badge-${t.status === 'live' ? 'active' : 'upcoming'}`}>{t.status}</span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">{t.tier}</span>
                    </div>
                    <Link href={`/esports/${t.slug}/`} className="font-display text-lg font-bold text-ink hover:text-accent transition leading-tight">
                      {t.name}
                    </Link>
                    <div className="font-mono text-[11px] uppercase tracking-widest text-accent">
                      {game?.frontmatter.name ?? t.game_slug}
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
                      {formatDate(t.date_start)} to {formatDate(t.date_end)}
                    </div>
                    {t.prize_pool_usd ? (
                      <div className="font-mono text-[10px] uppercase tracking-widest text-signal">
                        Prize pool ${(t.prize_pool_usd / 1000).toLocaleString()}K
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Section 4: News rail */}
      {newsRail.length > 0 && (
        <section className="border-b border-ink/15">
          <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
            <SectionHead
              eyebrow="Latest news"
              title="From the desk and the wire"
              href="/news/"
              cta="All news"
            />
            <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {newsRail.map((a) => (
                <li key={a.frontmatter.slug} className="border border-ink/15 surface p-4 flex flex-col gap-2">
                  <div className="font-mono text-[11px] uppercase tracking-widest text-accent">
                    {authorDisplay(a.frontmatter.author)} / {a.frontmatter.category}
                  </div>
                  <Link href={`/news/${a.frontmatter.slug}/`} className="font-display text-lg font-bold text-ink hover:text-accent transition leading-tight">
                    {a.frontmatter.title}
                  </Link>
                  <p className="font-serif text-sm text-ink/75 leading-snug line-clamp-3">
                    {a.frontmatter.description}
                  </p>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted mt-auto">
                    {formatDate(a.frontmatter.published)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Section 5: Coming Soon rail */}
      {comingSoon.length > 0 && (
        <section className="border-b border-ink/15">
          <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
            <SectionHead
              eyebrow="Coming soon"
              title="Upcoming PvP releases"
              href="/games/"
              cta="All games"
            />
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

      {/* Section 6: Esports Orgs strip */}
      {orgsStrip.length > 0 && (
        <section className="border-b border-ink/15">
          <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
            <SectionHead
              eyebrow="Esports orgs"
              title="Currently competing"
              href="/esports/orgs/"
              cta="All orgs"
            />
            <ul className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {orgsStrip.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={`/esports/orgs/${o.slug}/`}
                    className="group surface border border-ink/15 hover:border-accent p-3 flex flex-col items-center gap-2 transition h-full text-center"
                  >
                    <LogoImg src={o.logo} name={o.name} size="md" className="bg-paper-elev" />
                    <div className="font-display text-sm font-bold text-ink group-hover:text-accent transition leading-tight">
                      {o.name}
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-muted">
                      {o.country ?? 'Intl'}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Section 7: Catalog teaser */}
      {catalogTeaser.length > 0 && (
        <section className="border-b border-ink/15">
          <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
            <SectionHead
              eyebrow="More to play"
              title="Live in the catalog"
              href="/games/"
              cta="See all"
            />
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {catalogTeaser.map((g) => (
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
                    <div className="font-mono text-[9px] uppercase tracking-widest text-muted mt-1">
                      {g.category}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 8: Archive callout */}
      <section>
        <div className="mx-auto max-w-page px-4 sm:px-6 py-16">
          <div className="border border-ink/15 surface p-8 sm:p-12 grid sm:grid-cols-[1fr,auto] gap-6 items-center">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-2">Archive</div>
              <h2 className="masthead-title text-2xl sm:text-3xl text-ink">The depth surface.</h2>
              <p className="font-serif text-base text-ink/75 mt-3 max-w-2xl leading-relaxed">
                Two decades of guild lineage, the OG Guilds Infograph, and legacy editorial preserved for anyone who wants the depth. PVPWire is the front door for current competitive PvP; the archive is the room with all the history.
              </p>
            </div>
            <Link
              href="/archive/"
              className="inline-flex items-center gap-2 border border-ink/30 hover:border-accent text-ink hover:text-accent px-5 py-3 font-mono text-[11px] uppercase tracking-widest transition shrink-0"
            >
              Open archive <ArrowRightIcon size={12} />
            </Link>
          </div>
        </div>
      </section>
    </>
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
