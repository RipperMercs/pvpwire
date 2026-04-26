import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getAllGuilds,
  getGuildBySlug,
  getGameBySlug,
  getRelatedArticlesForGuild,
  getRelatedLegendsForGuild,
} from '@/lib/content';
import { formatDate, formatYearRange, guildStatusDisplay } from '@/lib/format';
import { LineageTree } from '@/components/LineageTree';
import { ExternalLinkIcon } from '@/components/icons';

export async function generateStaticParams() {
  return getAllGuilds().map((g) => ({ slug: g.frontmatter.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const item = getGuildBySlug(params.slug);
  if (!item) return { title: 'Not found' };
  const fm = item.frontmatter;
  const description = fm.status_note || `${fm.name}, ${formatYearRange(fm.era_active)}. PVPWire guild profile.`;
  return {
    title: fm.name,
    description,
    openGraph: { title: fm.name, description, type: 'profile' },
  };
}

export default function GuildPage({ params }: { params: { slug: string } }) {
  const item = getGuildBySlug(params.slug);
  if (!item) notFound();
  const guild = item.frontmatter;

  const allGuilds = getAllGuilds().map((g) => g.frontmatter);
  const articles = getRelatedArticlesForGuild(guild.slug);
  const legends = getRelatedLegendsForGuild(guild.slug);

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pvpwire.com/' },
      { '@type': 'ListItem', position: 2, name: 'Guilds', item: 'https://pvpwire.com/guilds/' },
      { '@type': 'ListItem', position: 3, name: guild.name, item: `https://pvpwire.com/guilds/${guild.slug}/` },
    ],
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <header className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
          <Link href="/guilds/" className="font-mono text-[11px] uppercase tracking-widest text-accent hover:text-ink transition">
            &larr; Back to guilds
          </Link>
          <div className="flex items-center gap-3 mt-6 mb-3">
            <span className={`badge badge-${guild.era}`}>{guild.era}</span>
            <span className={`badge badge-${guild.status}`}>{guildStatusDisplay(guild.status)}</span>
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
              {formatYearRange(guild.era_active)}
            </span>
          </div>
          <h1 className="masthead-title text-5xl sm:text-7xl text-ink">{guild.name}</h1>
          {guild.aliases && guild.aliases.length > 0 && (
            <div className="font-serif text-lg text-muted italic mt-2">
              also known as {guild.aliases.join(', ')}
            </div>
          )}
          {guild.status_note && (
            <p className="font-serif text-xl text-ink/85 mt-6 max-w-3xl leading-relaxed">{guild.status_note}</p>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-page px-4 sm:px-6 py-12 grid lg:grid-cols-[1fr,320px] gap-12">
        <div>
          {item.content.trim().length > 0 && (
            <div className="prose-editorial mb-12">
              {item.content
                .split(/\n\n+/)
                .filter((p) => p.trim())
                .map((p, i) => <p key={i}>{p.trim()}</p>)}
            </div>
          )}

          {/* Lineage tree */}
          {((guild.predecessor_guilds && guild.predecessor_guilds.length) ||
            (guild.successor_guilds && guild.successor_guilds.length) ||
            (guild.splinter_guilds && guild.splinter_guilds.length)) && (
            <section className="mt-8">
              <h2 className="masthead-title text-2xl text-ink border-b border-ink/15 pb-2">Lineage</h2>
              <p className="font-serif text-base text-ink/75 my-3">
                The web of predecessors, successors, and splinters this guild touched. Click any node to navigate.
              </p>
              <LineageTree focal={guild} all={allGuilds} />
            </section>
          )}

          {/* Notable moments */}
          {guild.notable_moments && guild.notable_moments.length > 0 && (
            <section className="mt-12">
              <h2 className="masthead-title text-2xl text-ink border-b border-ink/15 pb-2">Notable moments</h2>
              <ol className="mt-4 relative border-l border-ink/20 ml-2">
                {guild.notable_moments.map((m, i) => (
                  <li key={i} className="ml-6 pb-6">
                    <span className="absolute -left-[7px] w-3 h-3 bg-accent rounded-full mt-2" aria-hidden="true" />
                    <div className="font-mono text-[11px] uppercase tracking-widest text-accent">{m.date}</div>
                    <h3 className="font-serif text-xl text-ink mt-1">{m.title}</h3>
                    <p className="font-serif text-base text-ink/80 mt-1">{m.description}</p>
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">
                        Sources: {m.sources.map((s, j) => (
                          <a key={j} href={s} target="_blank" rel="noopener noreferrer" className="ml-1 text-accent hover:text-ink">
                            [{j + 1}]
                          </a>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Notable members */}
          {guild.notable_members && guild.notable_members.length > 0 && (
            <section className="mt-12">
              <h2 className="masthead-title text-2xl text-ink border-b border-ink/15 pb-2">Notable members</h2>
              <ul className="mt-4 grid sm:grid-cols-2 gap-4">
                {guild.notable_members.map((m, i) => (
                  <li key={i} className="border border-ink/15 p-4">
                    <div className="font-serif text-lg text-ink">{m.handle}</div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted mt-0.5">{m.role}</div>
                    {m.notes && <p className="font-serif text-sm text-ink/80 mt-2">{m.notes}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Related */}
          {(legends.length > 0 || articles.length > 0) && (
            <section className="mt-12 border-t border-ink/15 pt-8">
              {legends.length > 0 && (
                <div className="mb-8">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">Featured</div>
                  <ul className="space-y-3">
                    {legends.map((l) => (
                      <li key={l.frontmatter.slug}>
                        <Link href={`/legends/${l.frontmatter.slug}/`} className="font-serif text-xl text-ink hover:text-accent">
                          {l.frontmatter.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {articles.length > 0 && (
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">Articles</div>
                  <ul className="space-y-3">
                    {articles.map((a) => (
                      <li key={a.frontmatter.slug}>
                        <Link href={`/news/${a.frontmatter.slug}/`} className="font-serif text-lg text-ink hover:text-accent">
                          {a.frontmatter.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
        </div>

        <aside className="border-t lg:border-t-0 lg:border-l border-ink/15 pt-8 lg:pt-0 lg:pl-8">
          <Meta label="Era" value={`${guild.era} (${formatYearRange(guild.era_active)})`} />
          {guild.allegiance_structure && <Meta label="Structure" value={guild.allegiance_structure} />}
          {guild.games && guild.games.length > 0 && (
            <div className="mb-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted">Games</div>
              <ul className="mt-1 space-y-1">
                {guild.games.map((g, i) => {
                  const gameItem = getGameBySlug(g.game_slug);
                  return (
                    <li key={i} className="font-serif text-base">
                      {gameItem ? (
                        <Link href={`/games/${g.game_slug}/`} className="text-accent hover:text-ink">
                          {gameItem.frontmatter.name}
                        </Link>
                      ) : (
                        <span className="text-ink">{g.game_slug}</span>
                      )}
                      {g.server && <span className="text-muted"> / {g.server}</span>}
                      {g.realm && <span className="text-muted"> / {g.realm}</span>}
                      {g.role && <div className="font-mono text-[10px] uppercase tracking-widest text-muted">{g.role}</div>}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {guild.last_verified && <Meta label="Last verified" value={formatDate(guild.last_verified)} />}
          {guild.verified_by && <Meta label="Verified by" value={guild.verified_by} />}

          {guild.sources && guild.sources.length > 0 && (
            <div className="mt-8">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Sources</div>
              <ul className="space-y-2">
                {guild.sources.map((s, i) => (
                  <li key={i}>
                    <a
                      href={s}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-serif text-sm text-accent hover:text-ink inline-flex items-center gap-1 break-all"
                    >
                      [{i + 1}] {new URL(s).hostname.replace(/^www\./, '')} <ExternalLinkIcon size={11} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 border-t border-ink/15 pt-4">
            <Link
              href="/guilds/submit/"
              className="font-mono text-[11px] uppercase tracking-widest text-accent hover:text-ink"
            >
              Send a correction or memory
            </Link>
          </div>
        </aside>
      </div>
    </article>
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
