import { describe, expect, it } from 'vitest';
import { FoundryCircularReferenceError } from '@antoniocorraliza/foundry-utils';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { createObjectWithFakeTag } from '@foundry-test/functions/create-object-with-fake-tag.function';
import { freezeAndSnapshot } from '@foundry-test/functions/freeze-and-snapshot.function';
import type { FrozenSnapshot } from '@foundry-test/interfaces/frozen-snapshot.interface';
import { FoundryKeyCollisionError } from '../errors/foundry-key-collision.error';
import type { FoundryKeyConversionOptions } from '../interfaces/foundry-key-conversion-options.interface';
import { toCamelCaseKeys } from './to-camel-case-keys.function';
import { toSnakeCaseKeys } from './to-snake-case-keys.function';

type ConvertKeys = (value: unknown, options?: FoundryKeyConversionOptions) => unknown;

interface KeyConversionCase {
  readonly name: string;
  readonly convert: ConvertKeys;
  readonly sourceKey: string;
  readonly targetKey: string;
}

class Ticket {
  constructor(readonly ticket_id: string) {}

  getLabel(): string {
    return this.ticket_id;
  }
}

const KEY_CONVERSIONS: ReadonlyArray<KeyConversionCase> = [
  { name: 'toCamelCaseKeys', convert: toCamelCaseKeys as ConvertKeys, sourceKey: 'user_id', targetKey: 'userId' },
  { name: 'toSnakeCaseKeys', convert: toSnakeCaseKeys as ConvertKeys, sourceKey: 'userId', targetKey: 'user_id' },
];

