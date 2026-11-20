import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { isPlainObject } from './is-plain-object.function';

class Ticket {}

describe('isPlainObject', () => {
  it.each([
    ['an object literal', {}],
    ['an object with data', { a: 1 }],
    ['an object without prototype', Object.create(null) as object],
    ['an object parsed from JSON', JSON.parse('{"a":1}') as object],
    ['an object from another context', runInNewContext('({ a: 1 })') as object],
  ])('accepts %s', (description, value) => {
    expect(isPlainObject(value)).toBe(true);
  });

  it.each([
    ['an array', []],
    ['a date', new Date()],
    ['a map', new Map()],
    ['a set', new Set()],
    ['a blob', new Blob(['x'])],
    ['a file', new File(['x'], 'a.txt')],
    ['a regular expression', /a/],
    ['an error', new Error('[test]: failure')],
    ['a class instance', new Ticket()],
    ['an object whose prototype is another object', Object.create({}) as object],
    ['a function', (): number => 1],
    ['null', null],
    ['undefined', undefined],
    ['a number', 5],
    ['a string', 'x'],
  ])('rejects %s', (description, value) => {
    expect(isPlainObject(value)).toBe(false);
  });

  it('never throws inside filter, which passes the index as second argument', () => {
    expect([{}, 1, null].filter(isPlainObject)).toEqual([{}]);
  });
});
