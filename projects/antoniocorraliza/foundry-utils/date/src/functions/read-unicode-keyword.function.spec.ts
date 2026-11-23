import { describe, expect, it } from 'vitest';
import { readUnicodeKeyword } from './read-unicode-keyword.function';

describe('readUnicodeKeyword', () => {
  it.each<[string, string, string | null]>([
    ['en-US-u-fw-mon', 'fw', 'mon'],
    ['en-u-ca-gregory-fw-sun', 'fw', 'sun'],
    ['en-u-rg-gbzzzz', 'rg', 'gbzzzz'],
    ['en-t-es-u-fw-sat', 'fw', 'sat'],
    ['en-u-fw-mon-x-private', 'fw', 'mon'],
    ['en-u-ca-gregory', 'fw', null],
    ['en-x-u-fw-mon', 'fw', null],
    ['en-US', 'fw', null],
  ])('reads from %s the keyword %s as %s', (tag, key, expected) => {
    expect(readUnicodeKeyword(tag, key)).toBe(expected);
  });
});
