import { describe, expect, it } from 'vitest';
import { splitFirstCharacter } from './split-first-character.function';

describe('splitFirstCharacter', () => {
  it('splits a text into its first character and the rest', () => {
    expect(splitFirstCharacter('hola')).toEqual(['h', 'ola']);
    expect(splitFirstCharacter('a')).toEqual(['a', '']);
  });

  it('keeps a character outside the basic plane whole', () => {
    expect(splitFirstCharacter('𝒶bc')).toEqual(['𝒶', 'bc']);
  });

  it('returns two empty texts for an empty text', () => {
    expect(splitFirstCharacter('')).toEqual(['', '']);
  });
});
