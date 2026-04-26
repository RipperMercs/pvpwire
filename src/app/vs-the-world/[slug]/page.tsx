import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { authorDisplay, formatDate, readingTime } from '@/lib/format';
import { ArticleBody } from '@/components/ArticleBody';
import { FlosiumGlyph } from '@/components/icons';

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
    });
}

function getBySlug(slug: string): VsItem | undefined {
  return getAllVsTheWorld().find((i) => i.slug === slug);
}

export async function generateStaticParams() {
  return getAllVsTheWorld().map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const item = getBySlug(params.slug);
  if (!item) return { title: 'Not found' };
  return {
    title: item.title,
    description: item.description,
    openGraph: { title: item.title, description: item.description, type: 'article' },
  };
}

export default function VsTheWorldEntry({ params }: { params: { slug: string } }) {
  const item = getBySlug(params.slug);
  if (!item) notFound();
  const minutes = readingTime(item.content);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: item.title,
    description: item.description,
    datePublished: item.published,
    author: { '@type': 'Person', name: authorDisplay(item.author) },
    publisher: { '@type': 'Organization', name: 'PVPWire' },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <header className="border-b border-ink/15">
        <div className="mx-auto max-w-col px-4 sm:px-6 py-12">
          <Link href="/vs-the-world/" className="font-mono text-[11px] uppercase tracking-widest text-accent hover:text-ink transition">
            &larr; Back to vs the World
          </Link>
          <div className="font-mono text-[11px] uppercase tracking-widest text-accent mt-6 mb-3 flex items-center gap-2">
            <FlosiumGlyph size={18} className="text-accent" />
            Flosium vs the World / {authorDisplay(item.author)}
          </div>
          <h1 className="masthead-title text-4xl sm:text-6xl text-ink text-balance">{item.title}</h1>
          <p className="font-serif text-xl text-ink/80 mt-4 leading-relaxed">{item.description}</p>
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted mt-6">
            {formatDate(item.published)} / {minutes} min read
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-col px-4 sm:px-6 py-12">
        <ArticleBody content={item.content} />
      </div>
    </article>
  );
}
