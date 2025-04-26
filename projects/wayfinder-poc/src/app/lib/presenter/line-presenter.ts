import { Store } from '@ngrx/store';
import Konva from 'konva';
import { combineLatest, filter, map, mergeScan, Observable, switchMap, tap } from 'rxjs';
import {
  cacheValue,
  delayUntil,
  FeaturePresenter,
  FeatureType,
  Line,
  network,
  sampleMap,
  Segment,
  Vector2,
  WFAnimatable,
  WFEvent,
  WFKonva,
  WFNode,
  WFState,
} from 'wf-core';

import { LineNodePresenter } from './line-node-presenter';
import { NodePresenter } from './node-presenter';
import { Camera } from '../viewport/camera';
import { asLinePoints, getSegments } from '../viewport/viewport-utils';

const LINE_STYLE: Partial<Konva.LineConfig> = {
  stroke: '#000',
  strokeWidth: 7,
  shadowColor: '#333',
  shadowOpacity: 0.7,
  shadowBlur: 3,
  shadowOffset: { x: 1, y: 0 },
  shadowEnabled: true,
  shadowForStrokeEnabled: true,
  lineCap: 'round',
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

const getLineLength = (vertices: Vector2.Expression[]) => {
  let length = 0;
  let index = 0;
  while (vertices[index + 1]) {
    length += Vector2.from(vertices[index])
      .sub(vertices[index + 1])
      .len();
    index++;
  }

  return length;
};

class LineDisplaySegment extends WFKonva.Extended(WFAnimatable(Konva.Line)) {
  private segmentLength$ = combineLatest({
    segment: this.segment$,
    vertices: this.localVertices$,
  }).pipe(
    filter(({ segment }) => !!segment),
    map(({ segment, vertices }) => {
      const segmentVertices = segment!.nodes
        .filter((node) => !!node && !!vertices[node.id])
        .map((node) => vertices[node.id]);
      return getLineLength(segmentVertices);
    }),
  );

  constructor(
    private segment$: Observable<Nullable<Segment>>,
    screenVertices$: Observable<Record<string, Vector2>>,
    private localVertices$: Observable<Record<string, Vector2>>,
    color?: string,
  ) {
    super();
    this.setAttrs({ ...LINE_STYLE, stroke: color });
    combineLatest({ segment: segment$, vertices: screenVertices$ })
      .pipe(
        filter(({ segment }) => !!segment),
        this.withCleanup(),
      )
      .subscribe(({ segment, vertices }) => {
        const segmentVertices = segment!.nodes
          .filter((node) => !!node && !!vertices[node.id])
          .map((node) => vertices[node.id]);
        this.points(asLinePoints(segmentVertices)).moveToBottom();
      });

    this.on$(WFEvent.Present)
      .pipe(
        sampleMap(this.segmentLength$),
        tap((length) => {
          this.dashOffset(length);
          this.dash([length]);
          this.queueTween({
            node: this,
            dashOffset: 0,
            duration: 0.5,
          });
        }),
      )
      .subscribe();
  }
}

export class LinePresenter extends FeaturePresenter<FeatureType.Line> {
  private line$ = this.feature$;
  private segments$ = this.line$.pipe(map(getSegments), cacheValue());
  private displaySegments$: Observable<KLineInventory> = combineLatest([
    this.line$,
    this.segments$,
  ]).pipe(
    delayUntil(this.onInitialize$),
    mergeScan(
      (kLines, [line, segments]) =>
        this.updateInventory$(
          kLines,
          segments,
          (segment: Segment) => segment.id,
          (segment) =>
            new LineDisplaySegment(
              this.store.select(network.getFeature(segment.id, FeatureType.Segment)),
              this.screenVertices$,
              this.localVertices$,
              line?.color,
            ),
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

  private screenVertices$: Observable<Record<string, Vector2>> = this.nodeMarkers$.pipe(
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

  private localVertices$: Observable<Record<string, Vector2>> = this.nodeMarkers$.pipe(
    switchMap((inventory) =>
      combineLatest(
        Object.keys(inventory).reduce(
          (out, nodeId) => ({
            ...out,
            [nodeId]: inventory[nodeId].nodePosition$,
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
    this.displaySegments$.subscribe({ error: (thrown) => console.error(thrown) });
    this.nodeMarkers$.subscribe({ error: (thrown) => console.error(thrown) });
  }
}
