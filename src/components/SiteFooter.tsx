import Link from 'next/link';

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
            { href: '/archive', label: 'Archive' },
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
        <div className="pt-6 flex flex-col md:flex-row justify-between gap-3 font-mono text-[11px] uppercase tracking-widest text-muted">
          <div>A Ripper project</div>
          <div>(c) {new Date().getFullYear()} PVPWire</div>
        </div>
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
