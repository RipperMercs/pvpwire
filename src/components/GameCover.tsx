// Game cover art component.
// Renders the real image when cover_image is set, otherwise a tasteful
// procedural placeholder built from the category glyph and game name.
// Aspect ratio is 2:3 vertical (poster style) by default.

import type { GameFrontmatter } from '@/lib/schemas';
import { CategoryGlyph } from '@/components/icons';

const ERA_TINT: Record<string, string> = {
  active: 'rgb(196 158 84 / 0.18)',
  classic: 'rgb(70 100 160 / 0.22)',
  sunset: 'rgb(140 138 132 / 0.18)',
  upcoming: 'rgb(220 178 80 / 0.22)',
};

export function GameCover({
  game,
  variant = 'poster',
  className = '',
  priority = false,
}: {
  game: GameFrontmatter;
  variant?: 'poster' | 'hero' | 'square';
  className?: string;
  priority?: boolean;
}) {
  const aspect =
    variant === 'hero'
      ? 'aspect-[16/9]'
      : variant === 'square'
        ? 'aspect-square'
        : 'aspect-[2/3]';

  const src = variant === 'hero' ? game.hero_image || game.cover_image : game.cover_image || game.hero_image;

  if (src) {
    const fit = game.cover_fit === 'contain' ? 'object-contain' : 'object-cover';
    const position = game.cover_fit !== 'contain' && game.cover_position ? game.cover_position : undefined;
    return (
      <div className={`relative overflow-hidden surface ${aspect} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`${game.name} cover art`}
          loading={priority ? 'eager' : 'lazy'}
          className={`absolute inset-0 w-full h-full ${fit}`}
          style={position ? { objectPosition: position } : undefined}
        />
      </div>
    );
  }

  // Procedural placeholder. Looks intentional, not broken.
  const tint = ERA_TINT[game.status] ?? 'rgb(196 158 84 / 0.15)';
  return (
    <div
      className={`relative overflow-hidden surface ${aspect} ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle at 30% 20%, ${tint} 0%, transparent 60%), radial-gradient(circle at 70% 90%, rgb(188 56 50 / 0.12) 0%, transparent 50%)`,
      }}
      aria-label={`${game.name} placeholder art`}
    >
      {/* Decorative frame */}
      <div className="absolute inset-2 border border-signal/30" />
      <div className="absolute top-3 left-3 w-3 h-3 border-l border-t border-signal/70" />
      <div className="absolute top-3 right-3 w-3 h-3 border-r border-t border-signal/70" />
      <div className="absolute bottom-3 left-3 w-3 h-3 border-l border-b border-signal/70" />
      <div className="absolute bottom-3 right-3 w-3 h-3 border-r border-b border-signal/70" />

      {/* Category glyph as central motif */}
      <div className="absolute inset-0 flex items-center justify-center opacity-40">
        <CategoryGlyph category={game.category} size={variant === 'hero' ? 96 : 72} className="text-signal" />
      </div>

      {/* Title plate near bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
        <div className="font-mono text-[9px] uppercase tracking-widest text-signal/90 mb-1">
          {String(game.release_year)}
        </div>
        <div className="font-display text-lg font-bold text-paper leading-tight" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
          {game.name}
        </div>
      </div>

      {/* Status corner badge */}
      <div className="absolute top-2 right-2">
        <span className={`badge badge-${game.status}`}>{game.status}</span>
      </div>
    </div>
  );
}
