import { describe, expect, it } from 'vitest';
import { splitGraphemes } from './split-graphemes.function';

describe('splitGraphemes', () => {
  it('splits a text into its visible characters', () => {
    expect(splitGraphemes('abc')).toEqual(['a', 'b', 'c']);
    expect(splitGraphemes('')).toEqual([]);
  });

  it.each<[string, string]>([
    ['an emoji', '😀'],
    ['a family joined with zero width joiners', '👨‍👩‍👧'],
    ['a flag', '🇪🇸'],
    ['an emoji with a skin tone', '👍🏽'],
    ['a letter with a combining mark', 'é'],
    ['a letter with two combining marks', 'á̈'],
  ])('keeps %s as one character', (_name, grapheme) => {
    expect(splitGraphemes(`a${grapheme}b`)).toEqual(['a', grapheme, 'b']);
  });

  it('keeps two flags in a row as two characters', () => {
    expect(splitGraphemes('🇪🇸🇫🇷')).toEqual(['🇪🇸', '🇫🇷']);
  });
});
