import { describe, expect, it } from 'vitest';
import { FoundryCircularReferenceError, ɵcheckOptions, ɵparseBooleanOption } from '@antoniocorraliza/foundry-utils';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { createObjectWithFakeTag } from '@foundry-test/functions/create-object-with-fake-tag.function';
import { freezeAndSnapshot } from '@foundry-test/functions/freeze-and-snapshot.function';
import type { FrozenSnapshot } from '@foundry-test/interfaces/frozen-snapshot.interface';
import { removeEmptyValues } from './remove-empty-values.function';

class Ticket {}

describe('removeEmptyValues', () => {
  it('removes null and undefined properties in depth without changing the input', () => {
    const input: FrozenSnapshot<object> = freezeAndSnapshot({ a: 1, b: null, c: undefined, d: { e: null, f: 'x' } });
    expect(removeEmptyValues(input.value)).toEqual({ a: 1, d: { f: 'x' } });
    expect(input.listChanges()).toEqual([]);
  });

  it('keeps empty strings unless asked, and keeps blank strings even then', () => {
    expect(removeEmptyValues({ a: '', b: '   ' })).toEqual({ a: '', b: '   ' });
    expect(removeEmptyValues({ a: '', b: '   ' }, { removeEmptyStrings: true })).toEqual({ b: '   ' });
  });

  it('keeps empty collections unless asked', () => {
    expect(removeEmptyValues({ a: {}, b: [], c: { d: null } })).toEqual({ a: {}, b: [], c: {} });
    expect(removeEmptyValues({ a: {}, b: [], c: { d: null }, e: 1 }, { removeEmptyCollections: true })).toEqual({ e: 1 });
  });

  it('keeps the positions of arrays by default and removes empty items only when asked', () => {
    expect(removeEmptyValues({ scores: [10, null, 8] })).toEqual({ scores: [10, null, 8] });
    expect(removeEmptyValues({ scores: [10, null, 8] }, { removeEmptyArrayItems: true })).toEqual({ scores: [10, 8] });
  });

  it('never removes an item of an array without removeEmptyArrayItems', () => {
    expect(removeEmptyValues({ list: ['', {}, null] }, { removeEmptyStrings: true, removeEmptyCollections: true })).toEqual({
      list: ['', {}, null],
    });
  });

  it('cleans the objects inside arrays', () => {
    expect(removeEmptyValues([{ a: null, b: 1 }])).toEqual([{ b: 1 }]);
  });

  it('keeps dates, files and other objects by reference, with every option', () => {
    const due: Date = new Date(2026, 0, 1);
    const invalid: Date = new Date(Number.NaN);
    const doc: File = new File(['x'], 'a.txt');
    const lookup: Map<string, number> = new Map();
    const ticket: Ticket = new Ticket();
    const result: Record<string, unknown> = removeEmptyValues(
      { due, invalid, doc, lookup, ticket },
      { removeEmptyStrings: true, removeEmptyCollections: true, removeEmptyArrayItems: true },
    ) as Record<string, unknown>;
    expect(result['due']).toBe(due);
    expect(result['invalid']).toBe(invalid);
    expect(result['doc']).toBe(doc);
    expect(result['lookup']).toBe(lookup);
    expect(result['ticket']).toBe(ticket);
  });

  it('keeps NaN, zero and false', () => {
    expect(removeEmptyValues({ a: Number.NaN, b: 0, c: false })).toEqual({ a: Number.NaN, b: 0, c: false });
  });

  it('returns a primitive, null or undefined root as it is', () => {
    expect(removeEmptyValues(null)).toBeNull();
    expect(removeEmptyValues(undefined)).toBeUndefined();
    expect(removeEmptyValues(5)).toBe(5);
  });

  it('returns a new empty collection when the root ends up empty', () => {
    const root: { a: null } = { a: null };
    const result: unknown = removeEmptyValues(root, { removeEmptyCollections: true });
    expect(result).toEqual({});
    expect(result).not.toBe(root);
    expect(removeEmptyValues([], { removeEmptyCollections: true })).toEqual([]);
  });

  it('does not copy symbol keys, accessors or non-enumerable properties, and never runs a getter', () => {
    const value: Record<string | symbol, unknown> = { a: 1, [Symbol('s')]: 1 };
    Object.defineProperty(value, 'hidden', { value: 1, enumerable: false });
    Object.defineProperty(value, 'computed', {
      enumerable: true,
      get: (): never => {
        throw new Error('[test]: the getter ran');
      },
    });
    expect(Reflect.ownKeys(removeEmptyValues(value) as object)).toEqual(['a']);
  });

  it('keeps a __proto__ key as an own property and never changes the prototype', () => {
    const result: Record<string, unknown> = removeEmptyValues(JSON.parse('{"name":"x","__proto__":{"isAdmin":true}}')) as Record<
      string,
      unknown
    >;
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.hasOwn(result, '__proto__')).toBe(true);
    expect(result['isAdmin']).toBeUndefined();
  });

  it('returns objects with the Object prototype from a null-prototype input', () => {
    expect(Object.getPrototypeOf(removeEmptyValues(Object.assign(Object.create(null) as object, { a: 1 })))).toBe(Object.prototype);
  });

  it('copies an object used in two places, without taking it for a cycle', () => {
    const shared: { a: number; b: null } = { a: 1, b: null };
    const result: { first: object; second: object } = removeEmptyValues({ first: shared, second: shared }) as {
      first: object;
      second: object;
    };
    expect(result).toEqual({ first: { a: 1 }, second: { a: 1 } });
    expect(result.first).not.toBe(result.second);
  });

  it('throws a circular reference error with the path that points back', () => {
    const value: { inner: { back?: unknown } } = { inner: {} };
    value.inner.back = value;
    const error: unknown = catchThrown(() => removeEmptyValues(value));
    expect(error).toBeInstanceOf(FoundryCircularReferenceError);
    expect(error).toMatchObject({ path: ['inner', 'back'] });
  });

  it('rejects options that are not an object and an option that is not a boolean as checkOptions and parseBooleanOption do', () => {
    expect(catchError(() => removeEmptyValues({ a: 1 }, 5 as never), TypeError).message).toBe(
      catchError(() => ɵcheckOptions(5, 'removeEmptyValues'), TypeError).message,
    );
    expect(catchError(() => removeEmptyValues({ a: 1 }, { removeEmptyStrings: 'yes' } as never), TypeError).message).toBe(
      catchError(
        () => ɵparseBooleanOption({ options: { removeEmptyStrings: 'yes' }, name: 'removeEmptyStrings', fallback: false }),
        TypeError,
      ).message,
    );
  });

  it('throws when map passes the index as its options', () => {
    expect(() => [{ a: { b: null } }, { a: 1 }].map(removeEmptyValues as (value: unknown, index: number) => unknown)).toThrow(TypeError);
  });

  it.each(['Date', 'Map', 'Set', 'RegExp', 'ArrayBuffer', 'Array', 'Object'])(
    'keeps an object that fakes the tag of %s by reference, with every option',
    (tag) => {
      const fake: object = createObjectWithFakeTag(tag);
      const result: Record<string, unknown> = removeEmptyValues(
        { due: fake },
        { removeEmptyStrings: true, removeEmptyCollections: true, removeEmptyArrayItems: true },
      ) as Record<string, unknown>;
      expect(result['due']).toBe(fake);
    },
  );
});
