import { describe, expect, it } from 'vitest';
import { isPromiseLike } from './is-promise-like.function.ts';

describe('isPromiseLike', () => {
  it('returns true for a promise and for an object with a then method', () => {
    expect(isPromiseLike(Promise.resolve(1))).toBe(true);
    expect(isPromiseLike({ then: (): void => undefined })).toBe(true);
  });

  it.each<unknown>([null, undefined, 1, 'then', {}, { then: 1 }, (): number => 1])('returns false for %j', (value) => {
    expect(isPromiseLike(value)).toBe(false);
  });
});
