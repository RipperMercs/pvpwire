import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getAllGames,
  getGameBySlug,
  getRelatedGuildsForGame,
  getRelatedArticlesForGame,
  getEsportsOrgsForGame,
  getTournamentsForGame,
} from '@/lib/content';
import { authorDisplay, formatDate } from '@/lib/format';
import { CategoryGlyph, ExternalLinkIcon, ArrowRightIcon } from '@/components/icons';
import { GameCover } from '@/components/GameCover';
import { LogoImg } from '@/components/LogoImg';

export async function generateStaticParams() {
  return getAllGames().map((g) => ({ slug: g.frontmatter.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const item = getGameBySlug(params.slug);
  if (!item) return { title: 'Not found' };
  return {
    title: item.frontmatter.name,
    description: item.frontmatter.description_short,
    openGraph: {
      title: item.frontmatter.name,
      description: item.frontmatter.description_short,
      type: 'article',
    },
  };
}

export default function GamePage({ params }: { params: { slug: string } }) {
  const item = getGameBySlug(params.slug);
  if (!item) notFound();

  const game = item.frontmatter;
  const orgs = getEsportsOrgsForGame(game.slug);
  const tournaments = getTournamentsForGame(game.slug);
  const upcomingTournaments = tournaments.filter((t) => t.frontmatter.status !== 'completed' && t.frontmatter.status !== 'cancelled');
  const articles = getRelatedArticlesForGame(game.slug);
  const allGames = getAllGames().map((g) => g.frontmatter);
  const archivedGuilds = getRelatedGuildsForGame(game.slug);
  const similarGames = allGames
    .filter((g) => g.slug !== game.slug && g.category === game.category)
    .filter((g) => g.status === 'active' || g.status === 'upcoming')
    .sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))
    .slice(0, 6);

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pvpwire.com/' },
      { '@type': 'ListItem', position: 2, name: 'Games', item: 'https://pvpwire.com/games/' },
      { '@type': 'ListItem', position: 3, name: game.name, item: `https://pvpwire.com/games/${game.slug}/` },
    ],
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <header className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-8 sm:py-12">
          <Link
            href="/games/"
            className="font-mono text-[11px] uppercase tracking-widest text-accent hover:text-ink transition"
          >
            &larr; Back to games
          </Link>
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mt-6 items-start">
            {/* Cover poster on the left */}
            <div className="w-full sm:w-64 lg:w-72 shrink-0">
              <GameCover
                game={game}
                variant="poster"
                priority
                className="border border-ink/15"
              />
            </div>
            {/* Title block on the right */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <CategoryGlyph category={game.category} size={28} className="text-accent" />
                <span className="font-mono text-xs uppercase tracking-widest text-ink/70">{game.category}</span>
                <span className={`badge badge-${game.status}`}>{game.status}</span>
                {game.activity_tier && (
                  <span className="badge badge-active">{game.activity_tier}</span>
                )}
                {game.scene_status === 'hot' && (
                  <span className="badge badge-accent">scene: hot</span>
                )}
                {game.has_pro_scene && (
                  <span className="badge badge-active">Pro scene: {game.pro_scene_status}</span>
                )}
              </div>
              <h1 className="masthead-title text-4xl sm:text-6xl lg:text-7xl text-ink text-balance">{game.name}</h1>
              {game.aliases && game.aliases.length > 0 && (
                <div className="font-serif text-lg text-muted italic mt-2">
                  also known as {game.aliases.join(', ')}
                </div>
              )}
              {game.current_meta_note && (
                <p className="font-serif italic text-lg text-accent/95 mt-4 max-w-2xl leading-relaxed border-l-2 border-accent/40 pl-3">
                  {game.current_meta_note}
                </p>
              )}
              <p className="font-serif text-lg sm:text-xl text-ink/85 mt-6 max-w-2xl leading-relaxed">{game.description_short}</p>
              {/* Quick metadata row */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 max-w-2xl">
                <QuickMeta label="Released" value={String(game.release_year)} />
                <QuickMeta label="Developer" value={game.developer} />
                <QuickMeta label="Publisher" value={game.publisher} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Gameplay gallery */}
      {game.gameplay_images && game.gameplay_images.length > 0 && (
        <section className="border-b border-ink/15">
          <div className="mx-auto max-w-page px-4 sm:px-6 py-10">
            <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">Gameplay</div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {game.gameplay_images.map((img, i) => (
                <figure key={i} className="surface border border-ink/15 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.caption || `${game.name} gameplay`}
                    loading="lazy"
                    className="w-full aspect-video object-cover"
                  />
                  {(img.caption || img.credit) && (
                    <figcaption className="p-2 text-xs text-ink/70 flex justify-between gap-2">
                      <span className="font-serif">{img.caption}</span>
                      {img.credit && (
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">{img.credit}</span>
                      )}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-page px-4 sm:px-6 py-12 grid lg:grid-cols-[1fr,320px] gap-12">
        <div>
          {item.content.trim().length > 0 ? (
            <div className="prose-editorial">
              <pre className="hidden">{/* MDX body intentionally rendered as markdown by static export */}</pre>
              <RenderMarkdown content={item.content} />
            </div>
          ) : (
            <p className="font-serif text-lg text-muted italic">
              Long-form editorial overview pending. Games get editorial weight on rotation.
            </p>
          )}

          {/* Orgs in this game (replaces v1 "Guilds in this game" per founder
              direction 2026-04-26). Active esports orgs that field a roster
              in this title, with logos. */}
          <Section
            title="Orgs in this game"
            empty={
              archivedGuilds.length > 0
                ? 'No esports orgs field a roster here in 2026. Historical guild profiles for this title live in /archive/guilds/.'
                : 'No esports orgs field a roster here yet.'
            }
          >
            {orgs.length > 0 && (
              <ul className="grid sm:grid-cols-2 gap-3 mt-4">
                {orgs.map((o) => (
                  <li key={o.frontmatter.slug}>
                    <Link
                      href={`/esports/orgs/${o.frontmatter.slug}/`}
                      className="group surface border border-ink/15 hover:border-accent p-3 flex items-center gap-3 transition h-full"
                    >
                      <LogoImg src={o.frontmatter.logo} name={o.frontmatter.name} size="sm" />
                      <div className="min-w-0">
                        <div className="font-display text-base font-bold text-ink group-hover:text-accent transition leading-tight truncate">
                          {o.frontmatter.name}
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-muted mt-0.5">
                          {o.frontmatter.country ?? 'International'} / {o.frontmatter.founded}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* Upcoming tournaments for this game, drawn from /content/tournaments/. */}
          <Section
            title="Tournaments"
            empty={tournaments.length > 0 ? 'No upcoming events. Past results below.' : 'No tournaments scheduled.'}
          >
            {upcomingTournaments.length > 0 && (
              <ul className="grid sm:grid-cols-2 gap-3 mt-4">
                {upcomingTournaments.map((t) => (
                  <li key={t.frontmatter.slug}>
                    <Link
                      href={`/esports/${t.frontmatter.slug}/`}
                      className="group surface border border-ink/15 hover:border-accent p-3 flex flex-col gap-1 transition h-full"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`badge badge-${t.frontmatter.status === 'live' ? 'active' : 'upcoming'}`}>
                          {t.frontmatter.status}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                          {t.frontmatter.tier}
                        </span>
                      </div>
                      <div className="font-display text-base font-bold text-ink group-hover:text-accent transition leading-tight">
                        {t.frontmatter.name}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
                        {formatDate(t.frontmatter.date_start)} to {formatDate(t.frontmatter.date_end)}
                      </div>
                      {t.frontmatter.prize_pool_usd ? (
                        <div className="font-mono text-[10px] uppercase tracking-widest text-signal">
                          ${(t.frontmatter.prize_pool_usd / 1000).toLocaleString()}K prize pool
                        </div>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Articles" empty="No articles tagged for this game yet.">
            {articles.length > 0 && (
              <ul className="divide-y divide-ink/10 border-t border-b border-ink/15 mt-4">
                {articles.map((a) => (
                  <li key={a.frontmatter.slug} className="py-4">
                    <Link href={`/news/${a.frontmatter.slug}/`} className="block hover:text-accent transition">
                      <div className="font-serif text-xl">{a.frontmatter.title}</div>
                      <div className="font-mono text-[11px] uppercase tracking-widest text-muted mt-1">
                        {authorDisplay(a.frontmatter.author)} / {formatDate(a.frontmatter.published)}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {similarGames.length > 0 && (
            <Section title={`More ${game.category}`}>
              <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {similarGames.map((g) => (
                  <li key={g.slug}>
                    <Link href={`/games/${g.slug}/`} className="group block">
                      <GameCover
                        game={g}
                        variant="poster"
                        className="border border-ink/15 group-hover:border-accent transition"
                      />
                      <div className="mt-2">
                        <div className="font-display text-sm font-semibold text-ink group-hover:text-accent transition leading-tight line-clamp-2">
                          {g.name}
                        </div>
                        {g.activity_tier && (
                          <div className="font-mono text-[9px] uppercase tracking-widest text-muted mt-0.5">
                            {g.activity_tier}
                          </div>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {archivedGuilds.length > 0 && (
            <div className="mt-12 border-t border-ink/15 pt-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">From the archive</div>
              <p className="font-serif text-base text-ink/75 leading-relaxed">
                {archivedGuilds.length} historical {archivedGuilds.length === 1 ? 'guild' : 'guilds'} associated with this game.{' '}
                <Link href="/archive/" className="text-accent hover:text-ink underline underline-offset-2">
                  Browse the guild archive
                </Link>
                .
              </p>
            </div>
          )}
        </div>

        <aside className="border-t lg:border-t-0 lg:border-l border-ink/15 pt-8 lg:pt-0 lg:pl-8">
          {/* Quick scene snapshot */}
          {(game.activity_tier || game.scene_status || game.player_count_signal) && (
            <div className="mb-6 border border-ink/15 surface p-3">
              <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">Scene snapshot</div>
              {game.activity_tier && <SnapRow label="Activity" value={game.activity_tier} />}
              {game.scene_status && <SnapRow label="Scene" value={game.scene_status} />}
              {game.player_count_signal && <SnapRow label="Players" value={game.player_count_signal} />}
              {game.last_major_patch && <SnapRow label="Last patch" value={formatDate(game.last_major_patch)} />}
            </div>
          )}

          {game.scene_status_note && (
            <p className="font-serif italic text-sm text-ink/80 mb-6 leading-relaxed">
              {game.scene_status_note}
            </p>
          )}

          <Meta label="Developer" value={game.developer} />
          <Meta label="Publisher" value={game.publisher} />
          <Meta label="Released" value={String(game.release_year)} />
          <Meta label="Platforms" value={game.platforms.join(', ')} />
          <Meta label="PvP Modes" value={game.pvp_modes.join(', ')} />
          {game.ranking_systems && game.ranking_systems.length > 0 && (
            <Meta label="Ranking" value={game.ranking_systems.join(', ')} />
          )}
          {game.sub_categories && game.sub_categories.length > 0 && (
            <Meta label="Tags" value={game.sub_categories.join(', ')} />
          )}
          {game.has_pro_scene && (
            <Meta label="Pro scene" value={game.pro_scene_status} />
          )}
          {game.last_updated && <Meta label="Last updated" value={formatDate(game.last_updated)} />}

          {game.external_links && game.external_links.length > 0 && (
            <div className="mt-8">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">External</div>
              <ul className="space-y-2">
                {game.external_links.map((l) => (
                  <li key={l.url}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-serif text-base text-accent hover:text-ink inline-flex items-center gap-1"
                    >
                      {l.name} <ExternalLinkIcon size={12} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}

function Section({
  title,
  children,
  empty,
  href,
}: {
  title: string;
  children?: React.ReactNode;
  empty?: string;
  href?: string;
}) {
  const hasChildren = !!children && (children as any).props?.children !== undefined;
  return (
    <div className="mt-12">
      <div className="flex justify-between items-baseline border-b border-ink/15 pb-2">
        <h2 className="masthead-title text-2xl text-ink">{title}</h2>
        {href && (
          <Link href={href} className="font-mono text-[11px] uppercase tracking-widest text-accent hover:text-ink">
            <span className="inline-flex items-center gap-1">
              Add one <ArrowRightIcon size={12} />
            </span>
          </Link>
        )}
      </div>
      {children}
      {!hasChildren && empty && <p className="font-serif text-base text-muted italic mt-4">{empty}</p>}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted">{label}</div>
      <div className="font-serif text-base text-ink mt-0.5">{value}</div>
    </div>
  );
}

function RenderMarkdown({ content }: { content: string }) {
  // v1 ships static MDX bodies. Keep simple paragraphs at this stage.
  return (
    <div>
      {content
        .split(/\n\n+/)
        .filter((p) => p.trim())
        .map((p, i) => (
          <p key={i}>{p.trim()}</p>
        ))}
    </div>
  );
}

function QuickMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted">{label}</div>
      <div className="font-serif text-base text-ink mt-0.5">{value}</div>
    </div>
  );
}

function SnapRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-2 py-1 border-b border-ink/10 last:border-0">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">{label}</span>
      <span className="font-mono text-[11px] uppercase tracking-widest text-ink/85">{value}</span>
    </div>
  );
}
