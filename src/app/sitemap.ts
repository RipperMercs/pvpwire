import type { MetadataRoute } from 'next';
import { getAllSlugs } from '@/lib/content';

const BASE = 'https://pvpwire.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getAllSlugs();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/games/`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/news/`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/guilds/`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/legends/`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/heritage/`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/ask-flosium/`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
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
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  const articles = slugs.articles.map((s) => ({
    url: `${BASE}/news/${s}/`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
  const legends = slugs.legends.map((s) => ({
    url: `${BASE}/legends/${s}/`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));
  const heritage = slugs.heritage.map((s) => ({
    url: `${BASE}/heritage/${s}/`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...games, ...guilds, ...articles, ...legends, ...heritage];
}
