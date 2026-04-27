// PandaScore esports data integration (PIVOT.md Section 22.4 Integration C).
//
// Credentials:
//   PANDASCORE_API_KEY <- pandascore.co dashboard. Inject via `wrangler secret put`.
// If missing, the job no-ops cleanly.
//
// Endpoints used (free tier):
//   GET https://api.pandascore.co/teams/{id}          team profile + current_videogame
//   GET https://api.pandascore.co/teams/{id}/players  roster
//   GET https://api.pandascore.co/teams/{id}/matches  recent + upcoming matches
//   GET https://api.pandascore.co/tournaments/{id}    tournament metadata
//   GET https://api.pandascore.co/tournaments/{id}/matches  bracket
//
// Cron cadence: daily. Esports brackets and rosters move on a daily-or-slower
// cadence; live match scores are intentionally out of scope for v2.1.
//
// Storage: NEWS_CACHE under runtimeKeys.pandascoreTeam(orgSlug) and
// runtimeKeys.pandascoreTournament(tournamentSlug). The frontend hydrates via
// /api/org-runtime/{slug} and /api/tournament-runtime/{slug}.

import type { Env } from './types';
import { runtimeKeys } from './runtime-data-shim';

const PANDASCORE_BASE = 'https://api.pandascore.co';
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 3; // 3 days
const REQUEST_TIMEOUT_MS = 8000;

interface OrgRef {
  slug: string;
  name: string;
  pandascore_team_id: number;
}

interface TournamentRef {
  slug: string;
  name: string;
  pandascore_tournament_id: number;
}

interface PandascoreIndex {
  teams?: OrgRef[];
  tournaments?: TournamentRef[];
}

interface PandascoreTeam {
  id: number;
  name?: string;
  acronym?: string;
  image_url?: string;
  current_videogame?: { id: number; name: string; slug: string };
  players?: { id: number; name?: string; first_name?: string; last_name?: string; role?: string; image_url?: string }[];
}

interface PandascoreMatch {
  id: number;
  name?: string;
  status?: string;
  begin_at?: string;
  end_at?: string;
  league?: { id: number; name: string };
  serie?: { id: number; name: string };
  tournament?: { id: number; name: string };
  opponents?: { opponent: { id: number; name: string; acronym?: string } }[];
  results?: { team_id: number; score: number }[];
  winner_id?: number;
}

interface PandascoreTournament {
  id: number;
  name?: string;
  begin_at?: string;
  end_at?: string;
  league?: { id: number; name: string };
  serie?: { id: number; name: string };
  prizepool?: string;
  tier?: string;
  videogame?: { id: number; name: string; slug: string };
}

export interface OrgRuntimeData {
  org_slug: string;
  pandascore_team_id: number;
  team?: PandascoreTeam;
  upcoming_matches?: PandascoreMatch[];
  recent_matches?: PandascoreMatch[];
  fetched_at: string;
  source: 'pandascore';
  attribution_required: true;
}

export interface TournamentRuntimeData {
  tournament_slug: string;
  pandascore_tournament_id: number;
  tournament?: PandascoreTournament;
  matches?: PandascoreMatch[];
  fetched_at: string;
  source: 'pandascore';
  attribution_required: true;
}

function hasKey(env: Env): boolean {
  return Boolean(env.PANDASCORE_API_KEY);
}

