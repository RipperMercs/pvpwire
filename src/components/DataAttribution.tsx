// Inline attribution for third-party data sources (PIVOT.md Section 22.4 Step 7).
// Steam, IGDB, and PandaScore all require visible credit when their data is
// shown. Render this near any block that hydrates from those sources.

const SOURCE_LABELS: Record<string, { label: string; href: string }> = {
  steam: { label: 'Steam', href: 'https://store.steampowered.com/' },
  igdb: { label: 'IGDB', href: 'https://www.igdb.com/' },
  pandascore: { label: 'PandaScore', href: 'https://pandascore.co/' },
  twitch: { label: 'Twitch', href: 'https://www.twitch.tv/' },
  liquipedia: { label: 'Liquipedia (CC-BY-SA)', href: 'https://liquipedia.net/' },
};

export function DataAttribution({
  sources,
  className = '',
}: {
  sources: (keyof typeof SOURCE_LABELS)[];
  className?: string;
}) {
  if (sources.length === 0) return null;
  return (
    <div className={`font-mono text-[10px] uppercase tracking-widest text-muted ${className}`}>
      Data:{' '}
      {sources.map((s, i) => {
        const meta = SOURCE_LABELS[s];
        if (!meta) return null;
        return (
          <span key={s}>
            <a
              href={meta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent underline underline-offset-2"
            >
              {meta.label}
            </a>
            {i < sources.length - 1 ? ' / ' : ''}
          </span>
        );
      })}
    </div>
  );
}
