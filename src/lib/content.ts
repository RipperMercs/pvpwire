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

// Guilds
export function getAllGuilds(): ContentItem<GuildFrontmatter>[] {
  return loadAll<GuildFrontmatter>('guilds').sort((a, b) =>
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

// Legends
export function getAllLegends(): ContentItem<LegendFrontmatter>[] {
  return loadAll<LegendFrontmatter>('legends').sort(
    (a, b) => new Date(b.frontmatter.published).getTime() - new Date(a.frontmatter.published).getTime()
  );
}
export function getLegendBySlug(slug: string): ContentItem<LegendFrontmatter> | undefined {
  return bySlug(getAllLegends(), slug);
}

// Heritage
export function getAllHeritage(): ContentItem<HeritageFrontmatter>[] {
  return loadAll<HeritageFrontmatter>('heritage').sort(
    (a, b) => new Date(b.frontmatter.published).getTime() - new Date(a.frontmatter.published).getTime()
  );
}
export function getHeritageBySlug(slug: string): ContentItem<HeritageFrontmatter> | undefined {
  return bySlug(getAllHeritage(), slug);
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
