import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightIcon } from '@/components/icons';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Submit to PVPWire',
  description: 'Submit a guild, a game, or a news tip. Anonymous and moderated. Editorial reviews each submission before publication.',
  path: '/submit/',
});

export default function SubmitPage() {
  return (
    <article className="mx-auto max-w-col px-4 sm:px-6 py-16">
      <header className="border-b border-ink/15 pb-8 mb-10">
        <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-4">Submit</div>
        <h1 className="masthead-title text-5xl sm:text-6xl text-ink">Tell us what we missed.</h1>
        <p className="font-serif text-xl text-ink/80 mt-4 leading-relaxed">
          The guild database is community-fed. Submissions are reviewed before publication. Sources are encouraged but not required.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <SubmitCard
          title="Submit a guild"
          description="Add a new guild profile, edit an existing one, contribute a memory, or send a correction."
          href="/guilds/submit/"
          ctaLabel="Open the form"
        />
        <SubmitCard
          title="News tips"
          description="Story leads, scoops, and tournament news for the news desk."
          href="mailto:tips@pvpwire.com"
          external
          ctaLabel="Email tips"
        />
      </div>

      <section className="prose-editorial mt-16">
        <h2 className="masthead-title text-3xl text-ink">What we publish</h2>
        <p>
          Verified guild histories, cross-game lineage, server lore, and notable moments with sources. We give weight to firsthand accounts, archived forum posts, dev patch notes, and contemporary screenshots. We are forgiving on era memory and strict on attribution. If you say something happened in a specific patch, give us the patch.
        </p>
        <h2 className="masthead-title text-3xl text-ink">What we will not publish</h2>
        <p>
          Personal attacks. Doxxing. Unsourced score-settling. Guild beef written like a dunk. We are interested in what happened, not who you still want to win an argument against in 2026.
        </p>
      </section>
    </article>
  );
}

function SubmitCard({
  title,
  description,
  href,
  ctaLabel,
  external = false,
}: {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  external?: boolean;
}) {
  return (
    <div className="border border-ink/15 p-6 flex flex-col gap-4">
      <div>
        <h2 className="masthead-title text-2xl text-ink mb-2">{title}</h2>
        <p className="font-serif text-base text-ink/75">{description}</p>
      </div>
      {external ? (
        <a
          href={href}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent hover:text-ink transition self-start"
        >
          {ctaLabel} <ArrowRightIcon size={14} />
        </a>
      ) : (
        <Link
          href={href}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent hover:text-ink transition self-start"
        >
          {ctaLabel} <ArrowRightIcon size={14} />
        </Link>
      )}
    </div>
  );
}
