import { Vector2 } from '../math';
import { BoundingBox } from '../types/geometry';

export function getBoundingBox(points: Vector2.Expression[]): BoundingBox {
  const box: BoundingBox = {
    minX: Number.POSITIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY,
  };

  return points.filter(Boolean).reduce(
    (box, point) => ({
      minX: Math.min(box.minX, point.x),
      minY: Math.min(box.minY, point.y),
      maxX: Math.max(box.maxX, point.x),
      maxY: Math.max(box.maxY, point.y),
    }),
    box,
  );
}