async function fetchIndex(env: Env): Promise<PandascoreIndex> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${env.SITE_URL}/pandascore-ids.json`, {
      headers: { 'User-Agent': env.USER_AGENT },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`pandascore-ids.json HTTP ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function ps<T>(env: Env, path: string): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${PANDASCORE_BASE}${path}`, {
      headers: {
        Authorization: `Bearer ${env.PANDASCORE_API_KEY}`,
        Accept: 'application/json',
        'User-Agent': env.USER_AGENT,
      },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`pandascore ${path} HTTP ${res.status}`);
    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}

async function refreshOneTeam(env: Env, ref: OrgRef, fetched_at: string): Promise<void> {
  const team = await ps<PandascoreTeam>(env, `/teams/${ref.pandascore_team_id}`);
  let upcoming: PandascoreMatch[] = [];
  let recent: PandascoreMatch[] = [];
  try {
    upcoming = await ps<PandascoreMatch[]>(env, `/teams/${ref.pandascore_team_id}/matches?filter[status]=not_started&page[size]=10&sort=begin_at`);
  } catch {
    /* swallow per-call so the team record still saves */
  }
  try {
    recent = await ps<PandascoreMatch[]>(env, `/teams/${ref.pandascore_team_id}/matches?filter[status]=finished&page[size]=10&sort=-end_at`);
  } catch {
    /* swallow */
  }
  const record: OrgRuntimeData = {
    org_slug: ref.slug,
    pandascore_team_id: ref.pandascore_team_id,
    team,
    upcoming_matches: upcoming,
    recent_matches: recent,
    fetched_at,
    source: 'pandascore',
    attribution_required: true,
  };
  await env.NEWS_CACHE.put(
    runtimeKeys.pandascoreTeam(ref.slug),
    JSON.stringify(record),
    { expirationTtl: CACHE_TTL_SECONDS }
  );
}

async function refreshOneTournament(env: Env, ref: TournamentRef, fetched_at: string): Promise<void> {
  const tournament = await ps<PandascoreTournament>(env, `/tournaments/${ref.pandascore_tournament_id}`);
  let matches: PandascoreMatch[] = [];
  try {
    matches = await ps<PandascoreMatch[]>(env, `/tournaments/${ref.pandascore_tournament_id}/matches?page[size]=50&sort=begin_at`);
  } catch {
    /* swallow */
  }
  const record: TournamentRuntimeData = {
    tournament_slug: ref.slug,
    pandascore_tournament_id: ref.pandascore_tournament_id,
    tournament,
    matches,
    fetched_at,
    source: 'pandascore',
    attribution_required: true,
  };
  await env.NEWS_CACHE.put(
    runtimeKeys.pandascoreTournament(ref.slug),
    JSON.stringify(record),
    { expirationTtl: CACHE_TTL_SECONDS }
  );
}

export interface PandascoreRefreshResult {
  teams_attempted: number;
  teams_updated: number;
  tournaments_attempted: number;
  tournaments_updated: number;
  errors: { kind: 'team' | 'tournament' | 'index'; slug?: string; error: string }[];
  fetched_at: string;
  skipped_reason?: string;
}

export async function refreshPandascore(env: Env): Promise<PandascoreRefreshResult> {
  const fetched_at = new Date().toISOString();
  const empty: PandascoreRefreshResult = {
    teams_attempted: 0, teams_updated: 0,
    tournaments_attempted: 0, tournaments_updated: 0,
    errors: [], fetched_at,
  };

  if (!hasKey(env)) return { ...empty, skipped_reason: 'missing_credentials' };

  let index: PandascoreIndex;
  try {
    index = await fetchIndex(env);
  } catch (e) {
    return { ...empty, errors: [{ kind: 'index', error: String(e) }] };
  }

  const teams = (index.teams ?? []).filter((t) => typeof t.pandascore_team_id === 'number');
  const tournaments = (index.tournaments ?? []).filter((t) => typeof t.pandascore_tournament_id === 'number');

  const errors: PandascoreRefreshResult['errors'] = [];
  let teamsUpdated = 0;
  let tournamentsUpdated = 0;

  // Sequential to stay under PandaScore's free-tier rate limit (~1 req/sec).
  for (const t of teams) {
    try {
      await refreshOneTeam(env, t, fetched_at);
      teamsUpdated++;
    } catch (e) {
      errors.push({ kind: 'team', slug: t.slug, error: String(e) });
    }
  }
  for (const t of tournaments) {
    try {
      await refreshOneTournament(env, t, fetched_at);
      tournamentsUpdated++;
    } catch (e) {
      errors.push({ kind: 'tournament', slug: t.slug, error: String(e) });
    }
  }

  return {
    teams_attempted: teams.length,
    teams_updated: teamsUpdated,
    tournaments_attempted: tournaments.length,
    tournaments_updated: tournamentsUpdated,
    errors,
    fetched_at,
  };
}

export async function getOrgRuntime(env: Env, orgSlug: string): Promise<OrgRuntimeData | null> {
  const cached = await env.NEWS_CACHE.get(runtimeKeys.pandascoreTeam(orgSlug), 'json');
  return (cached as OrgRuntimeData) ?? null;
}

export async function getTournamentRuntime(env: Env, tournamentSlug: string): Promise<TournamentRuntimeData | null> {
  const cached = await env.NEWS_CACHE.get(runtimeKeys.pandascoreTournament(tournamentSlug), 'json');
  return (cached as TournamentRuntimeData) ?? null;
}
