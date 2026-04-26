// Custom SVG icons. Per Pizza Robot Studios spec: NO generic emojis in UI.
// Every icon is a stroke-based SVG, monochrome by default, color via currentColor.

import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 20, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const MenuIcon = (p: IconProps) => (
  <Icon {...p}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </Icon>
);

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </Icon>
);

export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.5" y2="16.5" />
  </Icon>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </Icon>
);

export const ExternalLinkIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14 4h6v6" />
    <line x1="20" y1="4" x2="10" y2="14" />
    <path d="M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6" />
  </Icon>
);

export const RssIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 11a9 9 0 0 1 9 9" />
    <path d="M4 4a16 16 0 0 1 16 16" />
    <circle cx="5" cy="19" r="1" />
  </Icon>
);

// Catalog category glyphs. All custom, no emoji.
// Each represents a competitive game category: tower for MMO, lattice for MOBA, etc.
export const CategoryGlyph = ({ category, ...p }: IconProps & { category: string }) => {
  const slug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  switch (slug) {
    case 'mmo-pvp':
      return (
        <Icon {...p}>
          <rect x="4" y="10" width="16" height="10" />
          <polygon points="4 10 12 4 20 10" />
          <line x1="9" y1="14" x2="9" y2="20" />
          <line x1="15" y1="14" x2="15" y2="20" />
        </Icon>
      );
    case 'moba':
      return (
        <Icon {...p}>
          <circle cx="12" cy="12" r="3" />
          <line x1="12" y1="3" x2="12" y2="9" />
          <line x1="12" y1="15" x2="12" y2="21" />
          <line x1="3" y1="12" x2="9" y2="12" />
          <line x1="15" y1="12" x2="21" y2="12" />
        </Icon>
      );
    case 'fps-tactical-shooter':
    case 'fps':
      return (
        <Icon {...p}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="3" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="21" />
          <line x1="3" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="21" y2="12" />
        </Icon>
      );
    case 'battle-royale':
      return (
        <Icon {...p}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </Icon>
      );
    case 'extraction-shooter':
      return (
        <Icon {...p}>
          <rect x="4" y="6" width="16" height="12" />
          <polyline points="9 12 12 15 15 12" />
          <line x1="12" y1="6" x2="12" y2="15" />
        </Icon>
      );
    case 'fighting-game':
      return (
        <Icon {...p}>
          <line x1="4" y1="4" x2="14" y2="14" />
          <line x1="20" y1="4" x2="10" y2="14" />
          <path d="M14 14 l2 2 -1.5 1.5 -2 -2" />
          <path d="M10 14 l-2 2 1.5 1.5 2 -2" />
          <line x1="3" y1="3" x2="5" y2="5" />
          <line x1="21" y1="3" x2="19" y2="5" />
        </Icon>
      );
    case 'strategy-chess-card':
      return (
        <Icon {...p}>
          <path d="M8 4 L 8 7 L 6 7 L 6 9 L 8 9 L 8 11 L 6 11 L 6 13 L 16 13 L 16 11 L 18 11 L 18 9 L 16 9 L 16 7 L 18 7 L 18 4 L 14 4 L 14 6 L 12 6 L 12 4 L 10 4 L 10 6 L 8 6 Z" />
          <path d="M5 13 L 5 18 L 19 18 L 19 13" />
          <line x1="4" y1="20" x2="20" y2="20" />
        </Icon>
      );
    case 'arena-class-based-pvp':
      return (
        <Icon {...p}>
          <path d="M12 3 L 19 5 L 19 12 C 19 16, 16 19, 12 21 C 8 19, 5 16, 5 12 L 5 5 Z" />
          <line x1="12" y1="3" x2="12" y2="21" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </Icon>
      );
    case 'sandbox-open-world-pvp':
      return (
        <Icon {...p}>
          <circle cx="12" cy="12" r="9" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0 -18" />
        </Icon>
      );
    case 'racing':
      return (
        <Icon {...p}>
          <path d="M3 17l4-7 5 1 5-3 4 4" />
          <circle cx="7" cy="19" r="2" />
          <circle cx="17" cy="19" r="2" />
        </Icon>
      );
    case 'hero-shooter':
      return (
        <Icon {...p}>
          <circle cx="12" cy="8" r="4" />
          <path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
        </Icon>
      );
    case 'movement-shooter-quake-lineage':
    case 'movement-shooter':
      return (
        <Icon {...p}>
          <polyline points="3 18 8 8 13 14 21 4" />
          <polyline points="15 4 21 4 21 10" />
        </Icon>
      );
    case 'auto-battler-tactics':
      return (
        <Icon {...p}>
          <rect x="4" y="4" width="6" height="6" />
          <rect x="14" y="4" width="6" height="6" />
          <rect x="4" y="14" width="6" height="6" />
          <rect x="14" y="14" width="6" height="6" />
        </Icon>
      );
    default:
      return (
        <Icon {...p}>
          <circle cx="12" cy="12" r="9" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="12" y1="8" x2="12" y2="16" />
        </Icon>
      );
  }
};

export const TimelineIcon = (p: IconProps) => (
  <Icon {...p}>
    <line x1="3" y1="12" x2="21" y2="12" />
    <circle cx="6" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="18" cy="12" r="2" />
  </Icon>
);

export const NetworkIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="6" cy="6" r="2" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="18" r="2" />
    <circle cx="12" cy="12" r="2" />
    <line x1="7.5" y1="7.5" x2="10.5" y2="10.5" />
    <line x1="16.5" y1="7.5" x2="13.5" y2="10.5" />
    <line x1="7.5" y1="16.5" x2="10.5" y2="13.5" />
    <line x1="16.5" y1="16.5" x2="13.5" y2="13.5" />
  </Icon>
);

export const FilterIcon = (p: IconProps) => (
  <Icon {...p}>
    <polygon points="3 4 21 4 14 13 14 20 10 20 10 13" />
  </Icon>
);

export const FlosiumGlyph = (p: IconProps) => (
  <Icon {...p}>
    <polygon points="12 3 21 8 21 16 12 21 3 16 3 8" />
    <polyline points="12 3 12 12 21 8" />
    <line x1="12" y1="12" x2="3" y2="8" />
    <line x1="12" y1="12" x2="12" y2="21" />
  </Icon>
);

export const OgGlyph = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="12" r="0.5" fill="currentColor" />
  </Icon>
);

export const FlipperGlyph = (p: IconProps) => (
  <Icon {...p}>
    <line x1="4" y1="12" x2="20" y2="12" />
    <polyline points="8 6 4 12 8 18" />
    <polyline points="16 6 20 12 16 18" />
  </Icon>
);
