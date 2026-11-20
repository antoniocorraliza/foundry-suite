import fc from 'fast-check';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { toCamelCase } from './to-camel-case.function';
import { toSnakeCase } from './to-snake-case.function';

const LOWER_WORD: fc.Arbitrary<string> = fc.stringMatching(/^[a-z][a-z0-9]{0,6}$/);
const UNDERSCORES: fc.Arbitrary<string> = fc.constantFrom('', '_', '__');

describe('toSnakeCase', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ['userName', 'user_name'],
    ['line1Name', 'line1_name'],
    ['parseHTMLString', 'parse_html_string'],
    ['userID', 'user_id'],
    ['addressLine1', 'address_line1'],
    ['content-type', 'content_type'],
    ['User Name', 'user_name'],
    ['IBAN', 'iban'],
    ['_id', '_id'],
    ['__v', '__v'],
  ])('converts %s to %s', (key, expected) => {
    expect(toSnakeCase(key)).toBe(expected);
  });

  it.each([
    ['', ''],
    ['_', '_'],
    ['-userName-', 'user_name'],
    ['añoNacimiento', 'año_nacimiento'],
    ['ÑuId', 'ñu_id'],
    ['2faCode', '2fa_code'],
  ])('converts the edge key %j to %j', (key, expected) => {
    expect(toSnakeCase(key)).toBe(expected);
  });

  it('does not depend on the locale', () => {
    vi.spyOn(String.prototype, 'toLocaleLowerCase').mockImplementation(function (this: string): string {
      return this.replaceAll('I', 'ı').toLowerCase();
    });
    expect(toSnakeCase('ID')).toBe('id');
  });
});

describe('round trip between snake_case and camelCase', () => {
  it('returns every canonical snake_case key where no one-letter word is followed by a word without a lowercase second letter', () => {
    const words: fc.Arbitrary<Array<string>> = fc
      .array(LOWER_WORD, { minLength: 1, maxLength: 5 })
      .filter((list) => list.every((word, index) => index < 2 || (list[index - 1] ?? '').length > 1 || /^[a-z][a-z]/.test(word)));
    fc.assert(
      fc.property(UNDERSCORES, words, UNDERSCORES, (leading, list, trailing) => {
        const key: string = `${leading}${list.join('_')}${trailing}`;
        expect(toSnakeCase(toCamelCase(key))).toBe(key);
      }),
    );
  });

  it('returns every canonical camelCase key', () => {
    const tail: fc.Arbitrary<string> = fc.stringMatching(/^[A-Z][a-z0-9]{1,6}$/);
    fc.assert(
      fc.property(UNDERSCORES, LOWER_WORD, fc.array(tail, { maxLength: 4 }), UNDERSCORES, (leading, head, rest, trailing) => {
        const key: string = `${leading}${head}${rest.join('')}${trailing}`;
        expect(toCamelCase(toSnakeCase(key))).toBe(key);
      }),
    );
  });

  it.each(['plan_b_enabled', 'pos_x'])('returns %s, with one single-letter word', (key) => {
    expect(toSnakeCase(toCamelCase(key))).toBe(key);
  });

  it.each([
    ['pos_x_y', 'posXY', 'pos_xy'],
    ['x_a_b2', 'xAB2', 'x_ab2'],
    ['a_a_a0a', 'aAA0a', 'a_aa0a'],
    ['a_b_c', 'aBC', 'a_bc'],
    ['is_a_b', 'isAB', 'is_ab'],
    ['get_a_b_test', 'getABTest', 'get_ab_test'],
    ['address_line_1', 'addressLine1', 'address_line1'],
  ])('does not return %s: it becomes %s and then %s', (key, camelKey, snakeKey) => {
    expect(toCamelCase(key)).toBe(camelKey);
    expect(toSnakeCase(camelKey)).toBe(snakeKey);
  });

  it('does not return userID: it becomes user_id and then userId', () => {
    expect(toSnakeCase('userID')).toBe('user_id');
    expect(toCamelCase('user_id')).toBe('userId');
  });
});
