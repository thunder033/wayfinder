import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  debounceTime,
  fromEvent,
  map,
  ReplaySubject,
  share,
  startWith,
  switchMap,
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

// AlterationService
// - alteration$
// - displayAlteration(id: string);
// - incrementAlteration();
// - decrementAlteration();
// abstract FeaturePresenter<T>
// - renderable$: Observable<Renderable>
// - featureId
// - featureType
// - teardown();
// > NodePresenter
// > StationPresenter
// > LinePresenter
// > SystemPresenter
// NetworkPresenter
// - presenters
// - addFeature
// - removeFeature
// - updateFeature

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
  private set renderTarget(ref: ElementRef) { this.renderTarget$.next(ref.nativeElement); };

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

  constructor(private systemService: SystemService) {
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

    this.systemService.system$
      .pipe(withSampleFrom(this.stage$, this.camera$, chainRead(this.camera$, 'ready$')))
      .subscribe({
        error(thrown) { console.error(thrown); },
        next: ([system, stage, camera]) => {
          camera.position.set(getSystemCenter(system));

          const layer = new Konva.Layer();
          stage.add(layer);

          const networkPresenter = new NetworkPresenter(this.systemService);
          networkPresenter.renderable$.subscribe((renderable) => layer.add(renderable));
          networkPresenter.present(camera);
          this.render();
        },
      })
  }

  render() {
    this.stage$.subscribe((stage) => stage.draw());
  }
}
