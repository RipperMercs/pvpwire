import Link from 'next/link';

// Sister sites strip. Cross-links to the small constellation PVPWire ships
// alongside. Keep the list short and on-theme; PhreakFM is intentionally
// excluded until it is more finished.
const SISTER_SITES = [
  { href: 'https://terminalfeed.io', label: 'Terminalfeed.io', tagline: 'Real-time data dashboard' },
  { href: 'https://tensorfeed.ai', label: 'Tensorfeed.ai', tagline: 'AI news aggregator' },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ink/15 surface text-ink">
      <div className="mx-auto max-w-page px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="masthead-title text-3xl text-ink mb-2">PVPWire</div>
            <p className="font-serif text-sm text-ink/70 leading-relaxed">
              The hub for competitive PvP and esports. Current games, current scenes.
            </p>
          </div>
          <FooterCol title="Site" links={[
            { href: '/about', label: 'About' },
            { href: '/submit', label: 'Submit' },
          ]}/>
          <FooterCol title="Feeds" links={[
            { href: '/rss.xml', label: 'RSS' },
            { href: '/llms.txt', label: 'llms.txt' },
            { href: 'https://twitter.com/PVPWire', label: 'Contact', external: true },
          ]}/>
        </div>

        <div className="rule-thin" />

        {/* Sister sites strip */}
        <div className="pt-6 pb-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">Sister sites</div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {SISTER_SITES.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-sm font-semibold text-ink hover:text-accent transition"
                >
                  {s.label}
                  <span className="ml-2 font-serif font-normal text-xs text-muted">{s.tagline}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="rule-thin" />

        <div className="pt-6 flex flex-col md:flex-row justify-between gap-3 font-mono text-[11px] uppercase tracking-widest text-muted">
          <div>A Ripper project</div>
          <div>(c) {new Date().getFullYear()} PVPWire</div>
        </div>
        <p className="pt-4 font-serif text-[11px] text-muted/80 leading-relaxed max-w-3xl">
          Game titles, esports organization names, team logos, and tournament marks are trademarks and properties of their respective owners. Used here for editorial identification.
        </p>
        <p className="pt-2 font-serif text-[11px] text-muted/80 leading-relaxed max-w-3xl">
          Live data via <a href="https://store.steampowered.com/" target="_blank" rel="noopener noreferrer" className="hover:text-accent underline underline-offset-2">Steam</a>,{' '}
          <a href="https://www.igdb.com/" target="_blank" rel="noopener noreferrer" className="hover:text-accent underline underline-offset-2">IGDB</a>,{' '}
          <a href="https://pandascore.co/" target="_blank" rel="noopener noreferrer" className="hover:text-accent underline underline-offset-2">PandaScore</a>, and{' '}
          <a href="https://liquipedia.net/" target="_blank" rel="noopener noreferrer" className="hover:text-accent underline underline-offset-2">Liquipedia</a> (CC-BY-SA).
        </p>
      </div>
    </footer>
  );
}

type FooterLink = { href: string; label: string; external?: boolean };

function FooterCol({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">{title}</div>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            {l.external ? (
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-serif text-sm text-ink/85 hover:text-accent transition"
              >
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className="font-serif text-sm text-ink/85 hover:text-accent transition">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
