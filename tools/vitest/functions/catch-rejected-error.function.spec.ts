import { describe, expect, it } from 'vitest';
import { catchRejectedError } from './catch-rejected-error.function.ts';

describe('catchRejectedError', () => {
  it('returns the reason of the rejection, with the type of the class', async () => {
    const error: RangeError = new RangeError('[test]: failure');
    const caught: RangeError = await catchRejectedError(() => Promise.reject(error), RangeError);
    expect(caught).toBe(error);
  });

  it('fails when the promise rejects with an error of another class', async () => {
    await expect(catchRejectedError(() => Promise.reject(new TypeError('[test]: failure')), RangeError)).rejects.toThrow();
  });

  it('fails when the promise resolves', async () => {
    await expect(catchRejectedError(() => Promise.resolve(1), TypeError)).rejects.toThrow();
  });
});
