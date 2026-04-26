import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getAllEsportsOrgs,
  getEsportsOrgBySlug,
  getGameBySlug,
  getTournamentsForOrg,
} from '@/lib/content';
import { ExternalLinkIcon } from '@/components/icons';

export async function generateStaticParams() {
  return getAllEsportsOrgs().map((o) => ({ slug: o.frontmatter.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const item = getEsportsOrgBySlug(params.slug);
  if (!item) return { title: 'Not found' };
  const fm = item.frontmatter;
  return {
    title: fm.name,
    description: fm.description_short,
    openGraph: { title: fm.name, description: fm.description_short, type: 'profile' },
  };
}

export default function EsportsOrgPage({ params }: { params: { slug: string } }) {
  const item = getEsportsOrgBySlug(params.slug);
  if (!item) notFound();
  const org = item.frontmatter;

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: org.name,
    foundingDate: String(org.founded),
    url: `https://pvpwire.com/esports/orgs/${org.slug}/`,
    sameAs: org.external_links?.map((l) => l.url) ?? [],
  };

  const tournaments = getTournamentsForOrg(org.slug);

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <header className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
          <Link href="/esports/orgs/" className="font-mono text-[11px] uppercase tracking-widest text-accent hover:text-ink transition">
            &larr; Back to orgs
          </Link>
          <div className="flex items-center gap-3 mt-6 mb-3">
            <span className={`badge badge-${org.status === 'active' ? 'active' : 'dissolved'}`}>
              {org.status}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
              Founded {org.founded}
            </span>
            {org.country && (
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
                {org.country}{org.hq_city ? ` / ${org.hq_city}` : ''}
              </span>
            )}
          </div>
          <h1 className="masthead-title text-5xl sm:text-7xl text-ink">{org.name}</h1>
          {org.aliases && org.aliases.length > 0 && (
            <div className="font-serif text-lg text-muted italic mt-2">
              also: {org.aliases.join(', ')}
            </div>
          )}
          <p className="font-serif text-xl text-ink/85 mt-6 max-w-3xl leading-relaxed">{org.description_short}</p>
        </div>
      </header>

      <div className="mx-auto max-w-page px-4 sm:px-6 py-12 grid lg:grid-cols-[1fr,320px] gap-12">
        <div>
          {item.content.trim().length > 0 && (
            <div className="prose-editorial mb-12">
              {item.content
                .split(/\n\n+/)
                .filter((p) => p.trim())
                .map((p, i) => {
                  if (p.startsWith('## ')) {
                    return <h2 key={i}>{p.replace(/^## /, '').trim()}</h2>;
                  }
                  return <p key={i}>{p.trim()}</p>;
                })}
            </div>
          )}

          {org.notable_titles && org.notable_titles.length > 0 && (
            <section className="mt-12">
              <h2 className="masthead-title text-2xl text-ink border-b border-ink/15 pb-2">Notable titles</h2>
              <ul className="mt-4 space-y-2">
                {org.notable_titles.map((title, i) => (
                  <li key={i} className="font-serif text-base text-ink/85">{title}</li>
                ))}
              </ul>
            </section>
          )}

          {org.notable_moments && org.notable_moments.length > 0 && (
            <section className="mt-12">
              <h2 className="masthead-title text-2xl text-ink border-b border-ink/15 pb-2">Notable moments</h2>
              <ol className="mt-4 relative border-l border-ink/20 ml-2">
                {org.notable_moments.map((m, i) => (
                  <li key={i} className="ml-6 pb-6">
                    <span className="absolute -left-[7px] w-3 h-3 bg-accent rounded-full mt-2" aria-hidden="true" />
                    <div className="font-mono text-[11px] uppercase tracking-widest text-accent">
                      {(m.date as unknown) instanceof Date ? (m.date as unknown as Date).toISOString().slice(0, 10) : m.date}
                    </div>
                    <h3 className="font-serif text-xl text-ink mt-1">{m.title}</h3>
                    <p className="font-serif text-base text-ink/80 mt-1">{m.description}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {org.roster_highlights && org.roster_highlights.length > 0 && (
            <section className="mt-12">
              <h2 className="masthead-title text-2xl text-ink border-b border-ink/15 pb-2">Roster highlights</h2>
              <ul className="mt-4 grid sm:grid-cols-2 gap-4">
                {org.roster_highlights.map((m, i) => (
                  <li key={i} className="border border-ink/15 p-4">
                    <div className="font-serif text-lg text-ink">{m.handle}</div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted mt-0.5">
                      {m.role} / {m.game_slug.replace(/-/g, ' ')}
                    </div>
                    {m.notes && <p className="font-serif text-sm text-ink/80 mt-2">{m.notes}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {tournaments.length > 0 && (
            <section className="mt-12 border-t border-ink/15 pt-8">
              <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">Tournament appearances</div>
              <ul className="space-y-3">
                {tournaments.map((t) => (
                  <li key={t.frontmatter.slug}>
                    <Link href={`/esports/${t.frontmatter.slug}/`} className="font-serif text-lg text-ink hover:text-accent">
                      {t.frontmatter.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="border-t lg:border-t-0 lg:border-l border-ink/15 pt-8 lg:pt-0 lg:pl-8">
          {org.games && org.games.length > 0 && (
            <div className="mb-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Active games</div>
              <ul className="space-y-1">
                {org.games.map((g, i) => {
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
                      {g.status === 'inactive' && <span className="text-muted text-sm"> (inactive)</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {org.external_links && org.external_links.length > 0 && (
            <div className="mt-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Links</div>
              <ul className="space-y-2">
                {org.external_links.map((l, i) => (
                  <li key={i}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-serif text-sm text-accent hover:text-ink inline-flex items-center gap-1"
                    >
                      {l.name} <ExternalLinkIcon size={11} />
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
