// Authoritative content schemas for PVPWire v1.
// Every MDX file in /content must match one of these shapes.
// Validation runs at build time via gray-matter parse.

export type GameCategory =
  | 'MMO PvP'
  | 'MOBA'
  | 'FPS / Tactical Shooter'
  | 'Battle Royale'
  | 'Extraction Shooter'
  | 'Fighting Game'
  | 'Strategy / Chess / Card'
  | 'Arena / Class-based PvP'
  | 'Sandbox / Open World PvP'
  | 'Racing'
  | 'Hero Shooter'
  | 'Movement Shooter (Quake-lineage)'
  | 'Auto-battler / Tactics';

export const GAME_CATEGORIES: GameCategory[] = [
  'MMO PvP',
  'MOBA',
  'FPS / Tactical Shooter',
  'Battle Royale',
  'Extraction Shooter',
  'Fighting Game',
  'Strategy / Chess / Card',
  'Arena / Class-based PvP',
  'Sandbox / Open World PvP',
  'Racing',
  'Hero Shooter',
  'Movement Shooter (Quake-lineage)',
  'Auto-battler / Tactics',
];

export type GameStatus = 'active' | 'sunset' | 'classic' | 'upcoming';
export type ProSceneStatus = 'active' | 'dormant' | 'emerging' | 'none';

export interface GameFrontmatter {
  slug: string;
  name: string;
  aliases?: string[];
  category: GameCategory;
  sub_categories?: string[];
  release_year: number;
  developer: string;
  publisher: string;
  status: GameStatus;
  platforms: string[];
  pvp_modes: string[];
  has_pro_scene: boolean;
  pro_scene_status: ProSceneStatus;
  ranking_systems?: string[];
  // Vertical poster image (preferred 600x900 or 2:3). Used in card grids.
  cover_image?: string;
  // Object-fit override for cover_image when its aspect does not match 2:3.
  // Defaults to 'cover'. Use 'contain' for square or wide source art so the
  // whole image stays visible (the surface background fills the letterbox).
  cover_fit?: 'cover' | 'contain';
  // Optional object-position override (e.g. 'center top'). Only used with 'cover'.
  cover_position?: string;
  // Wide hero image (16:9). Used at the top of the game detail page.
  hero_image?: string;
  // Gameplay screenshots gallery. Strings are paths under /public/images/games/{slug}/.
  gameplay_images?: { src: string; caption?: string; credit?: string }[];
  description_short: string;
  related_guilds?: string[];
  related_articles?: string[];
  related_legends?: string[];
  external_links?: { name: string; url: string }[];
  last_updated?: string;
}

export type GuildEra = 'og' | 'classic' | 'modern' | 'active';
// "retired" means the guild stopped operating as an organization but the core
// roster remains active in adjacent communities (the band broke up, the players
// still play). Distinct from "dissolved" (scattered) and "dormant" (paused).
export type GuildStatus = 'active' | 'dormant' | 'dissolved' | 'reformed' | 'retired';

export interface GuildFrontmatter {
  slug: string;
  name: string;
  aliases?: string[];
  era: GuildEra;
  era_active: { start: number; end: number | 'active' };
  games: {
    game_slug: string;
    server?: string;
    realm?: string;
    role?: string;
  }[];
  notable_members?: { handle: string; role: string; notes?: string }[];
  allegiance_structure?: string;
  notable_moments?: {
    date: string;
    title: string;
    description: string;
    sources?: string[];
  }[];
  status: GuildStatus;
  status_note?: string;
  predecessor_guilds?: string[];
  successor_guilds?: string[];
  splinter_guilds?: string[];
  related_articles?: string[];
  related_legends?: string[];
  hero_image?: string;
  sources?: string[];
  last_verified?: string;
  verified_by?: string;
}

// New content uses 'editorial' (default house byline) or 'ripper' (founder notes).
// 'flosium', 'og', and 'flipper' remain valid for grandfathered legacy content
// (the 12 archived stories, the existing news articles, and any Flosium vs the
// World pieces) but are not used for new content per the v2 pivot.
export type Author = 'editorial' | 'ripper' | LegacyAuthor;
export type ArticleCategory = 'analysis' | 'feature' | 'news' | 'column' | 'review';

