// Game submission handler. Mirror of submissions.ts but shaped around game
// metadata (name, developer, release, PvP modes, category) instead of guild
// fields. Same KV namespace; records carry kind: 'game' so the admin queue
// can split guild vs game vs (future) org / tournament submissions.

import type { Env } from './types';

interface GameSubmissionInput {
  game_name?: unknown;
  aliases?: unknown;
  developer?: unknown;
  publisher?: unknown;
  release_year?: unknown;
  category?: unknown;
  platforms?: unknown;
  pvp_modes?: unknown;
  status?: unknown;            // active / upcoming / classic / sunset
  official_url?: unknown;
  why_pvp?: unknown;           // body / pitch
  submitter_handle?: unknown;
  submitter_email?: unknown;
  sources?: unknown;
  turnstile_token?: unknown;
  honeypot?: unknown;
}

interface GameSubmissionRecord {
  kind: 'game';
  id: string;
  game_name: string;
  aliases?: string;
  developer?: string;
  publisher?: string;
  release_year?: string;
  category?: string;
  platforms?: string;
  pvp_modes?: string;
  status?: string;
  official_url?: string;
  why_pvp: string;
  sources?: string;
  submitter_handle?: string;
  submitter_email?: string;
  submitted_at: string;
  ip_hash?: string;
  queue_status: 'pending' | 'approved' | 'rejected';
}

const MAX_BODY_CHARS = 8000;

function asStr(v: unknown, max = 500): string | undefined {
  if (typeof v !== 'string') return undefined;
  const trimmed = v.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

async function ipHash(ip: string): Promise<string> {
  const enc = new TextEncoder().encode(ip + ':pvpwire');
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

async function verifyTurnstile(token: string, secret: string, ip: string): Promise<boolean> {
  try {
    const body = new FormData();
    body.append('secret', secret);
    body.append('response', token);
    body.append('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const result = (await res.json()) as { success: boolean };
    return !!result.success;
  } catch {
    return false;
  }
}

export async function handleGameSubmission(req: Request, env: Env): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  let input: GameSubmissionInput;
  try {
    input = await req.json();
  } catch {
    return json({ error: 'invalid json' }, 400);
  }

  if (input.honeypot) return json({ ok: true, queued: false }, 200);

  const gameName = asStr(input.game_name);
  const whyPvp = asStr(input.why_pvp, MAX_BODY_CHARS);
  if (!gameName || !whyPvp) {
    return json({ error: 'missing required fields (game_name, why_pvp)' }, 400);
  }

  const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
  const turnstile = asStr(input.turnstile_token);
  if (env.TURNSTILE_SECRET) {
    if (!turnstile) return json({ error: 'turnstile required' }, 400);
    const ok = await verifyTurnstile(turnstile, env.TURNSTILE_SECRET, ip);
    if (!ok) return json({ error: 'turnstile failed' }, 400);
  }

  const id = crypto.randomUUID();
  const record: GameSubmissionRecord = {
    kind: 'game',
    id,
    game_name: gameName,
    aliases: asStr(input.aliases),
    developer: asStr(input.developer, 200),
    publisher: asStr(input.publisher, 200),
    release_year: asStr(input.release_year, 16),
    category: asStr(input.category, 100),
    platforms: asStr(input.platforms, 200),
    pvp_modes: asStr(input.pvp_modes, 500),
    status: asStr(input.status, 32),
    official_url: asStr(input.official_url, 500),
    why_pvp: whyPvp,
    sources: asStr(input.sources, 2000),
    submitter_handle: asStr(input.submitter_handle, 64),
    submitter_email: asStr(input.submitter_email, 200),
    submitted_at: new Date().toISOString(),
    ip_hash: await ipHash(ip),
    queue_status: 'pending',
  };

  await env.SUBMISSIONS.put(`submissions:queue:game:${id}`, JSON.stringify(record), {
    metadata: { kind: 'game', status: 'pending', submitted_at: record.submitted_at },
  });

  return json({ ok: true, queued: true, id }, 201);
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    },
  });
}
