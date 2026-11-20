import { describe, expect, it } from 'vitest';
import { FoundryCircularReferenceError } from '@antoniocorraliza/foundry-utils';
import { freezeAndSnapshot } from '../../../../../../tools/vitest/functions/freeze-and-snapshot.function';
import type { FrozenSnapshot } from '../../../../../../tools/vitest/interfaces/frozen-snapshot.interface';
import { FoundryKeyCollisionError } from '../errors/foundry-key-collision.error';
import { toSnakeCaseKeys } from './to-snake-case-keys.function';

class Unrelated {}

function createTaggedObject(tag: string): object {
  return Object.defineProperty(new Unrelated(), Symbol.toStringTag, { value: tag });
}

describe('toSnakeCaseKeys', () => {
  it('converts the keys of nested plain objects and arrays without changing the input', () => {
    const input: FrozenSnapshot<object> = freezeAndSnapshot({
      userName: 'Ana',
      homeAddress: { streetName: 'Mayor' },
      orderLines: [{ unitPrice: 2 }],
    });
    expect(toSnakeCaseKeys(input.value)).toEqual({
      user_name: 'Ana',
      home_address: { street_name: 'Mayor' },
      order_lines: [{ unit_price: 2 }],
    });
    expect(input.listChanges()).toEqual([]);
  });

  it('keeps a date by reference', () => {
    const due: Date = new Date(2026, 0, 1);
    expect((toSnakeCaseKeys({ dueDate: due }) as { due_date: Date }).due_date).toBe(due);
  });

  it('throws a key collision error by default', () => {
    expect(() => toSnakeCaseKeys({ userId: 1, user_id: 2 })).toThrow(FoundryKeyCollisionError);
  });

  it('throws a circular reference error on a cycle', () => {
    const value: { self?: unknown } = {};
    value.self = value;
    expect(() => toSnakeCaseKeys(value)).toThrow(FoundryCircularReferenceError);
  });

  it('keeps a __proto__ key as an own property and never changes the prototype', () => {
    const result: Record<string, unknown> = toSnakeCaseKeys(JSON.parse('{"name":"x","__proto__":{"isAdmin":true}}')) as Record<
      string,
      unknown
    >;
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.hasOwn(result, '__proto__')).toBe(true);
    expect(result['isAdmin']).toBeUndefined();
  });

  it('rejects an unknown collision option', () => {
    expect(() => toSnakeCaseKeys({ a: 1 }, { onCollision: 'merge' } as never)).toThrow(TypeError);
  });

  it.each(['Date', 'Map', 'Set', 'RegExp', 'ArrayBuffer', 'Array', 'Object'])(
    'keeps an object that fakes the tag of %s by reference, without throwing',
    (tag) => {
      const fake: object = createTaggedObject(tag);
      expect(toSnakeCaseKeys({ dueAt: fake }).due_at).toBe(fake);
    },
  );
});
