'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3';
import type { GuildFrontmatter } from '@/lib/schemas';
import { TimelineIcon, NetworkIcon } from '@/components/icons';

type View = 'timeline' | 'network';

// Brighter palette for dark-theme readability. Each game gets a recognizable
// hue with enough saturation to read clearly on the dark surface.
const GAME_COLORS: Record<string, string> = {
  'asherons-call': 'rgb(220 84 84)',      // accent red
  'dark-age-of-camelot': 'rgb(110 150 220)', // bright slate blue
  'darkfall-online': 'rgb(210 130 60)',   // burnt orange
  'ultima-online': 'rgb(120 180 120)',    // sage green
  'everquest': 'rgb(196 158 84)',         // signal gold
  'shadowbane': 'rgb(170 110 200)',       // amethyst
  'eve-online': 'rgb(80 140 200)',        // azure
  'quake': 'rgb(230 140 80)',             // ember
  default: 'rgb(140 138 132)',            // neutral
};

function colorFor(slug: string): string {
  return GAME_COLORS[slug] || GAME_COLORS.default;
}

export function OgGuildsInfograph({
  guilds,
  gameMap,
}: {
  guilds: GuildFrontmatter[];
  gameMap: Record<string, string>;
}) {
  const [view, setView] = useState<View>('timeline');

  if (guilds.length === 0) {
    return (
      <div className="border border-ink/15 p-12 text-center">
        <p className="font-serif text-lg text-muted">
          OG era profiles seed in over the first weeks of launch. The infograph fills in as the database grows.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <ViewToggle active={view === 'timeline'} onClick={() => setView('timeline')}>
          <TimelineIcon size={14} /> Timeline
        </ViewToggle>
        <ViewToggle active={view === 'network'} onClick={() => setView('network')}>
          <NetworkIcon size={14} /> Network
        </ViewToggle>
      </div>
      {view === 'timeline' ? (
        <TimelineView guilds={guilds} gameMap={gameMap} />
      ) : (
        <NetworkView guilds={guilds} gameMap={gameMap} />
      )}
    </div>
  );
}

function ViewToggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest px-3 py-1.5 border transition ${
        active
          ? 'bg-ink text-paper border-ink'
          : 'bg-paper text-ink/70 border-ink/20 hover:border-accent hover:text-accent'
      }`}
    >
      {children}
    </button>
  );
}

function TimelineView({
  guilds,
  gameMap,
}: {
  guilds: GuildFrontmatter[];
  gameMap: Record<string, string>;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(900);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const { rows, minYear, maxYear } = useMemo(() => {
    const startYears = guilds.map((g) => g.era_active.start);
    const endYears = guilds.map((g) => (g.era_active.end === 'active' ? new Date().getFullYear() : g.era_active.end));
    const minY = Math.min(...startYears, 1996);
    const maxY = Math.max(...endYears, new Date().getFullYear());
    const sorted = [...guilds].sort((a, b) => a.era_active.start - b.era_active.start);
    return { rows: sorted, minYear: minY, maxYear: maxY };
  }, [guilds]);

  // Wider label column so long names like "Test Alliance Please Ignore" fit.
  const margin = { left: 200, right: 32, top: 20, bottom: 36 };
  const rowHeight = 26;
  const barHeight = 16;
  const innerWidth = Math.max(width - margin.left - margin.right, 200);
  const innerHeight = rows.length * rowHeight;
  const svgHeight = innerHeight + margin.top + margin.bottom;
  const yearScale = (y: number) => ((y - minYear) / (maxYear - minYear)) * innerWidth;

  const tickYears: number[] = [];
  for (let y = Math.ceil(minYear / 5) * 5; y <= maxYear; y += 5) tickYears.push(y);

  // Build a unique-game legend for the colors actually in use.
  const usedGames = Array.from(new Set(rows.map((g) => g.games?.[0]?.game_slug || 'default')));

  return (
    <div className="space-y-3">
      <div ref={containerRef} className="border border-ink/15 surface p-4 overflow-x-auto">
        <svg width={width} height={svgHeight} role="img" aria-label="Timeline of OG era guilds">
          {/* alternating row backgrounds for readability */}
          {rows.map((g, i) => (
            <rect
              key={`bg-${g.slug}`}
              x={margin.left}
              y={margin.top + i * rowHeight}
              width={innerWidth}
              height={rowHeight}
              fill={i % 2 === 0 ? 'rgb(var(--color-ink) / 0.025)' : 'transparent'}
            />
          ))}

          {/* gridlines */}
          {tickYears.map((y) => (
            <g key={y}>
              <line
                x1={margin.left + yearScale(y)}
                x2={margin.left + yearScale(y)}
                y1={margin.top}
                y2={margin.top + innerHeight}
                style={{ stroke: 'rgb(var(--color-rule))', strokeOpacity: 0.18 }}
              />
              <text
                x={margin.left + yearScale(y)}
                y={svgHeight - 10}
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                style={{ fill: 'rgb(var(--color-muted))' }}
                textAnchor="middle"
              >
                {y}
              </text>
            </g>
          ))}

          {/* guild bars */}
          {rows.map((g, i) => {
            const rowTop = margin.top + i * rowHeight;
            const barY = rowTop + (rowHeight - barHeight) / 2;
            const startX = margin.left + yearScale(g.era_active.start);
            const endY = g.era_active.end === 'active' ? new Date().getFullYear() : g.era_active.end;
            const endX = margin.left + yearScale(endY);
            const w = Math.max(endX - startX, 6);
            const primaryGame = g.games?.[0]?.game_slug || 'default';
            const fill = colorFor(primaryGame);
            const isActive = g.era_active.end === 'active';
            return (
              <g
                key={g.slug}
                className="cursor-pointer"
                onClick={() => router.push(`/guilds/${g.slug}/`)}
              >
                <text
                  x={margin.left - 10}
                  y={rowTop + rowHeight / 2}
                  fontSize="11"
                  fontFamily="Georgia, serif"
                  style={{ fill: 'rgb(var(--color-ink))' }}
                  textAnchor="end"
                  dominantBaseline="central"
                >
                  {g.name}
                </text>
                <rect
                  x={startX}
                  y={barY}
                  width={w}
                  height={barHeight}
                  fill={fill}
                  rx={2}
                  ry={2}
                >
                  <title>{`${g.name} (${g.era_active.start}, ${isActive ? 'active' : g.era_active.end}) / ${gameMap[primaryGame] || primaryGame}`}</title>
                </rect>
                {isActive && (
                  <>
                    <circle cx={endX} cy={barY + barHeight / 2} r={4} fill={fill} />
                    <circle cx={endX} cy={barY + barHeight / 2} r={6} fill="none" stroke={fill} strokeOpacity={0.4} />
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      {/* Color legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono uppercase tracking-widest text-muted">
        <span>Color by primary game</span>
        {usedGames.map((slug) => (
          <span key={slug} className="inline-flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: colorFor(slug) }} aria-hidden="true" />
            {gameMap[slug] || slug}
          </span>
        ))}
      </div>
    </div>
  );
}

interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  era: string;
  game: string;
}
interface NetworkLink extends d3.SimulationLinkDatum<NetworkNode> {
  kind: 'predecessor' | 'successor' | 'splinter';
}

function NetworkView({
  guilds,
  gameMap,
}: {
  guilds: GuildFrontmatter[];
  gameMap: Record<string, string>;
}) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(900);
  const height = 520;

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || guilds.length === 0) return;

    const slugs = new Set(guilds.map((g) => g.slug));
    const nodes: NetworkNode[] = guilds.map((g) => ({
      id: g.slug,
      name: g.name,
      era: g.era,
      game: g.games?.[0]?.game_slug || 'default',
    }));
    const links: NetworkLink[] = [];
    for (const g of guilds) {
      for (const p of g.predecessor_guilds || []) {
        if (slugs.has(p)) links.push({ source: p, target: g.slug, kind: 'predecessor' });
      }
      for (const s of g.successor_guilds || []) {
        if (slugs.has(s)) links.push({ source: g.slug, target: s, kind: 'successor' });
      }
      for (const sp of g.splinter_guilds || []) {
        if (slugs.has(sp)) links.push({ source: g.slug, target: sp, kind: 'splinter' });
      }
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const simulation = d3
      .forceSimulation<NetworkNode>(nodes)
      .force('link', d3.forceLink<NetworkNode, NetworkLink>(links).id((d) => d.id).distance(110))
      .force('charge', d3.forceManyBody().strength(-220))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<NetworkNode>().radius(36));

    const linkSel = svg
      .append('g')
      .style('stroke', 'rgb(var(--color-rule))')
      .attr('stroke-opacity', 0.35)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-dasharray', (d) => (d.kind === 'splinter' ? '4 3' : null));

    const nodeSel = svg
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .on('click', (_, d) => router.push(`/guilds/${d.id}/`));

    nodeSel
      .append('circle')
      .attr('r', 14)
      .attr('fill', (d) => colorFor(d.game))
      .style('stroke', 'rgb(var(--color-ink))')
      .attr('stroke-width', 1.5);

    nodeSel
      .append('text')
      .attr('y', 28)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Georgia, serif')
      .attr('font-size', '11')
      .style('fill', 'rgb(var(--color-ink))')
      .text((d) => d.name);

    nodeSel.append('title').text((d) => `${d.name} / ${gameMap[d.game] || d.game}`);

    simulation.on('tick', () => {
      linkSel
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      nodeSel.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [guilds, gameMap, width, height, router]);

  return (
    <div ref={containerRef} className="border border-ink/15 bg-paper p-4 hidden md:block">
      <svg ref={svgRef} width={width} height={height} role="img" aria-label="Network of OG era guild lineage" />
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted mt-2">
        Solid edges: predecessor or successor. Dashed edges: splinters.
      </div>
    </div>
  );
}
