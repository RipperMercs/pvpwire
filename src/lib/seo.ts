// SEO helpers used by per-page generateMetadata functions.
// Patterns from SEO.md Section 3 (titles, descriptions, OG, canonical).

import type { Metadata } from 'next';

export const SITE_URL = 'https://pvpwire.com';
export const SITE_NAME = 'PVPWire';
export const DEFAULT_OG_IMAGE = '/og-default.svg';

export function canonical(path: string): string {
  // Trailing-slash convention to match the static export.
  if (path === '/') return SITE_URL + '/';
  const trimmed = path.startsWith('/') ? path : `/${path}`;
  return SITE_URL + (trimmed.endsWith('/') ? trimmed : trimmed + '/');
}

// Pick a per-entity OG image. Reuses existing assets so we don't have to
// composite new ones at v2.1: covers for games, logos for orgs, hero images
// for tournaments / news / archive when present, falling back to the site
// default for entities with no asset. v2.2 can add sharp-based composition
// for branded overlays.
export function ogImagePath(kind: string, slugOrPath?: string | null): string {
  if (!slugOrPath) return DEFAULT_OG_IMAGE;
  // If the caller passed a path that already starts with /, use it directly.
  if (slugOrPath.startsWith('/')) return slugOrPath;
  // Otherwise default to the canonical asset location for that kind.
  switch (kind) {
    case 'games':
      return `/images/games/${slugOrPath}/cover.jpg`;
    case 'esports-orgs':
      return `/images/orgs/${slugOrPath}.png`;
    case 'esports':
    case 'news':
    case 'archive':
    default:
      return DEFAULT_OG_IMAGE;
  }
}

interface BuildArgs {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile' | 'video.other';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  noindex?: boolean;
}

// Compose Metadata for a page. Inherits robots, twitter handle, and template
// title from layout.tsx defaults; only overrides what is page-specific.
export function buildMetadata(args: BuildArgs): Metadata {
  const url = canonical(args.path);
  const image = args.ogImage ?? DEFAULT_OG_IMAGE;
  const md: Metadata = {
    title: args.title,
    description: args.description,
    alternates: { canonical: url },
    openGraph: {
      title: args.title,
      description: args.description,
      url,
      siteName: SITE_NAME,
      type: args.ogType ?? 'website',
      images: [{ url: image, width: 1200, height: 630, alt: args.title }],
      ...(args.publishedTime ? { publishedTime: args.publishedTime } : {}),
      ...(args.modifiedTime ? { modifiedTime: args.modifiedTime } : {}),
      ...(args.authors ? { authors: args.authors } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: args.title,
      description: args.description,
      images: [image],
    },
  };
  if (args.noindex) {
    md.robots = { index: false, follow: false };
  }
  return md;
}

export function truncate(s: string, max = 158): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim() + '...';
}
