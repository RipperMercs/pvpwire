import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllHeritage } from '@/lib/content';
import { authorDisplay, formatDate, readingTime } from '@/lib/format';
import { FlosiumGlyph } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Heritage',
  description:
    'From the Old World. Flosium\'s recurring column on PvP history, sieges, server politics, and the philosophies that shaped the genre.',
};

export default function HeritagePage() {
  const columns = getAllHeritage();

  return (
    <article>
      <header className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-12 sm:py-20">
          <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-4 flex items-center gap-2">
            <FlosiumGlyph size={20} className="text-accent" />
            Flosium / From the Old World
          </div>
          <h1 className="masthead-title text-5xl sm:text-7xl text-ink">Heritage.</h1>
          <p className="font-serif text-xl sm:text-2xl text-ink/80 max-w-3xl mt-6 leading-relaxed">
            The genre is older than most of its current participants. Heritage is where it gets written down. Sieges, server politics, patches that reshaped communities, and the doctrines that traveled between titles. New columns every seven to ten days.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
        <ul className="space-y-12">
          {columns.map((c) => {
            const minutes = readingTime(c.content);
            return (
              <li key={c.frontmatter.slug} className="border-b border-ink/15 pb-12 last:border-0">
                <Link href={`/heritage/${c.frontmatter.slug}/`} className="group block">
                  <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-2">
                    {authorDisplay(c.frontmatter.author)} / {formatDate(c.frontmatter.published)} / {minutes} min read
                  </div>
                  <h2 className="masthead-title text-3xl sm:text-5xl text-ink group-hover:text-accent transition max-w-3xl">
                    {c.frontmatter.title}
                  </h2>
                  <p className="font-serif text-lg text-ink/80 mt-4 leading-relaxed max-w-3xl">
                    {c.frontmatter.description}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}
