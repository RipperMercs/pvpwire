import Link from 'next/link';
import {
  getAllArticles,
  getAllLegends,
  getAllHeritage,
  getAllGuilds,
  getAllGames,
} from '@/lib/content';
import { GAME_CATEGORIES } from '@/lib/schemas';
import { formatDate, authorDisplay, formatYearRange } from '@/lib/format';
import { ArrowRightIcon, CategoryGlyph } from '@/components/icons';
import { GameCover } from '@/components/GameCover';

export const dynamic = 'force-static';

export default function HomePage() {
  const games = getAllGames();
  const guilds = getAllGuilds();
  const articles = getAllArticles();
  const legends = getAllLegends();
  const heritage = getAllHeritage();

  const totalGames = games.length;
  const totalGuilds = guilds.length;
  const ogGuilds = guilds.filter((g) => g.frontmatter.era === 'og').length;

  // Latest editorial mixed feed.
  const editorialMix = [
    ...articles.map((a) => ({ kind: 'news' as const, fm: a.frontmatter })),
    ...legends.map((l) => ({ kind: 'legends' as const, fm: l.frontmatter })),
    ...heritage.map((h) => ({ kind: 'heritage' as const, fm: h.frontmatter })),
  ]
    .sort((a, b) => new Date(b.fm.published).getTime() - new Date(a.fm.published).getTime());

  const leadStory = editorialMix[0];
  const sideStories = editorialMix.slice(1, 4);

  // Featured upcoming/active games (latest releases or upcoming).
  const upcomingOrFresh = games
    .filter((g) => g.frontmatter.status === 'upcoming' || g.frontmatter.release_year >= 2024)
    .sort((a, b) => b.frontmatter.release_year - a.frontmatter.release_year)
    .slice(0, 6);

  // Group games by category for the grid.
  const byCategory = GAME_CATEGORIES.map((cat) => ({
    category: cat,
    games: games.filter((g) => g.frontmatter.category === cat),
  })).filter((c) => c.games.length > 0);

  const featuredGuilds = [
    ...guilds.filter((g) => g.frontmatter.era === 'og').slice(0, 4),
    ...guilds.filter((g) => g.frontmatter.era === 'classic').slice(0, 3),
    ...guilds.filter((g) => g.frontmatter.era === 'modern').slice(0, 2),
  ].slice(0, 8);

  return (
    <>
      {/* Compact masthead intro */}
      <section className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-10 sm:py-14">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent mb-4">
            Volume I, 2026
          </div>
          <h1 className="masthead-title text-4xl sm:text-6xl lg:text-7xl text-ink text-balance max-w-4xl">
            The competitive gaming reference.
          </h1>
          <p className="font-serif text-lg sm:text-xl text-ink/80 max-w-3xl mt-4 leading-relaxed">
            Every notable PvP game indexed, cross-game guild lineage from the late 1990s through modern esports, and editorial that follows the meta where it leads.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-widest text-muted">
            <Link href="/games" className="hover:text-accent transition">
              <span className="text-ink font-semibold">{totalGames}</span> games
            </Link>
            <Link href="/guilds" className="hover:text-accent transition">
              <span className="text-ink font-semibold">{totalGuilds}</span> guilds <span className="text-accent ml-1">{ogGuilds} OG</span>
            </Link>
            <span><span className="text-ink font-semibold">{GAME_CATEGORIES.length}</span> categories</span>
            <span><span className="text-ink font-semibold">{articles.length + legends.length + heritage.length}</span> editorial pieces</span>
          </div>
        </div>
      </section>

      {/* Lead story + side stories - editorial layout */}
      {leadStory && (
        <section className="border-b border-ink/15">
          <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
            <div className="grid lg:grid-cols-[1.5fr,1fr] gap-10">
              <Link
                href={`/${leadStory.kind}/${leadStory.fm.slug}/`}
                className="group block"
              >
                <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-3">
                  {leadStory.kind} / {authorDisplay(leadStory.fm.author)} / {formatDate(leadStory.fm.published)}
                </div>
                <h2 className="masthead-title text-3xl sm:text-5xl lg:text-6xl text-ink group-hover:text-accent transition leading-tight">
                  {leadStory.fm.title}
                </h2>
                <p className="font-serif text-lg sm:text-xl text-ink/80 mt-4 leading-relaxed">
                  {leadStory.fm.description}
                </p>
              </Link>
              {sideStories.length > 0 && (
                <ul className="space-y-6 lg:border-l lg:border-ink/15 lg:pl-10">
                  {sideStories.map((s) => (
                    <li key={`${s.kind}-${s.fm.slug}`} className="border-b border-ink/10 pb-6 last:border-0 last:pb-0">
                      <Link href={`/${s.kind}/${s.fm.slug}/`} className="group block">
                        <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-1">
                          {s.kind} / {authorDisplay(s.fm.author)}
                        </div>
                        <h3 className="font-display text-xl font-bold text-ink group-hover:text-accent transition leading-snug">
                          {s.fm.title}
                        </h3>
                        <p className="font-serif text-sm text-ink/70 mt-2 leading-relaxed line-clamp-2">{s.fm.description}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Featured games - latest and upcoming */}
      {upcomingOrFresh.length > 0 && (
        <section className="border-b border-ink/15">
          <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
            <SectionHead
              eyebrow="Latest and upcoming"
              title="What we're watching"
              href="/games"
              cta="All games"
            />
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {upcomingOrFresh.map((g) => (
                <Link key={g.frontmatter.slug} href={`/games/${g.frontmatter.slug}/`} className="group block">
                  <GameCover
                    game={g.frontmatter}
                    variant="poster"
                    className="border border-ink/15 group-hover:border-accent transition"
                  />
                  <div className="mt-2">
                    <div className="font-display text-sm font-semibold text-ink group-hover:text-accent transition leading-tight line-clamp-2">
                      {g.frontmatter.name}
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-muted mt-1 line-clamp-1">
                      {g.frontmatter.release_year} / {g.frontmatter.status}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Games by genre */}
      <section className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
          <SectionHead
            eyebrow="Games"
            title="By genre"
            href="/games"
            cta="See all"
          />
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {byCategory.map((c) => (
              <Link
                key={c.category}
                href={`/games?category=${encodeURIComponent(c.category)}`}
                className="group surface border border-ink/15 hover:border-accent p-4 flex items-start gap-4 transition"
              >
                <CategoryGlyph category={c.category} size={24} className="text-accent shrink-0 mt-1" />
                <div className="min-w-0">
                  <div className="font-display text-base font-semibold text-ink group-hover:text-accent transition leading-tight">
                    {c.category}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted mt-1">
                    {c.games.length} {c.games.length === 1 ? 'title' : 'titles'}
                  </div>
                  <div className="font-serif text-sm text-ink/70 mt-2 leading-snug line-clamp-2">
                    {c.games.slice(0, 4).map((g) => g.frontmatter.name).join(', ')}
                    {c.games.length > 4 ? ', ...' : ''}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured guilds */}
      <section className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
          <SectionHead
            eyebrow="The database"
            title="Featured guilds"
            href="/guilds"
            cta="Browse all"
          />
          <div className="mt-6 grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {featuredGuilds.map((g) => (
              <Link
                key={g.frontmatter.slug}
                href={`/guilds/${g.frontmatter.slug}/`}
                className="group surface border border-ink/15 hover:border-accent p-4 flex flex-col gap-2 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`badge badge-${g.frontmatter.era}`}>{g.frontmatter.era}</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                    {formatYearRange(g.frontmatter.era_active)}
                  </span>
                </div>
                <div className="font-display text-lg font-bold text-ink group-hover:text-accent transition leading-tight">
                  {g.frontmatter.name}
                </div>
                {g.frontmatter.aliases?.[0] && (
                  <div className="font-serif text-xs text-muted italic">
                    also: {g.frontmatter.aliases[0]}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tertiary CTAs */}
      <section>
        <div className="mx-auto max-w-page px-4 sm:px-6 py-10 grid sm:grid-cols-3 gap-3">
          <SmallCta
            href="/vs-the-world/"
            eyebrow="Column"
            title="Flosium vs the World"
            body="Recurring rant on the state of competitive gaming."
          />
          <SmallCta
            href="/guilds/submit/"
            eyebrow="Community"
            title="Submit a guild"
            body="Anonymous, moderated. Add a profile or correction."
          />
          <SmallCta
            href="/ask-flosium/"
            eyebrow="Tool"
            title="Ask Flosium"
            body="Live AI in voice. Brief, opinionated, rate limited."
          />
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

function SmallCta({
  href,
  eyebrow,
  title,
  body,
}: {
  href: string;
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group surface border border-ink/15 hover:border-accent p-4 transition flex flex-col gap-2"
    >
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted">{eyebrow}</div>
      <div className="flex items-center gap-2">
        <span className="font-display text-base font-bold text-ink group-hover:text-accent transition">{title}</span>
        <ArrowRightIcon size={12} className="text-ink/50 group-hover:text-accent transition" />
      </div>
      <p className="font-serif text-sm text-ink/70 leading-relaxed">{body}</p>
    </Link>
  );
}