describe('convertKeys', () => {
  describe.each(KEY_CONVERSIONS)('through $name', ({ convert, sourceKey, targetKey }) => {
    it.each([null, undefined, 5, 'a_b', true])('returns %j as it is', (value) => {
      expect(convert(value)).toBe(value);
    });

    it('returns new objects, never the input', () => {
      const inner: Record<string, number> = { [sourceKey]: 1 };
      const list: Array<number> = [1];
      const value: Record<string, unknown> = { [sourceKey]: inner, list };
      const result: Record<string, unknown> = convert(value) as Record<string, unknown>;
      expect(result).not.toBe(value);
      expect(result[targetKey]).not.toBe(inner);
      expect(result['list']).not.toBe(list);
    });

    it('keeps arrays of booleans, dates and arrays as they are', () => {
      const first: Date = new Date(2026, 0, 1);
      const second: Date = new Date(2027, 5, 30);
      const input: FrozenSnapshot<object> = freezeAndSnapshot({
        flags: [true, false],
        dates: [first, second],
        matrix: [
          [1, 2],
          [3, 4],
        ],
      });
      const result: { dates: Array<Date> } = convert(input.value) as { dates: Array<Date> };
      expect(result).toEqual({
        flags: [true, false],
        dates: [first, second],
        matrix: [
          [1, 2],
          [3, 4],
        ],
      });
      expect(result.dates[0]).toBe(first);
      expect(input.listChanges()).toEqual([]);
    });

    it('decides by the type of each item of an array, not by the first one', () => {
      expect(convert([{ [sourceKey]: 1 }, 'txt'])).toEqual([{ [targetKey]: 1 }, 'txt']);
      expect(convert([null, { [sourceKey]: 1 }])).toEqual([null, { [targetKey]: 1 }]);
    });

    it('keeps dates, maps, sets, blobs, regular expressions, typed arrays and class instances by reference', () => {
      const values: Record<string, unknown> = {
        date: new Date(2026, 0, 1),
        lookup: new Map([['a_b', 1]]),
        tags: new Set(['a_b']),
        file: new Blob(['x']),
        pattern: /a_b/,
        bytes: new Uint8Array([1]),
        ticket: new Ticket('t1'),
      };
      const result: Record<string, unknown> = convert(values) as Record<string, unknown>;
      Object.entries(values).forEach(([key, value]) => expect(result[key]).toBe(value));
    });

    it('throws a key collision error by default, with the path, both keys and the converted key', () => {
      const error: unknown = catchThrown(() => convert({ list: [{ [sourceKey]: 1, [targetKey]: 2 }] }));
      expect(error).toBeInstanceOf(FoundryKeyCollisionError);
      expect(error).toMatchObject({ path: ['list', 0], originalKeys: [sourceKey, targetKey], convertedKey: targetKey });
    });

    it('keeps the first or the last value of colliding keys when asked', () => {
      expect(convert({ [sourceKey]: 1, [targetKey]: 2 }, { onCollision: 'keepFirst' })).toEqual({ [targetKey]: 1 });
      expect(convert({ [sourceKey]: 1, [targetKey]: 2 }, { onCollision: 'keepLast' })).toEqual({ [targetKey]: 2 });
    });

    it('rejects an unknown collision option', () => {
      expect(() => convert({ a: 1 }, { onCollision: 'merge' } as never)).toThrow(TypeError);
    });

    it('throws a circular reference error with the path that points back', () => {
      const value: { a: { b?: unknown } } = { a: {} };
      value.a.b = value;
      const error: unknown = catchThrown(() => convert(value));
      expect(error).toBeInstanceOf(FoundryCircularReferenceError);
      expect(error).toMatchObject({ path: ['a', 'b'] });
    });

    it('copies an object used in two places, without taking it for a cycle', () => {
      const shared: Record<string, number> = { [sourceKey]: 1 };
      const result: { first: object; second: object } = convert({ first: shared, second: shared }) as { first: object; second: object };
      expect(result).toEqual({ first: { [targetKey]: 1 }, second: { [targetKey]: 1 } });
      expect(result.first).not.toBe(result.second);
    });

    it('keeps a __proto__ key as an own property and never changes the prototype', () => {
      const result: Record<string, unknown> = convert(JSON.parse(`{"name":"x","__proto__":{"${sourceKey}":true}}`)) as Record<
        string,
        unknown
      >;
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
      expect(Object.hasOwn(result, '__proto__')).toBe(true);
      expect(result[targetKey]).toBeUndefined();
    });

    it('returns objects with the Object prototype, also from a null-prototype input', () => {
      const input: Record<string, unknown> = Object.assign(Object.create(null) as object, { [sourceKey]: 1 });
      expect(Object.getPrototypeOf(convert(input))).toBe(Object.prototype);
    });

    it('ignores symbol keys, accessors and non-enumerable properties, and never runs a getter', () => {
      const value: Record<string | symbol, unknown> = { [sourceKey]: 1, [Symbol('s')]: 2 };
      Object.defineProperty(value, 'hidden', { value: 3, enumerable: false });
      Object.defineProperty(value, 'getter', {
        enumerable: true,
        get: (): never => {
          throw new Error('[test]: the getter ran');
        },
      });
      expect(Reflect.ownKeys(convert(value) as object)).toEqual([targetKey]);
    });

    it('converts nested data through map', () => {
      expect([{ [sourceKey]: { [sourceKey]: 1 } }].map((item) => convert(item))).toEqual([{ [targetKey]: { [targetKey]: 1 } }]);
    });

    it('throws when map passes the index as its options', () => {
      expect(() => [{ [sourceKey]: 1 }].map(convert as (value: unknown, index: number) => unknown)).toThrow(TypeError);
    });

    it.each(['Date', 'Map', 'Set', 'RegExp', 'ArrayBuffer', 'Array', 'Object'])(
      'keeps an object that fakes the tag of %s by reference, without throwing',
      (tag) => {
        const fake: object = createObjectWithFakeTag(tag);
        expect((convert({ due: fake }) as Record<string, unknown>)['due']).toBe(fake);
        expect((convert([fake]) as ReadonlyArray<unknown>)[0]).toBe(fake);
      },
    );
  });
});
