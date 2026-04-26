// Formatting helpers shared across pages.

export function formatDate(input: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...opts,
  }).format(d);
}

export function formatDateLong(input: string | Date): string {
  return formatDate(input, { month: 'long' });
}

export function formatYearRange(range: { start: number; end: number | 'active' }): string {
  if (range.end === 'active') return `${range.start}, active`;
  if (range.start === range.end) return `${range.start}`;
  return `${range.start} to ${range.end}`;
}

export function authorDisplay(author: 'flosium' | 'og' | 'flipper'): string {
  return author === 'flosium' ? 'Flosium' : author === 'og' ? 'Og' : 'Flipper';
}

// Map a guild status enum to its display label.
// "retired" becomes "Actively Retired" since that's the editorial framing the
// publication uses for guilds whose roster persists in adjacent scenes.
export function guildStatusDisplay(status: string): string {
  switch (status) {
    case 'retired':
      return 'Actively Retired';
    case 'dissolved':
      return 'Dissolved';
    case 'dormant':
      return 'Dormant';
    case 'reformed':
      return 'Reformed';
    case 'active':
      return 'Active';
    default:
      return status;
  }
}

export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 230));
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Strip MDX/markdown to a plain-text excerpt for cards and SEO descriptions.
export function excerpt(markdown: string, maxChars = 220): string {
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#+\s.*$/gm, '')
    .replace(/^\s*[-*>]\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (stripped.length <= maxChars) return stripped;
  return stripped.slice(0, maxChars).replace(/\s+\S*$/, '') + '...';
}
