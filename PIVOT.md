# PVPWire Pivot Spec v2.0 (Hard Pivot)

Status: Active. Supersedes SPEC.md and the previous PIVOT.md draft (v2.0 soft pivot, 2026-04-26 a.m.).

Owner: Pizza Robot Studios LLC. Founder: Ripper.

This document is the single source of truth for any decision made from 2026-04-26 forward. CLAUDE.md should be updated to point here. CC reads this before SPEC.md until SPEC.md is rewritten or replaced. Once the pivot ships, this content rolls forward into a new SPEC.md and the old SPEC.md moves to `docs/SPEC-v1.0.md` for archive.

The earlier soft-pivot draft kept Ask Flosium in the primary nav and preserved Legends and Heritage as paused-but-living routes, with persona writing reallocated 70/25/5 across Flipper, Flosium, and Og. That direction is rejected. The hard pivot below removes all writers from the site, retires every persona, drops Ask Flosium entirely, and consolidates legacy content into a single Archive surface.

## 1. Why this hard pivot exists

The v1.0 build leaned on guild lineage, Heritage columns, Legends deep dives, and an Ask Flosium chat as primary surfaces. The result reads as an editorial archive with a games catalog stapled on. That is the wrong shape. PVPWire is a hub for what is competitive in PvP right now, with depth available for those who want it.

The thesis change:

- Primary user is someone deciding what PvP game to play this week, what tournament to watch this weekend, what scene is hot, what just patched.
- Secondary user is someone curious about a guild, a scene's history, a legendary battle. That audience is served at one click below the surface, not on the front door.
- The site stops generating new editorial in voice-driven personas. Article writing pauses indefinitely. When article writing returns, it returns under a clean editorial byline, not personas.

## 2. North-star outcomes

A first-time visitor on the home page sees within five seconds:

1. The PvP games that are currently most contested, with scene status visible.
2. The esports broadcasts that are live or imminent.
3. The most recent news from the cross-genre aggregator.

Old guild content, old editorial, and any historical material remain reachable in two clicks via the Archive surface.

## 3. Final navigation

Top nav, four tabs:

`Home | Games | Esports | News`

Footer:

Column A: Archive, About, Submit
Column B: RSS, llms.txt, Contact

Removed from top nav permanently: Heritage, Legends, Ask Flosium, Guilds. The first three are deleted (Section 4). Guilds becomes a sub-surface of Archive (Section 6 and Section 15).

## 4. What gets removed (hard removal)

Routes and pages deleted:
- `/heritage` and `/heritage/[slug]`
- `/legends` and `/legends/[slug]`
- `/ask-flosium`
- The Heritage strip on the home page
- The Legends column on the home page
- The Field Notes column on the home page
- The Ask Flosium teaser block on the home page

Worker endpoints deleted:
- `POST /api/ask-flosium`
- The locked Flosium system prompt module
- The Workers AI Llama 3.1 binding
- The KV rate limiter scoped to Ask Flosium
- The em-dash output sanitizer that ran on AI responses

Components deleted:
- The Flosium chat UI
- The Heritage hub page component
- The Legends hub page component
- Any persona glyph imports on the home page (`FlosiumGlyph`, `OgGlyph`)

Schemas deprecated and replaced (Section 9):
- `LegendFrontmatter`
- `HeritageFrontmatter`

RSS feeds deleted:
- `/rss/legends.xml`
- `/rss/heritage.xml`

X bot post types deleted:
- "New Legends profile" auto-post
- "New Heritage column" auto-post
- "Flosium quote" manual post

The castle background on the home page is removed (Section 16).

## 5. What gets moved

The 8 existing Legends profiles and 4 existing Heritage columns move from `/content/legends/` and `/content/heritage/` into `/content/archive/stories/`. They keep their original bylines (Flosium, Og) for archive integrity. They render at `/archive/[slug]`. The Legends and Heritage hub pages do not survive; only the individual pieces remain accessible via the Archive surface.

The 38 guild profiles move from `/content/guilds/` to `/content/archive/guilds/`. The route `/guilds` and `/guilds/[slug]` continue to function as canonical URLs for SEO and bookmark stability via redirect from `/archive/guilds/[slug]` (or vice versa, see Section 10). The OG Guilds Infograph stays as the centerpiece of the guild surface, now accessible from `/archive`. Lineage trees stay on individual guild profiles. The submission pipeline at `/guilds/submit` stays functional.

