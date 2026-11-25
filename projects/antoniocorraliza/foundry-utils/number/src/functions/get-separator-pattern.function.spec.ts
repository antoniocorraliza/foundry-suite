import { describe, expect, it } from 'vitest';
import { getSeparatorPattern } from './get-separator-pattern.function';

describe('getSeparatorPattern', () => {
  it('matches the dot and the comma only as themselves', () => {
    expect(new RegExp(`^${getSeparatorPattern('.')}$`, 'u').test('.')).toBe(true);
    expect(new RegExp(`^${getSeparatorPattern('.')}$`, 'u').test('a')).toBe(false);
    expect(getSeparatorPattern(',')).toBe(',');
  });

  it('matches every space and apostrophe that a separator takes, and nothing else', () => {
    const spaces: RegExp = new RegExp(`^${getSeparatorPattern(' ')}$`, 'u');
    const apostrophes: RegExp = new RegExp(`^${getSeparatorPattern("'")}$`, 'u');
    expect([' ', '\u00a0', '\u202f', '\u2009', '\t'].map((character) => spaces.test(character))).toEqual([true, true, true, true, false]);
    expect(["'", '\u2019', '`'].map((character) => apostrophes.test(character))).toEqual([true, true, false]);
  });
});
