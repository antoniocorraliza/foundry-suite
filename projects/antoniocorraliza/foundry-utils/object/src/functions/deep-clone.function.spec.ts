import { describe, expect, it } from 'vitest';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { freezeAndSnapshot } from '@foundry-test/functions/freeze-and-snapshot.function';
import type { FrozenSnapshot } from '@foundry-test/interfaces/frozen-snapshot.interface';
import { FoundryCloneError } from '../errors/foundry-clone.error';
import { deepClone } from './deep-clone.function';

class Ticket {
  constructor(readonly id: string) {}
}

class TicketList extends Array<unknown> {}

class TicketLookup extends Map<string, unknown> {}

class TicketTags extends Set<unknown> {}

class DueDate extends Date {}

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

  it('copies a typed array into a new view of the same type', () => {
    const original: { view: Uint16Array } = { view: new Uint16Array([1, 2]) };
    const clone: typeof original = deepClone(original);
    expect(clone.view).not.toBe(original.view);
    expect(clone.view).toBeInstanceOf(Uint16Array);
    expect([...clone.view]).toEqual([1, 2]);
  });

  it('copies views over one buffer onto one copy of it, keeping their offsets and lengths', () => {
    const buffer: ArrayBuffer = new ArrayBuffer(8);
    const original: { head: Uint8Array; tail: DataView; buffer: ArrayBuffer } = {
      head: new Uint8Array(buffer, 0, 4),
      tail: new DataView(buffer, 4, 4),
      buffer,
    };
    const clone: typeof original = deepClone(original);
    expect(clone.head.buffer).not.toBe(buffer);
    expect(clone.tail.buffer).toBe(clone.head.buffer);
    expect(clone.buffer).toBe(clone.head.buffer);
    expect([clone.head.byteOffset, clone.head.length, clone.tail.byteOffset, clone.tail.byteLength]).toEqual([0, 4, 4, 4]);
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
    const error: unknown = catchError(
      () =>
        deepClone({
          due: new Date(2026, 0, 1),
          run(): number {
            return 1;
          },
        }),
      FoundryCloneError,
    );
    expect(error).toMatchObject({ path: ['run'], valueDescription: 'function' });
  });

  it('throws on a class instance with the class name and the path', () => {
    expect(catchError(() => deepClone({ items: [{}, {}, { owner: new Ticket('t1') }] }), FoundryCloneError)).toMatchObject({
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
    expect(catchError(() => deepClone({ value }), FoundryCloneError)).toMatchObject({ path: ['value'], valueDescription });
  });

  it('throws on a property of an array that is not an index, instead of dropping it', () => {
    expect(catchError(() => deepClone({ items: Object.assign([1], { extra: 'x' }) }), FoundryCloneError)).toMatchObject({
      path: ['items', 'extra'],
      valueDescription: 'array property',
    });
  });

  it.each<[string, object, string]>([
    ['an array', TicketList.from([1]), 'class TicketList'],
    ['a map', new TicketLookup(), 'class TicketLookup'],
    ['a set', new TicketTags(), 'class TicketTags'],
    ['a date', new DueDate(2026, 0, 1), 'class DueDate'],
    [
      'an array whose class is also called Array',
      new (Object.defineProperty(class extends Array<unknown> {}, 'name', { value: 'Array' }))(),
      'class Array',
    ],
  ])('throws on a subclass of %s with the class name, instead of copying it as the base class', (_label, value, valueDescription) => {
    expect(catchError(() => deepClone({ value }), FoundryCloneError)).toMatchObject({ path: ['value'], valueDescription });
  });

  it('throws on a symbol key, an accessor and a non-enumerable property', () => {
    expect(catchError(() => deepClone({ [Symbol('s')]: 1 }), FoundryCloneError)).toMatchObject({
      path: [],
      valueDescription: 'symbol key',
    });
    const withAccessor: object = {};
    Object.defineProperty(withAccessor, 'computed', { enumerable: true, get: (): number => 1 });
    expect(catchError(() => deepClone({ inner: withAccessor }), FoundryCloneError)).toMatchObject({
      path: ['inner', 'computed'],
      valueDescription: 'accessor',
    });
    const withHidden: object = {};
    Object.defineProperty(withHidden, 'hidden', { value: 1, enumerable: false });
    expect(catchError(() => deepClone(withHidden), FoundryCloneError)).toMatchObject({
      path: ['hidden'],
      valueDescription: 'non-enumerable',
    });
  });

  it('looks inside maps and sets and says where the value was', () => {
    expect(catchError(() => deepClone({ lookup: new Map([[new Ticket('t1'), 1]]) }), FoundryCloneError)).toMatchObject({
      path: ['lookup'],
      valueDescription: 'class Ticket (Map key)',
    });
    expect(catchError(() => deepClone({ lookup: new Map([['k', (): number => 1]]) }), FoundryCloneError)).toMatchObject({
      path: ['lookup'],
      valueDescription: 'function (Map value)',
    });
    expect(catchError(() => deepClone({ tags: new Set([new Error('[test]: failure')]) }), FoundryCloneError)).toMatchObject({
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