The 4 modern competitive guild profiles (Fnatic, SK Telecom T1, Sentinels, Team 3D) migrate from `/content/archive/guilds/` to `/content/esports-orgs/` with a schema swap (Section 9). They are esports organizations, not historical guilds, and belong on the live `/esports` surface.

## 6. What gets added

`/esports` section. The major scope addition.

Routes:
- `/esports` index. Three lanes: Live and starting soon, This week, By game.
- `/esports/calendar`. Full filterable tournament calendar.
- `/esports/orgs`. Index of esports organizations.
- `/esports/orgs/[slug]`. Individual org profile.
- `/esports/[slug]`. Individual tournament or major series profile.

`/archive` section. The new catch-all surface for guild data, legacy editorial, and any historical content.

Routes:
- `/archive` hub. Lists Guilds (with link to OG Guilds Infograph), Stories (legacy editorial), and any future archived content categories.
- `/archive/[slug]`. Individual legacy story page (formerly Legends or Heritage).

The home page is rebuilt (Section 12). The catalog page is reordered (Section 13). The news feed mechanism is unchanged (Section 14).

A new background asset replaces the castle on the home page (Section 16): a generic esports arena image, dark and modern, evoking competitive stadium environments. Placeholder at v2.0, commissioned at v2.1.

## 7. Personas retired (with Ripper carve-out)

All persona-driven content lanes are retired. The site no longer has writers as a structural element of the brand.

Specifically:

- **Flosium**: retired entirely. No new content under this byline. Voice bible archived to `/docs/voice-archive.md` for IP preservation. Ask Flosium chat removed.
- **Og**: retired entirely. No new content under this byline. Voice bible archived alongside Flosium.
- **Flipper**: retired as a byline name. Replaced by **Ripper** (Section 7.1).

The 12 legacy editorial pieces moving to `/archive` keep their original bylines for historical accuracy. Future content does not use Flosium, Og, or Flipper.

### 7.1 Ripper byline

The founder byline changes from "Flipper" to "Ripper." This is a label rename, not a re-introduction of persona writing. Ripper is the founder's actual handle (RipperMercs on GitHub, Ripper on the original Mercs roster). The byline is reserved for occasional founder notes only: launch posts, anniversary posts, major announcements, decisions where the founder's voice matters.

Frequency: rare. The site is not a personality vehicle.

Implementation:
- `Author` enum in `src/lib/schemas.ts`: replace `'flipper'` with `'ripper'` for new content. Keep `'flosium'`, `'og'`, `'flipper'` as legacy values valid only on archived pieces.
- New canonical Author values for new content: `'editorial' | 'ripper'`
- `src/components/icons.tsx`: rename `FlipperGlyph` to `RipperGlyph` if it exists. Otherwise no glyph (the new editorial framing avoids glyph branding).
- `src/lib/format.ts`: update `authorDisplay` to map `'ripper'` to "Ripper" and grandfather legacy values.
- Any hardcoded "flipper" string references across the codebase: rename to "ripper."

### 7.2 New article byline policy

When article writing eventually returns to PVPWire (no commitment in v2.0), the canonical bylines are:

- `editorial` (default; renders as "PVPWire Editorial")
- `ripper` (founder; rare)
- Specific contributor handles when the masthead expands

No new persona structure. No voice bibles for new bylines. Articles read as professional sports journalism, not voiced essays.

### 7.3 Voice archive

`/docs/voice-archive.md` is created during the migration. It contains the original SPEC.md Section 3 voice bibles for Flosium, Og, and Flipper, the Appendix A Flosium samples, and a note explaining that this material is preserved for IP reasons but is not enforced on any new content.

## 8. Critical rules (unchanged)

The CRITICAL RULES section in CLAUDE.md is unchanged:

