import { expect } from 'vitest';

import { Vector2 } from './vector2';

describe('Vector2', () => {
  it('creates a vector with 2 components', () => {
    const v = new Vector2(1, 2);
    expect(v.x).toBe(1);
    expect(v.y).toBe(2);
  });

  it('does not allow modifying a vector specified as const', () => {
    const v = new Vector2(1, 2, true);

    const changeX = () => {
      v.set({ x: 3 });
    };

    expect(changeX).toThrow();

    const changeY = () => {
      v.set({ y: 4 });
    };

    expect(changeY).toThrow();
  });

  describe('ZERO', () => {
    it('is a const vector with 0 components', () => {
      expect(Vector2.ZERO.x).toBe(0);
      expect(Vector2.ZERO.y).toBe(0);
    });
  });

  describe('angleTo', () => {
    it('returns the angle of the vector from point A to point B, relative to the positive X-axis', () => {
      let a = new Vector2(0, 1);
      let b = new Vector2(1, 0);
      expect(Vector2.angleTo(a, b)).toBeCloseTo(-Math.PI / 4); // AKA -135 deg or 45 deg up from negative x-axis

      a = new Vector2(1, 0);
      b = new Vector2(0, 1);
      expect(Vector2.angleTo(a, b)).toBeCloseTo((3 * Math.PI) / 4); // AKA 135 deg clockwise

      a = new Vector2(0, 1);
      b = new Vector2(0, 1);
      expect(Vector2.angleTo(a, b)).toBeCloseTo(0); // 0 deg

      a = new Vector2(0, 1);
      b = new Vector2(0, 1);
      expect(Vector2.angleTo(a, b)).toBeCloseTo(0); // 0 deg

      a = new Vector2(0, -1);
      b = new Vector2(0, 1);
      expect(Vector2.angleTo(a, b)).toBeCloseTo(Math.PI / 2); // 180 deg; clockwise

      a = new Vector2(0, 1);
      b = new Vector2(0, -1);
      expect(Vector2.angleTo(a, b)).toBeCloseTo(-Math.PI / 2); // -180 deg; CCW
    });
  });

  describe('dot', () => {
    it('calculates the dot product of 2 vectors', () => {
      const a = new Vector2(2, 3);
      const b = new Vector2(4, 5);
      const r = Vector2.dot(a, b);
      expect(r).toBe(23);
    });
  });

  describe('project', () => {
    it('creates a new vector that is project of B onto A', () => {
      const a = new Vector2(2, 2);
      const b = new Vector2(0, 1);
      const r = Vector2.project(a, b);
      expect(r.x).toBeCloseTo(0.5, 3);
      expect(r.y).toBeCloseTo(0.5, 3);
    });
  });

  describe('interpolate', () => {
    it('gives a point on ray between A and B, corresponding to position scalar', () => {
      let a = new Vector2(2, 2);
      let b = new Vector2(0, 0);
      let r = Vector2.interpolate(a, b, 0.5);
      expect(r.x).toBeCloseTo(1);
      expect(r.y).toBeCloseTo(1);

      a = new Vector2(2, 2);
      b = new Vector2(0, 0);
      r = Vector2.interpolate(a, b, 0.75);
      expect(r.x).toBeCloseTo(0.5);
      expect(r.y).toBeCloseTo(0.5);
    });

    it('does not clamp the scalar value', () => {
      let a = new Vector2(2, 2);
      let b = new Vector2(0, 0);
      let r = Vector2.interpolate(a, b, -0.5);
      expect(r.x).toBeCloseTo(3);
      expect(r.y).toBeCloseTo(3);

      a = new Vector2(2, 2);
      b = new Vector2(0, 0);
      r = Vector2.interpolate(a, b, 1.25);
      expect(r.x).toBeCloseTo(-0.5);
      expect(r.y).toBeCloseTo(-0.5);
    });
  });

  describe('from', () => {
    it('creates a Vector2 from the given Vector2Expression', () => {
      const v = Vector2.from({ x: 1, y: 2 });
      expect(v).toBeInstanceOf(Vector2);
      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
    });
  });

  describe('::set', () => {
    it('independently updates components to a new value', () => {
      const v = new Vector2(1, 2);
      v.set({ x: 3 });
      expect(v.x).toBe(3);
      expect(v.y).toBe(2);

      v.set({ y: 4 });
      expect(v.x).toBe(3);
      expect(v.y).toBe(4);
    });
  });

  describe('::clone', () => {
    it('creates a copy of the Vector2', () => {
      const v0 = new Vector2(1, 2);
      const v1 = v0.clone();
      expect(v1.x).toBe(1);
      expect(v1.y).toBe(2);

      v1.set({ x: 4 });
      expect(v1.x).toBe(4);
      expect(v0.x).toBe(1);
    });

    it('does not propagate a const/frozen state', () => {
      const v0 = new Vector2(1, 2, true);
      const v1 = v0.clone();
      v1.set({ x: 4 });
      expect(v1.x).toBe(4);
    });
  });

  describe('::asExpression', () => {
    it('creates vector expression of the vector', () => {
      const v = new Vector2(1, 2);
      expect(v.asExpression()).toEqual({ x: 1, y: 2 });
    });
  });

  describe('::*[Symbol.iterator]', () => {
    it('allows the components of the vector to be iterable', () => {
      const v = new Vector2(1, 2);
      const components = Array.from(v);
      expect(components).toEqual([1, 2]);
    });
  });

  describe('::toString', () => {
    it('expresses the vector components in a readable format', () => {
      const v = new Vector2(1, 2);
      expect(v.toString()).toBe('[1, 2]');
    });
  });

  describe('::add', () => {
    it('updates the components of the vector in place as the result of adding the instance and term components', () => {
      const v = new Vector2(1, 2);
      v.add({ x: 3, y: 5 });
      expect(v.x).toBeCloseTo(4);
      expect(v.y).toBeCloseTo(7);
    });
  });

  describe('::multiply', () => {
    it('updates the components of the vector in place as the product of the instance and term components', () => {
      const v = new Vector2(1, 2);
      v.multiply({ x: 3, y: 5 });
      expect(v.x).toBeCloseTo(3);
      expect(v.y).toBeCloseTo(10);
    });
  });

  describe('::divide', () => {
    it('updates the components of the vector in place as the product of the instance and term components', () => {
      const v = new Vector2(6, 15);
      v.divide({ x: 3, y: 5 });
      expect(v.x).toBeCloseTo(2);
      expect(v.y).toBeCloseTo(3);
    });
  });

  describe('::scale', () => {
    it('updates the components of the vector in place as product of multiplying by the scalar', () => {
      const v = new Vector2(6, 15);
      v.scale(2);
      expect(v.x).toBeCloseTo(12);
      expect(v.y).toBeCloseTo(30);
    });
  });

  describe('::divideScalar', () => {
    it('updates the components of the vector in place as result of dividing by the scalar', () => {
      const v = new Vector2(6, 15);
      v.divideScalar(2);
      expect(v.x).toBeCloseTo(3);
      expect(v.y).toBeCloseTo(7.5);
    });
  });

  describe('::magnitude', () => {
    it('Calculates the absolute magnitude of the vector', () => {
      expect(Vector2.from({ x: 0, y: 2 }).magnitude()).toBeCloseTo(2);
      expect(Vector2.from({ x: 2, y: 0 }).magnitude()).toBeCloseTo(2);
      expect(Vector2.from({ x: -2, y: 0 }).magnitude()).toBeCloseTo(2);
      expect(Vector2.from({ x: 0, y: -2 }).magnitude()).toBeCloseTo(2);

      expect(Vector2.from({ x: -2, y: -2 }).magnitude()).toBeCloseTo(2.83);
      expect(Vector2.from({ x: 2, y: 2 }).magnitude()).toBeCloseTo(2.83);
    });
  });

  describe('::normal', () => {
    it('converts the vector to a normal', () => {
      const v = new Vector2(2, 2);
      v.normal();
      expect(v.x).toBeCloseTo(0.707);
      expect(v.y).toBeCloseTo(0.707);
      expect(v.magnitude()).toBeCloseTo(1);
    });
  });
});
