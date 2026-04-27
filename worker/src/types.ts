// Shared types for the PVPWire Worker.

export interface Env {
  // Workers AI binding removed in v2 pivot Step 3 (Ask Flosium retired).
  NEWS_CACHE: KVNamespace;
  SUBMISSIONS: KVNamespace;
  // RATE_LIMIT KV remains in use by the X bot in worker/src/twitter.ts.
  RATE_LIMIT: KVNamespace;
  BOT_LOG: KVNamespace;
  SITE_URL: string;
  USER_AGENT: string;
  // Secrets injected via `wrangler secret put`:
  TURNSTILE_SECRET?: string;
  X_API_KEY?: string;
  X_API_SECRET?: string;
  X_ACCESS_TOKEN?: string;
  X_ACCESS_SECRET?: string;
  X_BEARER?: string;
  ADMIN_TOKEN?: string;
  // Section 22.4 Integration B: IGDB enrichment via Twitch developer creds.
  IGDB_CLIENT_ID?: string;
  IGDB_CLIENT_SECRET?: string;
  // Section 22.4 Integration C: PandaScore esports data.
  PANDASCORE_API_KEY?: string;
}

export interface AggregatedArticle {
  title: string;
  url: string;
  description: string;
  publishedAt: string;
  source: string;
  sourceDomain: string;
}

export interface NewsCachePayload {
  articles: AggregatedArticle[];
  fetchedAt: string;
  sources: string[];
  errors: { source: string; error: string }[];
}

export interface RSSSource {
  name: string;
  url: string;
  domain: string;
}

export interface SubmissionRecord {
  id: string;
  guild_name: string;
  aliases?: string;
  games?: string;
  era_start?: string;
  era_end?: string;
  submitter_handle?: string;
  submitter_email?: string;
  intent: 'new' | 'edit' | 'memory' | 'correction';
  body: string;
  sources?: string;
  submitted_at: string;
  ip_hash?: string;
  status: 'pending' | 'approved' | 'rejected';
  moderator_notes?: string;
}