1. No em dashes anywhere, in code, copy, articles, metadata, or commit messages.
2. No double-hyphens as substitute em dashes.
3. No generic emojis in UI. Custom SVG icons or text labels only.
4. No raw user text passed to Claude API or any LLM. Always structured JSON with locked system prompts. (Currently moot since Ask Flosium is removed; rule retained for any future AI feature.)
5. No hardcoded API keys. Pre-commit hooks unchanged.
6. `.gitignore` coverage for `.env`, `worker/.dev.vars`, `*.key` unchanged.

`scan-emdash.mjs`, `scan-secrets.mjs`, and the husky pre-commit hook are unchanged.

## 9. Schema updates

`GameFrontmatter` additions:

```ts
export type ActivityTier = 'live' | 'casual' | 'fading' | 'dormant' | 'upcoming';
export type SceneStatus = 'hot' | 'steady' | 'declining' | 'dormant';

export interface GameFrontmatter {
  // ...existing fields...
  activity_tier?: ActivityTier;     // derived if missing
  scene_status?: SceneStatus;        // editorial flag, manual at v2.0
  scene_status_note?: string;        // one-line context
  current_meta_note?: string;        // one-liner for above-the-fold on game profile
  player_count_signal?: string;      // free text, e.g. "150k+ daily" or "small but active"
  trending?: boolean;                // surfaces on /games "Trending now" rail
  coming_soon?: boolean;             // surfaces on /games "Coming soon" rail
  priority?: number;                 // home-page ordering; lower is more prominent; default 100
  last_major_patch?: string;         // ISO date
  current_tournaments?: string[];    // tournament_slug array, cross-link to /esports
  top_orgs?: string[];               // esports_org_slug array, cross-link to /esports/orgs
  twitch_directory_slug?: string;    // for v2.1 Twitch integration
  steam_app_id?: number;             // for v2.1 Steam integration
}
```

Default derivation when fields are missing:
- `activity_tier`: from `status` and `release_year`. `upcoming` -> `upcoming`. `sunset` -> `dormant`. `active` and `release_year >= 2022` -> `live`. `active` and `release_year >= 2015` -> `casual`. Otherwise `fading`.
- `scene_status`: defaults to `steady`.

`GuildFrontmatter`: unchanged. The 38 existing profiles continue to work as-is at `/archive/guilds/[slug]`.

`ArchivedStoryFrontmatter` (replaces `LegendFrontmatter` and `HeritageFrontmatter`):

```ts
export type ArchivedStoryOrigin = 'legends' | 'heritage';
export type LegacyAuthor = 'flosium' | 'og' | 'flipper';

export interface ArchivedStoryFrontmatter {
  slug: string;
  title: string;
  original_section: ArchivedStoryOrigin;
  guild_slug?: string;
  era?: GuildEra;
  era_active?: { start: number; end: number | 'active' };
  author: LegacyAuthor;              // grandfathered; only valid on archived pieces
  related_games?: string[];
  related_guilds?: string[];
  hero_image?: string;
  published: string;
  updated?: string;
  description: string;
}
```

`TournamentFrontmatter` (new):

```ts
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

export interface TournamentFrontmatter {
  slug: string;
  name: string;
  aliases?: string[];
  game_slug: string;                       // primary game; must match catalog slug
  secondary_games?: string[];               // for cross-game tournaments (rare)
  organizer: string;                        // ESL, Riot, Valve, etc.
  tier: TournamentTier;
  format?: EsportsFormat;
  prize_pool_usd?: number;
  date_start: string;                       // ISO
  date_end: string;                         // ISO
  region?: 'international' | 'na' | 'eu' | 'apac' | 'latam' | 'mena' | string;
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
```

`EsportsOrgFrontmatter` (new):

```ts
export interface EsportsOrgFrontmatter {
  slug: string;
  name: string;
  aliases?: string[];
  founded: number;
  country?: string;
  hq_city?: string;
  status: 'active' | 'inactive' | 'dissolved';
  games: {
    game_slug: string;
    status: 'active' | 'inactive';
    notable_titles?: string[];
  }[];
  notable_titles?: string[];                // org-level major wins
  notable_moments?: {                       // preserved from migrated GuildFrontmatter
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
```

`ArticleFrontmatter`: update Author enum.

```ts
export type Author = 'editorial' | 'ripper' | LegacyAuthor;
```

Where `LegacyAuthor` is defined in `ArchivedStoryFrontmatter` and remains valid only on archived content. New articles must use `editorial` or `ripper`.

