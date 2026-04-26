'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3';
import type { GuildFrontmatter } from '@/lib/schemas';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  isFocal: boolean;
  era: string;
}
interface Link extends d3.SimulationLinkDatum<Node> {
  kind: 'predecessor' | 'successor' | 'splinter';
  label?: string;
}

const ERA_COLORS: Record<string, string> = {
  og: 'rgb(168 30 36)',
  classic: 'rgb(70 100 160)',
  modern: 'rgb(50 50 60)',
  active: 'rgb(80 130 80)',
};

export function LineageTree({
  focal,
  all,
  depth = 3,
}: {
  focal: GuildFrontmatter;
  all: GuildFrontmatter[];
  depth?: number;
}) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const slugMap = new Map(all.map((g) => [g.slug, g]));

    const visited = new Set<string>([focal.slug]);
    const nodes: Node[] = [{ id: focal.slug, name: focal.name, isFocal: true, era: focal.era }];
    const links: Link[] = [];

    function expand(slug: string, currentDepth: number) {
      if (currentDepth >= depth) return;
      const g = slugMap.get(slug);
      if (!g) return;
      for (const p of g.predecessor_guilds || []) {
        const target = slugMap.get(p);
        if (!target) continue;
        if (!visited.has(p)) {
          visited.add(p);
          nodes.push({ id: p, name: target.name, isFocal: false, era: target.era });
          expand(p, currentDepth + 1);
        }
        links.push({ source: p, target: slug, kind: 'predecessor' });
      }
      for (const s of g.successor_guilds || []) {
        const target = slugMap.get(s);
        if (!target) continue;
        if (!visited.has(s)) {
          visited.add(s);
          nodes.push({ id: s, name: target.name, isFocal: false, era: target.era });
          expand(s, currentDepth + 1);
        }
        links.push({ source: slug, target: s, kind: 'successor' });
      }
      for (const sp of g.splinter_guilds || []) {
        const target = slugMap.get(sp);
        if (!target) continue;
        if (!visited.has(sp)) {
          visited.add(sp);
          nodes.push({ id: sp, name: target.name, isFocal: false, era: target.era });
          expand(sp, currentDepth + 1);
        }
        links.push({ source: slug, target: sp, kind: 'splinter' });
      }
    }
    expand(focal.slug, 0);

    const width = containerRef.current.clientWidth || 720;
    const height = Math.max(360, Math.min(560, nodes.length * 60));

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const sim = d3
      .forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id((d) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-260))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<Node>().radius(36));

    const linkSel = svg
      .append('g')
      .attr('stroke', 'rgb(30 30 32)')
      .attr('stroke-opacity', 0.4)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-dasharray', (d) => (d.kind === 'splinter' ? '4 3' : null));

    const nodeSel = svg
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', (d) => (d.isFocal ? 'default' : 'pointer'))
      .on('click', (_, d) => {
        if (!d.isFocal) router.push(`/guilds/${d.id}/`);
      });

    nodeSel
      .append('circle')
      .attr('r', (d) => (d.isFocal ? 18 : 12))
      .attr('fill', (d) => ERA_COLORS[d.era] || 'rgb(112 110 105)')
      .attr('stroke', (d) => (d.isFocal ? 'rgb(168 30 36)' : 'rgb(18 18 20)'))
      .attr('stroke-width', (d) => (d.isFocal ? 3 : 1.5));

    nodeSel
      .append('text')
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Georgia, serif')
      .attr('font-size', (d) => (d.isFocal ? '13' : '11'))
      .attr('fill', 'rgb(18 18 20)')
      .text((d) => d.name);

    sim.on('tick', () => {
      linkSel
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      nodeSel.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      sim.stop();
    };
  }, [focal, all, depth, router]);

  return (
    <div ref={containerRef} className="border border-ink/15 bg-paper p-4 mt-4">
      <svg ref={svgRef} width="100%" height="420" role="img" aria-label={`Lineage of ${focal.name}`} />
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted mt-2">
        Solid edges: predecessor or successor. Dashed edges: splinters. Click a node to open that profile.
      </div>
    </div>
  );
}
