import { Line, Segment, WFNode } from '@wf-core/types/network-features';
import { flatten, last } from 'lodash';
import { Vector2 } from '@wf-core/types/geometry';

export function add(a: number, b: number): number {
  return a + b;
}

export function toDeg(rad: number): number {
  return rad / Math.PI * 180;
}

export function getSegments(line: Line): Segment[] {
  return flatten(line.services.map(({ segments }) => segments));
}

export function chunkLineNodes(line: Line): WFNode[][] {
  return getSegments(line).reduce(
    (chunks: WFNode[][], segment: Segment) => {
      const head = chunks.pop();
      const chunk = head && segment.nodes[0].id === last(head)?.id
        ? [...head, ...segment.nodes.slice(1)]
        : [...segment.nodes];

      return [...chunks, chunk];
    },
    <WFNode[][]>[],
  )
}

export function asLinePoints(chunk: Vector2.Expression[]): number[] {
  return flatten(chunk.map(({ x, y }) => [x, y]));
}
