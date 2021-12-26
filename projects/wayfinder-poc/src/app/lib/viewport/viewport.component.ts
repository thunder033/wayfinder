import { Component, ElementRef, ViewChild } from '@angular/core';
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
  switchMap,
  take,
} from 'rxjs';
import Konva from 'konva';
import { map as _map } from 'lodash';

import { System } from '@wf-core/types/network-features';

import { SystemService } from '../system.service';
import { cacheValue, chainRead, withSampleFrom } from '@wf-core/utils/rx-operators';
import { Camera } from './camera';
import { Vector2 } from '@wf-core/math';
import { getBoundingBox } from '@wf-core/utils/geomety';
import { NetworkPresenter } from '../presenter/network-presenter';
import { Store } from '@ngrx/store';
import { WFState } from '@wf-core/types/store';

// AlterationService
// - alteration$
// - displayAlteration(id: string);
// - incrementAlteration();
// - decrementAlteration();

// NetworkPresenter
// - presenters
// - addFeature
// - removeFeature
// - updateFeature

// marker tray - one for each prevailing angle
// - prevailing angle
// - size = # of lines
// - positioning
//   - project 180 deg from prevailing angle
//   - calculated distance by summing projected length of all other trays

function getSystemCenter(system: System): Vector2 {
  const { minX, minY, maxX, maxY } = getBoundingBox(_map(system.nodes, 'position'));
  return new Vector2((minX + maxX) / 2, (minY + maxY) / 2);
}

@Component({
  selector: 'wf-viewport',
  templateUrl: './viewport.component.html',
  styleUrls: ['./viewport.component.scss']
})
export class ViewportComponent {
  renderTarget$ = new ReplaySubject<HTMLElement>(1);
  @ViewChild('viewport')
  private set renderTarget(ref: ElementRef) { this.renderTarget$.next(ref.nativeElement); }

  stage$ = this.renderTarget$.pipe(
    map((target) => new Konva.Stage({
      container: target.id,
      height: window.innerHeight,
      width: window.innerWidth,
    })),
    cacheValue(),
  );

  camera$ = this.stage$.pipe(
    map((stage) => new Camera(stage)),
    cacheValue(),
  );

  onResize$ = fromEvent(window, 'resize').pipe(debounceTime(250), share());

  displayGrid$$ = new BehaviorSubject(false);
  private gridLayer?: Konva.Layer;

  constructor(public systemService: SystemService, private store: Store<WFState>,) {
    this.onResize$
      .pipe(startWith(null), withSampleFrom(this.camera$, this.renderTarget$))
      .subscribe(([, camera, renderTarget]) => {
        camera.imageSizePx.set({ x: renderTarget.clientWidth, y: renderTarget.clientHeight });
      });

    this.camera$
      .pipe(switchMap((camera) => camera.imageSizePx.$), withSampleFrom(this.stage$))
      .subscribe(([imageSize, stage]) => {
        stage.size(imageSize);
        this.render();
      });

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

    this.systemService.system$
      .pipe(
        filter(Boolean),
        withSampleFrom(chainRead(this.camera$, 'ready$'))
      )
      .subscribe({
        error(thrown) { console.error(thrown); },
        next: ([system, camera]) => {
          camera.position.set(getSystemCenter(system));
          this.displayGrid();
        },
      });
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
      layer.add(new Konva.Line({
        points: [0, y1, window.innerWidth, y1],
        stroke: '#555',
        strokeWidth: 1,
      }));
      if (i === 0) {
        continue;
      }

      const { y: y2 } = camera.project({ x: 0, y: -i });
      layer.add(new Konva.Line({
        points: [0, y2, window.innerWidth, y2],
        stroke: '#555',
        strokeWidth: 1,
      }));
    }

    const xLineCount = Math.abs(window.innerWidth / camera.positionScale.x);
    for (let i = 0; i < xLineCount; i++) {
      const { x: x1 } = camera.project({ x: i, y: 0 });
      layer.add(new Konva.Line({
        points: [x1, 0, x1, window.innerHeight],
        stroke: '#555',
        strokeWidth: 1,
      }));
      if (i === 0) {
        continue;
      }

      const { x: x2 } = camera.project({ x: -i, y: 0 });
      layer.add(new Konva.Line({
        points: [x2, 0, x2, window.innerHeight],
        stroke: '#555',
        strokeWidth: 1,
      }));
    }

    return layer;
  }
}
