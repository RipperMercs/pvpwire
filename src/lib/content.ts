// Build-time content loader.
// Reads MDX from /content/{kind}/, parses frontmatter with gray-matter,
// and exposes typed accessors for pages and Worker scripts.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import type {
  GameFrontmatter,
  GuildFrontmatter,
  ArticleFrontmatter,
  LegendFrontmatter,
  HeritageFrontmatter,
  ArchivedStoryFrontmatter,
  TournamentFrontmatter,
  EsportsOrgFrontmatter,
  ContentItem,
} from './schemas';

const CONTENT_ROOT = join(process.cwd(), 'content');

function readDir(kind: string): string[] {
  const dir = join(CONTENT_ROOT, kind);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((f) => join(dir, f));
}

function loadOne<T>(filePath: string): ContentItem<T> {
  const raw = readFileSync(filePath, 'utf8');
  const parsed = matter(raw);
  return {
    frontmatter: parsed.data as T,
    content: parsed.content,
    filePath,
  };
}

function loadAll<T>(kind: string): ContentItem<T>[] {
  return readDir(kind).map((p) => loadOne<T>(p));
}

function bySlug<T extends { frontmatter: { slug: string } }>(items: T[], slug: string): T | undefined {
  return items.find((i) => i.frontmatter.slug === slug);
}

// Catalog (games)
export function getAllGames(): ContentItem<GameFrontmatter>[] {
  return loadAll<GameFrontmatter>('catalog').sort((a, b) =>
    a.frontmatter.name.localeCompare(b.frontmatter.name)
  );
}
export function getGameBySlug(slug: string): ContentItem<GameFrontmatter> | undefined {
  return bySlug(getAllGames(), slug);
}

// Guilds (now sourced from /content/archive/guilds/ per v2 pivot Step 2).
// /guilds/[slug] route still resolves; only the on-disk location moved.
export function getAllGuilds(): ContentItem<GuildFrontmatter>[] {
  return loadAll<GuildFrontmatter>('archive/guilds').sort((a, b) =>
    a.frontmatter.name.localeCompare(b.frontmatter.name)
  );
}
export function getGuildBySlug(slug: string): ContentItem<GuildFrontmatter> | undefined {
  return bySlug(getAllGuilds(), slug);
}

// News (original articles)
export function getAllArticles(): ContentItem<ArticleFrontmatter>[] {
  return loadAll<ArticleFrontmatter>('news').sort(
    (a, b) => new Date(b.frontmatter.published).getTime() - new Date(a.frontmatter.published).getTime()
  );
}
export function getArticleBySlug(slug: string): ContentItem<ArticleFrontmatter> | undefined {
  return bySlug(getAllArticles(), slug);
}

// Archived stories (formerly Legends and Heritage). Flattened into
// /content/archive/{slug}.mdx in Step 2 with original_section provenance.
export function getAllArchivedStories(): ContentItem<ArchivedStoryFrontmatter>[] {
  return loadAll<ArchivedStoryFrontmatter>('archive').sort(
    (a, b) => new Date(b.frontmatter.published).getTime() - new Date(a.frontmatter.published).getTime()
  );
}
export function getArchivedStoryBySlug(slug: string): ContentItem<ArchivedStoryFrontmatter> | undefined {
  return bySlug(getAllArchivedStories(), slug);
}

// Legacy legend / heritage helpers, kept as no-ops so pre-Step-9 callers
// (game/guild related-content sections, sitemap, RSS, search-index scripts)
// continue to compile and render. Step 9 removes the call sites entirely.
export function getAllLegends(): ContentItem<LegendFrontmatter>[] {
  return [];
}
export function getLegendBySlug(_slug: string): ContentItem<LegendFrontmatter> | undefined {
  return undefined;
}
export function getAllHeritage(): ContentItem<HeritageFrontmatter>[] {
  return [];
}
export function getHeritageBySlug(_slug: string): ContentItem<HeritageFrontmatter> | undefined {
  return undefined;
}

