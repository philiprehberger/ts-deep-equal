import type { DeepEqualOptions } from './types';

export function deepEqual(
  a: unknown,
  b: unknown,
  options?: DeepEqualOptions,
): boolean {
  const strict = options?.strict ?? false;
  const circular = options?.circular ?? false;

  if (circular) {
    const seenA = new WeakSet();
    const seenB = new WeakSet();
    return compare(a, b, strict, true, seenA, seenB);
  }

  return compare(a, b, strict, false, undefined, undefined);
}

export function deepEqualBy<T, U>(
  a: T,
  b: T,
  selector: (value: T) => U,
  options?: DeepEqualOptions,
): boolean {
  return deepEqual(selector(a), selector(b), options);
}

function compare(
  a: unknown,
  b: unknown,
  strict: boolean,
  circular: boolean,
  seenA: WeakSet<object> | undefined,
  seenB: WeakSet<object> | undefined,
): boolean {
  if (strict) {
    if (Object.is(a, b)) return true;
  } else {
    if (a === b) return true;
  }

  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (typeof a !== 'object' && typeof a !== 'function') {
    if (typeof a === 'bigint') return a === b;
    return false;
  }

  const objA = a as object;
  const objB = b as object;

  if (circular && seenA && seenB) {
    if (seenA.has(objA) && seenB.has(objB)) return true;
    seenA.add(objA);
    seenB.add(objB);
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (a instanceof RegExp && b instanceof RegExp) {
    return a.source === b.source && a.flags === b.flags;
  }

  if (a instanceof Error && b instanceof Error) {
    return a.message === b.message && a.name === b.name;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!compare(a[i], b[i], strict, circular, seenA, seenB)) return false;
    }
    return true;
  }

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [key, val] of a) {
      let found = false;
      for (const [bKey, bVal] of b) {
        if (compare(key, bKey, strict, circular, seenA, seenB) &&
            compare(val, bVal, strict, circular, seenA, seenB)) {
          found = true;
          break;
        }
      }
      if (!found) return false;
    }
    return true;
  }

  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    for (const val of a) {
      if (typeof val === 'object' && val !== null) {
        let found = false;
        for (const bVal of b) {
          if (compare(val, bVal, strict, circular, seenA, seenB)) {
            found = true;
            break;
          }
        }
        if (!found) return false;
      } else {
        if (!b.has(val)) return false;
      }
    }
    return true;
  }

  if (ArrayBuffer.isView(a) && !(a instanceof DataView) &&
      ArrayBuffer.isView(b) && !(b instanceof DataView)) {
    const ta = a as unknown as { byteLength: number; length: number; [index: number]: number };
    const tb = b as unknown as { byteLength: number; length: number; [index: number]: number };
    if (ta.byteLength !== tb.byteLength) return false;
    if (ta.length !== tb.length) return false;
    for (let i = 0; i < ta.length; i++) {
      if (ta[i] !== tb[i]) return false;
    }
    return true;
  }

  const keysA = Object.keys(a as Record<string, unknown>);
  const keysB = Object.keys(b as Record<string, unknown>);

  if (keysA.length !== keysB.length) return false;

  const recA = a as Record<string, unknown>;
  const recB = b as Record<string, unknown>;

  for (const key of keysA) {
    if (!(key in recB)) return false;
    if (!compare(recA[key], recB[key], strict, circular, seenA, seenB)) return false;
  }

  return true;
}
