import Link from 'next/link';
import { ArrowRightIcon } from '@/components/icons';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-col px-4 sm:px-6 py-24 text-center">
      <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-4">404</div>
      <h1 className="masthead-title text-6xl text-ink mb-6">Wrong field.</h1>
      <p className="font-serif text-xl text-ink/80 mb-8 max-w-2xl mx-auto leading-relaxed">
        The fence you are looking for is not in this field. The desk recommends starting with the games, the guilds tab, or the news feed.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-accent transition"
        >
          Home <ArrowRightIcon size={14} />
        </Link>
        <Link
          href="/games/"
          className="inline-flex items-center gap-2 border border-ink px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-ink hover:text-paper transition"
        >
          Games
        </Link>
        <Link
          href="/guilds/"
          className="inline-flex items-center gap-2 border border-ink px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-ink hover:text-paper transition"
        >
          Guilds
        </Link>
      </div>
    </div>
  );
}
