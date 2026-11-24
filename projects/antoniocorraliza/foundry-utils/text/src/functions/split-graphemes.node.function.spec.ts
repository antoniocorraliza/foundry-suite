import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe('splitGraphemes on its own module', () => {
  it('creates no segmenter when its module loads, and a single one for every later call', async () => {
    const segmenter: unknown = vi.spyOn(Intl, 'Segmenter');
    const { splitGraphemes } = await import('./split-graphemes.function');
    expect(segmenter).toHaveBeenCalledTimes(0);
    Array.from({ length: 100 }, (_value, index) => splitGraphemes(`text ${index}`));
    expect(segmenter).toHaveBeenCalledTimes(1);
  });
});
