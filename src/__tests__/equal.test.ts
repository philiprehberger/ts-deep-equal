import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { deepEqual, deepEqualBy } from '../../dist/index.js';

describe('deepEqual', () => {
  describe('primitives', () => {
    it('should compare numbers', () => {
      assert.equal(deepEqual(1, 1), true);
      assert.equal(deepEqual(1, 2), false);
    });

    it('should compare strings', () => {
      assert.equal(deepEqual('hello', 'hello'), true);
      assert.equal(deepEqual('hello', 'world'), false);
    });

    it('should compare booleans', () => {
      assert.equal(deepEqual(true, true), true);
      assert.equal(deepEqual(true, false), false);
    });

    it('should compare null', () => {
      assert.equal(deepEqual(null, null), true);
      assert.equal(deepEqual(null, undefined), false);
    });

    it('should compare undefined', () => {
      assert.equal(deepEqual(undefined, undefined), true);
      assert.equal(deepEqual(undefined, null), false);
    });

    it('should compare BigInt', () => {
      assert.equal(deepEqual(1n, 1n), true);
      assert.equal(deepEqual(1n, 2n), false);
    });

    it('should compare Symbol (reference equality)', () => {
      const s = Symbol('a');
      assert.equal(deepEqual(s, s), true);
      assert.equal(deepEqual(Symbol('a'), Symbol('a')), false);
    });
  });

  describe('objects', () => {
    it('should compare flat objects', () => {
      assert.equal(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 }), true);
      assert.equal(deepEqual({ a: 1, b: 2 }, { a: 1, b: 3 }), false);
    });

    it('should compare nested objects', () => {
      assert.equal(deepEqual({ a: { b: { c: 1 } } }, { a: { b: { c: 1 } } }), true);
      assert.equal(deepEqual({ a: { b: { c: 1 } } }, { a: { b: { c: 2 } } }), false);
    });

    it('should compare objects with different key order', () => {
      assert.equal(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 }), true);
    });
  });

  describe('arrays', () => {
    it('should compare arrays', () => {
      assert.equal(deepEqual([1, 2, 3], [1, 2, 3]), true);
      assert.equal(deepEqual([1, 2, 3], [1, 2, 4]), false);
      assert.equal(deepEqual([1, 2], [1, 2, 3]), false);
    });
  });

  describe('Date', () => {
    it('should compare Date instances', () => {
      const d = new Date('2024-01-01');
      assert.equal(deepEqual(d, new Date('2024-01-01')), true);
      assert.equal(deepEqual(d, new Date('2024-01-02')), false);
    });
  });

  describe('RegExp', () => {
    it('should compare RegExp instances', () => {
      assert.equal(deepEqual(/abc/gi, /abc/gi), true);
      assert.equal(deepEqual(/abc/g, /abc/i), false);
      assert.equal(deepEqual(/abc/, /def/), false);
    });
  });

  describe('Map', () => {
    it('should compare Map instances', () => {
      const a = new Map([['x', 1], ['y', 2]]);
      const b = new Map([['x', 1], ['y', 2]]);
      const c = new Map([['x', 1], ['y', 3]]);
      assert.equal(deepEqual(a, b), true);
      assert.equal(deepEqual(a, c), false);
    });
  });

  describe('Set', () => {
    it('should compare Set instances', () => {
      assert.equal(deepEqual(new Set([1, 2, 3]), new Set([1, 2, 3])), true);
      assert.equal(deepEqual(new Set([1, 2]), new Set([1, 2, 3])), false);
    });

    it('should compare Sets with objects', () => {
      assert.equal(deepEqual(new Set([{ a: 1 }]), new Set([{ a: 1 }])), true);
      assert.equal(deepEqual(new Set([{ a: 1 }]), new Set([{ a: 2 }])), false);
    });
  });

  describe('TypedArray', () => {
    it('should compare Uint8Array', () => {
      assert.equal(deepEqual(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 3])), true);
      assert.equal(deepEqual(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 4])), false);
    });
  });

  describe('Error', () => {
    it('should compare Error instances', () => {
      assert.equal(deepEqual(new Error('fail'), new Error('fail')), true);
      assert.equal(deepEqual(new Error('a'), new Error('b')), false);
    });
  });

  describe('NaN handling', () => {
    it('should treat NaN !== NaN in default mode', () => {
      assert.equal(deepEqual(NaN, NaN), false);
    });

    it('should treat NaN === NaN in strict mode', () => {
      assert.equal(deepEqual(NaN, NaN, { strict: true }), true);
    });
  });

  describe('-0 / +0 handling', () => {
    it('should treat -0 and +0 as equal in default mode', () => {
      assert.equal(deepEqual(-0, +0), true);
    });

    it('should treat -0 and +0 as not equal in strict mode', () => {
      assert.equal(deepEqual(-0, +0, { strict: true }), false);
    });
  });

  describe('circular references', () => {
    it('should handle circular references when enabled', () => {
      const a: Record<string, unknown> = { x: 1 };
      a.self = a;
      const b: Record<string, unknown> = { x: 1 };
      b.self = b;
      assert.equal(deepEqual(a, b, { circular: true }), true);
    });
  });

  describe('mixed types', () => {
    it('should return false for different types', () => {
      assert.equal(deepEqual(1, '1'), false);
      assert.equal(deepEqual(null, 0), false);
      assert.equal(deepEqual([], {}), false);
      assert.equal(deepEqual(true, 1), false);
    });
  });

  describe('deepEqualBy', () => {
    it('compares projected values', () => {
      const a = { id: 1, ts: 'a', body: { x: 1 } };
      const b = { id: 2, ts: 'b', body: { x: 1 } };
      assert.equal(deepEqualBy(a, b, (r) => r.body), true);
      assert.equal(deepEqualBy(a, b, (r) => r.id), false);
    });

    it('forwards options to deepEqual', () => {
      const a: Record<string, unknown> = { x: 1 };
      a.self = a;
      const b: Record<string, unknown> = { x: 1 };
      b.self = b;
      assert.equal(
        deepEqualBy({ wrap: a }, { wrap: b }, (r) => r.wrap, { circular: true }),
        true,
      );
    });
  });
});
