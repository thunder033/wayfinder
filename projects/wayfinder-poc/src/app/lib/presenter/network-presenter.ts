import { SystemService } from '../system.service';
import { FeaturePresenter } from './feature-presenter';
import { Camera } from '../viewport/camera';
import { Subject } from 'rxjs';
import { Renderable } from '../viewport/viewport.types';
import { NodePresenter, StationPresenter } from './node-presenter';
import { Line } from '@wf-core/types/network-features';
import { asLinePoints, chunkLineNodes } from '../viewport/viewport-utils';
import Konva from 'konva';

const LINE_STYLE: Partial<Konva.LineConfig> = {
  stroke: '#000',
  strokeWidth: 8,
}

export class NetworkPresenter {
  private presenters: {[featureId: string]: FeaturePresenter } = {};

  private renderable$$ = new Subject<Renderable>();
  renderable$ = this.renderable$$.asObservable();

  constructor(
    private systemService: SystemService
  ) {}

  present(camera: Camera): void {
    this.systemService.system$.subscribe((system) => {
      system.nodes.forEach((node) => NodePresenter.create(camera, node, system.lines));

      system.lines
        .map((line) => this.getLineShapes(line))
        .flat()
        .forEach((renderable) => this.renderable$$.next(renderable));

      system.nodes
        .map(({id}) => {
          const controller = NodePresenter.get(id);
          return controller instanceof StationPresenter ? controller.getStationLabel() : null
        })
        .filter((label) => !!label)
        .forEach((label) => this.renderable$$.next(label!));
    });
  }

  getLineShapes(line: Line): Renderable[] {
    const chunks = chunkLineNodes(line);
    const lines = chunks.map((chunk) =>
      new Konva.Line({
        points: asLinePoints(chunk.map((node) => NodePresenter.get(node.id).getRenderNodePosition(line.id))),
        ...LINE_STYLE,
        stroke: line.color,
      })
    );
    const nodes = line.services
      .map(({ segments }) => segments.map(({ nodes }) => nodes))
      .flat(2);
    const markers = nodes.map((node) => NodePresenter.get(node.id).getLineNodeMarker(line.id));

    return [...lines, ...markers];
  }
}
