'use client';

import { useState } from 'react';
import { ArrowRightIcon } from '@/components/icons';

const SUBMIT_API = process.env.NEXT_PUBLIC_SUBMIT_API ?? 'https://pvpwire-api.workers.dev/api/submit-guild';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function GuildSubmitForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload: Record<string, unknown> = {};
    data.forEach((v, k) => {
      payload[k] = v;
    });

    try {
      const res = await fetch(SUBMIT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErrorMsg((j as any).error || `Submit failed (${res.status}).`);
        setStatus('error');
        return;
      }
      setStatus('success');
      form.reset();
    } catch (e) {
      setErrorMsg(String(e));
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="border border-accent/40 bg-accent/5 p-8">
        <div className="font-mono text-[11px] uppercase tracking-widest text-accent mb-2">Submitted</div>
        <h2 className="masthead-title text-2xl text-ink mb-3">Thanks. The desk will review it.</h2>
        <p className="font-serif text-base text-ink/80">
          Submissions are reviewed weekly. Approved entries appear in the guilds tab without further notice. If you left an email and the editor needs a clarification, you may hear back.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-4 font-mono text-[11px] uppercase tracking-widest text-accent hover:text-ink inline-flex items-center gap-1"
        >
          Submit another <ArrowRightIcon size={12} />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Honeypot. Hidden from real users via tailwind, bots see and fill it. */}
      <input
        type="text"
        name="honeypot"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] w-px h-px opacity-0"
      />

      <Field label="Guild name" name="guild_name" required placeholder="e.g. Bloodwinter Clan" />
      <Field label="Aliases" name="aliases" placeholder="comma separated, e.g. BWC" />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Game(s) and server(s)" name="games" placeholder="DAoC Merlin, Albion EU" />
        <Field label="Era active" name="era_start" placeholder="2002 - 2008" />
      </div>

      <SelectField
        label="What are you contributing"
        name="intent"
        required
        options={[
          { value: 'new', label: 'New guild profile' },
          { value: 'edit', label: 'Edit an existing profile' },
          { value: 'memory', label: 'A memory or moment' },
          { value: 'correction', label: 'A correction' },
        ]}
      />

      <TextareaField
        label="Body"
        name="body"
        required
        rows={10}
        placeholder="Tell us what happened. Specifics over generalizations. Patches, dates, named events. We will edit for clarity, not for opinion."
      />

      <Field label="Sources or citations (optional)" name="sources" placeholder="Forum links, wiki pages, screenshots, archived posts" />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Your handle (optional)" name="submitter_handle" placeholder="How would you like to be credited" />
        <Field label="Your email (optional, never shown)" name="submitter_email" type="email" placeholder="In case the editor needs to follow up" />
      </div>

      {errorMsg && (
        <div className="border border-accent bg-accent/5 p-3 font-serif text-base text-accent">{errorMsg}</div>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="bg-ink text-paper px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-accent transition disabled:opacity-50"
      >
        {status === 'submitting' ? 'Submitting...' : 'Submit to editorial'}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
  type = 'text',
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted block mb-1">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-ink/20 bg-paper font-serif text-base focus:outline-none focus:border-accent"
      />
    </label>
  );
}

function TextareaField({
  label,
  name,
  required,
  placeholder,
  rows = 6,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted block mb-1">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      <textarea
        name={name}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-ink/20 bg-paper font-serif text-base focus:outline-none focus:border-accent leading-relaxed"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  required,
  options,
}: {
  label: string;
  name: string;
  required?: boolean;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted block mb-1">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      <select
        name={name}
        required={required}
        defaultValue=""
        className="w-full px-3 py-2 border border-ink/20 bg-paper font-serif text-base focus:outline-none focus:border-accent"
      >
        <option value="" disabled>Pick one</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
