import { Store } from '@ngrx/store';
import Konva from 'konva';
import { combineLatest, map, mergeScan, Observable, switchMap } from 'rxjs';

import { Vector2 } from '@wf-core/math';
import { FeaturePresenter } from '@wf-core/render/feature-presenter';
import { FeatureType, Line, Segment, WFNode } from '@wf-core/types/network-features';
import { WFState } from '@wf-core/types/store';
import { cacheValue, delayUntil } from '@wf-core/utils/rx-operators';

import { Camera } from '../viewport/camera';
import {
  asLinePoints,
  chunkLineNodes,
  getSegments,
  LineNodeChunk,
} from '../viewport/viewport-utils';
import { LineNodePresenter } from './line-node-presenter';
import { NodePresenter } from './node-presenter';

const LINE_STYLE: Partial<Konva.LineConfig> = {
  stroke: '#000',
  strokeWidth: 7,
  shadowColor: '#333',
  shadowOpacity: 0.7,
  shadowBlur: 3,
  shadowOffset: { x: 1, y: 0 },
  shadowEnabled: true,
  shadowForStrokeEnabled: true,
};

type KLineInventory = { [signature: string]: Konva.Line };
type NodeInventory = { [nodeId: string]: WFNode };

function getNodes(line: Nullable<Line>): NodeInventory {
  return getSegments(line)
    .map((segment: Segment) => segment.nodes)
    .flat()
    .filter(Boolean)
    .reduce((out, node) => ({ ...out, [node.id]: node }), {});
}

export class LinePresenter extends FeaturePresenter<FeatureType.Line> {
  private line$ = this.feature$;
  private vertexChunks$ = this.line$.pipe(
    map(chunkLineNodes),
    tapLog(this.featureId + ' chunks'),
    cacheValue(),
  );
  private kLines$: Observable<KLineInventory> = combineLatest([
    this.line$,
    this.vertexChunks$,
  ]).pipe(
    delayUntil(this.onInitialize$),
    mergeScan(
      (kLines, [line, chunks]) =>
        this.updateInventory$(
          kLines,
          chunks,
          (chunk: LineNodeChunk) => chunk.signature,
          () => new Konva.Line({ ...LINE_STYLE, stroke: line?.color }),
        ),
      {} as KLineInventory,
    ),
    tapLog(this.featureId + ' kLines'),
    cacheValue(),
  );

  private nodes$ = this.line$.pipe(map(getNodes), cacheValue());

  private nodeMarkers$ = this.nodes$.pipe(
    delayUntil(this.onInitialize$),
    mergeScan(
      (nodeMarkers, nodes) =>
        this.updateInventory$(
          nodeMarkers,
          Object.values(nodes),
          (node) => node.id,
          (node) => new LineNodePresenter(NodePresenter.get(node.id), this.camera, this.featureId),
        ),
      {} as Inventory<LineNodePresenter>,
    ),
    cacheValue(),
  );

  private vertices$: Observable<{ [nodeId: string]: Vector2 }> = this.nodeMarkers$.pipe(
    tapLog(this.featureId + ' nodes'),
    switchMap((inventory) =>
      combineLatest(
        Object.keys(inventory).reduce(
          (out, nodeId) => ({
            ...out,
            [nodeId]: inventory[nodeId].screenPosition$,
          }),
          {},
        ),
      ),
    ),
    // tapLog(this.featureId + ' vertices'),
    cacheValue(),
  );

  constructor(
    protected readonly camera: Camera,
    protected readonly lineId: string,
    store: Store<WFState>,
  ) {
    super(lineId, FeatureType.Line, store);
  }

  override initialize(): void {
    super.initialize();
    combineLatest({
      kLines: this.kLines$,
      chunks: this.vertexChunks$,
      vertices: this.vertices$,
    }).subscribe({
      error: (thrown) => console.error(thrown),
      next: ({ kLines, chunks, vertices }) => {
        // console.log(`${this.featureType} ${this.featureId}`, { vertices, chunks });
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

    this.nodeMarkers$.subscribe({ error: (thrown) => console.error(thrown) });
  }
}
