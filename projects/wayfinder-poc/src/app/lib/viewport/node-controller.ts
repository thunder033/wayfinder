import { FeatureType, Line, Station, WFNode } from '@wf-core/types/network-features';
import { Renderable } from './viewport.types';
import Konva from 'konva';
import { add, getSegments, mapToViewportCoords, toDeg } from './viewport-utils';
import { flatten } from 'lodash';
import { Vector2 } from '@wf-core/types/geometry';

const NODE_STYLE: Partial<Konva.CircleConfig> = {
  radius: 4,
}

const STATION_MARKER_STYLE: Partial<Konva.CircleConfig> = {
  ...NODE_STYLE,
  fill: '#fff',
  stroke: '#333',
  strokeWidth: 1,
}

interface RenderNodeOptions {
  lineId: string;
  orientation: number;
  index: number;
}

export class WFNodeController<T extends WFNode = WFNode> {
  private static controllers: {[nodeId: string]: WFNodeController} = {};
  static create(node: WFNode, lines: Line[]): WFNodeController {
    const controller = node.type === FeatureType.Station
      ? new StationController(node as Station, lines)
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
    protected readonly node: T,
    protected readonly lines: Line[],
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
      const orientation = angles.reduce(add, 0) / angles.length;

      return { lineId: line.id, index, orientation };
    });
  }
}

export class StationController extends WFNodeController<Station> {
  getStationLabel(): Renderable {
    return new Konva.Text({
      text: this.node.name,
      ...mapToViewportCoords(this.node.position),
    });
  }

  override getLineNodeMarker(lineId: string): Renderable {
    return new Konva.Circle({ ...STATION_MARKER_STYLE, ...this.getRenderNodePosition(lineId) });
  }
}
