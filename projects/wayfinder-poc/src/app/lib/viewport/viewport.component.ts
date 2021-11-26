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
import { flatten, flattenDeep } from 'lodash';

import { Line, WFNode } from '@wf-core/types/network-features';

import { SystemService } from '../system.service';
import { Renderable } from './viewport.types';
import { asLinePoints, chunkLineNodes } from './viewport-utils';
import { StationController, WFNodeController } from './node-controller';
import { cacheValue, chainRead, withSampleFrom } from '@wf-core/utils/rx-operators';
import { Camera } from './camera';

// AlterationService
// - alteration$
//

const LINE_STYLE: Partial<Konva.LineConfig> = {
  stroke: '#000',
  strokeWidth: 8,
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
          system.nodes.forEach((node) => WFNodeController.create(camera, node, system.lines));

          const lineShapes = system.lines.map((line) => this.getLineShapes(line));
          const stationLabels = system.nodes
            .map(({id}) => {
              const controller = WFNodeController.get(id);
              return controller instanceof StationController ? controller.getStationLabel() : null
            })
            .filter((label) => !!label);

          const layer = new Konva.Layer();
          stage.add(layer);
          console.log(flatten(lineShapes));
          flatten(lineShapes).forEach((shape) => layer.add(shape));
          stationLabels.forEach((shape) => layer.add(shape!));
          this.render();
        },
      })
  }

  render() {
    this.stage$.subscribe((stage) => stage.draw());
  }

  getLineShapes(line: Line): Renderable[] {
    const chunks = chunkLineNodes(line);
    const lines = chunks.map((chunk) =>
      new Konva.Line({
        points: asLinePoints(chunk.map((node) => WFNodeController.get(node.id).getRenderNodePosition(line.id))),
        ...LINE_STYLE,
        stroke: line.color,
      })
    );
    const nodes = flattenDeep<WFNode>(line.services.map(({ segments }) => segments.map(({ nodes }) => nodes)));
    const markers = nodes.map((node) => WFNodeController.get(node.id).getLineNodeMarker(line.id));

    return [...lines, ...markers];
  }
}
