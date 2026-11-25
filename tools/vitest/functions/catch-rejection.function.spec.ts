import { describe, expect, it } from 'vitest';
import { catchRejection } from './catch-rejection.function.ts';

describe('catchRejection', () => {
  it('returns the reason of the rejection', async () => {
    const error: Error = new Error('[test]: failure');
    expect(await catchRejection(() => Promise.reject(error))).toBe(error);
  });

  it('returns null when the promise resolves', async () => {
    expect(await catchRejection(() => Promise.resolve(1))).toBeNull();
  });

  it('fails when starting the action throws instead of returning a rejected promise', async () => {
    const throwWhenStarted: () => Promise<unknown> = () => {
      throw new RangeError('[test]: thrown when called');
    };
    await expect(catchRejection(throwWhenStarted)).rejects.toThrow(/RangeError/);
  });
});
