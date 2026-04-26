import type { Env, SubmissionRecord } from './types';

interface SubmissionInput {
  guild_name?: unknown;
  aliases?: unknown;
  games?: unknown;
  era_start?: unknown;
  era_end?: unknown;
  submitter_handle?: unknown;
  submitter_email?: unknown;
  intent?: unknown;
  body?: unknown;
  sources?: unknown;
  turnstile_token?: unknown;
  honeypot?: unknown;
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
    const json = (await res.json()) as { success: boolean };
    return !!json.success;
  } catch {
    return false;
  }
}

export async function handleSubmission(req: Request, env: Env): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  let input: SubmissionInput;
  try {
    input = await req.json();
  } catch {
    return json({ error: 'invalid json' }, 400);
  }

  // Honeypot: any value submitted means bot.
  if (input.honeypot) return json({ ok: true, queued: false }, 200);

  const guildName = asStr(input.guild_name);
  const body = asStr(input.body, MAX_BODY_CHARS);
  const intentStr = asStr(input.intent);
  const allowedIntents = ['new', 'edit', 'memory', 'correction'] as const;
  const intent = allowedIntents.find((i) => i === intentStr);

  if (!guildName || !body || !intent) {
    return json({ error: 'missing required fields (guild_name, body, intent)' }, 400);
  }

  const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
  const turnstile = asStr(input.turnstile_token);
  if (env.TURNSTILE_SECRET) {
    if (!turnstile) return json({ error: 'turnstile required' }, 400);
    const ok = await verifyTurnstile(turnstile, env.TURNSTILE_SECRET, ip);
    if (!ok) return json({ error: 'turnstile failed' }, 400);
  }

  const id = crypto.randomUUID();
  const record: SubmissionRecord = {
    id,
    guild_name: guildName,
    aliases: asStr(input.aliases),
    games: asStr(input.games),
    era_start: asStr(input.era_start, 16),
    era_end: asStr(input.era_end, 16),
    submitter_handle: asStr(input.submitter_handle, 64),
    submitter_email: asStr(input.submitter_email, 200),
    intent,
    body,
    sources: asStr(input.sources, 2000),
    submitted_at: new Date().toISOString(),
    ip_hash: await ipHash(ip),
    status: 'pending',
  };

  await env.SUBMISSIONS.put(`submissions:queue:${id}`, JSON.stringify(record), {
    metadata: { status: 'pending', submitted_at: record.submitted_at },
  });

  return json({ ok: true, queued: true, id }, 201);
}

export async function listSubmissions(env: Env): Promise<Response> {
  const list = await env.SUBMISSIONS.list({ prefix: 'submissions:queue:' });
  const records: SubmissionRecord[] = [];
  for (const key of list.keys) {
    const value = await env.SUBMISSIONS.get(key.name);
    if (value) {
      try {
        records.push(JSON.parse(value));
      } catch {
        // skip malformed
      }
    }
  }
  records.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  return json({ records }, 200);
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
