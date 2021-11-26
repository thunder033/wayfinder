import { Component, ElementRef, ViewChild } from '@angular/core';
import { debounceTime, fromEvent, map, ReplaySubject, share, switchMap, withLatestFrom } from 'rxjs';
import Konva from 'konva';
import { flatten, flattenDeep } from 'lodash';

import { Line, WFNode } from '@wf-core/types/network-features';

import { SystemService } from '../system.service';
import { Renderable } from './viewport.types';
import { asLinePoints, chunkLineNodes } from './viewport-utils';
import { StationController, WFNodeController } from './node-controller';
import { Vector2 } from '@wf-core/types/geometry';
import { cacheValue, withSampleFrom } from '@wf-core/utils/rx-operators';

// AlterationService
// - alteration$
//

const LINE_STYLE: Partial<Konva.LineConfig> = {
  stroke: '#000',
  strokeWidth: 8,
}

class Camera {
  position = new Vector2.Rx(0, 0);

  // -100 to account for inverted screen space y-axis
  positionScale = new Vector2.Rx(100, -100);
  imageScale = new Vector2.Rx(1, 1);
  imageSizePx = new Vector2.Rx(0, 0);

  constructor(private stage: Konva.Stage) {}

  project(point: Vector2): Vector2 {
    return point.clone().sub(this.position).multiply(this.positionScale);
  }

  getImageOrigin(): Vector2 {
    const { height, width } = this.stage.size();
    const { x: scale } = this.stage.scale();
    // account for scaling of the stage
    return new Vector2(width, height).divideScalar(2).scale(1 / scale);
  }
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
      .pipe(withLatestFrom(this.camera$, this.renderTarget$))
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
      .pipe(withSampleFrom(this.stage$))
      .subscribe({
        error(thrown) { console.error(thrown); },
        next: ([system, stage]) => {
          system.nodes.forEach((node) => WFNodeController.create(node, system.lines));

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
