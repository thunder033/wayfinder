import Konva from 'konva';

import { FeatureType, Line, Segment, WFNode, WFNodeType } from '@wf-core/types/network-features';

import { FeaturePresenter } from './feature-presenter';
import { Renderable } from '../viewport/viewport.types';
import { asLinePoints, chunkLineNodes, getSegments, LineNodeChunk } from '../viewport/viewport-utils';
import { NodePresenter } from './node-presenter';
import { combineLatest, map, Observable, scan, switchMap } from 'rxjs';
import { cacheValue } from '@wf-core/utils/rx-operators';
import { Vector2 } from '@wf-core/math';

const LINE_STYLE: Partial<Konva.LineConfig> = {
  stroke: '#000',
  strokeWidth: 8,
};

type KLineInventory = { [signature: string]: Konva.Line };
type NodeInventory = { [nodeId: string]: WFNode<WFNodeType> };

function getNodes(line: Line): NodeInventory {
  return getSegments(line)
    .map((segment: Segment) => segment.nodes)
    .flat()
    .filter(Boolean)
    .reduce((out, node) => ({ ...out, [node.id]: node }), {});
}

export class LinePresenter extends FeaturePresenter<FeatureType.Line> {
  private line$ = this.feature$;
  private vertexChunks$ = this.line$.pipe(map(chunkLineNodes), logOut(this.featureId + ' chunks'), cacheValue());
  private kLines$: Observable<KLineInventory> = combineLatest([this.line$, this.vertexChunks$]).pipe(
    scan((kLines, [line, chunks]) =>
      this.updateRenderableInventory(
        kLines,
        chunks,
        (chunk: LineNodeChunk) => chunk.signature,
        () => new Konva.Line({...LINE_STYLE, stroke: line.color}),
      ), {} as KLineInventory),
    logOut(this.featureId + ' kLines'),
    cacheValue(),
  );

  private nodes$ = this.line$.pipe(map(getNodes), cacheValue());

  private vertices$: Observable<{ [nodeId: string]: Vector2 }> = this.nodes$.pipe(
    logOut(this.featureId + ' nodes'),
    switchMap((inventory) =>
      combineLatest(
        Object.keys(inventory).reduce((out, nodeId) => ({
          ...out,
          [nodeId]: NodePresenter.get(nodeId).getLineVertexPosition$(this.featureId),
        }), {}),
      ),
    ),
    logOut(this.featureId + ' vertices'),
    cacheValue(),
  );

  private nodeMarkers$ = this.nodes$.pipe(
    scan((nodeMarkers, nodes) =>
      this.updateRenderableInventory(
        nodeMarkers,
        Object.values(nodes),
        (node) => node.id,
        (node) => NodePresenter.get(node.id).getLineNodeMarker(this.featureId),
      ),
      {} as Inventory<Renderable>
    ),
    cacheValue(),
  );

  initialize(): void {
    combineLatest({
      kLines: this.kLines$,
      chunks: this.vertexChunks$,
      vertices: this.vertices$,
    })
      .subscribe({
        error: (thrown) => console.error(thrown),
        next: ({ kLines, chunks, vertices }) => {
          console.log(`${this.featureType} ${this.featureId}`, { vertices, chunks });
          chunks
            .filter(({ signature }) => !!kLines[signature])
            .forEach((chunk) => {
              const chunkVertices = chunk.nodes
                .filter((node) => !!node && !!vertices[node.id])
                .map((node) => vertices[node.id]);
              kLines[chunk.signature].points(asLinePoints(chunkVertices));
              kLines[chunk.signature].moveToBottom();
            });
        },
      });

    combineLatest({
      nodeMarkers: this.nodeMarkers$,
      vertices: this.vertices$,
    })
      .subscribe({
        error: (thrown) => console.error(thrown),
        next: ({ nodeMarkers, vertices }) => {
          Object.entries(nodeMarkers).forEach(([id, marker]) => {
            marker.x(vertices[id]?.x);
            marker.y(vertices[id]?.y);
          });
        }
      });
  }
}