export interface ArticleFrontmatter {
  slug: string;
  title: string;
  author: Author;
  category: ArticleCategory;
  tags?: string[];
  related_games?: string[];
  related_guilds?: string[];
  hero_image?: string;
  published: string;
  updated?: string;
  description: string;
}

export interface LegendFrontmatter {
  slug: string;
  title: string;
  guild_slug?: string;
  era: GuildEra;
  era_active?: { start: number; end: number | 'active' };
  author: Author;
  related_games?: string[];
  related_guilds?: string[];
  related_articles?: string[];
  hero_image?: string;
  published: string;
  updated?: string;
  description: string;
}

export interface HeritageFrontmatter {
  slug: string;
  title: string;
  author: Author;
  related_games?: string[];
  related_guilds?: string[];
  hero_image?: string;
  published: string;
  updated?: string;
  description: string;
  series?: string;
}

// Replaces LegendFrontmatter and HeritageFrontmatter post-pivot. The 12 legacy
// pieces were flattened into /content/archive/ in Step 2 with original_section
// added to track provenance. New content does not use this schema; it exists
// only to render the archived stories.
export type ArchivedStoryOrigin = 'legends' | 'heritage';
export type LegacyAuthor = 'flosium' | 'og' | 'flipper';

export interface ArchivedStoryFrontmatter {
  slug: string;
  title: string;
  original_section: ArchivedStoryOrigin;
  guild_slug?: string;
  era?: GuildEra;
  era_active?: { start: number; end: number | 'active' };
  author: LegacyAuthor;
  related_games?: string[];
  related_guilds?: string[];
  hero_image?: string;
  published: string;
  updated?: string;
  description: string;
  series?: string;
}

// ----- Esports (v2 pivot Step 5) -----

export type EsportsStatus = 'upcoming' | 'live' | 'completed' | 'cancelled';
export type TournamentTier = 'major' | 'tier1' | 'tier2' | 'regional';
export type EsportsFormat =
  | 'single-elimination'
  | 'double-elimination'
  | 'round-robin'
  | 'swiss'
  | 'league'
  | 'gauntlet'
  | 'other';

export type EsportsRegion = 'international' | 'na' | 'eu' | 'apac' | 'latam' | 'mena' | 'kr' | 'cn' | 'jp' | 'sea' | 'oce';

export interface TournamentFrontmatter {
  slug: string;
  name: string;
  aliases?: string[];
  game_slug: string;                       // primary game; must match catalog slug
  secondary_games?: string[];               // for cross-game events (EVO, EWC)
  organizer: string;
  tier: TournamentTier;
  format?: EsportsFormat;
  prize_pool_usd?: number;
  date_start: string;                       // ISO
  date_end: string;                         // ISO
  region?: EsportsRegion | string;
  location?: string;
  venue?: string;
  status: EsportsStatus;
  participants?: { org_slug: string; seed?: number }[];
  results?: { org_slug: string; placement: number; prize_usd?: number }[];
  broadcast_links?: { name: string; url: string }[];
  bracket_url?: string;
  results_url?: string;
  hero_image?: string;
  external_links?: { name: string; url: string }[];
  description_short: string;
  description_long?: string;
}

export type EsportsOrgStatus = 'active' | 'inactive' | 'dissolved';

export interface EsportsOrgFrontmatter {
  slug: string;
  name: string;
  aliases?: string[];
  founded: number;
  country?: string;
  hq_city?: string;
  status: EsportsOrgStatus;
  games: {
    game_slug: string;                     // catalog slug
    status: 'active' | 'inactive';
    notable_titles?: string[];
  }[];
  notable_titles?: string[];                // org-level major wins
  notable_moments?: {
    date: string;
    title: string;
    description: string;
    sources?: string[];
  }[];
  roster_highlights?: { handle: string; game_slug: string; role: string; notes?: string }[];
  hero_image?: string;
  logo?: string;
  external_links?: { name: string; url: string }[];
  description_short: string;
  description_long?: string;
}

export interface ContentItem<T> {
  frontmatter: T;
  content: string;
  filePath: string;
}
