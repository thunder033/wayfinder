export interface Vector2Expression {
  x: number;
  y: number;
}

export class Vector2 {
  static angleTo(a: Vector2Expression, b: Vector2Expression): number {
    return Math.atan2(b.y - a.y, b.x - a.x);
  }
}

export namespace Vector2 {
  export type Expression = Vector2Expression;
}
