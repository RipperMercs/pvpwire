'use client';

import { useState, useRef, useEffect } from 'react';
import { FlosiumGlyph, ArrowRightIcon } from '@/components/icons';

const ASK_API = process.env.NEXT_PUBLIC_ASK_API ?? 'https://pvpwire-api.workers.dev/api/ask-flosium';

type Message = { role: 'user' | 'assistant'; content: string };

export function AskFlosiumChat({ starterQuestions }: { starterQuestions: string[] }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setError(null);
    const userMsg: Message = { role: 'user', content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(ASK_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg.content, history: messages }),
      });
      if (!res.ok) {
        if (res.status === 429) {
          setError('Rate limited. Flosium is taking a break. Try again in an hour.');
        } else {
          setError(`Request failed (${res.status}). Try again in a moment.`);
        }
        setLoading(false);
        return;
      }
      const data: { answer?: string; remaining?: number; error?: string } = await res.json();
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
      if (typeof data.remaining === 'number') setRemaining(data.remaining);
      if (data.answer) {
        setMessages((m) => [...m, { role: 'assistant', content: data.answer || '' }]);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="grid lg:grid-cols-[180px,1fr] gap-6">
      <aside className="hidden lg:flex flex-col items-start gap-3 sticky top-20 self-start">
        <div className="border-2 border-accent/40 bg-paper p-3">
          <FlosiumGlyph size={64} className="text-accent" />
        </div>
        <div className="font-mono text-[11px] uppercase tracking-widest text-accent">Flosium</div>
        <div className="font-serif text-sm text-ink/70 leading-snug">
          Retired guild leader. Critical by default. Praise when earned.
        </div>
      </aside>

      <div className="flex flex-col h-[640px] border border-ink/15 bg-paper">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div>
              <div className="font-serif text-lg text-ink/80 mb-4">
                Open with a question. The desk will respond.
              </div>
              <div className="grid gap-2">
                {starterQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="text-left border border-ink/20 px-3 py-2 font-serif text-base text-ink hover:border-accent hover:text-accent transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i}>
              <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-1">
                {m.role === 'user' ? 'You' : 'Flosium'}
              </div>
              <div
                className={`font-serif text-lg leading-relaxed whitespace-pre-wrap ${
                  m.role === 'assistant' ? 'text-ink' : 'text-ink/80'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-1">Flosium</div>
              <div className="font-serif text-lg text-muted italic">Thinking.</div>
            </div>
          )}

          {error && (
            <div className="border border-accent bg-accent/5 p-3 font-serif text-base text-accent">{error}</div>
          )}
        </div>

        <form onSubmit={onSubmit} className="border-t border-ink/15 p-4 flex gap-3 bg-paper">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Flosium a question"
            disabled={loading}
            className="flex-1 px-3 py-2 border border-ink/20 bg-paper font-serif text-base focus:outline-none focus:border-accent disabled:opacity-50"
            maxLength={1500}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-ink text-paper px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-accent transition disabled:opacity-50 inline-flex items-center gap-1"
          >
            Send <ArrowRightIcon size={14} />
          </button>
        </form>
        {remaining !== null && (
          <div className="border-t border-ink/15 px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted">
            {remaining} questions remaining this hour
          </div>
        )}
      </div>
    </div>
  );
}
