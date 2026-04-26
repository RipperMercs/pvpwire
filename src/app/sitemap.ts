import type { MetadataRoute } from 'next';
import {
  getAllSlugs,
  getAllArchivedStories,
  getAllEsportsOrgs,
  getAllTournaments,
} from '@/lib/content';

const BASE = 'https://pvpwire.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getAllSlugs();
  const archivedStories = getAllArchivedStories();
  const esportsOrgs = getAllEsportsOrgs();
  const tournaments = getAllTournaments();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/games/`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/esports/`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/esports/calendar/`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${BASE}/esports/orgs/`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE}/news/`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/archive/`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/guilds/`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/about/`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/submit/`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/guilds/submit/`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];

  const games = slugs.games.map((s) => ({
    url: `${BASE}/games/${s}/`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  const guilds = slugs.guilds.map((s) => ({
    url: `${BASE}/guilds/${s}/`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));
  const articles = slugs.articles.map((s) => ({
    url: `${BASE}/news/${s}/`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
  const archive = archivedStories.map((s) => ({
    url: `${BASE}/archive/${s.frontmatter.slug}/`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));
  const orgs = esportsOrgs.map((o) => ({
    url: `${BASE}/esports/orgs/${o.frontmatter.slug}/`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));
  const tourneys = tournaments.map((t) => ({
    url: `${BASE}/esports/${t.frontmatter.slug}/`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...games, ...guilds, ...articles, ...archive, ...orgs, ...tourneys];
}
