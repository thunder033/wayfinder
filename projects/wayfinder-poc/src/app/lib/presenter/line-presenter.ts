import Konva from 'konva';

import { FeatureType, Line } from '@wf-core/types/network-features';

import { FeaturePresenter } from './feature-presenter';
import { Camera } from '../viewport/camera';
import { Renderable } from '../viewport/viewport.types';
import { asLinePoints, chunkLineNodes } from '../viewport/viewport-utils';
import { NodePresenter } from './node-presenter';

const LINE_STYLE: Partial<Konva.LineConfig> = {
  stroke: '#000',
  strokeWidth: 8,
}

export class LinePresenter extends FeaturePresenter<FeatureType.Line> {
  private lineChunks: Konva.Line[] = [];
  private nodeMarkers: Renderable[] = [];

  initialize(line: Line): void {
    this.lineChunks = chunkLineNodes(line).map((chunk) =>
      new Konva.Line({
        points: asLinePoints(chunk.map((node) => NodePresenter.get(node.id).getRenderNodePosition(line.id))),
        ...LINE_STYLE,
        stroke: line.color,
      })
    );

    this.nodeMarkers = line.services
      .map(({ segments }) => segments.map(({ nodes }) => nodes))
      .flat(2)
      .map((node) => NodePresenter.get(node.id).getLineNodeMarker(line.id));

    [...this.lineChunks, ...this.nodeMarkers].forEach((renderable) => this.renderable$$.next(renderable));
  }
}
