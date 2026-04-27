// Runtime data shapes for v2.1 external data integrations (PIVOT.md Section 22.4).
//
// These records are fetched live by the Worker (cron jobs) and stored in KV
// under stable keys (e.g. NEWS_CACHE -> "steam:players:{slug}"). They are NOT
// authored as MDX frontmatter, because they change on a schedule independent
// of editorial work and would otherwise force a content rebuild every cycle.
//
// Game profile pages render these at request time via /api/game-runtime/{slug}.

export interface GameRuntimeData {
  game_slug: string;
  current_player_count?: number;
  player_count_fetched_at?: string;       // ISO timestamp of the Steam fetch
  is_live_on_twitch?: boolean;
  twitch_viewer_count?: number;
}

export interface ExternalDataSource {
  source: 'steam' | 'igdb' | 'pandascore' | 'twitch';
  fetched_at: string;                     // ISO timestamp
  attribution_required: boolean;          // drives DataAttribution component
}

// KV key conventions. Centralized so Worker writers and frontend readers stay
// in sync. Always use these helpers, never inline string templates.
export const runtimeKeys = {
  steamPlayers: (gameSlug: string) => `steam:players:${gameSlug}`,
  twitchLive: (gameSlug: string) => `twitch:live:${gameSlug}`,
  igdbGame: (gameSlug: string) => `igdb:game:${gameSlug}`,
  pandascoreTeam: (orgSlug: string) => `pandascore:team:${orgSlug}`,
  pandascoreTournament: (tournamentSlug: string) => `pandascore:tournament:${tournamentSlug}`,
};
