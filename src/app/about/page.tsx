import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'About PVPWire',
  description: 'PVPWire is the independent hub for competitive PvP and esports. Editorial standards, mission, and how to contribute.',
  path: '/about/',
});

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-col px-4 sm:px-6 py-16">
      <header className="border-b border-ink/15 pb-8 mb-10">
        <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-4">About</div>
        <h1 className="masthead-title text-5xl sm:text-6xl text-ink">PVPWire.</h1>
        <p className="font-serif text-xl text-ink/80 mt-4 leading-relaxed">
          The hub for competitive PvP and esports. From chess preparation to MMO sieges to modern esports finals.
        </p>
      </header>

      <section className="prose-editorial mb-12">
        <h2 className="masthead-title text-3xl text-ink">The mission</h2>
        <p>
          Every existing competitive gaming publication is either title-vertical (HLTV for CS, Liquipedia per game) or stuck on the current top four esports. Nobody covers the full breadth of PvP across genres with timely scene reporting.
        </p>
        <p>
          PVPWire fills that gap. The catalog spans MMO PvP, MOBAs, FPS, fighting games, chess and strategy, battle royale, extraction shooters, sandbox, racing, hero shooters, and more. The esports surface tracks the professional scene across those games: the orgs, the tournaments, the broadcasts. The archive preserves the guild history that the genre was built on.
        </p>
      </section>

      <section className="border-t border-ink/15 pt-10 mb-12 prose-editorial">
        <h2 className="masthead-title text-3xl text-ink">Editorial standards</h2>
        <p>
          PVPWire reports facts: what is releasing, what is patching, what is being played at tier-1, what tournaments are running, who is winning. When the desk takes a position, it is short and specific, never padded.
        </p>
        <p>
          We do not attack people. We attack decisions, designs, patches, and bad takes. We name names when crediting. We do not name names when criticizing. The line is sharp.
        </p>
        <p>
          New reporting publishes under PVPWire Editorial. Archive editorial preserves its original bylines (Flosium, Og, Flipper) for historical accuracy.
        </p>
        <p>
          The guild and esports databases are community-fed. Submissions go through editorial review before publication. We cite sources and timestamp everything we verify. If we get something wrong, we correct it visibly, with a note and a date.
        </p>
      </section>

      <section className="border-t border-ink/15 pt-10 mb-12 prose-editorial">
        <h2 className="masthead-title text-3xl text-ink">Contact</h2>
        <p>
          Tips, corrections, guild submissions: <Link href="/submit/">/submit</Link>.
        </p>
        <p>
          PVPWire is an independent publication.
        </p>
      </section>
    </article>
  );
}
