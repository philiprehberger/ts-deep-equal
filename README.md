# @philiprehberger/deep-equal

[![CI](https://github.com/philiprehberger/ts-deep-equal/actions/workflows/ci.yml/badge.svg)](https://github.com/philiprehberger/ts-deep-equal/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@philiprehberger/deep-equal)](https://www.npmjs.com/package/@philiprehberger/deep-equal)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Fast deep equality comparison for JavaScript values with TypeScript type guards.

## Installation

```bash
npm install @philiprehberger/deep-equal
```

## Usage

```ts
import { deepEqual } from '@philiprehberger/deep-equal';

deepEqual({ a: 1, b: [2, 3] }, { a: 1, b: [2, 3] }); // true
deepEqual(new Map([['x', 1]]), new Map([['x', 1]]));    // true
deepEqual(new Set([1, 2]), new Set([1, 2]));             // true

// Strict mode: Object.is semantics
deepEqual(NaN, NaN, { strict: true });  // true
deepEqual(-0, +0, { strict: true });    // false

// Circular reference support
const a: any = { x: 1 };
a.self = a;
const b: any = { x: 1 };
b.self = b;
deepEqual(a, b, { circular: true }); // true
```

## API

### `deepEqual(a: unknown, b: unknown, options?: DeepEqualOptions): boolean`

Performs a deep equality comparison between two values.

**Options:**

| Option     | Type      | Default | Description                                      |
| ---------- | --------- | ------- | ------------------------------------------------ |
| `strict`   | `boolean` | `false` | Use `Object.is` semantics (NaN, -0/+0 handling) |
| `circular` | `boolean` | `false` | Detect and handle circular references            |

**Supported types:** primitives, plain objects, arrays, `Date`, `RegExp`, `Map`, `Set`, `TypedArray`, `Error`, `BigInt`.

## Development

```bash
npm install
npm run build
npm test
```

## License

MIT
