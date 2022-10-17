import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import Konva from 'konva';
import { map as _map } from 'lodash';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  filter,
  fromEvent,
  map,
  ReplaySubject,
  share,
  startWith,
  Subject,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';

import { Vector2 } from '@wf-core/math';
import { region } from '@wf-core/state/region';
import { System } from '@wf-core/types/network-features';
import { WFState } from '@wf-core/types/store';
import { getBoundingBox } from '@wf-core/utils/geometry';
import { cacheValue, chainRead, withSampleFrom } from '@wf-core/utils/rx-operators';

import { NetworkPresenter } from '../presenter/network-presenter';
import { SystemService } from '../system.service';
import { Camera } from './camera';

/**
 * Finds the bounds of all nodes in the system and calculates the center point
 * @param system
 */
function getSystemCenter(system: System): Vector2 {
  const { minX, minY, maxX, maxY } = getBoundingBox(_map(system.nodes, 'position'));
  return new Vector2((minX + maxX) / 2, (minY + maxY) / 2);
}

/**
 * Primary container & entry point for the map rendering subsystem
 */
@Component({
  selector: 'wf-viewport',
  templateUrl: './viewport.component.html',
  styleUrls: ['./viewport.component.scss'],
})
export class ViewportComponent implements OnDestroy {
  // populated when the render target element is available
  renderTarget$ = new ReplaySubject<HTMLElement>(1);
  @ViewChild('viewport')
  private set renderTarget(ref: ElementRef) {
    this.renderTarget$.next(ref.nativeElement);
  }

  stage$ = this.renderTarget$.pipe(
    map(
      (target) =>
        new Konva.Stage({
          container: target.id,
          height: window.innerHeight,
          width: window.innerWidth,
        }),
    ),
    take(1),
    cacheValue(),
  );

  // calculates how the system will fit onto the screen
  camera$ = this.stage$.pipe(
    map((stage) => new Camera(stage)),
    cacheValue(),
  );

  onResize$ = fromEvent(window, 'resize').pipe(debounceTime(250), share());

  displayGrid$$ = new BehaviorSubject(false);
  private gridLayer?: Konva.Layer;

  currentYear$ = this.store.pipe(
    select(region.getHeadAlteration),
    filter(Boolean),
    map((alteration) => new Date(alteration.date).getFullYear()),
    cacheValue(),
  );

  private destroy$ = new Subject<void>();

  constructor(public systemService: SystemService, private store: Store<WFState>) {
    // Since everything in here is downstream of the render target, we don't run into any
    // issues without waiting for ngOnInit

    // refresh camera calculations when window resizes
    this.onResize$
      .pipe(
        startWith(null),
        withSampleFrom(this.camera$, this.renderTarget$, this.stage$),
        takeUntil(this.destroy$),
      )
      .subscribe(([, camera, renderTarget, stage]) => {
        stage.width(window.innerWidth).height(window.innerHeight);
        camera.imageSizePx.set({ x: renderTarget.clientWidth, y: renderTarget.clientHeight });
      });

    // refresh display when camera parameters update
    this.camera$
      .pipe(
        switchMap((camera) => camera.imageSizePx.$),
        withSampleFrom(this.stage$),
        takeUntil(this.destroy$),
      )
      .subscribe(([imageSize, stage]) => {
        stage.size(imageSize);
        this.render();
      });

    // TODO: everything below here would be abstracted out of here later
    // render elements of the system when the viewport is ready
    chainRead(this.camera$, 'ready$')
      .pipe(withSampleFrom(this.stage$), take(1))
      .subscribe(([camera, stage]) => {
        const layer = new Konva.Layer();
        stage.add(layer);

        const networkPresenter = new NetworkPresenter(this.systemService, this.store);
        networkPresenter.renderable$.subscribe((renderable) => layer.add(renderable));
        networkPresenter.update$.subscribe(() => this.render());
        networkPresenter.present(camera);
        this.render();
      });

    // reposition the camera to the center of the system and display debugging grid
    this.systemService.system$
      .pipe(
        filter(Boolean),
        withSampleFrom(chainRead(this.camera$, 'ready$')),
        takeUntil(this.destroy$),
      )
      .subscribe({
        error(thrown) {
          console.error(thrown);
        },
        next: ([system, camera]) => {
          camera.panTo(getSystemCenter(system));
          this.displayGrid();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  render() {
    this.stage$.subscribe((stage) => stage.draw());
  }

  displayGrid(doDisplay = this.displayGrid$$.value) {
    this.displayGrid$$.next(doDisplay);
    if (!doDisplay) {
      this.gridLayer?.destroy();
      return;
    }

    combineLatest([this.stage$, chainRead(this.camera$, 'ready$')])
      .pipe(take(1))
      .subscribe(([stage, camera]) => {
        this.gridLayer?.destroy();
        this.gridLayer = this.createGridLayer(camera);
        stage.add(this.gridLayer);
      });
  }

  createGridLayer(camera: Camera): Konva.Layer {
    const layer = new Konva.Layer();
    const yLineCount = Math.abs(window.innerHeight / camera.positionScale.y);
    for (let i = 0; i < yLineCount; i++) {
      const { y: y1 } = camera.project({ x: 0, y: i });
      layer.add(
        new Konva.Line({
          points: [0, y1, window.innerWidth, y1],
          stroke: '#555',
          strokeWidth: 1,
        }),
      );
      if (i === 0) {
        continue;
      }

      const { y: y2 } = camera.project({ x: 0, y: -i });
      layer.add(
        new Konva.Line({
          points: [0, y2, window.innerWidth, y2],
          stroke: '#555',
          strokeWidth: 1,
        }),
      );
    }

    const xLineCount = Math.abs(window.innerWidth / camera.positionScale.x);
    for (let i = 0; i < xLineCount; i++) {
      const { x: x1 } = camera.project({ x: i, y: 0 });
      layer.add(
        new Konva.Line({
          points: [x1, 0, x1, window.innerHeight],
          stroke: '#555',
          strokeWidth: 1,
        }),
      );
      if (i === 0) {
        continue;
      }

      const { x: x2 } = camera.project({ x: -i, y: 0 });
      layer.add(
        new Konva.Line({
          points: [x2, 0, x2, window.innerHeight],
          stroke: '#555',
          strokeWidth: 1,
        }),
      );
    }

    return layer;
  }
}