## 10. Routing changes

Delete:
- `src/app/heritage/page.tsx`
- `src/app/heritage/[slug]/page.tsx`
- `src/app/legends/page.tsx`
- `src/app/legends/[slug]/page.tsx`
- `src/app/ask-flosium/page.tsx`

Add:
- `src/app/esports/page.tsx`
- `src/app/esports/calendar/page.tsx`
- `src/app/esports/orgs/page.tsx`
- `src/app/esports/orgs/[slug]/page.tsx`
- `src/app/esports/[slug]/page.tsx`
- `src/app/archive/page.tsx`
- `src/app/archive/[slug]/page.tsx`

Keep (with content updates per relevant section):
- `src/app/page.tsx` (rebuild per Section 12)
- `src/app/catalog/page.tsx` (reorder per Section 13)
- `src/app/catalog/[slug]/page.tsx`
- `src/app/news/page.tsx`
- `src/app/news/[slug]/page.tsx`
- `src/app/guilds/page.tsx` (still exists; surfaced via Archive in nav)
- `src/app/guilds/[slug]/page.tsx`
- `src/app/guilds/submit/page.tsx`
- `src/app/about/page.tsx`
- `src/app/submit/page.tsx`

URL stability: existing `/guilds/*` URLs continue to resolve. The `/archive` hub provides discovery; direct guild URLs do not break.

## 11. Worker changes

Delete:
- `POST /api/ask-flosium` route handler
- The locked Flosium system prompt module
- The Workers AI Llama 3.1 binding (remove from `wrangler.toml`)
- The Ask Flosium rate limiter KV namespace
- The em-dash output sanitizer

Keep, no changes:
- `GET /api/news`
- `POST /api/submit-guild`
- `GET /api/admin/submissions`
- The RSS aggregator cron (30 min)
- The X bot cron
- KV namespaces for `NEWS_CACHE`, `SUBMISSIONS`, `BOT_LOG`

Add:
- `GET /api/tournaments`. Returns the curated tournament calendar. KV-cached, refreshed on editorial publish.
- `GET /api/esports-news`. Returns a keyword-filtered subset of `/api/news` tagged as esports-relevant.

The Worker stays single-file in `/worker/`. New endpoints are small additions, not a restructure.

## 12. Homepage redesign

Rebuild `src/app/page.tsx` from scratch. New section order, top to bottom:

Section 1: Lede band. New background asset (esports arena, see Section 16). Headline framing PVPWire as the hub for current competitive PvP. Sample copy: "Competitive PvP, current and indexed." Two CTAs: "Browse the games" linking to `/catalog`, "See what's running this week" linking to `/esports`. No editorial pull-quote, no masthead branding, no persona glyphs.

Section 2: Live and Hot rail. 6 to 8 game cards for currently hot PvP titles, manually flagged via the new `trending` field in `GameFrontmatter`. Each card: hero image, name, scene status badge, activity tier badge, one-line `current_meta_note`.

Section 3: Running This Week tournament strip. Pulls from `/api/tournaments`. Shows the next 5 to 7 upcoming or live tournaments. Each card: tournament name, primary game, date range, status badge, prize pool.

Section 4: News rail. The 6 most recent items from `/api/news`. Filter chip: All / Esports.

Section 5: Coming Soon rail. Upcoming PvP releases for the next 6 to 12 months. Card grid filtered by `coming_soon: true`.

Section 6: Esports Orgs strip. 8 esports orgs with logos, linking to `/esports/orgs/[slug]`. Rotates monthly via editorial selection.

Section 7: Catalog teaser. Six game cards from `/catalog` filtered by activity_tier, "See all" link.

Section 8: Archive callout. Single small block linking to `/archive` for users who want guild history and legacy editorial.

Section 9: Footer.

Removed from current home page:
- Volume 1, Issue 1 / Established 2026 eyebrow
- Editorial pull-quote hero
- Heritage strip with `FlosiumGlyph`
- Legends column with `FlosiumGlyph`
- Ask Flosium teaser black band
- Field Notes / Og column with `OgGlyph`
- Featured Guilds panel
- Castle background

## 13. Catalog rework

