import type { Metadata } from 'next';
import Link from 'next/link';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { authorDisplay, formatDate, readingTime } from '@/lib/format';
import { FlosiumGlyph } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Flosium vs the World',
  description:
    'Flosium\'s recurring rant column. The state of competitive gaming, current titles, scene observations. Brief, opinionated, no hedging.',
};

interface VsItem {
  slug: string;
  title: string;
  description: string;
  author: 'flosium' | 'og' | 'flipper';
  published: string;
  content: string;
}

function getAllVsTheWorld(): VsItem[] {
  const dir = join(process.cwd(), 'content', 'vs-the-world');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((f) => {
      const raw = readFileSync(join(dir, f), 'utf8');
      const parsed = matter(raw);
      return { ...(parsed.data as Omit<VsItem, 'content'>), content: parsed.content };
    })
    .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
}

export default function VsTheWorldPage() {
  const items = getAllVsTheWorld();

  return (
    <article>
      <header className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-12 sm:py-20">
          <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-4 flex items-center gap-2">
            <FlosiumGlyph size={20} className="text-accent" />
            Flosium / Recurring rant column
          </div>
          <h1 className="masthead-title text-5xl sm:text-7xl text-ink">Flosium vs the World.</h1>
          <p className="font-serif text-xl sm:text-2xl text-ink/80 max-w-3xl mt-6 leading-relaxed">
            Where Heritage looks back, this looks at right now. Brief opinions on current titles, industry decisions, scene observations, and whatever is producing actively bad takes this week.
          </p>
          <p className="font-serif text-base text-ink/65 mt-4 max-w-3xl">
            Cadence is irregular. The desk drops these when something earns the column.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
        {items.length === 0 ? (
          <div className="border border-ink/15 p-12 text-center">
            <p className="font-serif text-lg text-muted italic">First entry coming. The desk is sharpening.</p>
          </div>
        ) : (
          <ul className="space-y-12">
            {items.map((it) => {
              const minutes = readingTime(it.content);
              return (
                <li key={it.slug} className="border-b border-ink/15 pb-12 last:border-0">
                  <Link href={`/vs-the-world/${it.slug}/`} className="group block">
                    <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-2">
                      {authorDisplay(it.author)} / {formatDate(it.published)} / {minutes} min read
                    </div>
                    <h2 className="masthead-title text-3xl sm:text-5xl text-ink group-hover:text-accent transition max-w-3xl">
                      {it.title}
                    </h2>
                    <p className="font-serif text-lg text-ink/80 mt-4 leading-relaxed max-w-3xl">{it.description}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </article>
  );
}
