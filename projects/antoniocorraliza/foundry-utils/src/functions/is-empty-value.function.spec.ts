import { describe, expect, it, vi } from 'vitest';
import { ɵisEmptyValue } from './is-empty-value.function';

describe('ɵisEmptyValue', () => {
  it.each<[string, unknown]>([
    ['null', null],
    ['undefined', undefined],
    ['a blank text', ' \t'],
    ['NaN', Number.NaN],
    ['an invalid date', new Date(Number.NaN)],
    ['an empty map', new Map()],
    ['an empty set', new Set()],
    ['an empty array', []],
    ['an array with only holes', new Array(3)],
    ['an empty plain object', {}],
  ])('returns true for %s, without asking about the entries', (_name, value) => {
    const isEmptyEntries: () => boolean = vi.fn(() => false);
    expect(ɵisEmptyValue(value, isEmptyEntries)).toBe(true);
    expect(isEmptyEntries).not.toHaveBeenCalled();
  });

  it.each<[string, unknown]>([
    ['zero', 0],
    ['false', false],
    ['a text', 'a'],
    ['a valid date', new Date(0)],
    ['a map with an entry', new Map([['a', null]])],
    ['a set with an item', new Set([null])],
    ['a function', (): number => 1],
    ['an instance of a class', new URL('https://empresa.es')],
  ])('returns false for %s', (_name, value) => {
    expect(ɵisEmptyValue(value, () => true)).toBe(false);
  });

  it('asks the rule about an array or a plain object with entries, and returns its answer', () => {
    const array: Array<unknown> = [null, 1];
    const isEmptyEntries: () => boolean = vi.fn(() => true);
    expect(ɵisEmptyValue(array, isEmptyEntries)).toBe(true);
    expect(isEmptyEntries).toHaveBeenCalledWith(array, [
      ['0', null],
      ['1', 1],
    ]);
    expect(ɵisEmptyValue({ name: 'Ana' }, () => false)).toBe(false);
  });

  it('reads the size of a map with the native getter, which an own size property cannot fake', () => {
    expect(ɵisEmptyValue(Object.defineProperty(new Map(), 'size', { value: 1 }), () => false)).toBe(true);
    expect(ɵisEmptyValue(Object.defineProperty(new Set([1]), 'size', { value: 0 }), () => false)).toBe(false);
  });
});
