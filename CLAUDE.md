# PVPWire CLAUDE.md

This is the project context for Claude Code. The single source of truth for active specifications is `PIVOT.md` at the repo root (v2.0 hard pivot, 2026-04-26). The legacy v1 spec lives at `docs/SPEC-v1.0.md` for historical reference; do not treat it as authoritative for new work.

## Project Overview

PVPWire is the hub for competitive PvP and esports. Catalog of every notable PvP game, esports calendar of tournaments and orgs, news aggregator, plus an archive surface for guild lineage and legacy editorial. Independent publication credited as "A Ripper project" in the footer only; do not surface a personal byline on bylines, the about page masthead, or article-level attribution. The publication-first framing dominates everything above the footer.

- Domain: pvpwire.com
- Stack: Next.js 14 (App Router) + Cloudflare Pages + Cloudflare Worker + KV
- Repo (official clone URL): https://github.com/RipperMercs/pvpwire.git
- GitHub: github.com/RipperMercs/pvpwire

## CRITICAL RULES (Override Anything Below)

### Writing rules
1. **NO em dashes anywhere.** Not in code, not in copy, not in articles, not in metadata, not in commit messages. Use commas, colons, semicolons, parentheses, or periods. Rewrite the sentence if needed.
2. **NO double-hyphens (`--`) as substitute em dashes.** Same rule, same scope.
3. **NO generic emojis in UI.** No game controller, no swords, no trophies, no fire. Custom SVG icons or text labels only. Emojis allowed only in deliberate X/social posts.
4. **No raw user text passed to any LLM.** Always structured JSON with locked system prompts. (Currently moot since Ask Flosium is removed; rule retained for any future AI feature.)

### Bylines (post v2 pivot)
- New content publishes under `editorial` only (renders as "PVPWire Editorial"). Do not surface a personal founder byline anywhere user-facing.
- The legacy `ripper` byline is preserved in the Author union for any pre-pivot MDX that already uses it, but `authorDisplay()` and the RSS author tag fold it into "PVPWire Editorial" so no public surface attributes content to a person.
- Legacy values `flosium`, `og`, `flipper` are valid only on grandfathered archive content (the 14 archived stories under `/content/archive/`). Do not generate new content under those bylines.
- Voice bibles for the retired personas live in `docs/voice-archive.md` for IP preservation only. They are not enforced on new content.

### Security
1. NEVER hardcode API keys as fallbacks. If env var missing, throw.
2. NEVER paste real keys into docs (use `<YOUR_KEY_HERE>`).
3. ALWAYS reference keys via `process.env` or Cloudflare Workers secrets.
4. ALWAYS verify `.gitignore` covers `.env`, `worker/.dev.vars`, `*.key`.
5. Pre-commit hook (`.husky/pre-commit`) blocks any staged content matching key patterns.

## Architecture

### Frontend
- Next.js 14 App Router, static export to Cloudflare Pages.
- Tailwind CSS only (no styled-components, no CSS modules).
- Content authored as MDX in `/content/{catalog,esports-orgs,tournaments,news,archive}/`. The `/content/archive/` tree contains both flat archived stories (with `original_section` provenance: legends, heritage, or vs-the-world) and a `/content/archive/guilds/` subdirectory with the 38 guild profiles.
- `gray-matter` parses frontmatter at build time. `next-mdx-remote` renders body content.

### Primary nav (5 tabs)
Home / Games / Esports / News / Archive. The Archive tab covers guild profiles and legacy editorial; v2.1+ scope adds curated viral gaming highlights to the same surface.

### API layer
Single Cloudflare Worker at `/worker/`. Routes:
- `GET /api/news` returns aggregated RSS results (KV-cached, 30 min cron).
- `GET /api/tournaments` returns the curated tournament calendar (proxies `public/tournaments.json`, KV-cached 1h).
- `GET /api/esports-news` returns a keyword-filtered subset of `/api/news`.
- `POST /api/submit-guild` writes to KV submission queue.
- `GET /api/admin/submissions` (Cloudflare Access protected) lists queue.

### Storage
Cloudflare KV. Namespaces:
- `NEWS_CACHE`: aggregated RSS feed dedup and TTL; also stores tournament JSON cache.
- `SUBMISSIONS`: `submissions:queue:{uuid}` records.
- `RATE_LIMIT`: X bot post-rate counter (was Ask Flosium, that consumer was removed in Step 3).
- `BOT_LOG`: X bot post history.

### AI
- No AI features in v2.0. Ask Flosium and the Workers AI binding were removed in Step 3. If a future feature needs an LLM, follow the same locked-system-prompt + structured JSON pattern.

### Auth
- v2: no user auth. Submission queue is anonymous, moderated.
- v3: guild claim via email magic link (deferred).
- Admin dashboard: Cloudflare Access (Ripper email only).

## Content Structure

```
/content
  /catalog/{slug}.mdx              game profiles
  /esports-orgs/{slug}.mdx         esports organization profiles
  /tournaments/{slug}.mdx          tournament profiles for the calendar
  /news/{slug}.mdx                 original PVPWire articles
  /archive/{slug}.mdx              legacy editorial stories (14 grandfathered: 8 legends, 4 heritage, 2 vs-the-world)
  /archive/guilds/{slug}.mdx       guild profiles (38)
```

Frontmatter schemas live in `src/lib/schemas.ts`. Validate at build time.

## Build Commands

- `npm run dev`: Next.js dev server (port 3000).
- `npm run build`: static export to `/out/`.
- `npm run worker:dev`: Wrangler dev for the Worker.
- `npm run scan-emdash`: greps every content file for em dashes and double-hyphens. Must pass before commit.
- `npm run scan-secrets`: greps for known API key patterns.
- `npm run typecheck`: `tsc --noEmit`.
- `npm run fetch-org-logos`: Wikipedia-based logo fetch for esports orgs (re-runnable; skips orgs that already have logos).
- `npm run build-tournaments-json`: regenerates `public/tournaments.json` from MDX.

## Deploy

- `main` push triggers Cloudflare Pages build via GitHub Actions.
- Worker deploys via `npm run worker:deploy`.

## Current State

The v2.0 hard pivot completed Steps 1 through 9 of the migration plan in PIVOT.md Section 20. Remaining: spec doc reconciliation (whether to fold PIVOT.md into a new SPEC.md is a founder call) and any v2.1 follow-ups (Twitch live integration on the Live and Hot rail, Steam current-player counts, weekly freshness sweep automation).

## Common Mistakes to Avoid

1. **Inserting em dashes.** Run `npm run scan-emdash` before any commit touching content.
2. **Hardcoded API keys** as fallbacks. Throw on missing env, never default.
3. **Reviving retired personas.** Do not author new content under Flosium, Og, or Flipper bylines. New content uses `editorial` or `ripper`.
4. **Emoji in UI components.** Use SVG icons in `src/components/icons.tsx` or text labels.
5. **Treating SPEC.md as authoritative.** v2 spec is `PIVOT.md`. The legacy v1 spec is preserved at `docs/SPEC-v1.0.md` for reference only.
6. **Adding Heritage / Legends / Ask Flosium routes back.** Those surfaces are deleted; the 12 legacy editorial pieces live at `/archive/[slug]` only.
