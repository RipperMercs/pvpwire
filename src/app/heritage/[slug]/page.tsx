import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getAllHeritage,
  getHeritageBySlug,
  getGameBySlug,
  getGuildBySlug,
} from '@/lib/content';
import { authorDisplay, formatDate, readingTime } from '@/lib/format';
import { ArticleBody } from '@/components/ArticleBody';
import { FlosiumGlyph, OgGlyph, FlipperGlyph } from '@/components/icons';

export async function generateStaticParams() {
  return getAllHeritage().map((h) => ({ slug: h.frontmatter.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const item = getHeritageBySlug(params.slug);
  if (!item) return { title: 'Not found' };
  const fm = item.frontmatter;
  return {
    title: fm.title,
    description: fm.description,
    openGraph: { title: fm.title, description: fm.description, type: 'article' },
  };
}

export default function HeritagePage({ params }: { params: { slug: string } }) {
  const item = getHeritageBySlug(params.slug);
  if (!item) notFound();
  const fm = item.frontmatter;
  const minutes = readingTime(item.content);
  const Glyph = fm.author === 'flosium' ? FlosiumGlyph : fm.author === 'og' ? OgGlyph : FlipperGlyph;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: fm.title,
    description: fm.description,
    datePublished: fm.published,
    author: { '@type': 'Person', name: authorDisplay(fm.author) },
    publisher: { '@type': 'Organization', name: 'PVPWire' },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <header className="border-b border-ink/15">
        <div className="mx-auto max-w-col px-4 sm:px-6 py-12">
          <Link href="/heritage/" className="font-mono text-[11px] uppercase tracking-widest text-accent hover:text-ink transition">
            &larr; Back to Heritage
          </Link>
          <div className="font-mono text-[11px] uppercase tracking-widest text-accent mt-6 mb-3 flex items-center gap-2">
            <Glyph size={18} className="text-accent" />
            From the Old World / {authorDisplay(fm.author)}
          </div>
          <h1 className="masthead-title text-4xl sm:text-6xl text-ink text-balance">{fm.title}</h1>
          <p className="font-serif text-xl text-ink/80 mt-4 leading-relaxed">{fm.description}</p>
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted mt-6">
            {formatDate(fm.published)} / {minutes} min read
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-col px-4 sm:px-6 py-12">
        <ArticleBody content={item.content} />

        {((fm.related_games?.length || 0) + (fm.related_guilds?.length || 0)) > 0 && (
          <section className="mt-16 border-t border-ink/15 pt-8 grid sm:grid-cols-2 gap-6">
            {fm.related_games && fm.related_games.length > 0 && (
              <div>
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
            {fm.related_guilds && fm.related_guilds.length > 0 && (
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Guilds</div>
                <ul className="space-y-1">
                  {fm.related_guilds.map((g) => {
                    const guild = getGuildBySlug(g);
                    return guild ? (
                      <li key={g}>
                        <Link href={`/guilds/${g}/`} className="font-serif text-base text-accent hover:text-ink">
                          {guild.frontmatter.name}
                        </Link>
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
            )}
          </section>
        )}
      </div>
    </article>
  );
}
