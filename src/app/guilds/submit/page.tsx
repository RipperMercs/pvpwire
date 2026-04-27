import type { Metadata } from 'next';
import { GuildSubmitForm } from '@/components/GuildSubmitForm';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Submit a Guild',
  description: 'Add a new guild profile, edit an existing one, contribute a memory, or send a correction. Anonymous and reviewed.',
  path: '/guilds/submit/',
});

export default function GuildSubmitPage() {
  return (
    <article className="mx-auto max-w-col px-4 sm:px-6 py-12">
      <header className="border-b border-ink/15 pb-8 mb-10">
        <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-4">Submit a guild</div>
        <h1 className="masthead-title text-5xl text-ink">Add to the database.</h1>
        <p className="font-serif text-xl text-ink/80 mt-4 leading-relaxed">
          Submissions are anonymous unless you sign them. Editorial reviews each submission before publication. Sources help; firsthand accounts help more.
        </p>
      </header>
      <GuildSubmitForm />

      <section className="prose-editorial mt-16 border-t border-ink/15 pt-8">
        <h2 className="masthead-title text-2xl text-ink">What we ask for</h2>
        <p>
          Names, eras, servers, the games the guild moved through. If you remember a specific patch, give us the patch. If you remember a specific year, give us the year. If you only remember the season ("late summer of the Darktide year"), say so. The editorial side will match it against other accounts.
        </p>
        <h2 className="masthead-title text-2xl text-ink">What we will not publish</h2>
        <p>
          Personal attacks. Doxxing. Old grudges that read like a dunk. Speculation about people's real names or addresses. Gossip presented as history.
        </p>
      </section>
    </article>
  );
}
