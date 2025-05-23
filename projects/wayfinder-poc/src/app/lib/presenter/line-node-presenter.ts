import Konva from 'konva';
import { combineLatest, filter, map, Observable, switchMap, take, takeUntil, tap } from 'rxjs';

import {
  cacheValue,
  toggleBy,
  FeatureType,
  WFNode,
  BasePresenter,
  Vector2,
  WFAnimatable,
  WFEvent,
  WFKonva,
} from 'wf-core';

import { Camera } from '../viewport/camera';
import { NODE_STYLE, NodePresenter } from './node-presenter';

export const STATION_MARKER_STYLE: Partial<Konva.CircleConfig> = {
  ...NODE_STYLE,
  fill: '#fff',
  stroke: '#333',
  strokeWidth: 1,
};

export const STATION_MARKER_START_STYLE: Partial<Konva.CircleConfig> = {
  radius: 0,
};

class LineNodeMarker extends WFKonva.Extended(WFAnimatable(Konva.Group)) {
  isStation$ = this.node$.pipe(
    map((node) => node?.type === FeatureType.Station),
    cacheValue(),
  );

  private stationMarker = new Konva.Circle({ ...NODE_STYLE, ...STATION_MARKER_START_STYLE });

  constructor(private node$: Observable<Nullable<WFNode>>) {
    super();
    this.add(this.stationMarker);
    this.on$(WFEvent.Present)
      .pipe(
        toggleBy(this.isStation$),
        tap(() => {
          this.queueTween({
            node: this.stationMarker,
            duration: 0.5,
            ...STATION_MARKER_STYLE,
          });
        }),
      )
      .subscribe();
    this.on$(WFEvent.Destroy)
      .pipe(
        toggleBy(this.isStation$),
        tap(({ teardown$$ }) => {
          const tween = this.queueTween({
            node: this.stationMarker,
            duration: 0.5,
            radius: 0,
          });
          teardown$$.next(tween.onIdle$.pipe(take(1)));
        }),
      )
      .subscribe();
  }
}

export class LineNodePresenter extends BasePresenter {
  nodePosition$ = this.nodePresenter.node$.pipe(
    filter(Boolean),
    switchMap((node) => this.camera.project$(node.position)),
    cacheValue(),
  );

  offset$ = this.nodePresenter.markerTrays$.pipe(
    map((markerTrays) => markerTrays.find((tray) => tray.lineIds.includes(this.lineId))),
    filter(Boolean),
    map((lineTray) => {
      const radius = NODE_STYLE.radius!;
      const sign = lineTray.angle < 0 ? -1 : 1; // not the same as Math.sign
      const markerCount = lineTray.lineIds.length;
      const markerIndex = lineTray.lineIds.indexOf(this.lineId);
      const markerOffset = sign * ((markerIndex + 1 - markerCount / 2) * (radius * 2) - radius);
      const u = new Vector2(-Math.sin(lineTray.angle), Math.cos(lineTray.angle));
      return u.scale(markerOffset).multiply({ x: 1, y: -1 });
    }),
    cacheValue(),
  );

  screenPosition$ = combineLatest([this.nodePosition$, this.offset$]).pipe(
    map(([origin, offset]) => origin.clone().add(offset)),
    cacheValue(),
    takeUntil(this.onDestroy$),
  );

  private marker = new LineNodeMarker(this.nodePresenter.node$);

  constructor(
    private nodePresenter: NodePresenter<WFNode>,
    private camera: Camera,
    private lineId: string,
  ) {
    super();
    this.screenPosition$.subscribe((position) => {
      this.marker.x(position.x);
      this.marker.y(position.y);
    });
  }

  override initialize() {
    super.initialize();
    this.render$(this.marker).subscribe();
  }

  override destroy() {
    this.marker.destroy();
  }
}
