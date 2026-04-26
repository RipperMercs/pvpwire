import type { Metadata } from 'next';
import { AskFlosiumChat } from '@/components/AskFlosiumChat';
import { FlosiumGlyph } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Ask Flosium',
  description:
    'Live AI chat with Flosium. Drop a question about competitive scenes, meta cycles, or what to play next. Critical by default. Praise when earned.',
};

const STARTER_QUESTIONS = [
  'What MMO PvP should I try in 2026?',
  'Why does small unit always beat zerg?',
  'What did Darkfall get right that modern games miss?',
  'Is Throne and Liberty worth committing to?',
  'How should I read the current extraction shooter wave?',
];

export default function AskFlosiumPage() {
  return (
    <article>
      <header className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
          <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-4 flex items-center gap-2">
            <FlosiumGlyph size={20} className="text-accent" />
            Ask Flosium
          </div>
          <h1 className="masthead-title text-5xl sm:text-6xl text-ink">Ask the desk.</h1>
          <p className="font-serif text-xl text-ink/80 max-w-3xl mt-4 leading-relaxed">
            Live AI in Flosium voice. Drop a question. The response will be brief, critical by default, and unhedged when something is genuinely good.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-page px-4 sm:px-6 py-8">
        <AskFlosiumChat starterQuestions={STARTER_QUESTIONS} />
      </div>

      <section className="mx-auto max-w-col px-4 sm:px-6 py-12 prose-editorial">
        <h2 className="masthead-title text-2xl text-ink">A note on this feature</h2>
        <p>
          The model is constrained by a locked system prompt that defines voice rules, forbidden language, and the tone the desk runs. The voice is a tool, not a person. Treat the answers as a starting point, not as the last word.
        </p>
        <p>
          Rate limited to ten questions per visitor per hour. Conversations are not saved beyond the current browser session.
        </p>
      </section>
    </article>
  );
}
