# PVPWire CLAUDE.md

> **Active spec: `PIVOT.md` (v2.0 hard pivot, 2026-04-26).**
> PIVOT.md at the repo root supersedes SPEC.md until Step 10 of the migration rolls it forward into a new SPEC.md. Read PIVOT.md before SPEC.md for any non-trivial work. SPEC.md still holds true for v1 history; anything it says about Heritage, Legends, Ask Flosium, the Flosium / Og / Flipper personas, or the home page composition is overridden by PIVOT.md.

This is the project context for Claude Code. The single source of truth for v1 specifications is `SPEC.md` at the repo root. PIVOT.md at the repo root holds the v2 hard-pivot direction and overrides SPEC.md where they conflict. Read PIVOT.md first, then SPEC.md, for any non-trivial work.

## Project Overview

PVPWire is an editorial hub and database for competitive gaming, spanning chess to MMO PvP to modern esports. A Flipper project, independent.

- Domain: pvpwire.com
- Stack: Next.js 14 (App Router) + Cloudflare Pages + Cloudflare Worker + KV
- Repo (official clone URL): https://github.com/RipperMercs/pvpwire.git
- GitHub: github.com/RipperMercs/pvpwire

## CRITICAL RULES (Override Anything Below)

### Writing rules
1. **NO em dashes anywhere.** Not in code, not in copy, not in articles, not in metadata, not in commit messages, not in AI prompts. Use commas, colons, semicolons, parentheses, or periods. Rewrite the sentence if needed.
2. **NO double-hyphens (`--`) as substitute em dashes.** Same rule, same scope.
3. **NO generic emojis in UI.** No game controller, no swords, no trophies, no fire. Custom SVG icons or text labels only. Emojis allowed only in deliberate X/social posts.
4. **No raw user text passed to Claude API.** Always structured JSON with locked system prompts.

### Persona voices are sacred
The voice bibles in `SPEC.md` Section 3 (Flosium, Og, Flipper) are authoritative. Future content generation under those bylines must reference them and the structural moves listed there. Voice drift across hundreds of articles is the failure mode the spec is designed to prevent.

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
- Content authored as MDX in `/content/{news,legends,heritage,catalog,guilds}/`.
- `gray-matter` parses frontmatter at build time. `next-mdx-remote` renders body content.

### API layer
Single Cloudflare Worker at `/worker/`. Routes:
- `GET /api/news` returns aggregated RSS results (KV-cached, 30 min cron).
- `POST /api/ask-flosium` runs Workers AI with locked system prompt.
- `POST /api/submit-guild` writes to KV submission queue.
- `GET /api/admin/submissions` (Cloudflare Access protected) lists queue.

### Storage
Cloudflare KV. Namespaces:
- `NEWS_CACHE`: aggregated RSS feed dedup and TTL.
- `SUBMISSIONS`: `submissions:queue:{uuid}` records.
- `RATE_LIMIT`: Ask Flosium per-IP counters.
- `BOT_LOG`: X bot post history.

### AI
- Ask Flosium chat: Cloudflare Workers AI free tier (Llama 3.1 8B Instruct).
- Original Flosium and Og articles: Anthropic API (Sonnet 4.7 or current). Structured JSON inputs only.

### Auth
- v1: no user auth. Submission queue is anonymous, moderated.
- v2: guild claim via email magic link.
- Admin dashboard: Cloudflare Access (Flipper email only).

## Content Structure

```
/content
  /catalog/{slug}.mdx       game profiles
  /guilds/{slug}.mdx        guild profiles with lineage references
  /news/{slug}.mdx          original Flosium / Og / Flipper bylines
  /legends/{slug}.mdx       prestige Flosium deep dives
  /heritage/{slug}.mdx      "From the Old World" columns
```

Frontmatter schemas live in `src/lib/schemas.ts`. Validate at build time.

## Build Commands

- `npm run dev`: Next.js dev server (port 3000).
- `npm run build`: static export to `/out/`.
- `npm run worker:dev`: Wrangler dev for the Worker.
- `npm run scan-emdash`: greps every content file for em dashes and double-hyphens. Must pass before launch.
- `npm run scan-secrets`: greps for known API key patterns.
- `npm run typecheck`: `tsc --noEmit`.

## Deploy

- `main` push triggers Cloudflare Pages build via GitHub Actions.
- Tuesday auto-rebuild cron refreshes catalog SEO signals (matches DraftCall).
- Worker deploys via `npm run worker:deploy` (manual at v1, automated at v1.1).

## Current State

See `SPEC.md` Section 14 for build phases. Active work tracked in tasks.

## Common Mistakes to Avoid

1. **Inserting em dashes.** Run `npm run scan-emdash` before any commit touching content.
2. **Hardcoded API keys** as fallbacks. Throw on missing env, never default.
3. **Raw user text into AI prompts.** Always structure as JSON with the system prompt locked server-side.
4. **Emoji in UI components.** Use SVG icons in `src/components/icons/` or text labels.
5. **Voice drift.** Check `SPEC.md` Section 3 voice bible before writing in Flosium or Og voice. The structural moves matter more than the content.
6. **Adding speculative features beyond v1.** v1 scope is locked. New ideas go to Section 15 (post-launch roadmap).
