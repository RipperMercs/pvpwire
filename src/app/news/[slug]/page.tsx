import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getAllArticles,
  getArticleBySlug,
  getGameBySlug,
  getGuildBySlug,
} from '@/lib/content';
import { authorDisplay, formatDate, readingTime } from '@/lib/format';
import { ArticleBody } from '@/components/ArticleBody';

export async function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.frontmatter.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const item = getArticleBySlug(params.slug);
  if (!item) return { title: 'Not found' };
  const fm = item.frontmatter;
  return {
    title: fm.title,
    description: fm.description,
    openGraph: {
      title: fm.title,
      description: fm.description,
      type: 'article',
      publishedTime: fm.published,
      modifiedTime: fm.updated,
      authors: [authorDisplay(fm.author)],
    },
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const item = getArticleBySlug(params.slug);
  if (!item) notFound();
  const fm = item.frontmatter;
  const minutes = readingTime(item.content);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: fm.title,
    description: fm.description,
    datePublished: fm.published,
    dateModified: fm.updated || fm.published,
    author: { '@type': 'Person', name: authorDisplay(fm.author) },
    publisher: {
      '@type': 'Organization',
      name: 'PVPWire',
      url: 'https://pvpwire.com',
    },
    mainEntityOfPage: `https://pvpwire.com/news/${fm.slug}/`,
  };

  const relatedGames = (fm.related_games || []).map((s) => getGameBySlug(s)).filter(Boolean);
  const relatedGuilds = (fm.related_guilds || []).map((s) => getGuildBySlug(s)).filter(Boolean);

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <header className="border-b border-ink/15">
        <div className="mx-auto max-w-col px-4 sm:px-6 py-12">
          <Link href="/news/" className="font-mono text-[11px] uppercase tracking-widest text-accent hover:text-ink transition">
            &larr; Back to news
          </Link>
          <div className="font-mono text-[11px] uppercase tracking-widest text-accent mt-6 mb-3">
            {authorDisplay(fm.author)} / {fm.category}
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

        {(relatedGames.length > 0 || relatedGuilds.length > 0) && (
          <section className="mt-16 border-t border-ink/15 pt-8">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-4">Related</div>
            <div className="grid sm:grid-cols-2 gap-6">
              {relatedGames.length > 0 && (
                <div>
                  <div className="font-serif text-base text-ink/70 mb-2">Games</div>
                  <ul className="space-y-1">
                    {relatedGames.map((g) =>
                      g ? (
                        <li key={g.frontmatter.slug}>
                          <Link href={`/games/${g.frontmatter.slug}/`} className="font-serif text-base text-accent hover:text-ink">
                            {g.frontmatter.name}
                          </Link>
                        </li>
                      ) : null
                    )}
                  </ul>
                </div>
              )}
              {relatedGuilds.length > 0 && (
                <div>
                  <div className="font-serif text-base text-ink/70 mb-2">Guilds</div>
                  <ul className="space-y-1">
                    {relatedGuilds.map((g) =>
                      g ? (
                        <li key={g.frontmatter.slug}>
                          <Link href={`/guilds/${g.frontmatter.slug}/`} className="font-serif text-base text-accent hover:text-ink">
                            {g.frontmatter.name}
                          </Link>
                        </li>
                      ) : null
                    )}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
