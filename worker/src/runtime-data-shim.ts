// Worker-local mirror of src/lib/runtime-data.ts.
// Kept in lockstep so the Worker writers and frontend readers agree on KV keys
// and payload shapes without sharing a tsconfig.

export interface GameRuntimeData {
  game_slug: string;
  current_player_count?: number;
  player_count_fetched_at?: string;
  is_live_on_twitch?: boolean;
  twitch_viewer_count?: number;
}

export interface ExternalDataSource {
  source: 'steam' | 'igdb' | 'pandascore' | 'twitch';
  fetched_at: string;
  attribution_required: boolean;
}

export const runtimeKeys = {
  steamPlayers: (gameSlug: string) => `steam:players:${gameSlug}`,
  twitchLive: (gameSlug: string) => `twitch:live:${gameSlug}`,
  igdbGame: (gameSlug: string) => `igdb:game:${gameSlug}`,
  pandascoreTeam: (orgSlug: string) => `pandascore:team:${orgSlug}`,
  pandascoreTournament: (tournamentSlug: string) => `pandascore:tournament:${tournamentSlug}`,
  trendingNow: () => 'trending:now',
  liveSnapshot: () => 'live:snapshot:current',
  liveHealth: () => 'live:health',
};

// ---- Live snapshot ("Is it alive?" page, /live) ----
//
// One combined snapshot per cron cycle (every 5 minutes) so the /live page
// can render the whole catalog from a single KV read. Per-game records under
// `steam:players:{slug}` continue to exist for game profile pages; this is
// purely the table-view payload.

export interface LiveSnapshotEntry {
  slug: string;
  name: string;
  category: string;
  // Editorial scene context, denormalized so the table renders without a
  // catalog lookup on the client.
  scene_status?: 'hot' | 'steady' | 'declining' | 'dormant';
  activity_tier?: 'live' | 'casual' | 'fading' | 'dormant' | 'upcoming';
  // Steam concurrent players (where steam_app_id is set on the game).
  steam_players?: number;
  steam_fetched_at?: string;
  // Twitch concurrent viewers across the top 100 streams (where the game
  // appears in the trending aggregate).
  twitch_viewers?: number;
  twitch_fetched_at?: string;
  // Source flags for the UI badge column.
  has_steam: boolean;
  has_twitch: boolean;
}

export interface LiveSnapshot {
  entries: LiveSnapshotEntry[];
  fetched_at: string;            // when the cron cycle that produced this finished
  steam_attempted: number;
  steam_succeeded: number;
  twitch_used: boolean;
}

export interface LiveHealth {
  last_successful_run: string;   // ISO timestamp; the freshness banner reads this
  last_error?: string;
  consecutive_failures: number;
}

export interface TrendingEntry {
  game_slug: string;
  game_name: string;
  twitch_viewer_count?: number;
  steam_player_count?: number;
  signal: 'twitch' | 'steam' | 'manual';
  rank: number;
}

export interface TrendingPayload {
  items: TrendingEntry[];
  fetched_at: string;
  source: 'twitch' | 'steam' | 'mixed';
  attribution: ('twitch' | 'steam')[];
}
