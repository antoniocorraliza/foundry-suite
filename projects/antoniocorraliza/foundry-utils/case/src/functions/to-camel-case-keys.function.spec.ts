import { describe, expect, it } from 'vitest';
import { FoundryCircularReferenceError } from '@antoniocorraliza/foundry-utils';
import { freezeAndSnapshot } from '../../../../../../tools/vitest/functions/freeze-and-snapshot.function';
import type { FrozenSnapshot } from '../../../../../../tools/vitest/interfaces/frozen-snapshot.interface';
import { FoundryKeyCollisionError } from '../errors/foundry-key-collision.error';
import { toCamelCaseKeys } from './to-camel-case-keys.function';

class Ticket {
  constructor(readonly ticket_id: string) {}

  getLabel(): string {
    return this.ticket_id;
  }
}

function getThrownError(action: () => unknown): unknown {
  try {
    action();
  } catch (error) {
    return error;
  }
  return null;
}

class Unrelated {}

function createTaggedObject(tag: string): object {
  return Object.defineProperty(new Unrelated(), Symbol.toStringTag, { value: tag });
}

describe('toCamelCaseKeys', () => {
  it.each([null, undefined, 5, 'a_b', true])('returns %j as it is', (value) => {
    expect(toCamelCaseKeys(value)).toBe(value);
  });

  it('converts the keys of nested plain objects and arrays', () => {
    const input: FrozenSnapshot<object> = freezeAndSnapshot({
      user_name: 'Ana',
      home_address: { street_name: 'Mayor' },
      order_lines: [{ unit_price: 2 }],
    });
    expect(toCamelCaseKeys(input.value)).toEqual({ userName: 'Ana', homeAddress: { streetName: 'Mayor' }, orderLines: [{ unitPrice: 2 }] });
    expect(input.listChanges()).toEqual([]);
  });

  it('returns new objects, never the input', () => {
    const value: { a_b: { c_d: number }; list: Array<number> } = { a_b: { c_d: 1 }, list: [1] };
    const result: { aB: object; list: Array<number> } = toCamelCaseKeys(value) as { aB: object; list: Array<number> };
    expect(result).not.toBe(value);
    expect(result.aB).not.toBe(value.a_b);
    expect(result.list).not.toBe(value.list);
  });

  it('keeps arrays of booleans, dates and arrays as they are', () => {
    const first: Date = new Date(2026, 0, 1);
    const second: Date = new Date(2027, 5, 30);
    const input: FrozenSnapshot<object> = freezeAndSnapshot({
      flags: [true, false],
      dates: [first, second],
      m: [
        [1, 2],
        [3, 4],
      ],
    });
    const result: { dates: Array<Date> } = toCamelCaseKeys(input.value) as { dates: Array<Date> };
    expect(result).toEqual({
      flags: [true, false],
      dates: [first, second],
      m: [
        [1, 2],
        [3, 4],
      ],
    });
    expect(result.dates[0]).toBe(first);
    expect(input.listChanges()).toEqual([]);
  });

  it('decides by the type of each item of an array, not by the first one', () => {
    expect(toCamelCaseKeys([{ a_b: 1 }, 'txt'])).toEqual([{ aB: 1 }, 'txt']);
    expect(toCamelCaseKeys([null, { a_b: 1 }])).toEqual([null, { aB: 1 }]);
  });

  it('keeps dates, maps, sets, blobs, regular expressions, typed arrays and class instances by reference', () => {
    const values: Record<string, unknown> = {
      created_at: new Date(2026, 0, 1),
      lookup_map: new Map([['a_b', 1]]),
      tag_set: new Set(['a_b']),
      raw_file: new Blob(['x']),
      search_pattern: /a_b/,
      raw_bytes: new Uint8Array([1]),
      owner_ticket: new Ticket('t1'),
    };
    const result: Record<string, unknown> = toCamelCaseKeys(values) as Record<string, unknown>;
    expect(result['createdAt']).toBe(values['created_at']);
    expect(result['lookupMap']).toBe(values['lookup_map']);
    expect(result['tagSet']).toBe(values['tag_set']);
    expect(result['rawFile']).toBe(values['raw_file']);
    expect(result['searchPattern']).toBe(values['search_pattern']);
    expect(result['rawBytes']).toBe(values['raw_bytes']);
    expect(result['ownerTicket']).toBe(values['owner_ticket']);
  });

  it('throws a key collision error by default, with the path, both keys and the converted key', () => {
    const error: unknown = getThrownError(() => toCamelCaseKeys({ a: [{ user_id: 1, userId: 2 }] }));
    expect(error).toBeInstanceOf(FoundryKeyCollisionError);
    expect(error).toMatchObject({ path: ['a', 0], originalKeys: ['user_id', 'userId'], convertedKey: 'userId' });
  });

  it('keeps the first or the last value of colliding keys when asked', () => {
    expect(toCamelCaseKeys({ user_id: 1, userId: 2 }, { onCollision: 'keepFirst' })).toEqual({ userId: 1 });
    expect(toCamelCaseKeys({ user_id: 1, userId: 2 }, { onCollision: 'keepLast' })).toEqual({ userId: 2 });
  });

  it('rejects an unknown collision option', () => {
    expect(() => toCamelCaseKeys({ a: 1 }, { onCollision: 'merge' } as never)).toThrow(TypeError);
  });

  it('throws a circular reference error with the path that points back', () => {
    const value: { a: { b?: unknown } } = { a: {} };
    value.a.b = value;
    const error: unknown = getThrownError(() => toCamelCaseKeys(value));
    expect(error).toBeInstanceOf(FoundryCircularReferenceError);
    expect(error).toMatchObject({ path: ['a', 'b'] });
  });

  it('copies an object used in two places, without taking it for a cycle', () => {
    const shared: { a_b: number } = { a_b: 1 };
    const result: { first: object; second: object } = toCamelCaseKeys({ first: shared, second: shared }) as {
      first: object;
      second: object;
    };
    expect(result).toEqual({ first: { aB: 1 }, second: { aB: 1 } });
    expect(result.first).not.toBe(result.second);
  });

  it('keeps a __proto__ key as an own property and never changes the prototype', () => {
    const result: Record<string, unknown> = toCamelCaseKeys(JSON.parse('{"name":"x","__proto__":{"is_admin":true}}')) as Record<
      string,
      unknown
    >;
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.hasOwn(result, '__proto__')).toBe(true);
    expect(result['isAdmin']).toBeUndefined();
  });

  it('returns objects with the Object prototype, also from a null-prototype input', () => {
    const input: Record<string, unknown> = Object.assign(Object.create(null) as object, { a_b: 1 });
    expect(Object.getPrototypeOf(toCamelCaseKeys(input))).toBe(Object.prototype);
  });

  it('ignores symbol keys, accessors and non-enumerable properties, and never runs a getter', () => {
    const value: Record<string, unknown> = { plain_key: 1, [Symbol('s')]: 2 };
    Object.defineProperty(value, 'hidden_key', { value: 3, enumerable: false });
    Object.defineProperty(value, 'getter_key', {
      enumerable: true,
      get: (): never => {
        throw new Error('[test]: the getter ran');
      },
    });
    const result: object = toCamelCaseKeys(value) as object;
    expect(Reflect.ownKeys(result)).toEqual(['plainKey']);
  });

  it('works as a loose reference with nested data', () => {
    const convert: typeof toCamelCaseKeys = toCamelCaseKeys;
    expect([{ a_b: { c_d: 1 } }].map((item) => convert(item))).toEqual([{ aB: { cD: 1 } }]);
  });

  it('throws when map passes the index as its options', () => {
    expect(() => [{ a_b: 1 }].map(toCamelCaseKeys as (value: unknown, index: number) => unknown)).toThrow(TypeError);
  });

  it.each(['Date', 'Map', 'Set', 'RegExp', 'ArrayBuffer', 'Array', 'Object'])(
    'keeps an object that fakes the tag of %s by reference, without throwing',
    (tag) => {
      const fake: object = createTaggedObject(tag);
      expect(toCamelCaseKeys({ due_at: fake }).dueAt).toBe(fake);
      expect(toCamelCaseKeys([fake])[0]).toBe(fake);
    },
  );
});
