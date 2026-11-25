import { describe, expect, it } from 'vitest';
import { ɵisArrayIndex } from './is-array-index.function';

describe('ɵisArrayIndex', () => {
  it.each(['0', '7', '4294967294'])('returns true for %j', (key) => {
    expect(ɵisArrayIndex(key)).toBe(true);
  });

  it.each(['', '01', '-1', '1.5', '1e3', ' 1', 'length', 'extra', '4294967295'])('returns false for %j', (key) => {
    expect(ɵisArrayIndex(key)).toBe(false);
  });
});
