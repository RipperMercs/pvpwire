// Decorative components for the chronicle aesthetic.
// All purely visual. Do not use these for semantic content.

import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement> & { size?: number };

// Stylized fleuron (typographic ornament). Used between sections and inside
// ornament rules. Drawn from line strokes, no fill, scales cleanly.
export function Fleuron({ size = 18, ...props }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 4 C 9 7, 9 10, 12 12 C 15 10, 15 7, 12 4 Z" />
      <path d="M12 20 C 9 17, 9 14, 12 12 C 15 14, 15 17, 12 20 Z" />
      <path d="M4 12 C 7 9, 10 9, 12 12 C 10 15, 7 15, 4 12 Z" />
      <path d="M20 12 C 17 9, 14 9, 12 12 C 14 15, 17 15, 20 12 Z" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Crossed swords. Used as an editorial mark, not a generic icon.
export function CrossedSwords({ size = 18, ...props }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <line x1="3" y1="3" x2="14" y2="14" />
      <line x1="21" y1="3" x2="10" y2="14" />
      <path d="M14 14 l3 3 -2 2 -3 -3" />
      <path d="M10 14 l-3 3 2 2 3 -3" />
      <line x1="2" y1="2" x2="4" y2="4" />
      <line x1="22" y1="2" x2="20" y2="4" />
    </svg>
  );
}

export function HeraldicShield({ size = 18, ...props }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3 L20 5 L20 12 C 20 17, 16 20, 12 22 C 8 20, 4 17, 4 12 L 4 5 Z" />
      <line x1="12" y1="3" x2="12" y2="22" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </svg>
  );
}

export function Banner({ size = 18, ...props }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 3 H 19 V 17 L 12 14 L 5 17 Z" />
      <line x1="9" y1="3" x2="9" y2="14" />
      <line x1="15" y1="3" x2="15" y2="14" />
    </svg>
  );
}

export function Crown({ size = 18, ...props }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M3 18 L 5 8 L 9 12 L 12 6 L 15 12 L 19 8 L 21 18 Z" />
      <line x1="3" y1="20" x2="21" y2="20" />
      <circle cx="5" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="19" cy="8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Line, fleuron, line. Use between major page sections.
export function OrnamentRule({ className = '' }: { className?: string }) {
  return (
    <div className={`ornament-rule my-8 ${className}`} aria-hidden="true">
      <Fleuron size={20} className="text-signal" />
    </div>
  );
}

// Convert an integer to Roman numerals. Used in eyebrows and section heads
// for chronicle flavor. Falls back to the number for values out of range.
export function romanize(n: number): string {
  if (!Number.isFinite(n) || n <= 0 || n >= 4000) return String(n);
  const map: [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let value = Math.floor(n);
  let out = '';
  for (const [v, sym] of map) {
    while (value >= v) {
      out += sym;
      value -= v;
    }
  }
  return out;
}
