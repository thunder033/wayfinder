import { Vector2 } from '@wf-core/math';
import Konva from 'konva';
import { combineLatest, filter, mapTo, merge, Observable, share, take } from 'rxjs';
import { cacheValue } from '@wf-core/utils/rx-operators';

export class Camera {
  position = new Vector2.Rx(0, 0);

  // -100 to account for inverted screen space y-axis
  positionScale = new Vector2.Rx(100, -100);
  imageScale = new Vector2.Rx(1, 1);
  imageSizePx = new Vector2.Rx();
  imageOriginPx = new Vector2.Rx();

  ready$: Observable<Camera> = combineLatest([
    this.imageSizePx.$.pipe(filter(Vector2.Rx.isSet)),
    this.imageOriginPx.$.pipe(filter(Vector2.Rx.isSet)),
  ]).pipe(take(1), mapTo(this), cacheValue());

  update$: Observable<Camera> = merge(
    this.position.$,
    this.positionScale.$,
    this.imageScale.$,
    this.imageOriginPx.$,
  ).pipe(mapTo(this), cacheValue());

  constructor(private stage: Konva.Stage) {
    this.imageSizePx.$.pipe(filter(Vector2.Rx.isSet)).subscribe((imageSize) =>
      this.imageOriginPx.set(imageSize.clone().divideScalar(2)),
    );
  }

  project(point: Vector2.Expression): Vector2 {
    return Vector2.from(point)
      .sub(this.position)
      .multiply(this.positionScale)
      .add(this.imageOriginPx);
  }

  toString() {
    return `Camera {
  position: ${this.position}
  positionScale: ${this.positionScale}
  imageScale: ${this.imageScale}
  imageSizePx: ${this.imageSizePx}
  imageOriginPx: ${this.imageOriginPx}
    }`;
  }
}
