import type { Metadata } from 'next';
import { getAllArticles } from '@/lib/content';
import { NewsBrowser } from '@/components/NewsBrowser';

export const metadata: Metadata = {
  title: 'News',
  description:
    'Original analysis from Flosium and Og, plus an aggregated cross-genre competitive gaming feed pulling from twenty editorial sources.',
};

export default function NewsPage() {
  const originals = getAllArticles().map((a) => ({
    ...a.frontmatter,
    excerpt: a.frontmatter.description,
  }));

  return (
    <article>
      <header className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-12 sm:py-16">
          <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-4">News</div>
          <h1 className="masthead-title text-5xl sm:text-6xl text-ink">The desk.</h1>
          <p className="font-serif text-xl text-ink/80 max-w-3xl mt-4 leading-relaxed">
            Original analysis under the masthead, plus an aggregated feed from the editorial sources we trust. Filter by author, source, or category.
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-page px-4 sm:px-6 py-10">
        <NewsBrowser originals={originals} />
      </div>
    </article>
  );
}
