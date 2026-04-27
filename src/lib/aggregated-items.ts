// Aggregated news item shapes (PIVOT.md Section 22.3, v2.1).
// The /api/news Worker endpoint returns a mixed feed of editorial RSS,
// Reddit subreddit posts, and Steam developer announcements. Each family
// shares a base shape and adds family-specific fields via the discriminator.

export type AggregatedItemSource = 'editorial' | 'reddit' | 'steam';

export interface BaseAggregatedItem {
  source_type: AggregatedItemSource;
  title: string;
  url: string;            // canonical permalink
  description?: string;   // first paragraph or RSS summary; empty for compact Reddit cards
  posted_at: string;      // ISO timestamp
  hash: string;           // dedup key, family-scoped
}

export interface EditorialAggregatedItem extends BaseAggregatedItem {
  source_type: 'editorial';
  source_name: string;     // 'Dexerto', 'HLTV', etc.
  source_domain: string;   // hltv.org
}

export interface RedditAggregatedItem extends BaseAggregatedItem {
  source_type: 'reddit';
  subreddit: string;       // 'MMORPG' (no leading r/)
  author: string;          // u/foo
  score: number;           // upvotes minus downvotes
  flair?: string;
  is_nsfw: boolean;
}

export interface SteamAggregatedItem extends BaseAggregatedItem {
  source_type: 'steam';
  game_slug: string;       // catalog slug for cross-link to /games/[slug]
  game_name: string;       // friendly game name for the badge
  steam_app_id: number;
  feed_label: string;      // typically 'Community Announcements' or 'Patch Notes'
}

export type AggregatedItem =
  | EditorialAggregatedItem
  | RedditAggregatedItem
  | SteamAggregatedItem;
