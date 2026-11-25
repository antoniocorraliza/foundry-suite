import fc from 'fast-check';
import { describe, expect, it, vi } from 'vitest';
import { hasValue } from './has-value.function';

describe('hasValue', () => {
  it.each<[string, unknown]>([
    ['null', null],
    ['undefined', undefined],
    ['an empty text', ''],
    ['a blank text', '   '],
    ['a text with only a no-break space and a tab', ' \t'],
    ['NaN', Number.NaN],
    ['an invalid date', new Date(Number.NaN)],
    ['an empty plain object', {}],
    ['an object without a prototype and without properties', Object.create(null) as object],
    ['an empty array', []],
    ['an array with only holes', new Array(3)],
    ['an empty map', new Map()],
    ['an empty set', new Set()],
  ])('returns false for %s', (_name, value) => {
    expect(hasValue(value)).toBe(false);
  });

  it.each<[string, unknown]>([
    ['zero', 0],
    ['negative zero', -0],
    ['false', false],
    ['a text', 'a'],
    ['an array with an item', [1]],
    ['a plain object with a property', { a: 1 }],
    ['a valid date', new Date(0)],
    ['a map with an entry', new Map([['a', 1]])],
    ['a set with an item', new Set([1])],
    ['a function', (): number => 1],
    ['an instance of a class', new URL('https://empresa.es')],
  ])('returns true for %s', (_name, value) => {
    expect(hasValue(value)).toBe(true);
  });

  it('looks only at the first level', () => {
    expect(hasValue({ a: null })).toBe(true);
    expect(hasValue({ nombre: 'Ana', telefono: null })).toBe(true);
    expect(hasValue([null])).toBe(true);
    expect(hasValue([null, 1])).toBe(true);
    expect(hasValue(new Map([['a', null]]))).toBe(true);
    expect(hasValue(new Set([null]))).toBe(true);
  });

  it('counts only own data properties of a plain object, without running a getter', () => {
    const getter: () => number = vi.fn(() => 1);
    expect(hasValue(Object.defineProperty({}, 'a', { get: getter, enumerable: true }))).toBe(false);
    expect(hasValue({ [Symbol('a')]: 1 })).toBe(false);
    expect(getter).not.toHaveBeenCalled();
  });

  it('never throws for maps, sets, dates and sparse arrays', () => {
    fc.assert(
      fc.property(
        fc.anything({ withMap: true, withSet: true, withDate: true, withSparseArray: true, withNullPrototype: true }),
        (value) => {
          expect(typeof hasValue(value)).toBe('boolean');
        },
      ),
    );
  });
});
