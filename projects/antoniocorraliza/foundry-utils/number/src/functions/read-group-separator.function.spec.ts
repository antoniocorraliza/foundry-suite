import { describe, expect, it } from 'vitest';
import { readGroupSeparator } from './read-group-separator.function';

describe('readGroupSeparator', () => {
  it.each<[string, string]>([
    ['.', '.'],
    [',', ','],
    [' ', ' '],
    ['\u00a0', ' '],
    ['\u202f', ' '],
    ['\u2009', ' '],
    ["'", "'"],
    ['\u2019', "'"],
  ])('reads %j as the separator %j', (character, separator) => {
    expect(readGroupSeparator(character)).toBe(separator);
  });

  it.each<string>(['_', '\t', '', '  '])('returns null for %j', (character) => {
    expect(readGroupSeparator(character)).toBeNull();
  });
});
