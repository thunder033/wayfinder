import { last } from 'lodash';

import { Vector2 } from '@wf-core/math';
import { Line, Segment, WFNode } from '@wf-core/types/network-features';

export function add(a: number, b: number): number {
  return a + b;
}

export function toDeg(rad: number): number {
  return (rad / Math.PI) * 180;
}

export function getSegments(line: Nullable<Line>): Segment[] {
  return line?.services.map(({ segments }) => segments).flat() ?? [];
}

export interface LineNodeChunk {
  signature: string;
  nodes: WFNode[];
}

/**
 * Generate a deterministic identifier for a line chunk based on the nodes contained
 * in the chunk
 * @param nodes
 */
function getChunkSignature(nodes: WFNode[]): string {
  return nodes
    .filter(Boolean)
    .map(({ id }) => id)
    .join('::');
}

/**
 * Collect contiguous segments from {@param line} into chunks that can be rendered
 * as a single path/line.
 */
export function chunkLineNodes(line: Nullable<Line>): LineNodeChunk[] {
  return getSegments(line).reduce((chunks: LineNodeChunk[], segment: Segment) => {
    const head = chunks.pop();
    const nodes =
      head && segment.nodes[0].id === last(head.nodes)?.id
        ? [...head.nodes, ...segment.nodes.slice(1)]
        : [...segment.nodes];
    const chunk = { signature: getChunkSignature(nodes), nodes };

    return [...chunks, chunk];
  }, <LineNodeChunk[]>[]);
}

export function asLinePoints(chunk: Vector2.Expression[]): number[] {
  return chunk.map(({ x, y }) => [x, y]).flat();
}