Route stays at `/catalog`. Label in nav becomes "Games."

Sort priority changes from alphabetical to:

1. Status (active first, then upcoming, then classic, then sunset)
2. Within status, by `activity_tier` (live, casual, fading, dormant)
3. Within tier, by `priority` (lower is more prominent)
4. Tiebreaker: alphabetical

New rails on `/catalog`:
- "Trending now" rail at the top: 6 to 8 currently hot PvP titles (`trending: true`)
- "Coming soon" rail below trending: upcoming PvP releases (`coming_soon: true`)

Filter primary axis flips from category to status. Category remains as a secondary axis. Activity tier becomes a tertiary filter.

Each game card adds:
- Scene status badge
- Activity tier badge
- Pro scene badge (already in schema, surface it)

Backfill task: add `activity_tier` and `priority` to all 108 catalog entries via `scripts/backfill-activity.mjs`. Default tier from derivation logic in Section 9. Manual review of the top 25 priority assignments and `current_meta_note` strings.

## 14. News (no changes to mechanism)

The aggregator stays as built. 20 RSS sources, 30-minute Worker cron, KV cache, dedup by title hash. The news feed UI stays.

Editorial bias shifts toward current scene reporting. No new commitment to original article cadence; original article writing is paused indefinitely. When original writing returns, it follows the byline policy in Section 7.2.

The news page UI gets a new filter chip: "Esports only" (via the `/api/esports-news` filtered subset).

Tags: add `esports` and `current-scene` as standard tags for new articles when they return. No retagging of the 3 existing original articles required.

## 15. Archive section

`/archive` is the new bulk-content hub for everything that is not games, esports, or news.

`/archive` hub page contents:

1. Brief intro paragraph (1 to 2 sentences) framing what's in the archive.
2. Guilds surface: link to the guilds index, embed of the OG Guilds Infograph (preserved from v1.0), stats line (38 profiles, X eras covered).
3. Stories surface: list of the 12 legacy editorial pieces with hero images and excerpts, sorted by published date desc.
4. Future archive categories: placeholder section that can hold patches archive, retired games, scene history retrospectives, etc.

The archive surface is intentionally low-frequency. New material is not actively produced for `/archive` in v2.0. The 12 legacy editorial pieces and 38 guild profiles remain accessible and indexable but do not generate new content.

Cross-links:
- `/catalog/[slug]` pages link to relevant guild profiles via `/guilds/[slug]` (canonical) or `/archive/guilds/[slug]` (consistent route under the new hub structure)
- `/esports/orgs/[slug]` does not cross-link to `/archive/guilds/`. Esports orgs are forward-looking.

URL stability rule: the existing `/guilds/[slug]` URLs continue to render and are indexed. They are surfaced under the Archive umbrella in navigation only.

## 16. Background asset replacement

The castle background image added 2026-04-26 is removed from the home page and from the site's general background usage.

Replacement: a generic esports arena image. Direction: dark, modern, electric. Stage lights, big screens, crowd silhouettes, modern stadium architecture. Avoid medieval, fantasy, or heritage visual language.

v2.0 placeholder source: free-license stock from Unsplash or Pexels. Search terms: "esports arena," "competitive gaming hall," "stadium tournament," "esports finals." Pick a 1920x1080 or larger asset with a dark color palette so text overlays remain readable.

v2.1: commission a custom hero asset that matches the brand's visual identity. Budget and vendor TBD.

The castle asset is not deleted. It can be repurposed on `/archive` if it fits the historical-content vibe, or shelved for a future feature.

## 17. Content strategy (v2.0 launch)

No new article writing during the pivot. The site goes live with:

- 108 game profiles in `/catalog`
- 38 guild profiles in `/archive/guilds`
- 12 legacy editorial pieces in `/archive`
- 45 esports org profiles in `/esports/orgs` (4 migrated from guilds, 16 tier-1 new, 2 regional balance, 23 scene-depth). Founder direction 2026-04-26: more orgs is better; `/esports` houses all professional teams. Final seed list and per-pick rationale in `docs/seed-rationale.md`.
- 13 tournament profiles in `/esports`. Final seed list in `docs/seed-rationale.md`.
- 3 existing original news articles (existing bylines grandfathered)
- Live news feed via aggregator

