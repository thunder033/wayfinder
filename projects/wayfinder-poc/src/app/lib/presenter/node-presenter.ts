import { select, Store } from '@ngrx/store';
import Konva from 'konva';
import { Bind } from 'lodash-decorators';
import { combineLatest, filter, forkJoin, map, Observable, of, switchMap, take } from 'rxjs';

import { cacheValue, FeatureType, Line, Station, WFNode, FeaturePresenter, network, Vector2, WFState } from 'wf-core';

import { Camera } from '../viewport/camera';
import { getSegments } from '../viewport/viewport-utils';

export const NODE_STYLE: Partial<Konva.CircleConfig> = {
  radius: 4,
};

interface MarkerTray {
  angle: number;
  lineIds: string[];
}

function addLine(tray: MarkerTray, line: Line, angle: number): MarkerTray {
  return tray ? { ...tray, lineIds: [...tray.lineIds, line.id] } : { angle, lineIds: [line.id] };
}

// will be used by line node presenter
function getTrayOffset(angle: number, markerTrays: MarkerTray[]): number {
  const u = new Vector2(Math.cos(angle), Math.sin(angle));
  return markerTrays.reduce((offset, tray) => {
    const width = tray.lineIds.length * NODE_STYLE.radius!;
    const b = new Vector2(Math.cos(angle) * width, Math.sin(angle) * width);
    // console.log(angle, { b, u, width, dot: b.magnitude() });
    return offset + Vector2.project(b, u).magnitude() / 2;
  }, 0);
}

/**
 * Calculates parameters for presenting a system node (Station or GeometryNode)
 */
export class NodePresenter<T extends WFNode<any>> extends FeaturePresenter<T['type']> {
  private static presenter: { [nodeId: string]: NodePresenter<any> } = {};
  static create<T extends FeatureType>(
    camera: Camera,
    node: WFNode<T>,
    systemId: string,
    store: Store<WFState>,
  ): NodePresenter<WFNode<T>> {
    const presenter: NodePresenter<WFNode<T>> =
      node.type === FeatureType.Station
        ? new StationPresenter(camera, node as any, systemId, store)
        : (new NodePresenter(camera, node, systemId, store) as any);
    NodePresenter.presenter[node.id] = presenter;
    return presenter as NodePresenter<WFNode<T>>;
  }

  static get<T extends WFNode>(id: string): NodePresenter<T> {
    return NodePresenter.presenter[id];
  }

  node$: Observable<Nullable<T>> = this.feature$;

  nodeLines$: Observable<Line[]> = this.store.pipe(
    select(network.getSystem(this.systemId)),
    map(({ lines }) => lines.filter((line) => this.hasNode(line))),
    cacheValue(),
  );

  markerTrays$: Observable<MarkerTray[]> = this.nodeLines$.pipe(
    switchMap((lines) =>
      forkJoin(lines.map(this.getPrevailingAngle$)).pipe(
        map((angles) => {
          const trays = lines.reduce(
            (trays, line, i) => ({
              ...trays,
              [angles[i]]: addLine(trays[angles[i]], line, angles[i]),
            }),
            {} as { [angle: number]: MarkerTray },
          );
          return Object.values(trays);
        }),
      ),
    ),
    cacheValue(),
  );

  labelPosition$ = combineLatest([this.markerTrays$, this.node$, this.camera.update$]).pipe(
    filter(([markerTrays, node]) => !!node && !!markerTrays.length),
    map(([markerTrays, node]) => {
      const tray = markerTrays[0];
      const radius = NODE_STYLE.radius!;
      const sign = tray.angle < 0 ? 1 : -1;
      const markerCount = tray.lineIds.length;
      const labelOffset = sign * ((markerCount / 2 + 1) * (radius * 2) - radius);

      const u = new Vector2(-Math.sin(tray.angle), Math.cos(tray.angle));
      return this.camera
        .project(node!.position)
        .add(u.scale(labelOffset).multiply({ x: 1, y: -1 }));
    }),
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

  @Bind()
  private getPrevailingAngle$(line: Line): Observable<number> {
    const segment = getSegments(line).find(
      ({ nodes }) => !!nodes.find(({ id }) => id === this.featureId),
    )!;
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
        const sharedLeftNodeLines = nodeLines.filter((v) => this.hasNode(v, leftNode.id));
        const sharedRightNodeLines = nodeLines.filter((v) => this.hasNode(v, rightNode.id));
        const sign = <-1 | 0 | 1>(
          Math.sign(sharedLeftNodeLines.length - sharedRightNodeLines.length)
        );
        return {
          [-1]: angleRight,
          [0]: (angleLeft + angleRight) / 2 - Math.PI / 2,
          [1]: angleLeft,
        }[sign];
      }),
    );
  }

  private hasNode(line: Line, nodeId: string = this.featureId) {
    return getSegments(line).some(
      ({ nodes }) => !!nodes.filter(Boolean).find(({ id }) => id === nodeId),
    );
  }
}

export class StationPresenter extends NodePresenter<Station> {
  label: Konva.Text | undefined;

  override initialize(node: Station) {
    super.initialize(node);
    this.label = new Konva.Text({ text: '' });
    this.renderable$$.next(this.label);

    combineLatest([this.node$, this.labelPosition$]).subscribe(([node, { x, y }]) => {
      if (!node) {
        this.label?.hide();
        return;
      }

      this.label?.show();
      this.label?.text(node.name + ' (' + this.featureId + ')');
      this.label?.x(x);
      this.label?.y(y);
      this.label?.moveToTop();
      this.onUpdate$$.next();
    });
  }
}
