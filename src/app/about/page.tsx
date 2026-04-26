import type { Metadata } from 'next';
import Link from 'next/link';
import { FlosiumGlyph, OgGlyph, FlipperGlyph } from '@/components/icons';

export const metadata: Metadata = {
  title: 'About',
  description:
    'PVPWire is an editorial hub for competitive gaming. A Flipper project. Masthead: Flosium, Og, Flipper.',
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-col px-4 sm:px-6 py-16">
      <header className="border-b border-ink/15 pb-8 mb-10">
        <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-4">About</div>
        <h1 className="masthead-title text-5xl sm:text-6xl text-ink">PVPWire.</h1>
        <p className="font-serif text-xl text-ink/80 mt-4 leading-relaxed">
          The editorial hub and database for competitive gaming. From chess preparation to MMO sieges to modern esports finals.
        </p>
      </header>

      <section className="prose-editorial mb-12">
        <h2 className="masthead-title text-3xl text-ink">The mission</h2>
        <p>
          Every existing competitive gaming publication is either title-vertical (HLTV for CS, Liquipedia per game) or stuck on the current top four esports. Nobody covers the full breadth of PvP across genres and eras with editorial polish.
        </p>
        <p>
          PVPWire fills that gap. The catalog spans MMO PvP, MOBAs, FPS, fighting games, chess and strategy, battle royale, extraction shooters, sandbox, racing, hero shooters, and more. The guilds tab is the canonical, cross-game, lineage-aware database of every notable PvP guild across MMO history and modern competitive gaming. The Legends tier is the prestige column. Heritage is the slow weekly cadence on what came before, and what the new wave still has to learn.
        </p>
      </section>

      <section className="border-t border-ink/15 pt-10 mb-12">
        <h2 className="masthead-title text-3xl text-ink mb-8">The masthead</h2>

        <MastheadEntry
          glyph={<FlosiumGlyph size={36} />}
          name="Flosium"
          role="Lead Editor"
          bio="Flosium is a retired guild leader and analyst, veteran of Darktide, Merlin, and Darkfall. Now a writer."
        />

        <MastheadEntry
          glyph={<OgGlyph size={36} />}
          name="Og"
          role="The Witness"
          bio="Og has been around longer than most guilds. Writes about what he saw."
        />

        <MastheadEntry
          glyph={<FlipperGlyph size={36} />}
          name="Flipper"
          role="Founder"
          bio="Flipper is the founder of PVPWire."
        />
      </section>

      <section className="border-t border-ink/15 pt-10 mb-12 prose-editorial">
        <h2 className="masthead-title text-3xl text-ink">Editorial standards</h2>
        <p>
          PVPWire writes opinions. Flosium is critical by default. Og notices things. Neither is in the business of pretending balance for its own sake, and neither hides behind hedges. When something is good, we say so plainly, in short sentences, without padding. When something is bad, we say so with specifics.
        </p>
        <p>
          We do not attack people. We attack decisions, designs, patches, and bad takes. We name names when crediting. We do not name names when criticizing. The line is sharp.
        </p>
        <p>
          The guild database is community-fed. Submissions go through editorial review before publication. We cite sources and timestamp everything we verify. If we get something wrong, we correct it visibly, with a note and a date.
        </p>
      </section>

      <section className="border-t border-ink/15 pt-10 mb-12 prose-editorial">
        <h2 className="masthead-title text-3xl text-ink">Contact</h2>
        <p>
          Tips, corrections, guild submissions: <Link href="/submit/">/submit</Link>.
        </p>
        <p>
          PVPWire is an independent project by Flipper.
        </p>
      </section>
    </article>
  );
}

function MastheadEntry({
  glyph,
  name,
  role,
  bio,
}: {
  glyph: React.ReactNode;
  name: string;
  role: string;
  bio: string;
}) {
  return (
    <div className="flex gap-6 mb-10 pb-10 border-b border-ink/10 last:border-0 last:pb-0">
      <div className="text-accent shrink-0 mt-1">{glyph}</div>
      <div>
        <div className="font-mono text-[11px] uppercase tracking-widest text-accent">{role}</div>
        <h3 className="masthead-title text-3xl text-ink mt-1 mb-3">{name}</h3>
        <p className="font-serif text-lg text-ink/85 leading-relaxed">{bio}</p>
      </div>
    </div>
  );
}
