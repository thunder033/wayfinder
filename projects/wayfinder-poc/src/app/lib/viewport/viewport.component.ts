import { Component, OnInit } from '@angular/core';
import { defer, of, withLatestFrom } from 'rxjs';
import Konva from 'konva';
import { flatten, isEqual, last } from 'lodash';

import { Line, Segment } from '@wf-core/types/network-features';
import { Vector2 } from '@wf-core/types/geometry';

import { SystemService } from '../system.service';

const NODE_STYLE: Partial<Konva.CircleConfig> = {
  radius: 4,
  fill: '#fff',
  stroke: '#333',
  strokeWidth: 1,
}

const LINE_STYLE: Partial<Konva.LineConfig> = {
  stroke: '#000',
  strokeWidth: 8,
}

function buildLineChunks(line: Line): Vector2[][] {
  return flatten(line.services.map(({ segments }) => segments)).reduce(
    (chunks: Vector2[][], segment: Segment) => {
      const head = chunks.pop();
      const chunk = !head || !isEqual(segment.nodes[0], last(head))
        ? [...segment.nodes.map(({ position }) => position)]
        : [...head, ...segment.nodes.slice(1).map(({ position }) => position)];

      return [...chunks, chunk];
    },
    <Vector2[][]>[],
  )
}

function mapToViewportCoords(position: Vector2): Vector2 {
  return {
    x: position.x * 100,
    y: position.y * 100,
  }
}

function asLinePoints(chunk: Vector2[]): number[] {
  return flatten(chunk.map(mapToViewportCoords).map(({ x, y }) => [x, y]));
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
        const nodeMarkers = system.nodes.map((node) =>
          new Konva.Circle({...mapToViewportCoords(node.position), ...NODE_STYLE}),
        );

        const servicePaths = system.lines.map((line) => {
          const chunks = buildLineChunks(line);
          return chunks.map((chunk) =>
            new Konva.Line({points: asLinePoints(chunk), ...LINE_STYLE, stroke: line.color})
          );
        });

        const layer = new Konva.Layer();
        stage.add(layer);
        flatten(servicePaths).forEach((path) => layer.add(path));
        nodeMarkers.forEach((marker) => layer.add(marker));
        stage.draw();
      })
  }
}
