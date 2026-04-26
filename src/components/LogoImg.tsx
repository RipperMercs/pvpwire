// Esports org logo with a clean text-mark fallback.
// When the org frontmatter includes a `logo` path, render the image at the
// requested size. When it does not, render the org name in a monospace plate
// so the layout stays solid even before logos land.

type Size = 'sm' | 'md' | 'lg';

const SIZE_PX: Record<Size, number> = {
  sm: 48,
  md: 72,
  lg: 120,
};

export function LogoImg({
  src,
  name,
  size = 'md',
  className = '',
}: {
  src?: string;
  name: string;
  size?: Size;
  className?: string;
}) {
  const px = SIZE_PX[size];
  if (src) {
    return (
      <div
        className={`relative shrink-0 surface border border-ink/15 ${className}`}
        style={{ width: px, height: px }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`${name} logo`}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-contain p-1.5"
        />
      </div>
    );
  }
  // Text-mark fallback. Compact, readable, never crops.
  const initials = name
    .replace(/[^A-Za-z0-9 ]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || name.slice(0, 2).toUpperCase();
  return (
    <div
      className={`shrink-0 surface border border-ink/15 flex items-center justify-center ${className}`}
      style={{ width: px, height: px }}
      aria-label={`${name} (logo unavailable)`}
    >
      <span className="font-mono text-accent font-semibold" style={{ fontSize: Math.round(px * 0.32) }}>
        {initials}
      </span>
    </div>
  );
}
