import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllArchivedStories, getAllGuilds } from '@/lib/content';
import { authorDisplay, formatDate } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Archive',
  description:
    'PVPWire archive. Historical guild profiles, legacy editorial pieces, and the lineage map of competitive PvP from the late 1990s through the modern esports era.',
};

export default function ArchivePage() {
  const stories = getAllArchivedStories();
  const guilds = getAllGuilds();
  const ogGuilds = guilds.filter((g) => g.frontmatter.era === 'og').length;

  return (
    <article>
      <header className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-12 sm:py-16">
          <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-4">Archive</div>
          <h1 className="masthead-title text-5xl sm:text-6xl text-ink">The depth surface.</h1>
          <p className="font-serif text-xl text-ink/80 max-w-3xl mt-4 leading-relaxed">
            PVPWire is the hub for current competitive PvP and esports. The archive is what came before: guild profiles, lineage trees, and legacy editorial preserved for anyone who wants the depth.
          </p>
        </div>
      </header>

      <section className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
          <div className="flex items-end justify-between gap-4 border-b border-ink/15 pb-3">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-accent">Guilds</div>
              <h2 className="masthead-title text-3xl sm:text-4xl text-ink mt-1">Two decades of lineage.</h2>
            </div>
            <Link
              href="/guilds/"
              className="font-mono text-[11px] uppercase tracking-widest text-ink/70 hover:text-accent shrink-0"
            >
              Browse all
            </Link>
          </div>
          <p className="font-serif text-base text-ink/80 max-w-3xl mt-6 leading-relaxed">
            The canonical, cross-game, lineage-aware database of competitive PvP guilds. Asheron's Call Darktide through modern esports orgs. Submissions are still open.
          </p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
            <Stat label="Profiles" value={String(guilds.length)} />
            <Stat label="OG era" value={String(ogGuilds)} />
            <Stat label="Stories" value={String(stories.length)} />
            <Stat label="Updated" value="Weekly" />
          </div>
          <div className="mt-8">
            <Link
              href="/guilds/"
              className="inline-block border border-ink/25 hover:border-accent px-5 py-3 font-mono text-[11px] uppercase tracking-widest text-ink hover:text-accent transition"
            >
              Open the guilds index
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
          <div className="flex items-end justify-between gap-4 border-b border-ink/15 pb-3">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-accent">Stories</div>
              <h2 className="masthead-title text-3xl sm:text-4xl text-ink mt-1">Legacy editorial.</h2>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted shrink-0">
              {stories.length} pieces
            </span>
          </div>
          <p className="font-serif text-base text-ink/80 max-w-3xl mt-6 leading-relaxed">
            The pre-pivot Legends and Heritage pieces. Bylines are grandfathered: Flosium and Og have retired as personas, but the work they produced stays accessible here.
          </p>
          {stories.length > 0 ? (
            <ul className="mt-8 space-y-8">
              {stories.map((s) => (
                <li key={s.frontmatter.slug} className="border-b border-ink/10 pb-8 last:border-0 last:pb-0">
                  <Link href={`/archive/${s.frontmatter.slug}/`} className="group block">
                    <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-2">
                      {s.frontmatter.original_section} / {authorDisplay(s.frontmatter.author)} / {formatDate(s.frontmatter.published)}
                    </div>
                    <h3 className="masthead-title text-2xl sm:text-3xl text-ink group-hover:text-accent transition leading-tight">
                      {s.frontmatter.title}
                    </h3>
                    <p className="font-serif text-base text-ink/75 mt-3 leading-relaxed max-w-3xl line-clamp-2">
                      {s.frontmatter.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-serif text-base text-muted italic mt-6">No archived stories yet.</p>
          )}
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted">More archive material is added as scope expands.</div>
          <p className="font-serif text-base text-ink/70 mt-2">
            For current games and active esports, head back to <Link href="/" className="text-accent hover:text-ink">the home page</Link>.
          </p>
        </div>
      </section>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="masthead-title text-3xl text-ink">{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted mt-1">{label}</div>
    </div>
  );
}
