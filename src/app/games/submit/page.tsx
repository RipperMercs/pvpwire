import type { Metadata } from 'next';
import { GameSubmitForm } from '@/components/GameSubmitForm';

export const metadata: Metadata = {
  title: 'Submit a game',
  description: 'Suggest a competitive PvP game we should add to the catalog. Anonymous and reviewed.',
};

export default function GameSubmitPage() {
  return (
    <article className="mx-auto max-w-col px-4 sm:px-6 py-12">
      <header className="border-b border-ink/15 pb-8 mb-10">
        <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-4">Submit a game</div>
        <h1 className="masthead-title text-5xl text-ink">Add to the catalog.</h1>
        <p className="font-serif text-xl text-ink/80 mt-4 leading-relaxed">
          See a notable PvP game missing from the index? Tell the desk. Submissions are anonymous unless you sign them. Editorial reviews each one before publication.
        </p>
      </header>
      <GameSubmitForm />

      <section className="prose-editorial mt-16 border-t border-ink/15 pt-8">
        <h2 className="masthead-title text-2xl text-ink">What we are looking for</h2>
        <p>
          Games with a recognizable PvP loop. Active titles, sunset titles that defined a format, classic titles that influenced the genre, upcoming titles with a real PvP design pitch. The bar is "the PvP is part of why this game matters," not "this game has a PvP mode somewhere."
        </p>
        <h2 className="masthead-title text-2xl text-ink">What helps your submission land</h2>
        <p>
          Specifics. Modes, format, scene size if you know it, the patches that mattered, the tournaments that ran. If a game is dead, name what killed it. If a scene is small but loud, say so. If you played it yourself, say that too.
        </p>
        <h2 className="masthead-title text-2xl text-ink">What we will not publish</h2>
        <p>
          Pure single-player games (no PvP loop). Games already in the catalog. Marketing copy. Hype without substance.
        </p>
      </section>
    </article>
  );
}
