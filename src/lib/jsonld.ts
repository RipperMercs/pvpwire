// Hand-rolled JSON-LD builders. Avoids pulling schema-dts into the bundle for
// the static export. Each builder returns a plain object that callers
// JSON.stringify into a <script type="application/ld+json"> tag.
//
// Coverage matches SEO.md Section 4: Organization + WebSite at the site
// level; VideoGame / SportsOrganization / SportsEvent / NewsArticle / Article
// per page type; BreadcrumbList everywhere; CollectionPage on indexes.

import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from './seo';
import type {
  GameFrontmatter,
  GuildFrontmatter,
  ArchivedStoryFrontmatter,
  ArticleFrontmatter,
  TournamentFrontmatter,
  EsportsOrgFrontmatter,
} from './schemas';

const ORG_LOGO = `${SITE_URL}/og-default.png`;
const PUBLISHER = {
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: ORG_LOGO,
  },
};

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: ORG_LOGO,
    sameAs: [
      'https://twitter.com/PVPWire',
    ],
    foundingDate: '2026',
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  };
}

interface BreadcrumbStep {
  name: string;
  url: string;
}

export function breadcrumbSchema(steps: BreadcrumbStep[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: steps.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: s.name,
      item: s.url,
    })),
  };
}

export function collectionPageSchema(args: {
  name: string;
  description: string;
  url: string;
  itemUrls?: string[];
}) {
  const out: any = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: args.name,
    description: args.description,
    url: args.url,
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  };
  if (args.itemUrls && args.itemUrls.length > 0) {
    out.mainEntity = {
      '@type': 'ItemList',
      itemListElement: args.itemUrls.slice(0, 30).map((url, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url,
      })),
    };
  }
  return out;
}

export function videoGameSchema(game: GameFrontmatter, image?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.name,
    description: game.description_short,
    genre: game.category,
    gamePlatform: game.platforms,
    applicationCategory: 'Game',
    playMode: 'MultiPlayer',
    image: image ? `${SITE_URL}${image}` : `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    url: `${SITE_URL}/games/${game.slug}/`,
    publisher: { '@type': 'Organization', name: game.publisher },
    ...(game.developer ? { producer: { '@type': 'Organization', name: game.developer } } : {}),
    ...(game.release_year ? { datePublished: String(game.release_year) } : {}),
  };
}

export function sportsOrganizationSchema(org: EsportsOrgFrontmatter) {
  const logoUrl = org.logo ? `${SITE_URL}${org.logo}` : `${SITE_URL}${DEFAULT_OG_IMAGE}`;
  const primaryGameSlug = org.games?.[0]?.game_slug;
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: org.name,
    url: `${SITE_URL}/esports/orgs/${org.slug}/`,
    logo: logoUrl,
    foundingDate: String(org.founded),
    ...(org.country ? { location: { '@type': 'Place', name: org.country } } : {}),
    ...(primaryGameSlug ? { sport: primaryGameSlug.replace(/-/g, ' ') } : {}),
    ...(org.external_links && org.external_links.length > 0
      ? { sameAs: org.external_links.map((l) => l.url) }
      : {}),
  };
}

export function sportsEventSchema(t: TournamentFrontmatter) {
  const eventStatus = t.status === 'cancelled'
    ? 'https://schema.org/EventCancelled'
    : t.status === 'live'
      ? 'https://schema.org/EventScheduled'
      : t.status === 'completed'
        ? 'https://schema.org/EventScheduled'
        : 'https://schema.org/EventScheduled';
  const out: any = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: t.name,
    description: t.description_short,
    startDate: t.date_start,
    endDate: t.date_end,
    eventStatus,
    eventAttendanceMode: t.location && t.venue
      ? 'https://schema.org/OfflineEventAttendanceMode'
      : 'https://schema.org/MixedEventAttendanceMode',
    organizer: { '@type': 'Organization', name: t.organizer },
    url: `${SITE_URL}/esports/${t.slug}/`,
    image: t.hero_image ? `${SITE_URL}${t.hero_image}` : `${SITE_URL}${DEFAULT_OG_IMAGE}`,
  };
  if (t.location) {
    out.location = t.venue
      ? { '@type': 'Place', name: t.venue, address: t.location }
      : { '@type': 'Place', name: t.location };
  }
  if (t.participants && t.participants.length > 0) {
    out.competitor = t.participants.map((p) => ({
      '@type': 'SportsOrganization',
      name: p.org_slug.replace(/-/g, ' '),
      url: `${SITE_URL}/esports/orgs/${p.org_slug}/`,
    }));
  }
  if (t.prize_pool_usd) {
    out.offers = {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: String(t.prize_pool_usd),
    };
  }
  return out;
}

export function guildOrganizationSchema(g: GuildFrontmatter) {
  const out: any = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: g.name,
    url: `${SITE_URL}/guilds/${g.slug}/`,
    description: g.status_note || `${g.name}, PVPWire guild profile.`,
    foundingDate: String(g.era_active.start),
  };
  if (g.era_active.end !== 'active' && typeof g.era_active.end === 'number') {
    out.dissolutionDate = String(g.era_active.end);
  }
  if (g.sources && g.sources.length > 0) {
    out.sameAs = g.sources;
  }
  if (g.notable_members && g.notable_members.length > 0) {
    out.member = g.notable_members.slice(0, 10).map((m) => ({
      '@type': 'Person',
      name: m.handle,
    }));
  }
  return out;
}

export function newsArticleSchema(a: ArticleFrontmatter, authorName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: a.title,
    description: a.description,
    image: a.hero_image ? `${SITE_URL}${a.hero_image}` : `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    datePublished: a.published,
    dateModified: a.updated || a.published,
    author: { '@type': 'Person', name: authorName },
    publisher: PUBLISHER,
    mainEntityOfPage: `${SITE_URL}/news/${a.slug}/`,
    articleSection: a.category,
    ...(a.tags ? { keywords: a.tags.join(', ') } : {}),
  };
}

export function articleSchema(s: ArchivedStoryFrontmatter, authorName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: s.title,
    description: s.description,
    image: s.hero_image ? `${SITE_URL}${s.hero_image}` : `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    datePublished: s.published,
    dateModified: s.updated || s.published,
    author: { '@type': 'Person', name: authorName },
    publisher: PUBLISHER,
    mainEntityOfPage: `${SITE_URL}/archive/${s.slug}/`,
    articleSection: s.original_section,
  };
}

export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data);
}
