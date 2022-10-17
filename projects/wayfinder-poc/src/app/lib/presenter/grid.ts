import Konva from 'konva';
import { Observable, Subject, takeUntil } from 'rxjs';

import { WFKonva } from '@wf-core/wf-konva/wf-konva';
import { WFEvent } from '@wf-core/wf-konva/wf-tween';

import { Camera } from '../viewport/camera';

const LINE_STYLE = {
  stroke: '#555',
  strokeWidth: 1,
};

export class Grid extends Konva.Layer {
  constructor(camera: Camera) {
    super();

    const yLineCount = Math.abs(window.innerHeight / camera.positionScale.y);
    for (let i = 0; i < yLineCount; i++) {
      const line1 = new Konva.Line({ ...LINE_STYLE });
      this.add(line1);
      camera
        .project$({ x: 0, y: i })
        .pipe(takeUntil(WFKonva.on$(this, WFEvent.Destroy)))
        .subscribe(({ y: y1 }) => {
          line1.points([0, y1, window.innerWidth, y1]);
        });

      if (i === 0) {
        continue;
      }

      const line2 = new Konva.Line({ points: [0, 0, window.innerWidth, 0], ...LINE_STYLE });
      this.add(line2);
      camera
        .project$({ x: 0, y: -i })
        .pipe(takeUntil(WFKonva.on$(this, WFEvent.Destroy)))
        .subscribe(({ y: y1 }) => {
          line2.points([0, y1, window.innerWidth, y1]);
        });
    }

    const xLineCount = Math.abs(window.innerWidth / camera.positionScale.x);
    for (let i = 0; i < xLineCount; i++) {
      const line1 = new Konva.Line({ ...LINE_STYLE });
      this.add(line1);
      camera
        .project$({ x: i, y: 0 })
        .pipe(takeUntil(WFKonva.on$(this, WFEvent.Destroy)))
        .subscribe(({ x: x1 }) => {
          line1.points([x1, 0, x1, window.innerHeight]);
        });

      if (i === 0) {
        continue;
      }

      const line2 = new Konva.Line({ ...LINE_STYLE });
      this.add(line2);
      camera
        .project$({ x: -i, y: 0 })
        .pipe(takeUntil(WFKonva.on$(this, WFEvent.Destroy)))
        .subscribe(({ x: x1 }) => {
          line2.points([x1, 0, x1, window.innerHeight]);
        });
    }
  }

  override destroy(): this {
    WFKonva.fire(this, WFEvent.Destroy, { teardown$$: new Subject<Observable<unknown>>() });
    return super.destroy();
  }
}
