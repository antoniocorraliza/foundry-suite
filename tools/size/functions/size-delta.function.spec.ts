import { describe, expect, it } from 'vitest';
import { sizeDelta } from './size-delta.function.ts';

describe('sizeDelta', () => {
  it('subtracts the base from the probe, raw and gzip separately', () => {
    expect(sizeDelta({ raw: 1500, gzip: 700 }, { raw: 1000, gzip: 500 })).toEqual({ raw: 500, gzip: 200 });
  });

  it('is zero when the import adds nothing', () => {
    expect(sizeDelta({ raw: 219112, gzip: 59400 }, { raw: 219112, gzip: 59400 })).toEqual({ raw: 0, gzip: 0 });
  });

  it('keeps a negative gzip delta instead of hiding it', () => {
    expect(sizeDelta({ raw: 1003, gzip: 498 }, { raw: 1000, gzip: 500 })).toEqual({ raw: 3, gzip: -2 });
  });
});
