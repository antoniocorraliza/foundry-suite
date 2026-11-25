import { describe, expect, it, vi } from 'vitest';
import { measureMilliseconds } from './measure-milliseconds.function.ts';

describe('measureMilliseconds', () => {
  it('runs the action once and returns the time between two reads of the clock', () => {
    const action: () => void = vi.fn();
    vi.spyOn(performance, 'now').mockReturnValueOnce(10).mockReturnValueOnce(35.5);
    expect(measureMilliseconds(action)).toBe(25.5);
    expect(action).toHaveBeenCalledOnce();
    vi.restoreAllMocks();
  });
});
