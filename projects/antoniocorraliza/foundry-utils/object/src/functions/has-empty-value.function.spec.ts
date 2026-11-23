import { describe, expect, it } from 'vitest';
import { freezeAndSnapshot } from '@foundry-test/functions/freeze-and-snapshot.function';
import type { FrozenSnapshot } from '@foundry-test/interfaces/frozen-snapshot.interface';
import { hasEmptyValue } from './has-empty-value.function';

class Ticket {}

describe('hasEmptyValue', () => {
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['an empty string', ''],
    ['a blank string', '   '],
    ['NaN', Number.NaN],
    ['an empty object', {}],
    ['an empty array', []],
    ['an invalid date', new Date(Number.NaN)],
    ['an empty map', new Map()],
    ['an empty set', new Set()],
    ['an object with an empty value inside', { a: 1, b: { c: '' } }],
    ['an array with an empty value inside', [1, null]],
  ])('finds %s empty', (description, value) => {
    expect(hasEmptyValue(value)).toBe(true);
  });

  it.each([
    ['zero', 0],
    ['false', false],
    ['text', 'x'],
    ['a valid date', new Date(2026, 0, 1)],
    ['a map with data, without looking inside it', new Map([['k', null]])],
    ['a set with data', new Set([null])],
    ['a regular expression', /a/],
    ['a typed array', new Uint8Array(0)],
    ['a blob', new Blob([])],
    ['a file', new File([], 'a.txt')],
    ['an error', new Error('[test]: failure')],
    ['a class instance', new Ticket()],
    ['a function', (): number => 1],
    ['a full object', { a: 1, b: [2] }],
  ])('does not find %s empty', (description, value) => {
    expect(hasEmptyValue(value)).toBe(false);
  });

  it('ignores symbol keys, accessors and non-enumerable properties', () => {
    const value: Record<string | symbol, unknown> = { a: 1, [Symbol('s')]: null };
    Object.defineProperty(value, 'hidden', { value: null, enumerable: false });
    Object.defineProperty(value, 'computed', { enumerable: true, get: (): null => null });
    expect(hasEmptyValue(value)).toBe(false);
  });

  it('only looks at the given first-level fields', () => {
    expect(hasEmptyValue({ a: 1, b: '' }, { fields: ['a'] })).toBe(false);
    expect(hasEmptyValue({ a: 1, b: '' }, { fields: ['b'] })).toBe(true);
    expect(hasEmptyValue({ a: 1 }, { fields: ['missing'] })).toBe(true);
    expect(hasEmptyValue({ 'a.b': 1, a: { b: '' } }, { fields: ['a.b'] })).toBe(false);
  });

  it('ignores the fields when the root is not a plain object', () => {
    expect(hasEmptyValue([1, ''], { fields: ['0'] })).toBe(true);
    expect(hasEmptyValue('x', { fields: ['a'] })).toBe(false);
  });

  it('reads the size of a map or a set, not an own size property', () => {
    const map: Map<string, number> = new Map<string, number>();
    const set: Set<number> = new Set<number>([1]);
    Object.defineProperty(map, 'size', { value: 3 });
    Object.defineProperty(set, 'size', { value: 0 });
    expect(hasEmptyValue(map)).toBe(true);
    expect(hasEmptyValue(set)).toBe(false);
  });

  it('does not count a cycle as empty', () => {
    const value: { self?: unknown; a: number } = { a: 1 };
    value.self = value;
    expect(hasEmptyValue(value)).toBe(false);
  });

  it('never throws: invalid options and the index of filter are ignored', () => {
    expect(hasEmptyValue({ a: '' }, 5 as never)).toBe(true);
    expect(hasEmptyValue({ a: '' }, { fields: 5 } as never)).toBe(true);
    expect([{ a: '' }, { a: 1 }].filter(hasEmptyValue as (value: unknown, index: number) => boolean)).toEqual([{ a: '' }]);
  });

  it('does not change its input', () => {
    const input: FrozenSnapshot<object> = freezeAndSnapshot({ due: new Date(2026, 0, 1), map: new Map([['k', 1]]) });
    hasEmptyValue(input.value);
    expect(input.listChanges()).toEqual([]);
  });
});
