// Renders MDX/markdown article bodies as styled prose.
// At v1 we keep this dependency-light: paragraphs, headings, blockquotes,
// lists, code blocks, hr separators. No remote MDX components yet.

type Block =
  | { kind: 'p'; text: string }
  | { kind: 'h2'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'quote'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'hr' }
  | { kind: 'code'; lang: string; text: string };

function parseBlocks(md: string): Block[] {
  const lines = md.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({ kind: 'code', lang, text: buf.join('\n') });
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push({ kind: 'h2', text: line.slice(3).trim() });
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push({ kind: 'h3', text: line.slice(4).trim() });
      i++;
      continue;
    }
    if (line.startsWith('> ')) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        buf.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ kind: 'quote', text: buf.join(' ') });
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      blocks.push({ kind: 'ul', items });
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ kind: 'ol', items });
      continue;
    }
    if (/^---+$/.test(line.trim())) {
      blocks.push({ kind: 'hr' });
      i++;
      continue;
    }
    const buf: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !lines[i].startsWith('#') && !lines[i].startsWith('>') && !/^\s*[-*\d]/.test(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push({ kind: 'p', text: buf.join(' ') });
  }
  return blocks;
}

function renderInline(text: string): React.ReactNode {
  // Minimal inline: **bold**, *italic*, `code`, [link](url)
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  const patterns: { re: RegExp; render: (m: RegExpMatchArray) => React.ReactNode }[] = [
    { re: /\*\*([^*]+)\*\*/, render: (m) => <strong key={key++} className="font-bold">{m[1]}</strong> },
    { re: /\*([^*]+)\*/, render: (m) => <em key={key++} className="italic">{m[1]}</em> },
    { re: /`([^`]+)`/, render: (m) => <code key={key++} className="font-mono text-base bg-wash px-1.5 py-0.5">{m[1]}</code> },
    { re: /\[([^\]]+)\]\(([^)]+)\)/, render: (m) => (
      <a key={key++} href={m[2]} target={m[2].startsWith('http') ? '_blank' : undefined} rel={m[2].startsWith('http') ? 'noopener noreferrer' : undefined} className="text-accent underline underline-offset-2 hover:no-underline">{m[1]}</a>
    )},
  ];

  while (remaining.length > 0) {
    let earliest: { idx: number; match: RegExpMatchArray; pat: (typeof patterns)[number] } | null = null;
    for (const pat of patterns) {
      const m = remaining.match(pat.re);
      if (m && m.index !== undefined) {
        if (!earliest || m.index < earliest.idx) {
          earliest = { idx: m.index, match: m, pat };
        }
      }
    }
    if (!earliest) {
      parts.push(remaining);
      break;
    }
    if (earliest.idx > 0) parts.push(remaining.slice(0, earliest.idx));
    parts.push(earliest.pat.render(earliest.match));
    remaining = remaining.slice(earliest.idx + earliest.match[0].length);
  }
  return <>{parts}</>;
}

export function ArticleBody({ content, dropCap = true }: { content: string; dropCap?: boolean }) {
  const blocks = parseBlocks(content);
  return (
    <div className={`prose-editorial${dropCap ? ' drop-cap' : ''}`}>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case 'h2': return <h2 key={i}>{renderInline(b.text)}</h2>;
          case 'h3': return <h3 key={i}>{renderInline(b.text)}</h3>;
          case 'p': return <p key={i}>{renderInline(b.text)}</p>;
          case 'quote': return <blockquote key={i}>{renderInline(b.text)}</blockquote>;
          case 'ul': return <ul key={i}>{b.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}</ul>;
          case 'ol': return <ol key={i}>{b.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}</ol>;
          case 'hr': return <hr key={i} />;
          case 'code': return (
            <pre key={i} className="bg-ink text-paper p-4 my-6 overflow-x-auto font-mono text-sm">
              <code>{b.text}</code>
            </pre>
          );
        }
      })}
    </div>
  );
}