When article writing eventually returns post-pivot, it follows the byline policy in Section 7.2. The expected article types:

- Tournament recaps after major events
- Scene state reports (monthly per major game)
- Game launch reviews
- Patch impact summaries
- Meta state snapshots

Long-form essay editorial is not on the roadmap.

## 18. SEO and discovery

Re-targeted keyword set:
- "best PvP games 2026"
- "competitive PvP games"
- "esports calendar 2026"
- "esports tournaments this week"
- "MMO PvP active 2026"
- "extraction shooter rankings"
- "competitive games to play"
- Per-game variants of "[game] tournament schedule" and "[game] competitive scene 2026"

JSON-LD updates:
- `Article` on news (unchanged)
- `BreadcrumbList` on game, esports, and archive pages
- `SportsEvent` on `/esports/[tournament-slug]`
- `Organization` on `/esports/orgs/[slug]`
- `VideoGame` on `/catalog/[slug]`

Sitemap:
- Add `/esports/*` and `/archive/*`
- Remove `/heritage/*`, `/legends/*`, `/ask-flosium`
- `/guilds/*` URLs remain in sitemap during the transition; can be consolidated into `/archive/guilds/*` in v2.1 if redirect strategy is finalized

`llms.txt`: rewrite for the new positioning. Surface Games, Esports, News as primary feeds. List the structured RSS feeds. Drop persona references.

RSS:
- `/rss.xml` (full feed) updated to include esports, exclude legends/heritage
- `/rss/news.xml` unchanged
- `/rss/esports.xml` (new)
- `/rss/legends.xml` and `/rss/heritage.xml` deleted

## 19. X bot post mix (revised)

Drop persona-quote post type. Add esports-current post types. Target distribution after pivot lands:

- 30%: tournament running this week (auto, from `/api/tournaments`)
- 25%: news feed highlights (curated subset of aggregator output)
- 15%: tournament recap on completion (auto)
- 10%: new game added to catalog (auto)
- 10%: scene state pulse, "X game is hot right now" (manual, when article writing returns)
- 10%: original article publish (auto on publish, when article writing returns)

Cadence ramp from SPEC.md Section 11.1 unchanged: 4 to 6 per day weeks 1 to 2, 6 to 8 per day weeks 3 to 4, 8 to 10 per day week 5+.

## 20. Migration order for CC

Each step is a separate commit. Each step leaves the site in a consistent buildable state.

**Step 1: Hard removal of personas, Ask Flosium, Heritage, and Legends.**
- Delete `src/app/heritage/`, `src/app/legends/`, `src/app/ask-flosium/`
- Delete Heritage strip, Legends column, Field Notes column, Ask Flosium teaser, persona glyphs from home page
- Delete `FlosiumGlyph` and `OgGlyph` from `src/components/icons.tsx`
- Update `src/components/SiteHeader.tsx` nav to: Home, Games, Esports, News
- Update `src/components/SiteFooter.tsx` to: Archive, About, Submit (column A); RSS, llms.txt, Contact (column B)

**Step 2: Move legacy content to archive.**
- `git mv content/legends content/archive/stories-legends-source`
- `git mv content/heritage content/archive/stories-heritage-source`
- Combine into a flat `/content/archive/` directory keyed by slug, with `original_section` frontmatter field tracking provenance
- `git mv content/guilds content/archive/guilds`
- Add `ArchivedStoryFrontmatter` schema in `src/lib/schemas.ts`
- Add `getAllArchivedStories()` and `getArchivedStoryBySlug()` in `src/lib/content.ts`
- Update existing `getAllGuilds()` to read from `/content/archive/guilds/` directory
- Add `src/app/archive/page.tsx` and `src/app/archive/[slug]/page.tsx`
- Verify `/guilds/[slug]` URLs still render correctly from the new directory location

**Step 3: Worker cleanup.**
- Remove `/api/ask-flosium` handler and locked system prompt module
- Remove Workers AI binding from `wrangler.toml`
- Remove the Ask Flosium rate limiter KV namespace declaration
- Remove the em-dash output sanitizer module
- Verify Worker still deploys cleanly with news, submit, and admin endpoints

