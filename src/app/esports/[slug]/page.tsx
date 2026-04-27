import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getAllTournaments,
  getTournamentBySlug,
  getGameBySlug,
  getEsportsOrgBySlug,
} from '@/lib/content';
import { formatDate } from '@/lib/format';
import { ExternalLinkIcon } from '@/components/icons';
import { buildMetadata, ogImagePath, truncate, SITE_URL } from '@/lib/seo';
import { sportsEventSchema, breadcrumbSchema, jsonLdScript } from '@/lib/jsonld';

export async function generateStaticParams() {
  return getAllTournaments().map((t) => ({ slug: t.frontmatter.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const item = getTournamentBySlug(params.slug);
  if (!item) return { title: 'Not found' };
  const fm = item.frontmatter;
  const year = new Date(fm.date_start).getFullYear();
  const game = getGameBySlug(fm.game_slug);
  const title = `${fm.name}: Schedule, Bracket, Prize Pool`;
  const description = truncate(
    `${fm.name} ${year} schedule, format, prize pool, and participating organizations. ${game?.frontmatter.name ?? fm.game_slug} esports calendar from PVPWire.`
  );
  return buildMetadata({
    title,
    description,
    path: `/esports/${fm.slug}/`,
    ogImage: ogImagePath('esports', fm.slug),
    ogType: 'article',
    publishedTime: fm.date_start,
  });
}

export default function TournamentPage({ params }: { params: { slug: string } }) {
  const item = getTournamentBySlug(params.slug);
  if (!item) notFound();
  const t = item.frontmatter;
  const game = getGameBySlug(t.game_slug);

  const eventSchema = sportsEventSchema(t);
  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Esports', url: `${SITE_URL}/esports/` },
    { name: t.name, url: `${SITE_URL}/esports/${t.slug}/` },
  ]);

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(eventSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumb) }} />
      <header className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
          <Link href="/esports/" className="font-mono text-[11px] uppercase tracking-widest text-accent hover:text-ink transition">
            &larr; Back to esports
          </Link>
          <div className="flex items-center gap-3 mt-6 mb-3">
            <span className={`badge badge-${t.status === 'live' ? 'active' : 'upcoming'}`}>{t.status}</span>
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted">{t.tier}</span>
            {t.region && (
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted">{t.region}</span>
            )}
          </div>
          <h1 className="masthead-title text-4xl sm:text-6xl text-ink">{t.name}</h1>
          {t.aliases && t.aliases.length > 0 && (
            <div className="font-serif text-lg text-muted italic mt-2">
              also: {t.aliases.join(', ')}
            </div>
          )}
          <p className="font-serif text-xl text-ink/85 mt-6 max-w-3xl leading-relaxed">{t.description_short}</p>
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted mt-6">
            {formatDate(t.date_start)} to {formatDate(t.date_end)}
            {t.location ? ` / ${t.location}` : ''}
            {t.venue ? ` / ${t.venue}` : ''}
          </div>
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

          {t.results && t.results.length > 0 && (
            <section className="mt-12">
              <h2 className="masthead-title text-2xl text-ink border-b border-ink/15 pb-2">Results</h2>
              <ol className="mt-4 space-y-2">
                {t.results.sort((a, b) => a.placement - b.placement).map((r, i) => {
                  const org = getEsportsOrgBySlug(r.org_slug);
                  return (
                    <li key={i} className="font-serif text-base flex items-baseline gap-3">
                      <span className="font-mono text-sm text-accent w-8 shrink-0">#{r.placement}</span>
                      {org ? (
                        <Link href={`/esports/orgs/${r.org_slug}/`} className="text-ink hover:text-accent">
                          {org.frontmatter.name}
                        </Link>
                      ) : (
                        <span className="text-ink">{r.org_slug}</span>
                      )}
                      {r.prize_usd ? <span className="text-muted ml-auto font-mono text-sm">${r.prize_usd.toLocaleString()}</span> : null}
                    </li>
                  );
                })}
              </ol>
            </section>
          )}

          {t.participants && t.participants.length > 0 && !t.results && (
            <section className="mt-12">
              <h2 className="masthead-title text-2xl text-ink border-b border-ink/15 pb-2">Participants</h2>
              <ul className="mt-4 grid sm:grid-cols-2 gap-2">
                {t.participants.map((p, i) => {
                  const org = getEsportsOrgBySlug(p.org_slug);
                  return (
                    <li key={i} className="font-serif text-base">
                      {org ? (
                        <Link href={`/esports/orgs/${p.org_slug}/`} className="text-accent hover:text-ink">
                          {org.frontmatter.name}
                        </Link>
                      ) : (
                        <span className="text-ink">{p.org_slug}</span>
                      )}
                      {p.seed ? <span className="text-muted text-sm"> (seed {p.seed})</span> : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        <aside className="border-t lg:border-t-0 lg:border-l border-ink/15 pt-8 lg:pt-0 lg:pl-8">
          <Meta label="Game" value={
            game ? (
              <Link href={`/games/${t.game_slug}/`} className="text-accent hover:text-ink">{game.frontmatter.name}</Link>
            ) : (
              t.game_slug
            )
          } />
          <Meta label="Organizer" value={t.organizer} />
          {t.format && <Meta label="Format" value={t.format.replace(/-/g, ' ')} />}
          {t.prize_pool_usd && <Meta label="Prize pool" value={`$${t.prize_pool_usd.toLocaleString()}`} />}

          {t.broadcast_links && t.broadcast_links.length > 0 && (
            <div className="mt-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Broadcasts</div>
              <ul className="space-y-2">
                {t.broadcast_links.map((l, i) => (
                  <li key={i}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="font-serif text-sm text-accent hover:text-ink inline-flex items-center gap-1">
                      {l.name} <ExternalLinkIcon size={11} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {t.external_links && t.external_links.length > 0 && (
            <div className="mt-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Links</div>
              <ul className="space-y-2">
                {t.external_links.map((l, i) => (
                  <li key={i}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="font-serif text-sm text-accent hover:text-ink inline-flex items-center gap-1">
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

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted">{label}</div>
      <div className="font-serif text-base text-ink mt-0.5">{value}</div>
    </div>
  );
}
