# PVPWIRE SEO SPEC v1.0

Status: Active. This spec covers SEO architecture, structured data, internal linking, and pre-launch readiness for PVPWire's public launch.

Owner: Pizza Robot Studios LLC. Founder: Ripper. Spec lead: PM.

This document is read alongside PIVOT.md (the v2.0 active product spec) and CLAUDE.md (project rules and bylines). On any conflict between this doc and PIVOT.md, PIVOT.md wins on product direction and CRITICAL RULES; this doc is authoritative on SEO implementation.

## 0. What's already in place

To avoid re-specifying shipped work, here is the current SEO baseline as of pivot ship:

- Root `metadata` export in `src/app/layout.tsx` with `metadataBase`, title template `%s | PVPWire`, default description, keywords, sitewide Open Graph and Twitter Card defaults, robots directives, RSS alternates, canonical URL, theme color viewport.
- `src/app/sitemap.ts` covering home, primary surfaces, all dynamic routes (games, guilds, news, archive, esports orgs, tournaments) with `lastModified`, `changeFrequency`, `priority`.
- `src/app/robots.ts` allowing all crawlers, disallowing `/admin/` and `/api/`, declaring sitemap location and host.
- `src/app/not-found.tsx` custom 404.
- JSON-LD blocks present on six dynamic page types: `/games/[slug]`, `/esports/orgs/[slug]`, `/esports/[slug]`, `/archive/[slug]`, `/guilds/[slug]`, `/news/[slug]`.
- `llms.txt` rewritten for v2 positioning.
- Static export to Cloudflare Pages: pre-rendered HTML for all pages, fast LCP, no client-side hydration cost on metadata.
- `trailingSlash: true` in `next.config.mjs` for URL consistency.
- Skip-to-content link in layout for accessibility.

This spec extends the baseline. It does not rebuild what is shipped.

## 1. Why SEO now

PVPWire is approaching public launch. Pages are populated. Content is real. Cross-link integrity is good. The site's discoverability depends on crawlability, structured data quality, internal linking density, and per-page metadata uniqueness. Any work not landed before launch becomes harder to retrofit later because Google indexes the early version of a page and de-prioritizes major rewrites.

The product positioning (cross-genre PvP and esports hub) maps to a genuinely uncontested keyword space. Liquipedia is per-game. HLTV is CS-only. Dexerto and Dot Esports cover top-four esports only. Nobody catalogs the full PvP genre with editorial signal on what's currently active. Capturing that space requires the SEO infrastructure to be right out of the gate.

## 2. Goals and success metrics

**Pre-launch goals:**

1. Every public-facing page has a unique title, unique meta description, valid JSON-LD, correct canonical URL, and at least one Open Graph image.
2. Sitemap covers every public URL. Robots.txt and sitemap reference each other correctly.
3. Internal linking density: every game profile links to at least three related entities (guilds, orgs, tournaments, news). Every esports org links to at least two games and current tournaments. Every tournament links to its game and all participating orgs.
4. Core Web Vitals: LCP under 2.5s, CLS under 0.1, INP under 200ms on key pages tested via Lighthouse.
5. Schema validation: every JSON-LD block passes Google's Rich Results Test.

**Post-launch metrics (90-day targets):**

- Pages indexed: 90%+ of submitted sitemap URLs
- Organic search impressions: tracked via Search Console weekly
- Brand keyword ranking: top 3 for "PVPWire" within 30 days
- Long-tail keyword coverage: at least 50 unique queries driving impressions within 60 days
- Core Web Vitals: 75%+ of pages passing on real-user metrics

## 3. Page metadata architecture

Every dynamic route (`[slug]` pattern) implements `generateMetadata()` in addition to the static layout metadata. Static index pages use `metadata` exports with hand-written values per route.

### 3.1 Title patterns per page type

The format is "Specific | Categorical | PVPWire" where appropriate. The site title template (`%s | PVPWire`) handles the suffix automatically; per-page titles supply the content before the pipe.

