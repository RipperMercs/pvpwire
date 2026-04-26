import type { Metadata } from 'next';
import { getAllGuilds, getAllGames } from '@/lib/content';
import { GuildsBrowser } from '@/components/GuildsBrowser';
import { OgGuildsInfograph } from '@/components/OgGuildsInfograph';
import { OgGlyph } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Guilds',
  description:
    'The canonical, cross-game, lineage-aware database of competitive PvP guilds across MMO history and modern competitive gaming.',
};

export default function GuildsPage() {
  const guildsRaw = getAllGuilds();
  const gamesRaw = getAllGames();
  const guilds = guildsRaw.map((g) => g.frontmatter);
  const gameMap = Object.fromEntries(gamesRaw.map((g) => [g.frontmatter.slug, g.frontmatter.name]));

  const ogGuilds = guilds.filter((g) => g.era === 'og' || g.era === 'classic');

  return (
    <article>
      <header className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-12 sm:py-16">
          <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-4">Guilds</div>
          <h1 className="masthead-title text-5xl sm:text-6xl text-ink">The database.</h1>
          <p className="font-serif text-xl text-ink/80 max-w-3xl mt-4 leading-relaxed">
            The canonical home for competitive PvP guilds. Cross-game lineage, server history, the people who shaped the eras. Submissions are open.
          </p>
          <div className="font-mono text-xs uppercase tracking-widest text-muted mt-6">
            {guilds.length} profiles / {ogGuilds.length} OG era / submissions reviewed weekly
          </div>
        </div>
      </header>

      {/* OG Guilds Infograph (per spec section 7.7) */}
      <section className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-10">
          <div className="flex items-center gap-3 mb-2">
            <OgGlyph size={24} className="text-accent" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-accent">Og / The OG era</span>
          </div>
          <h2 className="masthead-title text-3xl sm:text-4xl text-ink">When this all started.</h2>
          <p className="font-serif text-lg text-ink/80 max-w-3xl mt-4">
            What you are looking at is two decades of guild lineage rendered as one shape. The bars run by years active. The connections show predecessors and successors across games, where they exist. Click any node to read the profile.
          </p>
          <div className="mt-8">
            <OgGuildsInfograph guilds={ogGuilds} gameMap={gameMap} />
          </div>
        </div>
      </section>

      {/* Browser */}
      <div className="mx-auto max-w-page px-4 sm:px-6 py-10">
        <GuildsBrowser guilds={guilds} gameMap={gameMap} />
      </div>
    </article>
  );
}
