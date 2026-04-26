import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getAllLegends,
  getLegendBySlug,
  getGuildBySlug,
  getGameBySlug,
} from '@/lib/content';
import { authorDisplay, formatDate, formatYearRange, readingTime } from '@/lib/format';
import { ArticleBody } from '@/components/ArticleBody';
import { FlosiumGlyph, OgGlyph, FlipperGlyph } from '@/components/icons';

export async function generateStaticParams() {
  return getAllLegends().map((l) => ({ slug: l.frontmatter.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const item = getLegendBySlug(params.slug);
  if (!item) return { title: 'Not found' };
  const fm = item.frontmatter;
  return {
    title: fm.title,
    description: fm.description,
    openGraph: { title: fm.title, description: fm.description, type: 'article' },
  };
}

export default function LegendPage({ params }: { params: { slug: string } }) {
  const item = getLegendBySlug(params.slug);
  if (!item) notFound();
  const fm = item.frontmatter;
  const minutes = readingTime(item.content);
  const guild = fm.guild_slug ? getGuildBySlug(fm.guild_slug) : undefined;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: fm.title,
    description: fm.description,
    datePublished: fm.published,
    dateModified: fm.updated || fm.published,
    author: { '@type': 'Person', name: authorDisplay(fm.author) },
    publisher: { '@type': 'Organization', name: 'PVPWire' },
  };

  const Glyph = fm.author === 'flosium' ? FlosiumGlyph : fm.author === 'og' ? OgGlyph : FlipperGlyph;

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <header className="border-b border-ink/15">
        <div className="mx-auto max-w-col px-4 sm:px-6 py-12">
          <Link href="/legends/" className="font-mono text-[11px] uppercase tracking-widest text-accent hover:text-ink transition">
            &larr; Back to Legends
          </Link>
          <div className="font-mono text-[11px] uppercase tracking-widest text-accent mt-6 mb-3 flex items-center gap-2">
            <Glyph size={18} className="text-accent" />
            Legends / {authorDisplay(fm.author)}
          </div>
          <h1 className="masthead-title text-4xl sm:text-6xl text-ink text-balance">{fm.title}</h1>
          <p className="font-serif text-xl text-ink/80 mt-4 leading-relaxed">{fm.description}</p>
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted mt-6">
            {formatDate(fm.published)} / {minutes} min read
            {fm.era_active && ` / ${formatYearRange(fm.era_active)}`}
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-col px-4 sm:px-6 py-12 grid lg:grid-cols-[1fr,260px] gap-12">
        <div>
          <ArticleBody content={item.content} />
        </div>
        <aside className="border-t lg:border-t-0 lg:border-l border-ink/15 pt-8 lg:pt-0 lg:pl-8 self-start">
          {guild && (
            <div className="mb-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Profile</div>
              <Link href={`/guilds/${guild.frontmatter.slug}/`} className="font-serif text-lg text-accent hover:text-ink">
                {guild.frontmatter.name}
              </Link>
            </div>
          )}
          {fm.related_games && fm.related_games.length > 0 && (
            <div className="mb-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Games</div>
              <ul className="space-y-1">
                {fm.related_games.map((g) => {
                  const game = getGameBySlug(g);
                  return game ? (
                    <li key={g}>
                      <Link href={`/games/${g}/`} className="font-serif text-base text-accent hover:text-ink">
                        {game.frontmatter.name}
                      </Link>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
