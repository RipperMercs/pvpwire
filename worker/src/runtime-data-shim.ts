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
};