**Step 4: Founder byline rename (Flipper to Ripper).**
- Update `Author` enum in `src/lib/schemas.ts`: add `'ripper'` and `'editorial'`, keep legacy values valid only on archived content
- Rename `FlipperGlyph` to `RipperGlyph` in `src/components/icons.tsx` if it exists, or remove glyph entirely
- Update `authorDisplay()` in `src/lib/format.ts` to map `'ripper'` to "Ripper"
- Audit codebase for any hardcoded "flipper" references and rename to "ripper"
- The 12 archived stories keep their original author values for grandfathering

**Step 5: Esports schemas and routes.**
- Add `TournamentFrontmatter` and `EsportsOrgFrontmatter` to `src/lib/schemas.ts`
- Create `/content/tournaments/` and `/content/esports-orgs/` directories
- Migrate Fnatic, SK Telecom T1, Sentinels, Team 3D from `/content/archive/guilds/` to `/content/esports-orgs/` with schema transform script (`scripts/migrate-modern-orgs.mjs`)
- Add 16 new esports org profiles to reach 20 total (recommended seed list: G2 Esports, Team Liquid, Cloud9, FaZe Clan, NAVI, Astralis, NRG, 100 Thieves, Evil Geniuses, OG, BLG, Gen.G, DRX, Heroic, Vitality, MOUZ; adjust per editorial)
- Seed 8 to 12 tournament profiles for 2026 (CS Major, LoL Worlds 2026, VCT 2026, EVO 2026, IEM Katowice 2026, ESL Pro League S22/S23, Six Invitational 2026, TI 2026, EWC 2026, Apex Global Series 2026)
- Add `/esports`, `/esports/calendar`, `/esports/orgs`, `/esports/orgs/[slug]`, `/esports/[slug]` routes
- Wire `/api/tournaments` and `/api/esports-news` Worker endpoints

**Step 6: Catalog rework.**
- Add new fields to `GameFrontmatter`: `activity_tier`, `scene_status`, `scene_status_note`, `current_meta_note`, `player_count_signal`, `trending`, `coming_soon`, `priority`, `last_major_patch`, `current_tournaments`, `top_orgs`
- Run `scripts/backfill-activity.mjs` to set `activity_tier` defaults across all 108 entries
- Manual editorial pass: set `trending: true` on 6 to 8 games, set `coming_soon: true` on relevant upcoming entries, write `current_meta_note` on the top 25 active games, set `priority` on the top 12
- Update `/catalog` sort priority to status-first, tier-second
- Update `CatalogBrowser.tsx` filter UI: status as primary, category secondary, activity tier tertiary
- Add Trending Now and Coming Soon rails to `/catalog`

**Step 7: Homepage rebuild.**
- Replace `src/app/page.tsx` with the new section order from Section 12
- Build new components: `HotNowRail`, `RunningThisWeekStrip`, `ComingSoonRail`, `EsportsOrgsStrip`, `ArchiveCallout`
- Reuse `NewsBrowser` for the news rail with a new `compact` mode
- Remove all persona glyph imports from home page
- Replace castle background with esports-arena placeholder asset

**Step 8: Background asset swap.**
- Remove `.home-bg` castle reference from `src/app/globals.css` or wherever it lives
- Add new esports-arena placeholder asset to `public/`
- Update home page to reference the new asset
- Confirm dark/light theme contrast is acceptable on the new background

**Step 9: SEO and feeds.**
- Update `sitemap.ts` to add `/esports/*` and `/archive/*`, remove `/legends/*`, `/heritage/*`, `/ask-flosium`
- Add `/rss/esports.xml` generator
- Remove `/rss/legends.xml` and `/rss/heritage.xml` generators
- Update `llms.txt` for new positioning
- Add `SportsEvent` JSON-LD on tournament pages, `Organization` JSON-LD on esports org pages

**Step 10: Spec doc updates.**
- Move `SPEC.md` to `docs/SPEC-v1.0.md`
- Either rename `PIVOT.md` to `SPEC.md` or merge both into a fresh `SPEC.md`. Founder call.
- Update `CLAUDE.md` to remove Heritage, Legends, Ask Flosium, Flosium, Og, Flipper references
- Update `CLAUDE.md` to reflect Ripper byline and the new 4-tab nav
- Create `docs/voice-archive.md` with the original SPEC.md Section 3 voice bibles for IP preservation

