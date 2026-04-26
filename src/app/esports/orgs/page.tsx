import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllEsportsOrgs } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Esports orgs',
  description:
    'The professional esports organizations index. Tier-1 multi-game brands, regional anchors, scene-specific specialists, and historical orgs across the global competitive scene.',
};

export default function EsportsOrgsPage() {
  const orgs = getAllEsportsOrgs();
  const active = orgs.filter((o) => o.frontmatter.status === 'active');
  const dissolved = orgs.filter((o) => o.frontmatter.status === 'dissolved');

  return (
    <article>
      <header className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-12 sm:py-16">
          <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-4">Organizations</div>
          <h1 className="masthead-title text-5xl sm:text-6xl text-ink">The pro orgs.</h1>
          <p className="font-serif text-xl text-ink/80 max-w-3xl mt-4 leading-relaxed">
            {active.length} active and {dissolved.length} historical organizations across the global competitive scene. Multi-game tier-1 brands, regional anchors, and scene specialists.
          </p>
        </div>
      </header>

      <section className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
          <div className="flex items-end justify-between gap-4 border-b border-ink/15 pb-3 mb-6">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-accent">Active</div>
              <h2 className="masthead-title text-2xl sm:text-3xl text-ink mt-1">{active.length} organizations</h2>
            </div>
          </div>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {active.map((o) => (
              <OrgCard key={o.frontmatter.slug} o={o} />
            ))}
          </ul>
        </div>
      </section>

      {dissolved.length > 0 && (
        <section>
          <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
            <div className="flex items-end justify-between gap-4 border-b border-ink/15 pb-3 mb-6">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-muted">Historical</div>
                <h2 className="masthead-title text-2xl sm:text-3xl text-ink mt-1">{dissolved.length} dissolved</h2>
              </div>
            </div>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {dissolved.map((o) => (
                <OrgCard key={o.frontmatter.slug} o={o} />
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}

function OrgCard({ o }: { o: ReturnType<typeof getAllEsportsOrgs>[number] }) {
  const fm = o.frontmatter;
  return (
    <li>
      <Link
        href={`/esports/orgs/${fm.slug}/`}
        className="group surface border border-ink/15 hover:border-accent p-4 flex flex-col gap-2 transition h-full"
      >
        <div className="flex items-center justify-between gap-2">
          <span className={`badge badge-${fm.status === 'active' ? 'active' : 'dissolved'}`}>
            {fm.status}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
            {fm.country ?? 'Intl'} / {fm.founded}
          </span>
        </div>
        <div className="font-display text-lg font-bold text-ink group-hover:text-accent transition leading-tight">
          {fm.name}
        </div>
        <p className="font-serif text-sm text-ink/75 leading-snug line-clamp-3">
          {fm.description_short}
        </p>
        {fm.games && fm.games.length > 0 && (
          <div className="font-mono text-[9px] uppercase tracking-widest text-muted mt-1">
            {fm.games.slice(0, 4).map((g) => g.game_slug.replace(/-/g, ' ')).join(', ')}
            {fm.games.length > 4 ? ', ...' : ''}
          </div>
        )}
      </Link>
    </li>
  );
}
