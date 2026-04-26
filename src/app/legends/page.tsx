import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllLegends, getGuildBySlug } from '@/lib/content';
import { authorDisplay, formatDate, formatYearRange } from '@/lib/format';
import { FlosiumGlyph } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Legends',
  description:
    'The prestige editorial tier. Long-form Flosium-bylined deep dives on the guilds that shaped competitive PvP across eras and games.',
};

export default function LegendsPage() {
  const legends = getAllLegends();

  return (
    <article>
      <header className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-12 sm:py-20">
          <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-4 flex items-center gap-2">
            <FlosiumGlyph size={20} className="text-accent" />
            Flosium / Prestige tier
          </div>
          <h1 className="masthead-title text-5xl sm:text-7xl text-ink">Legends.</h1>
          <p className="font-serif text-xl sm:text-2xl text-ink/80 max-w-3xl mt-6 leading-relaxed">
            Long-form profiles of the guilds that shaped competitive PvP. Slow cadence, narrow column, no padding. New profiles every two to three weeks.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
        <ul className="grid md:grid-cols-2 gap-12">
          {legends.map((l) => {
            const guild = l.frontmatter.guild_slug ? getGuildBySlug(l.frontmatter.guild_slug) : undefined;
            return (
              <li key={l.frontmatter.slug}>
                <Link href={`/legends/${l.frontmatter.slug}/`} className="group block">
                  <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-2">
                    {authorDisplay(l.frontmatter.author)} / {formatDate(l.frontmatter.published)}
                  </div>
                  <h2 className="masthead-title text-3xl sm:text-4xl text-ink group-hover:text-accent transition">
                    {l.frontmatter.title}
                  </h2>
                  <p className="font-serif text-lg text-ink/75 mt-3 leading-relaxed">{l.frontmatter.description}</p>
                  {guild && (
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted mt-4">
                      {guild.frontmatter.name} / {formatYearRange(guild.frontmatter.era_active)}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}
