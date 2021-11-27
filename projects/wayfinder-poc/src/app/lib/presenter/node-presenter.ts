import { FeatureType, Line, Station, WFNode } from '@wf-core/types/network-features';
import { Renderable } from '../viewport/viewport.types';
import Konva from 'konva';
import { add, getSegments, toDeg } from '../viewport/viewport-utils';
import { Vector2 } from '@wf-core/math';
import { Camera } from '../viewport/camera';
import { FeaturePresenter } from './feature-presenter';

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

export class NodePresenter<T extends WFNode = WFNode> extends FeaturePresenter {
  private static controllers: {[nodeId: string]: NodePresenter} = {};
  static create(camera: Camera, node: WFNode, lines: Line[]): NodePresenter {
    const controller = node.type === FeatureType.Station
      ? new StationPresenter(camera, node as Station, lines)
      : new NodePresenter(camera, node, lines);
    NodePresenter.controllers[node.id] = controller;
    return controller;
  }

  static get(id: string): NodePresenter {
    return NodePresenter.controllers[id];
  }

  private nodeLines = this.lines.filter((line) => this.hasNode(line));
  private lineRenderNodeOptions = this.generateLineRenderNodeOptions();

  constructor(
    protected readonly camera: Camera,
    protected readonly node: T,
    protected readonly lines: Line[],
  ) {
    super();
  }

  getLineNodeMarker(lineId: string): Renderable {
    return new Konva.Group();
  }

  getRenderNodePosition(lineId: string) {
    const origin = this.camera.project(this.node.position);
    const { index, orientation } = this.lineRenderNodeOptions.find((options) => options.lineId === lineId)!;
    const radius = NODE_STYLE.radius!;
    const offset = ((-this.nodeLines.length + index) * radius * 2) + radius;
    return origin
      .add({ x: offset * Math.sin(orientation), y: offset * Math.cos(orientation) })
  }

  private hasNode(line: Line) {
    return getSegments(line).some((segment) => segment.nodes.includes(this.node));
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

export class StationPresenter extends NodePresenter<Station> {
  getStationLabel(): Renderable {
    return new Konva.Text({
      text: this.node.name,
      ...this.camera.project(this.node.position).asExpression(),
    });
  }

  override getLineNodeMarker(lineId: string): Renderable {
    const position = this.getRenderNodePosition(lineId).asExpression();
    return new Konva.Circle({ ...STATION_MARKER_STYLE, ...position });
  }
}
