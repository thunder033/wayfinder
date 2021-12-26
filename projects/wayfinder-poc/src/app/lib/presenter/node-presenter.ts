import { FeatureType, Line, Station, WFNode } from '@wf-core/types/network-features';
import { Renderable } from '../viewport/viewport.types';
import Konva from 'konva';
import { getSegments } from '../viewport/viewport-utils';
import { Vector2 } from '@wf-core/math';
import { Camera } from '../viewport/camera';
import { FeaturePresenter } from './feature-presenter';
import { select, Store } from '@ngrx/store';
import { WFState } from '@wf-core/types/store';
import { network } from '@wf-core/state/network';
import { combineLatest, filter, forkJoin, map, Observable, of, switchMap, take } from 'rxjs';
import { cacheValue } from '@wf-core/utils/rx-operators';
import { Bind } from 'lodash-decorators';

const NODE_STYLE: Partial<Konva.CircleConfig> = {
  radius: 4,
};

const STATION_MARKER_STYLE: Partial<Konva.CircleConfig> = {
  ...NODE_STYLE,
  fill: '#fff',
  stroke: '#333',
  strokeWidth: 1,
};

interface MarkerTray {
  angle: number;
  lineIds: string[];
}

function addLine(tray: MarkerTray, line: Line, angle: number): MarkerTray {
  return tray
    ? { ...tray, lineIds: [...tray.lineIds, line.id] }
    : { angle, lineIds: [line.id]};
}

function getTrayOffset(angle: number, markerTrays: MarkerTray[]): number {
  const u = new Vector2(Math.cos(angle), Math.sin(angle));
  return markerTrays.reduce((offset, tray) => {
    const width = tray.lineIds.length * NODE_STYLE.radius!;
    const b = new Vector2(Math.cos(angle) * width, Math.sin(angle) * width);
    console.log(angle, { b, u, width, dot: b.magnitude() });
    return offset + Vector2.project(b, u).magnitude() / 2;
  }, 0);
}

export class NodePresenter<T extends WFNode<any>> extends FeaturePresenter<T['type']> {
  private static presenter: {[nodeId: string]: NodePresenter<any>} = {};
  static create<T extends FeatureType>(
    camera: Camera,
    node: WFNode<T>,
    systemId: string,
    store: Store<WFState>,
  ): NodePresenter<WFNode<T>> {
    const presenter = node.type === FeatureType.Station
      ? new StationPresenter(camera, node as any, systemId, store)
      : new NodePresenter(camera, node, systemId, store);
    NodePresenter.presenter[node.id] = presenter;
    return presenter as NodePresenter<WFNode<T>>;
  }

  static get<T extends WFNode<any>>(id: string): NodePresenter<T> {
    return NodePresenter.presenter[id];
  }

  node$ = this.feature$;

  nodeLines$: Observable<Line[]> = this.store.pipe(
    select(network.getSystem(this.systemId)),
    map(({ lines }) => lines.filter((line) => this.hasNode(line))),
    cacheValue(),
  );

  markerTrays$: Observable<MarkerTray[]> = this.nodeLines$.pipe(
    switchMap((lines) =>
      forkJoin(lines.map(this.getPrevailingAngle$)).pipe(
        map((angles) => {
          const trays = lines.reduce((trays, line, i) => ({
            ...trays,
            [angles[i]]: addLine(trays[angles[i]], line, angles[i]),
          }), {} as {[angle: number]: MarkerTray});
          return Object.values(trays);
        }),
      ),
    ),
    cacheValue(),
  );

  constructor(
    protected readonly camera: Camera,
    protected readonly node: T,
    protected readonly systemId: string,
    store: Store<WFState>,
  ) {
    super(node.id, node.type, store);
    this.nodeLines$.subscribe();
  }

  initialize(node: T): void {}

  getLineNodeMarker(lineId: string): Renderable {
    return new Konva.Group();
  }

  getLineVertexPosition$(lineId: string): Observable<Vector2> {
    return combineLatest([this.markerTrays$, this.node$, this.camera.position.$]).pipe(
      filter(([markerTrays]) => !!markerTrays.find((tray) => tray.lineIds.includes(lineId))),
      map(([markerTrays, node]) => {
        const lineTray = markerTrays.find((tray) => tray.lineIds.includes(lineId))!;
        const trayOffset = getTrayOffset(lineTray.angle, markerTrays);
        const radius = NODE_STYLE.radius!;

        const sign = lineTray.angle < 0 ? -1 : 1;
        const markerCount = lineTray.lineIds.length;
        const markerIndex = lineTray.lineIds.indexOf(lineId);
        const markerOffset = sign * (markerIndex * radius * 2 + radius - markerCount * radius * 2);

        const u = new Vector2(-Math.sin(lineTray.angle), Math.cos(lineTray.angle));
        return this.camera.project(node.position)
          .add(u.scale(markerOffset).multiply({ x: 1, y: - 1}));
      }),
    );
  }

  @Bind()
  private getPrevailingAngle$(line: Line): Observable<number> {
    const segment = getSegments(line).find(({ nodes }) => !!nodes.find(({ id }) => id === this.featureId))!;
    const nodeIndex = segment.nodes.findIndex(({ id }) => id === this.featureId);
    const leftNode = segment.nodes[nodeIndex - 1];
    const rightNode = segment.nodes[nodeIndex + 1];

    const angleLeft = !leftNode ? NaN : Vector2.angleTo(this.node.position, leftNode.position);
    const angleRight = !rightNode ? NaN : Vector2.angleTo(this.node.position, rightNode.position);

    if (angleLeft === angleRight || angleLeft - 180 === angleRight) {
      return of(angleRight);
    }

    if (Number.isNaN(angleLeft)) {
      return of(angleRight);
    }

    if (Number.isNaN(angleRight)) {
      return of(angleLeft);
    }

    return this.nodeLines$.pipe(
      take(1),
      map((nodeLines) => {
        const sharedLeftNodeLines = nodeLines.filter((nodeLine) => this.hasNode(nodeLine, leftNode.id));
        const sharedRightNodeLines = nodeLines.filter((nodeLine) => this.hasNode(nodeLine, rightNode.id));
        const sign = <-1 | 0 | 1>Math.sign(sharedLeftNodeLines.length - sharedRightNodeLines.length);
        return ({
          [-1]: angleRight,
          [1]: angleLeft,
          [0]: (angleLeft + angleRight) / 2 - (Math.PI / 2),
        })[sign];
      }),
    );
  }

  private hasNode(line: Line, nodeId: string = this.featureId) {
    return getSegments(line).some(({ nodes }) => !!nodes.find(({ id }) => id === nodeId));
  }
}

export class StationPresenter extends NodePresenter<Station> {
  label: Konva.Text | undefined;

  override initialize(node: Station) {
    super.initialize(node);
    this.label = new Konva.Text({ text: '' });
    this.renderable$$.next(this.label);

    combineLatest([this.node$, this.camera.position.$]).subscribe(([{ position, name }]) => {
      const { x, y } = this.camera.project(position);
      this.label?.text(name + ' (' + this.featureId + ')');
      this.label?.x(x);
      this.label?.y(y);
      this.label?.zIndex(10);
      this.update$$.next();
    });
  }

  override getLineNodeMarker(lineId: string): Renderable {
    return new Konva.Circle({ ...STATION_MARKER_STYLE });
  }
}
