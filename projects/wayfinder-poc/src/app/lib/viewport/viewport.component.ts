import { Component, OnInit } from '@angular/core';
import { defer, of, withLatestFrom } from 'rxjs';
import Konva from 'konva';
import { flatten, flattenDeep, last } from 'lodash';

import { FeatureType, Line, Segment, WFNode } from '@wf-core/types/network-features';
import { Vector2 } from '@wf-core/types/geometry';

import { SystemService } from '../system.service';

type Renderable = Konva.Shape | Konva.Group;

const NODE_STYLE: Partial<Konva.CircleConfig> = {
  radius: 4,
}

const STATION_MARKER_STYLE: Partial<Konva.CircleConfig> = {
  ...NODE_STYLE,
  fill: '#fff',
  stroke: '#333',
  strokeWidth: 1,
}

const LINE_STYLE: Partial<Konva.LineConfig> = {
  stroke: '#000',
  strokeWidth: 8,
}

function add(a: number, b: number): number {
  return a + b;
}

function toDeg(rad: number): number {
  return rad / Math.PI * 180;
}

function getSegments(line: Line): Segment[] {
  return flatten(line.services.map(({ segments }) => segments));
}

function chunkLineNodes(line: Line): WFNode[][] {
  return getSegments(line).reduce(
    (chunks: WFNode[][], segment: Segment) => {
      const head = chunks.pop();
      const chunk = head && segment.nodes[0].id === last(head)?.id
        ? [...head, ...segment.nodes.slice(1)]
        : [...segment.nodes];

      return [...chunks, chunk];
    },
    <WFNode[][]>[],
  )
}

function mapToViewportCoords(position: Vector2.Expression): Vector2.Expression {
  const origin = { x: 0, y: 500 }
  return {
    x: origin.x + position.x * 100,
    y: origin.y + position.y * -100,
  }
}

function asLinePoints(chunk: Vector2.Expression[]): number[] {
  return flatten(chunk.map(({ x, y }) => [x, y]));
}

interface RenderNodeOptions {
  lineId: string;
  orientation: number;
  index: number;
}

class WFNodeController {
  private static controllers: {[nodeId: string]: WFNodeController} = {};
  static create(node: WFNode, lines: Line[]): WFNodeController {
    const controller = node.type === FeatureType.Station
      ? new StationController(node, lines)
      : new WFNodeController(node, lines);
    WFNodeController.controllers[node.id] = controller;
    return controller;
  }

  static get(id: string): WFNodeController {
    return WFNodeController.controllers[id];
  }

  private nodeLines = this.lines.filter((line) => this.hasNode(line));
  private lineRenderNodeOptions = this.generateLineRenderNodeOptions();

  constructor(
    private readonly node: WFNode,
    private readonly lines: Line[],
  ) {}

  getLineNodeMarker(lineId: string): Renderable {
    return new Konva.Group();
  }

  getRenderNodePosition(lineId: string) {
    const origin = mapToViewportCoords(this.node.position);
    const options = this.lineRenderNodeOptions.find((options) => options.lineId === lineId)!;
    const radius = NODE_STYLE.radius!;
    const offset = ((-this.nodeLines.length + options.index) * radius * 2) + radius;
    return {
      x: origin.x + offset * Math.sin(options.orientation),
      y: origin.y + offset * Math.cos(options.orientation),
    }
  }

  private hasNode(line: Line) {
    return flatten(line.services.map(({ segments }) => segments))
      .some((segment) => segment.nodes.includes(this.node));
  }

  private generateLineRenderNodeOptions(): RenderNodeOptions[] {
    return this.nodeLines.map((line, index) => {
      const segment = getSegments(line).find((segment) => segment.nodes.includes(this.node))!;
      const nodeIndex = segment.nodes.indexOf(this.node);
      const leftNode = segment.nodes[nodeIndex - 1];
      const rightNode = segment.nodes[nodeIndex + 1];

      const angleLeft = !leftNode ? NaN : Vector2.angleTo(leftNode.position, this.node.position);
      const angleRight = !rightNode ? NaN : Vector2.angleTo(this.node.position, rightNode.position);
      const angles = [angleLeft, angleRight].filter(Number.isFinite);
      console.log(`${line.name} ${this.node.id}`, [angleLeft, angleRight].map(toDeg))
      const orientation = angles.map((v) => v - 0).reduce(add, 0) / angles.length;

      return { lineId: line.id, index, orientation };
    });
  }
}

class StationController extends WFNodeController {
  override getLineNodeMarker(lineId: string): Konva.Shape {
    return new Konva.Circle({ ...this.getRenderNodePosition(lineId), ...STATION_MARKER_STYLE });
  }
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

        const layer = new Konva.Layer();
        stage.add(layer);
        console.log(flatten(lineShapes));
        flatten(lineShapes).forEach((shape) => layer.add(shape));
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
