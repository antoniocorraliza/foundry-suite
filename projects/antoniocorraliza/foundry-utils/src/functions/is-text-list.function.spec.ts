import { describe, expect, it } from 'vitest';
import { ɵisTextList } from './is-text-list.function';

describe('ɵisTextList', () => {
  it.each<[string, unknown]>([
    ['an empty array', []],
    ['an array of texts', ['https:', 'mailto:']],
  ])('returns true for %s', (_name, value) => {
    expect(ɵisTextList(value)).toBe(true);
  });

  it.each<[string, unknown]>([
    ['null', null],
    ['a text', 'https:'],
    ['an array with a number', ['https:', 1]],
    ['an array with a String object', [new String('https:')]],
    ['a set of texts', new Set(['https:'])],
  ])('returns false for %s', (_name, value) => {
    expect(ɵisTextList(value)).toBe(false);
  });
});
