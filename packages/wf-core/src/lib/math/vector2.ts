import { Observable, Subject } from 'rxjs';

import { Vector2Expression } from '../types/geometry';
import { cacheValue } from '../utils/rx-operators';

export class Vector2 implements Vector2Expression {
  static ZERO: Readonly<Vector2> = new Vector2(0, 0, true);
  static Rx: typeof RxVector2;

  /** treating A and B as points, returns the angle of the vector from A to B relative to the positive X-axis */
  static angleTo(a: Vector2Expression, b: Vector2Expression): number {
    return Math.atan2(b.y - a.y, b.x - a.x);
  }

  /** calculates the dot product of A and B */
  static dot(a: Vector2Expression, b: Vector2Expression): number {
    return a.x * b.x + a.y * b.y;
  }

  /** creates a new vector that is a projection of B onto A */
  static project(a: Vector2, b: Vector2): Vector2 {
    const magA = a.magnitude();
    return a.clone().scale(Vector2.dot(a, b) / (magA * magA));
  }

  /**
   * treating A and B as points, calculates the intermediate point given by position (.5 is halfway between A and B)
   * i.e. interpolate(a, b, .75) -> give the point that is 75% of way towards B starting from A
   * @param a point vector
   * @param b point vector
   * @param position a scalar that indicates how far towards B the result is (0 - 1)
   */
  static interpolate(a: Vector2, b: Vector2, position: number) {
    return new Vector2(a.x + (b.x - a.x) * position, a.y + (b.y - a.y) * position);
  }

  /** creates a Vector2 instance from a vector expression */
  static from(expression: Vector2Expression): Vector2 {
    return new Vector2(expression.x, expression.y);
  }

  // the vector is represented internally as an array tuple
  // this creates interoperability with more advanced calculation patterns (ex. matrices)
  protected readonly buffer: [number, number] = [0, 0];

  get x() {
    return this.buffer[0];
  }
  get y() {
    return this.buffer[1];
  }

  // alternative nomenclature for vector components
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

  /**
   * independently assigns new values to vector components, specified as an expression for
   * ease of use
   */
  set({ x = this.x, y = this.y }: Partial<Vector2Expression>): this {
    Object.assign(this.buffer, [x, y]);
    return this;
  }

  /** log out the current value of the vector in a chain statement */
  tap(label: string): this {
    console.log(label + ' ' + this.toString());
    return this;
  }

  /** creates a copy of the vector; does not propagate const state */
  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  /** creates an expression of the vector components */
  asExpression(): Vector2Expression {
    return { x: this.buffer[0], y: this.buffer[1] };
  }

  /** provides the vector components as an iterable */
  *[Symbol.iterator]() {
    yield this.buffer[0];
    yield this.buffer[1];
  }

  toString(): string {
    // ensure the vector is not serialized as [Object object]
    return `[${this.x}, ${this.y}]`;
  }

  /**
   * Adds the components of the term to this vector, in place
   * @param term the component values to add this vector
   */
  add(term: Vector2Expression): this {
    return this.set({
      x: this.x + term.x,
      y: this.y + term.y,
    });
  }

  /**
   * Subtracts the components of the term to this vector, in place
   * @param term the component values to subtract from this vector
   */
  sub(term: Vector2Expression): this {
    return this.set({
      x: this.x - term.x,
      y: this.y - term.y,
    });
  }

  /**
   * Multiples the components this vector by the components of the term, in place
   * @param term the component values to multiply this vector by
   */
  multiply(term: Vector2Expression): this {
    return this.set({
      x: this.x * term.x,
      y: this.y * term.y,
    });
  }

  /**
   * Divides the components this vector by the components of the term, in-place
   * @param term the component values to divide this vector by
   */
  divide(term: Vector2Expression): this {
    return this.set({
      x: this.x / term.x,
      y: this.y / term.y,
    });
  }

  /**
   * Multiplies both components of this vector by the scalar, in-place
   */
  scale(scalar: number): this {
    return this.set({
      x: this.x * scalar,
      y: this.y * scalar,
    });
  }

  /**
   * Divides both components of this vector by the scalar, in-place
   */
  divideScalar(scalar: number): this {
    return this.set({
      x: this.x / scalar,
      y: this.y / scalar,
    });
  }

  /**
   * Calculates the (absolute) magnitude of the vector
   */
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Converts this vector to its normal in-place (same direction, magnitude of 1)
   */
  normal() {
    return this.divideScalar(this.magnitude());
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
