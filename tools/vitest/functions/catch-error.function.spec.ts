import { describe, expect, it } from 'vitest';
import { catchError } from './catch-error.function.ts';

describe('catchError', () => {
  it('returns what the action throws, with the type of the class', () => {
    const error: RangeError = new RangeError('[test]: failure');
    const caught: RangeError = catchError(() => {
      throw error;
    }, RangeError);
    expect(caught).toBe(error);
  });

  it('fails when the action throws an error of another class', () => {
    expect(() =>
      catchError(() => {
        throw new TypeError('[test]: failure');
      }, RangeError),
    ).toThrow();
  });

  it('fails when the action throws nothing', () => {
    expect(() => catchError(() => 1, TypeError)).toThrow();
  });
});