// Esports organizations (v2 pivot Step 5).
export function getAllEsportsOrgs(): ContentItem<EsportsOrgFrontmatter>[] {
  return loadAll<EsportsOrgFrontmatter>('esports-orgs').sort((a, b) =>
    a.frontmatter.name.localeCompare(b.frontmatter.name)
  );
}
export function getEsportsOrgBySlug(slug: string): ContentItem<EsportsOrgFrontmatter> | undefined {
  return bySlug(getAllEsportsOrgs(), slug);
}

// Tournaments (v2 pivot Step 5).
export function getAllTournaments(): ContentItem<TournamentFrontmatter>[] {
  return loadAll<TournamentFrontmatter>('tournaments').sort(
    (a, b) => new Date(a.frontmatter.date_start).getTime() - new Date(b.frontmatter.date_start).getTime()
  );
}
export function getTournamentBySlug(slug: string): ContentItem<TournamentFrontmatter> | undefined {
  return bySlug(getAllTournaments(), slug);
}
export function getTournamentsForGame(gameSlug: string): ContentItem<TournamentFrontmatter>[] {
  return getAllTournaments().filter(
    (t) => t.frontmatter.game_slug === gameSlug || t.frontmatter.secondary_games?.includes(gameSlug)
  );
}
export function getTournamentsForOrg(orgSlug: string): ContentItem<TournamentFrontmatter>[] {
  return getAllTournaments().filter((t) =>
    t.frontmatter.participants?.some((p) => p.org_slug === orgSlug) ||
    t.frontmatter.results?.some((r) => r.org_slug === orgSlug)
  );
}

// Active esports orgs that field a roster in the given game. Used on game
// detail pages to replace the v1 "Guilds in this game" section with the v2
// "Orgs in this game" surface per founder direction 2026-04-26.
export function getEsportsOrgsForGame(gameSlug: string): ContentItem<EsportsOrgFrontmatter>[] {
  return getAllEsportsOrgs().filter((o) =>
    o.frontmatter.status === 'active' &&
    o.frontmatter.games?.some((g) => g.game_slug === gameSlug && g.status === 'active')
  );
}

// Cross-link helpers
export function getRelatedGuildsForGame(gameSlug: string): ContentItem<GuildFrontmatter>[] {
  return getAllGuilds().filter((g) =>
    g.frontmatter.games?.some((entry) => entry.game_slug === gameSlug)
  );
}

export function getRelatedArticlesForGame(gameSlug: string): ContentItem<ArticleFrontmatter>[] {
  return getAllArticles().filter((a) => a.frontmatter.related_games?.includes(gameSlug));
}

export function getRelatedLegendsForGame(gameSlug: string): ContentItem<LegendFrontmatter>[] {
  return getAllLegends().filter((l) => l.frontmatter.related_games?.includes(gameSlug));
}

export function getRelatedArticlesForGuild(guildSlug: string): ContentItem<ArticleFrontmatter>[] {
  return getAllArticles().filter((a) => a.frontmatter.related_guilds?.includes(guildSlug));
}

export function getRelatedLegendsForGuild(guildSlug: string): ContentItem<LegendFrontmatter>[] {
  return getAllLegends().filter((l) =>
    l.frontmatter.related_guilds?.includes(guildSlug) || l.frontmatter.guild_slug === guildSlug
  );
}

// Used by sitemap and llms.txt generators.
export function getAllSlugs(): {
  games: string[];
  guilds: string[];
  articles: string[];
  legends: string[];
  heritage: string[];
} {
  return {
    games: getAllGames().map((g) => g.frontmatter.slug),
    guilds: getAllGuilds().map((g) => g.frontmatter.slug),
    articles: getAllArticles().map((a) => a.frontmatter.slug),
    legends: getAllLegends().map((l) => l.frontmatter.slug),
    heritage: getAllHeritage().map((h) => h.frontmatter.slug),
  };
}
