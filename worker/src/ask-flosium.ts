import type { Env } from './types';
import { FLOSIUM_SYSTEM_PROMPT } from './flosium-prompt';

const RATE_LIMIT_PER_HOUR = 10;
const RATE_WINDOW_SECONDS = 60 * 60;
const MAX_INPUT_CHARS = 1500;
const MODEL = '@cf/meta/llama-3.1-8b-instruct';

interface AskInput {
  question?: unknown;
  history?: unknown;
}

interface HistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

function safeQuestion(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, MAX_INPUT_CHARS);
}

function safeHistory(v: unknown): HistoryEntry[] {
  if (!Array.isArray(v)) return [];
  const out: HistoryEntry[] = [];
  for (const entry of v.slice(-6)) {
    if (entry && typeof entry === 'object') {
      const role = (entry as any).role;
      const content = (entry as any).content;
      if ((role === 'user' || role === 'assistant') && typeof content === 'string') {
        out.push({ role, content: content.slice(0, MAX_INPUT_CHARS) });
      }
    }
  }
  return out;
}

async function checkRate(env: Env, ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const key = `rate:askflosium:${ip}`;
  const current = await env.RATE_LIMIT.get(key);
  const count = current ? parseInt(current, 10) : 0;
  if (count >= RATE_LIMIT_PER_HOUR) return { allowed: false, remaining: 0 };
  await env.RATE_LIMIT.put(key, String(count + 1), { expirationTtl: RATE_WINDOW_SECONDS });
  return { allowed: true, remaining: RATE_LIMIT_PER_HOUR - count - 1 };
}

// Last-line scrub: replace any em or en dash the model produced with comma.
// Belt-and-suspenders against the locked system prompt.
// Unicode escapes used so this source file does not contain literal em dashes.
function stripEmDashes(s: string): string {
  return s.replace(/[\u2014\u2013]/g, ', ');
}

export async function handleAskFlosium(req: Request, env: Env): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors() });
  }
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  let input: AskInput;
  try {
    input = await req.json();
  } catch {
    return json({ error: 'invalid json' }, 400);
  }

  const question = safeQuestion(input.question);
  if (!question) return json({ error: 'question required' }, 400);

  const history = safeHistory(input.history);
  const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
  const rate = await checkRate(env, ip);
  if (!rate.allowed) {
    return json({ error: 'rate_limited', message: 'Flosium is taking a break. Try again in an hour.' }, 429);
  }

  const messages = [
    { role: 'system' as const, content: FLOSIUM_SYSTEM_PROMPT },
    ...history,
    { role: 'user' as const, content: question },
  ];

  try {
    const result = await env.AI.run(MODEL, {
      messages,
      max_tokens: 512,
      temperature: 0.7,
    });

    const raw = (result as any).response ?? '';
    const answer = stripEmDashes(String(raw)).trim();
    return json({ answer, remaining: rate.remaining }, 200);
  } catch (e) {
    return json({ error: 'inference_failed', message: 'Try again in a moment.' }, 502);
  }
}

function cors(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...cors(),
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
