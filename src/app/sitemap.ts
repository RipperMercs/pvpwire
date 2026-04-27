import type { MetadataRoute } from 'next';
import {
  getAllGames,
  getAllGuilds,
  getAllArticles,
  getAllArchivedStories,
  getAllEsportsOrgs,
  getAllTournaments,
} from '@/lib/content';

const BASE = 'https://pvpwire.com';

function asDate(input: string | undefined, fallback: Date): Date {
  if (!input) return fallback;
  const d = new Date(input);
  return isNaN(d.getTime()) ? fallback : d;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const games = getAllGames();
  const guilds = getAllGuilds();
  const articles = getAllArticles();
  const archived = getAllArchivedStories();
  const orgs = getAllEsportsOrgs();
  const tournaments = getAllTournaments();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/live/`, lastModified: now, changeFrequency: 'always', priority: 0.95 },
    { url: `${BASE}/tools/`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/wifi/`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE}/games/`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/esports/`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/esports/calendar/`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${BASE}/esports/orgs/`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE}/news/`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/archive/`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/guilds/`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/about/`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/submit/`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/games/submit/`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/guilds/submit/`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];

  // Game profiles: trending get priority 0.9, others 0.7. Sunset/dormant 0.5.
  const gameUrls = games.map((g) => {
    const fm = g.frontmatter;
    const trending = fm.trending === true;
    const sunset = fm.status === 'sunset' || fm.activity_tier === 'dormant';
    const priority = trending ? 0.9 : sunset ? 0.5 : 0.7;
    return {
      url: `${BASE}/games/${fm.slug}/`,
      lastModified: asDate(fm.last_updated, now),
      changeFrequency: 'weekly' as const,
      priority,
    };
  });

  // Tournaments: live and upcoming high, completed lower, cancelled lowest.
  const tournamentUrls = tournaments.map((t) => {
    const fm = t.frontmatter;
    let priority = 0.5;
    if (fm.status === 'live') priority = 0.9;
    else if (fm.status === 'upcoming') priority = 0.85;
    else if (fm.status === 'cancelled') priority = 0.4;
    const isLive = fm.status === 'live' || fm.status === 'upcoming';
    return {
      url: `${BASE}/esports/${fm.slug}/`,
      lastModified: now,
      changeFrequency: isLive ? ('daily' as const) : ('monthly' as const),
      priority,
    };
  });

  const orgUrls = orgs.map((o) => ({
    url: `${BASE}/esports/orgs/${o.frontmatter.slug}/`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: o.frontmatter.status === 'active' ? 0.75 : 0.55,
  }));

  const guildUrls = guilds.map((g) => ({
    url: `${BASE}/guilds/${g.frontmatter.slug}/`,
    lastModified: asDate(g.frontmatter.last_verified, now),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // News: descend by date. Most recent 0.85, older drops gradually.
  const sortedArticles = [...articles].sort(
    (a, b) => new Date(b.frontmatter.published).getTime() - new Date(a.frontmatter.published).getTime()
  );
  const articleUrls = sortedArticles.map((a, i) => {
    const ageBucket = Math.min(Math.floor(i / 5), 5);
    const priority = Math.max(0.5, 0.85 - ageBucket * 0.07);
    return {
      url: `${BASE}/news/${a.frontmatter.slug}/`,
      lastModified: asDate(a.frontmatter.updated || a.frontmatter.published, now),
      changeFrequency: 'monthly' as const,
      priority,
    };
  });

  const archiveUrls = archived.map((s) => ({
    url: `${BASE}/archive/${s.frontmatter.slug}/`,
    lastModified: asDate(s.frontmatter.updated || s.frontmatter.published, now),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...gameUrls,
    ...tournamentUrls,
    ...orgUrls,
    ...guildUrls,
    ...articleUrls,
    ...archiveUrls,
  ];
}
