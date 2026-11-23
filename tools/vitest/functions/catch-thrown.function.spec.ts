import { describe, expect, it } from 'vitest';
import { catchThrown } from './catch-thrown.function.ts';

describe('catchThrown', () => {
  it('returns what the action throws', () => {
    const error: Error = new Error('[test]: failure');
    expect(
      catchThrown(() => {
        throw error;
      }),
    ).toBe(error);
  });

  it('returns null when the action throws nothing', () => {
    expect(catchThrown(() => 1)).toBeNull();
  });
});
