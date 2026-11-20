import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { freezeAndSnapshot } from '../../../../../../tools/vitest/functions/freeze-and-snapshot.function';
import type { FrozenSnapshot } from '../../../../../../tools/vitest/interfaces/frozen-snapshot.interface';
import { deepClone } from './deep-clone.function';
import { isDeepEqual } from './is-deep-equal.function';

class Point {
  constructor(readonly x: number) {}
}

class FakeDate {
  readonly [Symbol.toStringTag]: string = 'Date';
}

class Unrelated {}

function fakeTag(tag: string): object {
  return Object.defineProperty(new Unrelated(), Symbol.toStringTag, { value: tag });
}

describe('isDeepEqual', () => {
  it.each([
    ['NaN and NaN', Number.NaN, Number.NaN],
    ['+0 and -0', 0, -0],
    ['equal plain objects', { a: 1, b: { c: [1, 2] } }, { b: { c: [1, 2] }, a: 1 }],
    ['equal arrays', [1, { a: 2 }], [1, { a: 2 }]],
    ['dates with the same time', new Date(2026, 0, 1), new Date(2026, 0, 1)],
    ['two invalid dates', new Date(Number.NaN), new Date('x')],
    ['regular expressions with the same source and flags', /a+/gi, /a+/gi],
    ['maps with the same keys and deep-equal values', new Map([['k', { a: 1 }]]), new Map([['k', { a: 1 }]])],
    ['sets with the same elements', new Set([1, 'a']), new Set(['a', 1])],
    ['typed arrays with the same type and bytes', new Uint8Array([1, 2]), new Uint8Array([1, 2])],
    ['buffers with the same bytes', new Uint8Array([1, 2]).buffer, new Uint8Array([1, 2]).buffer],
  ])('considers equal %s', (description, first, second) => {
    expect(isDeepEqual(first, second)).toBe(true);
  });

  it.each([
    ['different dates', { due: new Date(2026, 0, 1) }, { due: new Date(2027, 5, 30) }],
    ['an object with an undefined property and an empty object', { a: undefined }, {}],
    ['an array and an object with the same indices', [1, 2], { 0: 1, 1: 2 }],
    ['different regular expressions', /a/, /b/],
    ['regular expressions with different flags', /a/g, /a/i],
    ['maps with different values', new Map([['k', 1]]), new Map([['k', 2]])],
    ['maps with keys that are equal but not the same object', new Map([[{}, 1]]), new Map([[{}, 1]])],
    ['sets with objects that are equal but not the same', new Set([{}]), new Set([{}])],
    ['typed arrays of different types', new Uint8Array([1]), new Int8Array([1])],
    ['typed arrays with different bytes', new Uint8Array([1]), new Uint8Array([2])],
    ['two different files', new File(['x'], 'a.txt'), new File(['x'], 'a.txt')],
    ['two different blobs', new Blob(['x']), new Blob(['x'])],
    ['two class instances with the same data', new Point(1), new Point(1)],
    ['two different errors', new Error('[test]: failure'), new Error('[test]: failure')],
    ['two different functions', (): number => 1, (): number => 1],
  ])('considers different %s', (description, first, second) => {
    expect(isDeepEqual(first, second)).toBe(false);
  });

  it('compares a file and an instance by reference', () => {
    const file: File = new File(['x'], 'a.txt');
    const point: Point = new Point(1);
    expect(isDeepEqual({ file, point }, { file, point })).toBe(true);
  });

  it('ignores symbol keys, accessors and non-enumerable properties', () => {
    const first: Record<string | symbol, unknown> = { a: 1, [Symbol('s')]: 1 };
    Object.defineProperty(first, 'hidden', { value: 1, enumerable: false });
    Object.defineProperty(first, 'computed', { enumerable: true, get: (): number => 1 });
    expect(isDeepEqual(first, { a: 1 })).toBe(true);
  });

  it('compares a __proto__ key as one more property', () => {
    expect(isDeepEqual(JSON.parse('{"__proto__":{"a":1}}'), JSON.parse('{"__proto__":{"a":1}}'))).toBe(true);
    expect(isDeepEqual(JSON.parse('{"__proto__":{"a":1}}'), {})).toBe(false);
  });

  it('supports cycles', () => {
    const first: { self?: unknown; value: number } = { value: 1 };
    const second: { self?: unknown; value: number } = { value: 1 };
    first.self = first;
    second.self = second;
    expect(isDeepEqual(first, second)).toBe(true);
  });

  it('does not change its inputs', () => {
    const first: FrozenSnapshot<object> = freezeAndSnapshot({ due: new Date(2026, 0, 1), tags: new Set([1]), map: new Map([['k', 1]]) });
    const second: FrozenSnapshot<object> = freezeAndSnapshot({ due: new Date(2026, 0, 1), tags: new Set([1]), map: new Map([['k', 1]]) });
    isDeepEqual(first.value, second.value);
    expect([...first.changes(), ...second.changes()]).toEqual([]);
  });

  it('asks customEquality first for every pair, and uses the default rule when it returns undefined', () => {
    const pairs: Array<[unknown, unknown]> = [];
    const isEqual: boolean = isDeepEqual(
      { point: new Point(1), count: 1 },
      { point: new Point(1), count: 1 },
      {
        customEquality: (first, second) => {
          pairs.push([first, second]);
          return first instanceof Point && second instanceof Point ? first.x === second.x : undefined;
        },
      },
    );
    expect(isEqual).toBe(true);
    expect(pairs.some(([first]) => first === 1)).toBe(true);
  });

  it('lets an error thrown by customEquality go through', () => {
    const failure: Error = new Error('[test]: from the app');
    expect(() =>
      isDeepEqual(1, 1, {
        customEquality: () => {
          throw failure;
        },
      }),
    ).toThrow(failure);
  });

  it('ignores options that are not an object or a customEquality that is not a function', () => {
    expect(isDeepEqual({ a: 1 }, { a: 1 }, 5 as never)).toBe(true);
    expect(isDeepEqual({ a: 1 }, { a: 1 }, { customEquality: 5 } as never)).toBe(true);
  });

  it('takes an object that fakes the tag of a date for another object, without throwing', () => {
    const fake: FakeDate = new FakeDate();
    expect(Object.prototype.toString.call(fake)).toBe('[object Date]');
    expect(isDeepEqual(fake, fake)).toBe(true);
    expect(isDeepEqual(fake, new FakeDate())).toBe(false);
    expect(isDeepEqual(fake, new Date(0))).toBe(false);
  });

  it.each(['Map', 'Set', 'RegExp', 'ArrayBuffer'])(
    'takes an object that fakes the tag of a %s for another object, without throwing',
    (tag) => {
      expect(isDeepEqual(fakeTag(tag), fakeTag(tag))).toBe(false);
    },
  );

  it('is reflexive and symmetric', () => {
    fc.assert(
      fc.property(fc.anything(), fc.anything(), (first, second) => {
        expect(isDeepEqual(first, first)).toBe(true);
        expect(isDeepEqual(first, second)).toBe(isDeepEqual(second, first));
      }),
    );
  });

  it('considers a deep clone equal to its source', () => {
    fc.assert(
      fc.property(fc.jsonValue(), (value) => {
        expect(isDeepEqual(deepClone(value), value)).toBe(true);
      }),
    );
  });
});
