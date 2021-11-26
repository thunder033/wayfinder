import { Observable, Subject } from 'rxjs';

export interface Vector2Expression {
  x: number;
  y: number;
}

export class Vector2 implements Vector2Expression {
  static ZERO: Readonly<Vector2> = new Vector2(0, 0, true);
  static Rx: typeof RxVector2;

  static angleTo(a: Vector2Expression, b: Vector2Expression): number {
    return Math.atan2(b.y - a.y, b.x - a.x);
  }

  static from(expression: Vector2Expression): Vector2 {
    return new Vector2(expression.x, expression.y);
  }

  protected readonly buffer: [number, number] = [0, 0];

  get x() { return this.buffer[0]; }
  get y() { return this.buffer[1]; }

  get width() { return this.buffer[0]; }
  get height() { return this.buffer[1]; }

  constructor(x: number, y: number, isConst = false) {
    this.buffer[0] = x;
    this.buffer[1] = y;

    if (isConst) {
      Object.freeze(this.buffer);
    }
  }

  set({ x = this.x, y = this.y }: Vector2Expression): this {
    Object.assign(this.buffer, [x, y]);
    return this;
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  asExpression(): Vector2Expression {
    return { x: this.buffer[0], y: this.buffer[1] };
  }

  *[Symbol.iterator]() {
    yield this.buffer[0];
    yield this.buffer[1];
  }

  toString(): string {
    return `[${this.x}, ${this.y}]`;
  }

  add(term: Vector2Expression): this {
    return this.set({
      x: this.x + term.x,
      y: this.y + term.y,
    });
  }

  sub(term: Vector2Expression): this {
    return this.set({
      x: this.x - term.x,
      y: this.y - term.y,
    });
  }

  multiply(term: Vector2Expression): this {
    return this.set({
      x: this.x * term.x,
      y: this.y * term.y,
    });
  }

  divide(term: Vector2Expression): this {
    return this.set({
      x: this.x / term.x,
      y: this.y / term.y,
    });
  }

  scale(scalar: number): this {
    return this.set({
      x: this.x + scalar,
      y: this.y + scalar,
    });
  }

  divideScalar(scalar: number): this {
    return this.set({
      x: this.x / scalar,
      y: this.y / scalar,
    });
  }
}

class RxVector2 extends Vector2 {
  private change = new Subject<this>();

  $: Observable<RxVector2> = this.change.asObservable();

  static isSet(v: RxVector2): boolean {
    return !Number.isNaN(v.x) && !Number.isNaN(v.y);
  }

  constructor(x: number = NaN, y: number = NaN) {
    super(x, y);
  }

  override set({ x = this.x, y = this.y }: Vector2Expression): this {
    Object.assign(this.buffer, [x, y]);
    this.change.next(this);
    return this;
  }
}

Vector2.Rx = RxVector2;

export namespace Vector2 {
  export type Expression = Vector2Expression;
}
