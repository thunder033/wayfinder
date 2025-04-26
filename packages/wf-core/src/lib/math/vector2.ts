import { Observable, Subject } from 'rxjs';

import { Vector2Expression } from '../types/geometry';
import { cacheValue } from '../utils/rx-operators';

export class Vector2 implements Vector2Expression {
  static ZERO: Readonly<Vector2> = new Vector2(0, 0, true);
  static Rx: typeof RxVector2;

  static angleTo(a: Vector2Expression, b: Vector2Expression): number {
    return Math.atan2(b.y - a.y, b.x - a.x);
  }

  static dot(a: Vector2Expression, b: Vector2Expression): number {
    return a.x * b.x + a.y * b.y;
  }

  static project(a: Vector2, b: Vector2): Vector2 {
    return a.clone().scale(Vector2.dot(a, b) / a.magnitude());
  }

  static interpolate(a: Vector2, b: Vector2, position: number) {
    return new Vector2(a.x + (b.x - a.x) * position, a.y + (b.y - a.y) * position);
  }

  static from(expression: Vector2Expression): Vector2 {
    return new Vector2(expression.x, expression.y);
  }

  protected readonly buffer: [number, number] = [0, 0];

  get x() {
    return this.buffer[0];
  }
  get y() {
    return this.buffer[1];
  }

  get width() {
    return this.buffer[0];
  }
  get height() {
    return this.buffer[1];
  }

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

  tap(label: string): this {
    console.log(label + ' ' + this.toString());
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
      x: this.x * scalar,
      y: this.y * scalar,
    });
  }

  divideScalar(scalar: number): this {
    return this.set({
      x: this.x / scalar,
      y: this.y / scalar,
    });
  }

  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normal() {
    return this.divideScalar(this.magnitude());
  }

  /**
   * Get the length of the vector
   */
  len() {
    return Math.sqrt(this.len2());
  }

  /**
   * Get the lengths squared of the vector
   */
  len2() {
    return this.x * this.x + this.y * this.y;
  }
}

class RxVector2 extends Vector2 {
  private change$$ = new Subject<this>();

  $: Observable<RxVector2> = this.change$$.pipe(cacheValue());

  static isSet(v: RxVector2): boolean {
    return !Number.isNaN(v.x) && !Number.isNaN(v.y);
  }

  constructor(x = NaN, y = NaN) {
    super(x, y);
  }

  override set({ x = this.x, y = this.y }: Vector2Expression): this {
    Object.assign(this.buffer, [x, y]);
    this.change$$.next(this);
    return this;
  }
}

Vector2.Rx = RxVector2;

export namespace Vector2 {
  export type Expression = Vector2Expression;
}
