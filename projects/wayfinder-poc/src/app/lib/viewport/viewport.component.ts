import { Component, OnInit } from '@angular/core';
import { defer, of, withLatestFrom } from 'rxjs';
import Konva from 'konva';
import { flatten, flattenDeep } from 'lodash';

import { Line, WFNode } from '@wf-core/types/network-features';

import { SystemService } from '../system.service';
import { Renderable } from './viewport.types';
import { asLinePoints, chunkLineNodes } from './viewport-utils';
import { StationController, WFNodeController } from './node-controller';

const LINE_STYLE: Partial<Konva.LineConfig> = {
  stroke: '#000',
  strokeWidth: 8,
}

@Component({
  selector: 'wf-viewport',
  templateUrl: './viewport.component.html',
  styleUrls: ['./viewport.component.scss']
})
export class ViewportComponent implements OnInit {
  stage$ = defer(() => of(
    new Konva.Stage({
      container: 'viewport',
      height: window.innerHeight,
      width: window.innerWidth,
    })),
  )

  constructor(private systemService: SystemService) {}

  ngOnInit(): void {
    this.systemService.system$
      .pipe(withLatestFrom(this.stage$))
      .subscribe(([system, stage]) => {
        system.nodes.forEach((node) => WFNodeController.create(node, system.lines));

        const lineShapes = system.lines.map((line) => this.getLineShapes(line));
        const stationLabels = system.nodes
          .map(({ id }) => {
            const controller = WFNodeController.get(id);
            return controller instanceof StationController ? controller.getStationLabel() : null
          })
          .filter((label) => !!label);

        const layer = new Konva.Layer();
        stage.add(layer);
        console.log(flatten(lineShapes));
        flatten(lineShapes).forEach((shape) => layer.add(shape));
        stationLabels.forEach((shape) => layer.add(shape!));
        stage.draw();
      })
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