- **Home** (`/`): "PVPWire" (uses default; the layout's default title is sufficient)
- **Games index** (`/games`): "PvP Games Catalog: Every Notable Competitive Title"
- **Game profile** (`/games/[slug]`): "{Game Name} PvP: Modes, Pro Scene, and Guilds"
- **Esports index** (`/esports`): "Esports Calendar 2026: Tournaments and Organizations"
- **Esports calendar** (`/esports/calendar`): "Esports Tournament Calendar 2026"
- **Esports orgs index** (`/esports/orgs`): "Esports Organizations: Top Pro Teams"
- **Esports org profile** (`/esports/orgs/[slug]`): "{Org Name}: Esports Organization Profile"
- **Tournament profile** (`/esports/[slug]`): "{Tournament Name} {Year}: Schedule, Bracket, Prize Pool"
- **News index** (`/news`): "Competitive PvP and Esports News"
- **News article** (`/news/[slug]`): "{Article Title}"
- **Archive index** (`/archive`): "Archive: PvP Guilds, Stories, and History"
- **Archive story** (`/archive/[slug]`): "{Story Title}"
- **Guilds index** (`/guilds`): "PvP Guild Database: Cross-Game Lineage and History"
- **Guild profile** (`/guilds/[slug]`): "{Guild Name}: {Primary Game} Guild Profile"
- **About** (`/about`): "About PVPWire"
- **Submit** (`/submit`): "Submit to PVPWire"

Title length target: 50 to 60 characters before the pipe and site name suffix. Truncation is fine if the most important keyword is at the front.

### 3.2 Meta description patterns

Every page gets a unique meta description, 140 to 160 characters, written to encourage click-through from search results. No filler. Lead with the value the page provides.

Per-page-type templates and examples:

- **Game profile**: "{Game Name} PvP profile. Modes, ranking systems, pro scene status, related guilds, and current tournaments. Cross-genre PvP catalog from PVPWire."
  - Example: "Counter-Strike 2 PvP profile. Competitive modes, ranking system, pro scene status, top organizations, and current Majors. PVPWire."
- **Esports org**: "{Org Name} esports organization profile. Active rosters across {N} games, notable titles, recent tournament results. PVPWire esports."
  - Example: "Fnatic esports organization profile. Active rosters across CS2, League of Legends, Valorant, and Dota 2. Major titles, current results. PVPWire."
- **Tournament**: "{Tournament Name} {Year} schedule, format, prize pool, and participating organizations. {Game} esports calendar from PVPWire."
- **Guild**: "{Guild Name} guild profile. {Era}-era PvP organization in {Game}, notable members, lineage, and key moments. PVPWire archive."
- **News article**: Use the article frontmatter `description` field.
- **Archive story**: Use the story frontmatter `description` field.

Index pages have hand-written descriptions per Section 3.1's title list, kept fresh as content grows.

### 3.3 Canonical URL strategy

Every page declares a canonical URL via `metadata.alternates.canonical`. Pattern: `https://pvpwire.com/{path}/` with trailing slash matching the `next.config.mjs` setting.

Special cases:

- **Pagination** (if introduced later): canonical points to `?page=1` or first page.
- **Filtered views** (e.g., `/games?category=mmo-pvp`): canonical points to the unfiltered index `/games/`. Filter params are not separately indexable.
- **Guild profiles**: canonical is `https://pvpwire.com/guilds/{slug}/` (the v2 nav promotes Archive but the guild URLs stayed at `/guilds/[slug]` for SEO continuity per PIVOT.md Section 6). Do not make `/archive/guilds/{slug}/` an alternative URL; either implement a 301 redirect to `/guilds/{slug}/` or do not surface that path at all.

### 3.4 Open Graph and Twitter Card per page type

The site-level OG and Twitter defaults from `layout.tsx` are inherited by all pages. Per-page overrides are required for:

- **Title**: matches the page title (drop the site suffix in OG; OG titles can be longer)
- **Description**: matches the page meta description
- **Image**: page-specific (Section 7)
- **URL**: page canonical
- **Type**: `article` for news and archive stories; `website` for everything else; `video.other` for tournament pages if a hero video is embedded
- **Publishedtime / modifiedtime**: for `article` type, from frontmatter

Twitter card type: `summary_large_image` for everything; `summary` for the home page only.

## 4. Structured data (JSON-LD) plan

JSON-LD blocks are already on six dynamic page types. This spec audits and extends.

### 4.1 Site-wide schemas

Add to root `layout.tsx` head injection:

- **Organization**: PVPWire as the publishing organization, with `name`, `url`, `logo`, `sameAs` for social profiles, `foundingDate`. Renders on every page.
- **WebSite**: with `name`, `url`, `potentialAction` set to a `SearchAction` pointing at `/search?q={search_term_string}` (deferred until search exists; placeholder OK).

### 4.2 Per-page-type schema requirements

Each page type below needs the listed JSON-LD blocks. Existing blocks should be audited against the field requirements; missing blocks need to be added.

**Game profile (`/games/[slug]`):**

- `VideoGame` (existing; audit): required fields `name`, `description`, `genre`, `gamePlatform`, `applicationCategory`, `playMode` (set to `MultiPlayer`), `image`, `url`. Optional: `releaseDate`, `publisher`, `developer`, `aggregateRating` (deferred), `gameItem`.
- `BreadcrumbList`: Home > Games > {Game Name}.

**Esports org (`/esports/orgs/[slug]`):**

- `SportsOrganization` (existing; audit): `name`, `url`, `logo`, `foundingDate`, `location`, `sport` (string per main game), `member` (link out to roster handles, optional).
- `BreadcrumbList`: Home > Esports > Organizations > {Org Name}.

**Tournament (`/esports/[slug]`):**

- `SportsEvent` (existing; audit): `name`, `description`, `startDate`, `endDate`, `eventStatus` (set per `status` field), `location`, `organizer` (Organization), `competitor` (array of SportsOrganization for each participant), `eventAttendanceMode` (`OfflineEventAttendanceMode` for LANs, `OnlineEventAttendanceMode` or `MixedEventAttendanceMode` for online or hybrid), `image`, `offers` (prize pool as `Offer.priceCurrency` USD).
- `BreadcrumbList`: Home > Esports > {Tournament Name}.

**Guild profile (`/guilds/[slug]`):**

- `Organization` (existing; audit): no clean schema.org type for "MMO guild." Use `Organization` with `name`, `description`, `foundingDate` derived from `era_active.start`, `dissolutionDate` if applicable, `url`, `sameAs` (cross-game links), `member` (notable_members array as Person blocks, optional).
- `BreadcrumbList`: Home > Archive > Guilds > {Guild Name}, OR Home > Guilds > {Guild Name} depending on canonical URL strategy decision.

**News article (`/news/[slug]`):**

- `NewsArticle` (existing; audit): `headline`, `description`, `image`, `datePublished`, `dateModified`, `author` (Person or Organization), `publisher` (Organization with logo), `mainEntityOfPage`, `articleSection`, `keywords`. The `Article` type works as fallback but `NewsArticle` is more specific and qualifies for Google News surface.
- `BreadcrumbList`: Home > News > {Article Title}.

**Archive story (`/archive/[slug]`):**

- `Article` (existing; audit): same fields as `NewsArticle` but `Article` type because these are not time-sensitive news. Fields: `headline`, `description`, `image`, `datePublished`, `dateModified`, `author`, `publisher`, `mainEntityOfPage`, `articleSection` (set to "Legends" or "Heritage" per `original_section`), `keywords`.
- `BreadcrumbList`: Home > Archive > {Story Title}.

**Index pages (no per-item JSON-LD beyond the site-wide):**

- `/games`, `/esports`, `/esports/calendar`, `/esports/orgs`, `/news`, `/archive`, `/guilds`: each gets `CollectionPage` with `name`, `description`, `mainEntity` set to an `ItemList` of the contained items (limit to top 30 by default to avoid bloat).
- `BreadcrumbList`: Home > {Surface}.

### 4.3 Schema validation

Add a verification step:

- Local: `npm run validate-schema` (new) runs each generated page through a schema.org validator. Recommended library: `schema-dts` for type-safe schema definitions in TS, `structured-data-testing-tool` (or equivalent) for runtime validation.
- Pre-launch: manually run Google's Rich Results Test (`https://search.google.com/test/rich-results`) on at least one URL per page type.
- Post-launch: monitor Search Console's "Enhancements" reports for structured-data errors.

## 5. Internal linking strategy

Internal links are PVPWire's primary SEO multiplier. Cross-genre coverage means every game has natural links to multiple guilds, orgs, tournaments, and news items. The graph density is the moat.

### 5.1 Required cross-links per page type

**Game profile** must include links to:

- All esports orgs that compete in this game (filter `EsportsOrgFrontmatter.games[].game_slug === current.slug`)
- All tournaments for this game (filter `TournamentFrontmatter.game_slug === current.slug`)
- All guilds with this game in their `games[]` array
- All recent news articles tagged with this game's slug
- The game's category index (e.g., "More MMO PvP games")

**Esports org profile** must include links to:

- All games the org competes in
- All tournaments the org is participating in (filter tournament `participants` for `org_slug === current.slug`)
- Recent news mentioning this org
- The orgs index

**Tournament profile** must include links to:

- The primary game profile
- All participating orgs (every entry in `participants[]`)
- The esports calendar index
- Past editions of the same tournament series, if any (linked via aliases or a series field)

**Guild profile** must include links to:

- The primary game profile (and secondary games if multi-game guild)
- Predecessor guilds, successor guilds, splinter guilds (already in schema)
- Related guilds via game (other guilds in the same game)
- Related archive stories
- The guilds index

**News article** must include links to:

- The primary game (`related_games[0]` or first tag matching a catalog slug)
- Related esports orgs if mentioned
- Related tournaments if mentioned
- Recent articles in the same category

**Home page** must include links to:

- Top 6 trending games (from `Hot Now` rail)
- Top 5 running tournaments (from `Running This Week` strip)
- Top 8 esports orgs (rotates monthly per editorial)
- Featured archive content

### 5.2 Link anchor text

Anchor text matters for SEO. Default rules:

- Always use the entity's name as the anchor when linking to its profile (e.g., link "Counter-Strike 2" not "this game")
- Avoid generic anchors ("click here", "learn more") on high-value internal links
- For category links, use descriptive anchors ("More MMO PvP games" not "More")
- For tournament links, include the year ("ESL Pro League S22" not just "ESL Pro League")

### 5.3 Linking density audit

Add `npm run audit-links` (new script) that walks all generated pages and reports:

- Pages with fewer than 3 internal links (flag as under-linked)
- Pages with more than 100 internal links (flag as potentially over-linked)
- Orphan pages (pages with zero inbound links from other pages); these don't pass link equity and may not be discovered
- Broken internal links (404 targets)

## 6. Sitemap and robots

Existing `sitemap.ts` and `robots.ts` are functional. Extensions:

### 6.1 Sitemap structure improvements

Update `sitemap.ts` to:

- Pull `lastModified` from each entity's `last_updated` or `updated` frontmatter field instead of using `now` for everything. Stale pages should report stale lastmod; updated pages should report fresh. Google uses lastmod to prioritize crawl.
- Add `priority` differentiation: home (1.0), trending games (0.9), other games (0.7), trending or live tournaments (0.9), upcoming tournaments (0.8), completed tournaments (0.5), esports orgs (0.75), guilds (0.6), news articles (descend by date), archive stories (0.6), index pages (0.85 to 0.9).

### 6.2 News sitemap

Add a separate news-specific sitemap at `/sitemap-news.xml` for Google News inclusion. News sitemap requirements:

- Only includes URLs published in the last 48 hours
- Each entry includes `news:publication`, `news:publication_date`, `news:title`
- Updated whenever news content changes
- Referenced from `robots.txt` alongside the main sitemap

Implement via a new `src/app/sitemap-news.xml/route.ts` that filters articles by `published >= now - 48h`.

### 6.3 Sitemap index (optional)

If total URLs exceed 5000, split into multiple sitemap files and add `sitemap.xml` as an index pointing to:

- `sitemap-games.xml`
- `sitemap-esports.xml`
- `sitemap-guilds.xml`
- `sitemap-archive.xml`
- `sitemap-news.xml`

PVPWire is currently around 215 URLs. Sitemap index is not yet needed but worth specifying for the next time the catalog or tournament archive crosses 5000.

### 6.4 robots.txt updates

Existing `robots.ts` is fine. One addition: allow Google News crawler explicitly.

```ts
return {
  rules: [
    { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] },
    { userAgent: 'Googlebot-News', allow: '/news/' },
  ],
  sitemap: ['https://pvpwire.com/sitemap.xml', 'https://pvpwire.com/sitemap-news.xml'],
  host: 'https://pvpwire.com',
};
```

### 6.5 llms.txt

Existing `llms.txt` is good per pivot. Audit at launch to ensure it lists the v2 surfaces (Games, Esports, News, Archive) and current RSS feeds. AI agents are first-class readers and should not have to re-derive the structure.

## 7. Open Graph image strategy

Currently no per-page OG images are generated; pages inherit the site default. This is a major SEO and social-share gap.

### 7.1 Static fallback (immediate)

Create a single 1200x630 site-default OG image at `/public/og-default.png`. Reference in `layout.tsx` `metadata.openGraph.images`. Used as fallback for any page without a specific OG.

### 7.2 Per-page OG (priority order)

Implement page-specific OG images in this priority order:

1. **Game profiles**: use the existing `cover` or `hero_image` field. If the asset exists, render at 1200x630 with the game name and category overlaid in PVPWire branding. If no hero, use the site default.
2. **Tournament pages**: hero image with tournament name and date overlaid.
3. **Esports org profiles**: org logo on a branded background card.
4. **News articles**: article hero image.
5. **Archive stories**: story hero image.
6. **Guild profiles**: deferred (no consistent visual asset; site default is fine for v1).

### 7.3 OG image generation

Two implementation options:

**Option A (recommended): static pre-rendering.** During build, pre-generate OG images for every page using a Node script (`scripts/build-og-images.mjs`) that:

- Reads each entity's frontmatter
- Composites the entity's hero/logo onto a branded background using `sharp` or `@napi-rs/canvas`
- Writes to `/public/og/{entity-type}/{slug}.png`
- Each page's `generateMetadata()` references the matching path

**Option B: dynamic via Cloudflare Worker.** Worker route `/og/:type/:slug` returns a PNG generated on demand using `@vercel/og` or similar. Caching via Cloudflare edge. More flexible but adds Worker complexity and is unnecessary for static content.

Recommendation: Option A. Static export is the project's pattern; adding a Worker dependency for OG images is overkill.

### 7.4 Twitter card images

Twitter Card images use the same OG image. No separate generation needed. Twitter respects the `og:image` if `twitter:image` is not specified, but explicit `twitter:image` in `metadata.twitter.images` is cleaner.

## 8. Image optimization

### 8.1 Alt text

Every `<img>` (or `<Image>` from `next/image`) must have a descriptive `alt` attribute. Audit:

- Game cover images: `alt={\`${game.name} cover image\`}` or `alt={\`${game.name} hero\`}` (descriptive; do not stuff keywords)
- Org logos: `alt={\`${org.name} logo\`}`
- Tournament heroes: `alt={\`${tournament.name} ${year} hero\`}`
- News article heroes: `alt` from `hero_image_alt` frontmatter field (add if not present)
- Decorative images (backgrounds, dividers): `alt=""` is correct (signals decorative to screen readers and Google)

### 8.2 Image formats

Static export supports `next/image` only with `unoptimized: true` (already set in `next.config.mjs`). Without runtime optimization, images must be pre-sized. Recommendation:

- Hero images at 1200 wide, served as WebP with PNG fallback
- Cover images at 600 wide
- Org logos at 256 wide, prefer SVG when available
- Background art: WebP or AVIF, served at appropriate sizes for desktop and mobile

Add `scripts/optimize-images.mjs` that runs at build time and produces optimized versions of every image in `/public/images/`. Source asset preserved alongside the optimized variant.

### 8.3 Lazy loading

`next/image` lazy-loads by default below the fold. Hero images above the fold should set `priority` to true. Specifically:

- Home page Hot Now rail first card: priority
- Game profile hero: priority
- Tournament profile hero: priority
- Org profile logo: priority
- News article hero: priority

Below-fold images stay default (lazy).

## 9. Core Web Vitals

The static export and Cloudflare Pages CDN handle most performance basics. Specific targets and audits:

### 9.1 Targets

- LCP (Largest Contentful Paint): under 2.5s on 75% of page loads
- CLS (Cumulative Layout Shift): under 0.1
- INP (Interaction to Next Paint): under 200ms

### 9.2 Common gotchas to audit

- Font loading: Google Fonts via `next/font` is already in `layout.tsx`. Verify `display: 'swap'` is set (it is). No FOIT.
- Layout shift on hero images: every hero image must have explicit `width` and `height` props or use `next/image` with `sizes` to reserve space.
- JS bundle size: client components should be minimal. Audit with `next build` output. Anything over 100kb per page bundle warrants review.
- Third-party scripts: AdSense (deferred), analytics (TBD). When added, use `next/script` with `strategy="lazyOnload"` or `afterInteractive`.

### 9.3 Lighthouse pass

Pre-launch: run Lighthouse on at least one page per type. Capture screenshots of scores for each. Address any below-90 score before launch.

## 10. Content SEO patterns

### 10.1 Heading hierarchy

Every page has exactly one `<h1>`. Heading hierarchy is strict:

- Game profile h1: game name (without "PvP" suffix; that's in the title tag)
- Esports org profile h1: org name
- Tournament profile h1: tournament name and year
- Guild profile h1: guild name
- News article h1: article headline
- Archive story h1: story title
- Index pages h1: surface name (e.g., "Games", "Esports")
- Home h1: not visible but should exist (use the lede band heading and mark as h1)

H2 within page bodies: section dividers (e.g., "Notable members", "Notable moments", "Related guilds"). H3 for sub-sections.

Audit: walk through one page per type and verify hierarchy. CC's `getAllX()` helpers and templated components make this consistent across all dynamic pages.

### 10.2 Word count guidance

Per page type:

- Game profile: 300 to 800 words in the body. Existing entries are 100 to 250. Top 25 active games should be expanded to 500+ words during SEO content pass.
- Esports org profile: 200 to 500 words.
- Tournament profile: 200 to 400 words pre-event, expanded with results post-event.
- Guild profile: 400 to 1500 words. Existing profiles are mostly in this range.
- News article: variable, follows news pattern.
- Archive story: 800 to 3500 words (existing pieces are in this range from v1).
- Hub pages (Section 11): 800 to 1500 words minimum.

Word count is not a goal in itself; substantive content is. But pages under 200 words rarely rank.

### 10.3 Keyword targeting per page

Each page should target one primary keyword and 2 to 4 secondary keywords. Examples by page type:

- Game profile: primary = "{Game Name} PvP" or "{Game Name} competitive". Secondary = "{Game Name} esports", "{Game Name} ranked", "is {Game Name} PvP", "{Game Name} PvP modes".
- Esports org: primary = "{Org Name} esports". Secondary = "{Org Name} roster", "{Org Name} {primary game}", "{Org Name} tournaments".
- Tournament: primary = "{Tournament Name} {Year}". Secondary = "{Tournament Name} schedule", "{Tournament Name} bracket", "{Tournament Name} results".
- Guild: primary = "{Guild Name} guild". Secondary = "{Guild Name} {primary game}", "{Game} guilds", "{Game} guild history".
- News article: primary keyword from article topic.

Keywords belong in: title (front-loaded), meta description, h1, first paragraph, image alt text, and naturally in the body. Do not stuff. Google penalizes density anomalies.

## 11. Hub and cluster strategy (new pages)

Hub pages target high-volume keyword clusters that don't map cleanly to a single game, org, or tournament. They're pillar content that links out to relevant catalog entries and earns SEO authority.

Recommended hub pages for v1.1 (post-launch):

- **`/hubs/best-pvp-games-2026/`**: pillar targeting "best PvP games 2026", "top competitive games 2026". Editorial intro + ranked list of top 15 active games + auto-list of all active titles by category.
- **`/hubs/best-mmo-pvp/`**: pillar targeting "best MMO PvP", "MMO PvP games". Intro + active MMO PvP titles + heritage MMO PvP overview.
- **`/hubs/extraction-shooters/`**: pillar targeting "extraction shooters", "best extraction shooters 2026". Intro + active extraction titles + scene state.
- **`/hubs/competitive-fighting-games/`**: pillar targeting fighting game scene.
- **`/hubs/battle-royale-rankings/`**: pillar targeting BR scene.
- **`/hubs/upcoming-pvp-games/`**: pillar targeting "upcoming PvP games", "new PvP games 2026 2027". Editorial-curated list of upcoming releases.

Each hub:

- Hand-written editorial intro (300 to 500 words)
- Hand-curated top 10 to 15 entries with one-line takes
- Auto-list of all matching catalog entries below the hand-curated section
- Cross-links to relevant esports orgs, tournaments, guilds where applicable
- Standard SEO metadata, JSON-LD `CollectionPage` with `ItemList`

Schema for hub frontmatter (proposed `HubFrontmatter` for `/content/hubs/{slug}.mdx`):

```ts
interface HubFrontmatter {
  slug: string;
  title: string;
  description: string;
  hero_image?: string;
  filter: {                          // matches against catalog entries
    category?: GameCategory | GameCategory[];
    status?: GameStatus | GameStatus[];
    sub_categories?: string[];
    tags?: string[];
  };
  curated_slugs: string[];           // hand-picked top entries, in display order
  related_orgs?: string[];
  related_tournaments?: string[];
  last_updated: string;
}
```

Hub pages are deferred. Not blocking launch. Worth spec'ing now so CC knows the shape when they get to it.

## 12. URL conventions

- All URLs lowercase
- Words separated by hyphens, not underscores
- Trailing slash present (matches `next.config.mjs`)
- No file extensions in URLs (`.html`, `.php` are forbidden)
- Slugs match entity name with hyphens replacing spaces and special characters stripped
- Year suffixes on tournaments: `cs-spring-major-2026` not `cs-major-spring-2026` (year always at end)

URL audit: run `npm run audit-urls` (new) that walks all generated pages and reports any URL not matching the convention.

## 13. Verification and tooling

### 13.1 New scripts to add

- `npm run validate-schema`: runs JSON-LD validation across generated pages.
- `npm run audit-links`: internal link density audit per Section 5.3.
- `npm run audit-urls`: URL convention audit per Section 12.
- `npm run audit-meta`: walks every page and reports any missing title, description, OG image, canonical. Flags duplicates across pages.
- `npm run lighthouse`: runs Lighthouse against a local build of representative pages, logs scores.

### 13.2 Pre-launch verification checklist

- [ ] `npm run typecheck` clean
- [ ] `npm run scan-emdash` clean
- [ ] `npm run scan-secrets` clean
- [ ] `npm run validate-schema` clean
- [ ] `npm run audit-links` reports zero broken links and fewer than 5 orphan pages
- [ ] `npm run audit-urls` clean
- [ ] `npm run audit-meta` reports zero missing fields, zero duplicates
- [ ] `npm run lighthouse` reports 90+ on Performance, 95+ on SEO, 95+ on Accessibility for at least 5 representative pages
- [ ] Google Rich Results Test passes on at least one URL per page type
- [ ] Sitemap submitted to Google Search Console
- [ ] Sitemap submitted to Bing Webmaster Tools
- [ ] Site verified in Search Console (DNS or HTML file method)
- [ ] News sitemap submitted to Google News Publisher Center

### 13.3 Post-launch monitoring

Weekly check, first 90 days:

- Search Console Coverage report: any pages excluded? Why?
- Search Console Enhancements report: structured data errors?
- Search Console Performance report: queries, impressions, CTR by page
- Bing Webmaster equivalent reports
- Core Web Vitals real-user metrics via Search Console or Cloudflare Analytics

## 14. Migration order for CC

Each step is a separate commit. Each step leaves the site buildable.

**Step 1: Per-page metadata generation.**
- Add `generateMetadata()` to every dynamic route page.tsx that has a `[slug]` segment: `/games/[slug]/page.tsx`, `/esports/orgs/[slug]/page.tsx`, `/esports/[slug]/page.tsx`, `/guilds/[slug]/page.tsx`, `/archive/[slug]/page.tsx`, `/news/[slug]/page.tsx`.
- Each function returns `Metadata` with `title`, `description`, `openGraph`, `twitter`, `alternates.canonical` derived from the entity frontmatter per Section 3.
- Add per-page `metadata` exports to all static index pages: `/games/page.tsx`, `/esports/page.tsx`, `/esports/calendar/page.tsx`, `/esports/orgs/page.tsx`, `/news/page.tsx`, `/archive/page.tsx`, `/guilds/page.tsx`, `/about/page.tsx`, `/submit/page.tsx`, `/guilds/submit/page.tsx`.

**Step 2: JSON-LD audit and extension.**
- Create `src/lib/jsonld.ts` with typed builders for each schema type (using `schema-dts` or hand-rolled).
- Audit existing JSON-LD blocks on the six dynamic page types per Section 4.2 field requirements. Add missing fields.
- Add `Organization` and `WebSite` JSON-LD to root `layout.tsx` per Section 4.1.
- Add `BreadcrumbList` JSON-LD to every dynamic page that doesn't have it.
- Add `CollectionPage` JSON-LD to all index pages.
- Add `npm run validate-schema` script (Section 13.1).

**Step 3: Sitemap and news sitemap.**
- Update `sitemap.ts` to pull `lastModified` from frontmatter `last_updated` or `updated` fields per Section 6.1.
- Differentiate `priority` per Section 6.1.
- Add `/sitemap-news.xml/route.ts` per Section 6.2.
- Update `robots.ts` with both sitemaps and Google News crawler rule per Section 6.4.

**Step 4: Open Graph image generation.**
- Add `/public/og-default.png` (1200x630) for sitewide fallback.
- Implement `scripts/build-og-images.mjs` per Section 7.3 Option A.
- Wire each `generateMetadata()` to reference the matching pre-generated image.
- Add as a `prebuild` step in `package.json`.

**Step 5: Image audit and alt text pass.**
- Audit every `<img>` and `<Image>` for alt text per Section 8.1.
- Add missing `hero_image_alt` field to news and archive frontmatter where needed.
- Verify hero images have explicit dimensions (no CLS).

**Step 6: Internal linking audit and density improvements.**
- Add `npm run audit-links` per Section 5.3.
- Walk pages with fewer than 3 internal links and add cross-references.
- Verify the cross-link patterns in Section 5.1 are present on each page type.

**Step 7: Heading hierarchy audit.**
- Walk one page per type and verify exactly one h1.
- Fix any nested or skipped heading levels.

**Step 8: Content expansion (editorial pass).**
- Founder editorial pass to expand top 25 active game profiles to 500+ words.
- Founder editorial pass on top 10 esports org profiles to 300+ words.
- Add `current_meta_note` and prose context where missing.

**Step 9: Verification scripts and Lighthouse pass.**
- Add the verification scripts from Section 13.1.
- Run all of them, fix issues until clean.
- Run Lighthouse on representative pages, capture scores, fix any sub-90 issues.

**Step 10: Search Console and Bing setup.**
- Verify domain in Google Search Console (DNS method preferred for static export).
- Submit sitemap.
- Submit news sitemap to Google News Publisher Center if applying for News inclusion.
- Verify in Bing Webmaster Tools, submit sitemap.

**Step 11: Hub pages (deferred to v1.1, not launch-blocking).**
- Implement `HubFrontmatter` schema per Section 11.
- Build `/content/hubs/` and `/hubs/[slug]/page.tsx`.
- Author 6 hub pages per Section 11.

Estimated total: 4 to 6 working days at single-engineer pace for Steps 1 through 10. Step 11 is a separate engagement.

## 15. Carried-over decisions and open questions

Carried over from prior PM work:

- Domain: pvpwire.com
- Trailing slash convention: yes (per `next.config.mjs`)
- Canonical URL pattern: `https://pvpwire.com/{path}/`
- Static export: yes (impacts OG image strategy and sitemap mechanics)
- AdSense placement: deferred (when added, JS strategy in `layout.tsx` matters for CWV)

Open questions for founder:

1. Analytics platform: Plausible (privacy-first, light), GA4 (industry standard, heavy), or none at v2.0 launch. Recommendation: Plausible. Cleaner CWV impact and respects PVPWire's positioning as a no-noise hub.
2. AdSense timing: launch with placeholders disabled, or apply during launch week. Recommendation: apply during launch week. AdSense approval can take weeks; starting early avoids being ad-empty post-launch.
3. Search Console verification method: DNS TXT or HTML file. Recommendation: DNS TXT (more permanent, doesn't depend on file existing).
4. Google News Publisher Center application: yes or skip. Recommendation: yes if news cadence holds at 2+ items per week post-launch. Otherwise skip to v2.1.
5. Hub pages: launch-blocking or post-launch. Recommendation: post-launch. Pillar content is a v1.1 add, not a launch dependency.
6. Schema validation tooling: `schema-dts` (TS types only, no runtime), `structured-data-testing-tool` (runtime, npm package), or custom script using Google's Rich Results Test API. Recommendation: `schema-dts` for build-time type safety plus a manual Rich Results Test pass at launch.

## 16. End

This is the SEO spec. Steps 1 through 10 of Section 14 are launch-blocking. Step 11 (hub pages) is a v1.1 follow-up.

The site has a strong baseline already shipped. The work below is the depth: per-page uniqueness, structured data quality, internal linking density, OG image generation, and verification tooling. Done correctly, PVPWire launches with the SEO infrastructure of a publication that takes Google seriously, in a keyword space (cross-genre PvP and esports) that nobody currently owns.

Built by Pizza Robot Studios. Quality over quantity, always.
