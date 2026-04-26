'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { MenuIcon, CloseIcon } from '@/components/icons';
import { ThemeToggle } from '@/components/ThemeToggle';

// v2 pivot: four-tab primary nav. Archive, About, Submit live in the footer.
const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/games', label: 'Games' },
  { href: '/esports', label: 'Esports' },
  { href: '/news', label: 'News' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <header className="border-b border-ink/15 bg-paper sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <div className="mx-auto max-w-page px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="wordmark text-xl sm:text-2xl text-ink group-hover:text-accent transition">
              PVPWire
            </span>
            {/* Logo slot reserved for future sword / brand mark next to the wordmark. */}
          </Link>

          <nav className="hidden lg:flex items-center gap-7" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link"
                aria-current={isActive(link.href) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 -mr-2"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="lg:hidden border-t border-ink/15 py-4 flex flex-col gap-3" aria-label="Primary mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link text-base py-1"
                aria-current={isActive(link.href) ? 'page' : undefined}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
      <div className="rule-thin" />
    </header>
  );
}
