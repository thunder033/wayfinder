import { Store } from '@ngrx/store';
import Konva from 'konva';
import { combineLatest, filter, map, mergeScan, Observable, switchMap } from 'rxjs';

import { Vector2 } from '@wf-core/math';
import { WFAnimatable } from '@wf-core/render/animatable';
import { FeaturePresenter } from '@wf-core/render/feature-presenter';
import { networkSelectors } from '@wf-core/state/network/network.selectors';
import { FeatureType, Line, Segment, WFNode } from '@wf-core/types/network-features';
import { WFState } from '@wf-core/types/store';
import { cacheValue, delayUntil } from '@wf-core/utils/rx-operators';
import { WFKonva } from '@wf-core/wf-konva/wf-konva';

import { Camera } from '../viewport/camera';
import { asLinePoints, getSegments } from '../viewport/viewport-utils';
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

class LineDisplaySegment extends WFKonva.Extended(WFAnimatable(Konva.Line)) {
  constructor(
    private segment$: Observable<Nullable<Segment>>,
    private vertices$: Observable<Record<string, Vector2>>,
    color?: string,
  ) {
    super();
    this.setAttrs({ ...LINE_STYLE, stroke: color });
    combineLatest({ segment: segment$, vertices: vertices$ })
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
              this.store.select(networkSelectors.getFeature(segment.id, FeatureType.Segment)),
              this.vertices$,
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

  private vertices$: Observable<Record<string, Vector2>> = this.nodeMarkers$.pipe(
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
    this.displaySegments$.subscribe({ error: (thrown) => console.error(thrown) });
    this.nodeMarkers$.subscribe({ error: (thrown) => console.error(thrown) });
  }
}
