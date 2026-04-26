import type { Metadata, Viewport } from 'next';
import { Inter, Source_Serif_4, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://pvpwire.com'),
  title: {
    default: 'PVPWire',
    template: '%s | PVPWire',
  },
  description:
    'The competitive gaming reference. Catalog of every PvP game, guild lineage database, and editorial covering chess to MMO PvP to modern esports.',
  keywords: [
    'PvP',
    'esports',
    'competitive gaming',
    'MMO PvP',
    'guild history',
    'Asherons Call',
    'Dark Age of Camelot',
    'Darkfall',
    'EVE Online',
    'extraction shooter',
    'fighting games',
    'chess',
    'Marathon',
    'ARC Raiders',
  ],
  authors: [{ name: 'Pizza Robot Studios' }],
  creator: 'Pizza Robot Studios',
  publisher: 'Pizza Robot Studios',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pvpwire.com',
    siteName: 'PVPWire',
    title: 'PVPWire',
    description:
      'The competitive gaming reference. Games, guilds, and editorial.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@PVPWire',
    creator: '@PVPWire',
    title: 'PVPWire',
    description: 'The competitive gaming reference.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://pvpwire.com',
    types: {
      'application/rss+xml': [
        { url: '/rss.xml', title: 'PVPWire (full feed)' },
        { url: '/rss/news.xml', title: 'PVPWire News' },
        { url: '/rss/legends.xml', title: 'PVPWire Legends' },
        { url: '/rss/heritage.xml', title: 'PVPWire Heritage' },
      ],
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0c' },
    { media: '(prefers-color-scheme: light)', color: '#fafaf8' },
  ],
  width: 'device-width',
  initialScale: 1,
};

const themeInitScript = `
(function(){
  try {
    var stored = localStorage.getItem('pvpwire-theme');
    var theme = stored === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={`${inter.variable} ${sourceSerif.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-ink focus:text-paper focus:px-3 focus:py-2"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
