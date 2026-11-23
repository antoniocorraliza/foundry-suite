import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { freezeAndSnapshot } from '@foundry-test/functions/freeze-and-snapshot.function';
import type { FrozenSnapshot } from '@foundry-test/interfaces/frozen-snapshot.interface';
import { FoundryCloneError } from '../errors/foundry-clone.error';
import { deepClone } from './deep-clone.function';

class Ticket {
  constructor(readonly id: string) {}
}

function getCloneError(value: unknown): unknown {
  const error: unknown = catchThrown(() => deepClone(value));
  expect(error).toBeInstanceOf(FoundryCloneError);
  return error;
}

describe('deepClone', () => {
  it.each([1, 'x', null, undefined, true, Number.NaN])('returns the primitive %j', (value) => {
    expect(deepClone(value)).toBe(value);
  });

  it('copies plain objects, arrays, dates, regular expressions, maps, sets and buffers into new instances', () => {
    const input: FrozenSnapshot<{
      due: Date;
      pattern: RegExp;
      lookup: Map<string, { a: number }>;
      tags: Set<number>;
      bytes: Uint8Array;
      lines: Array<{ amount: number }>;
    }> = freezeAndSnapshot({
      due: new Date(2026, 0, 1),
      pattern: /a+/g,
      lookup: new Map([['k', { a: 1 }]]),
      tags: new Set([1, 2]),
      bytes: new Uint8Array([1, 2]),
      lines: [{ amount: 1 }],
    });
    const clone: typeof input.value = deepClone(input.value);
    expect(clone).toEqual(input.value);
    expect(clone).not.toBe(input.value);
    expect(clone.due).not.toBe(input.value.due);
    expect(clone.due).toBeInstanceOf(Date);
    expect(clone.due.getTime()).toBe(input.value.due.getTime());
    expect(clone.lookup).not.toBe(input.value.lookup);
    expect(clone.lines[0]).not.toBe(input.value.lines[0]);
    expect(input.listChanges()).toEqual([]);
  });

  it('keeps files and blobs by reference, with their name', () => {
    const doc: File = new File(['x'], 'a.txt');
    const blob: Blob = new Blob(['y']);
    const clone: { doc: File; blob: Blob } = deepClone({ doc, blob });
    expect(clone.doc).toBe(doc);
    expect(clone.doc.name).toBe('a.txt');
    expect(clone.blob).toBe(blob);
  });

  it('keeps cycles and shared references', () => {
    const shared: { a: number } = { a: 1 };
    const value: { first: object; second: object; self?: unknown } = { first: shared, second: shared };
    value.self = value;
    const clone: typeof value = deepClone(value);
    expect(clone.self).toBe(clone);
    expect(clone.first).toBe(clone.second);
    expect(clone.first).not.toBe(shared);
  });

  it('throws on a function instead of dropping it', () => {
    const error: unknown = getCloneError({
      due: new Date(2026, 0, 1),
      run(): number {
        return 1;
      },
    });
    expect(error).toMatchObject({ path: ['run'], valueDescription: 'function' });
  });

  it('throws on a class instance with the class name and the path', () => {
    expect(getCloneError({ items: [{}, {}, { owner: new Ticket('t1') }] })).toMatchObject({
      path: ['items', 2, 'owner'],
      valueDescription: 'class Ticket',
    });
  });

  it.each([
    ['an error', new Error('[test]: failure'), 'Error'],
    ['a weak map', new WeakMap(), 'WeakMap'],
    ['a weak set', new WeakSet(), 'WeakSet'],
    ['a symbol', Symbol('s'), 'symbol'],
  ])('throws on %s', (label, value, valueDescription) => {
    expect(getCloneError({ value })).toMatchObject({ path: ['value'], valueDescription });
  });

  it('throws on a symbol key, an accessor and a non-enumerable property', () => {
    expect(getCloneError({ [Symbol('s')]: 1 })).toMatchObject({ path: [], valueDescription: 'symbol key' });
    const withAccessor: object = {};
    Object.defineProperty(withAccessor, 'computed', { enumerable: true, get: (): number => 1 });
    expect(getCloneError({ inner: withAccessor })).toMatchObject({ path: ['inner', 'computed'], valueDescription: 'accessor' });
    const withHidden: object = {};
    Object.defineProperty(withHidden, 'hidden', { value: 1, enumerable: false });
    expect(getCloneError(withHidden)).toMatchObject({ path: ['hidden'], valueDescription: 'non-enumerable' });
  });

  it('looks inside maps and sets and says where the value was', () => {
    expect(getCloneError({ lookup: new Map([[new Ticket('t1'), 1]]) })).toMatchObject({
      path: ['lookup'],
      valueDescription: 'class Ticket (Map key)',
    });
    expect(getCloneError({ lookup: new Map([['k', (): number => 1]]) })).toMatchObject({
      path: ['lookup'],
      valueDescription: 'function (Map value)',
    });
    expect(getCloneError({ tags: new Set([new Error('[test]: failure')]) })).toMatchObject({
      path: ['tags'],
      valueDescription: 'Error (Set element)',
    });
  });

  it('keeps a __proto__ key as an own property and never changes the prototype', () => {
    const clone: Record<string, unknown> = deepClone(JSON.parse('{"name":"x","__proto__":{"isAdmin":true}}') as Record<string, unknown>);
    expect(Object.getPrototypeOf(clone)).toBe(Object.prototype);
    expect(Object.hasOwn(clone, '__proto__')).toBe(true);
    expect(clone['isAdmin']).toBeUndefined();
  });

  it('returns an object with the Object prototype from a null-prototype input', () => {
    const input: object = Object.assign(Object.create(null) as object, { a: 1 });
    expect(Object.getPrototypeOf(deepClone(input))).toBe(Object.prototype);
  });
});