**Step 11: Verification.**
- `npm run build` clean
- `npm run scan-emdash` clean
- `npm run scan-secrets` clean
- `npm run typecheck` clean
- All routes return 200 and render correctly
- Sitemap and RSS feeds validate
- Visual smoke test on mobile and desktop, dark and light theme

Estimated total: 5 to 7 working days at single-engineer pace. Step 5 (esports scaffolding and seed content) is the largest block at 1.5 to 2 days.

## 21. What this pivot preserves

To be explicit, none of the following is lost:

- The 108-game catalog, fully kept, reordered
- The 38 guild profiles, fully kept, surfaced via `/archive`
- The OG Guilds Infograph, fully kept on the Archive surface
- The lineage tree component, fully kept on individual guild profiles
- The submission pipeline, fully kept at `/guilds/submit`
- The 12 existing editorial pieces, fully kept at `/archive/[slug]` with grandfathered bylines
- The brand: PVPWire, pvpwire.com
- The infrastructure: Next.js 14, Cloudflare Pages, Cloudflare Worker, KV
- The CRITICAL RULES (writing, security, pre-commit hooks)
- The X bot account (post mix updated, account unchanged)
- The news aggregator (mechanism unchanged)
- The build scripts: scan-emdash, scan-secrets, typecheck
- The custom SVG icon library (minus retired persona glyphs)

## 22. v2.1 roadmap (post-pivot)

These items defer to the next milestone after the pivot ships:

- Tournament results live updates from API source (Liquipedia, PandaScore, or Abios) where licensable
- Esports org claim flow with magic-link auth
- Player profile pages, per-game leaderboards
- Twitch Live integration on the home page Live and Hot rail
- Steam current-player count badge on game profiles
- Patch tracker with RSS ingest per game
- Custom commissioned hero asset for the home page background
- Optional return of original article writing under the new byline policy

## 23. Carried-over decisions

For continuity, decisions made in PM mode before this hard pivot:

- Repo official clone URL: `https://github.com/RipperMercs/pvpwire.git`
- Catalog count starting point: 108 entries (will not change in pivot)
- Guild count starting point: 38 profiles (drops to 34 after migrating 4 to esports orgs)
- Necron is excluded from The Mercs roster on editorial instruction
- The Mercs profile sources from themercs.org wayback (2012) plus pvpblog.com plus asheron.fandom.com
- The Mercs `notable_members` reflects the official themercs.org roster only; pvpblog-named individuals not on the roster were removed
- `covetous-crew.mdx` stub is unresolved; recommend deleting unless source is confirmed from the 2009 wayback capture
- Penn-attribution overreach in The Mercs profile (notable_moments and body prose) should be byline-corrected during a future editorial pass on the archived guild content; not a pivot blocker

## 24. Open questions

1. Background asset: confirm a specific stock source for the v2.0 esports arena placeholder, or pick from candidates after CC scaffolds the home page.
2. Esports org seed list: 16 names recommended in Step 5. Founder vetoes welcome.
3. Tournament seed list: 10 names recommended in Step 5. Founder vetoes welcome.
4. `covetous-crew.mdx` resolution before pivot ships: delete the stub, or fetch the 2009 themercs.org wayback to confirm or refute as a peer guild.
5. URL strategy for `/guilds/*` vs `/archive/guilds/*`: maintain both via redirect, or choose one canonical form. Default recommendation: keep `/guilds/[slug]` as canonical for SEO continuity, surface via Archive in nav.
6. SPEC.md replacement: at Step 10, replace SPEC.md content wholesale with this pivot rolled forward, or keep PIVOT.md alongside SPEC.md and update CLAUDE.md to point at PIVOT.md.

## 25. End

This is the hard pivot. The v1.0 build was the right work. The pivot reorients without throwing it out. The old version becomes the depth surface, the new version becomes the front door. No more writers. No more personas. The site is a hub for current competitive PvP and esports, with guild history and editorial archive available for anyone who wants the depth.

Built by Pizza Robot Studios. Quality over quantity, always. Current over historical, where it matters.
