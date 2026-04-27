import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightIcon } from '@/components/icons';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Tools for Competitive Gamers',
  description: 'Free browser-based tools for competitive PvP players. Network diagnostics, ping tests, and more, built for gamers.',
  path: '/tools/',
});

// Each tool card. The wifi tool lives as standalone HTML in /public/wifi/
// which Cloudflare Pages serves at /wifi/ in production. We link to
// /wifi/index.html explicitly so the link also works in `next dev` (where
// /wifi/ alone 404s because Next's router does not know about static
// /public/* directories without an index.html resolution step).
//
// Future tools register here. Internal Next routes use `href` directly;
// standalone HTML or external tools set `external: true`.
interface Tool {
  slug: string;
  title: string;
  href: string;
  external?: boolean;
  status: 'live' | 'soon';
  description: string;
  bullets: string[];
}

const TOOLS: Tool[] = [
  {
    slug: 'wifi',
    title: 'Gaming Network Test',
    href: '/wifi/index.html',
    external: true,
    status: 'live',
    description: 'Ping, jitter, packet loss, DNS speed, and a gaming score, all in your browser. No app, no signup, no tracking.',
    bullets: [
      'Ping and jitter measured against multiple endpoints',
      'Download and upload via Cloudflare speed test',
      'DNS resolution timing across Steam, Discord, Cloudflare, Google',
      'Editorial diagnostics for high ping, packet loss, WiFi extender bottlenecks',
    ],
  },
];

export default function ToolsPage() {
  const live = TOOLS.filter((t) => t.status === 'live');
  const soon = TOOLS.filter((t) => t.status === 'soon');

  return (
    <article>
      <header className="border-b border-ink/15">
        <div className="mx-auto max-w-page px-4 sm:px-6 py-10 sm:py-14">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent mb-3">
            Tools
          </div>
          <h1 className="masthead-title text-4xl sm:text-5xl lg:text-6xl text-ink text-balance max-w-3xl">
            Free tools for competitive gamers.
          </h1>
          <p className="font-serif text-lg text-ink/80 max-w-3xl mt-4 leading-relaxed">
            Browser-based utilities for the PvP scene. Network diagnostics today; more coming as we ship them.
          </p>
        </div>
      </header>

      <section>
        <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {live.map((tool) => (
              <li key={tool.slug}>
                <ToolCardLink tool={tool} />
              </li>
            ))}
            {soon.map((tool) => (
              <li key={tool.slug} className="surface border border-ink/15 p-5 opacity-70">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Coming soon</div>
                <div className="font-display text-xl font-bold text-ink leading-tight">{tool.title}</div>
                <p className="font-serif text-sm text-ink/75 mt-2 leading-snug">{tool.description}</p>
              </li>
            ))}
          </ul>

          {soon.length === 0 && (
            <p className="mt-8 font-serif text-sm text-muted italic">
              More tools shipping soon. Have an idea? <Link href="/submit/" className="text-accent hover:text-ink underline underline-offset-2">Send it in.</Link>
            </p>
          )}
        </div>
      </section>
    </article>
  );
}

function ToolCardLink({ tool }: { tool: Tool }) {
  const inner = (
    <div className="surface border border-ink/15 hover:border-accent transition p-5 h-full flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="badge badge-active text-[10px]">Live</span>
        <ArrowRightIcon size={14} className="text-muted group-hover:text-accent transition" />
      </div>
      <div className="font-display text-xl font-bold text-ink group-hover:text-accent transition leading-tight">
        {tool.title}
      </div>
      <p className="font-serif text-sm text-ink/75 mt-2 leading-snug">{tool.description}</p>
      <ul className="mt-3 space-y-1 font-serif text-[13px] text-ink/70 leading-snug">
        {tool.bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="text-accent shrink-0">/</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return tool.external ? (
    <a href={tool.href} className="group block h-full">
      {inner}
    </a>
  ) : (
    <Link href={tool.href} className="group block h-full">
      {inner}
    </Link>
  );
}
