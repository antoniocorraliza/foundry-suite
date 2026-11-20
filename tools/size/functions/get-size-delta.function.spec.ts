import { describe, expect, it } from 'vitest';
import { getSizeDelta } from './get-size-delta.function.ts';

describe('getSizeDelta', () => {
  it('subtracts the base from the probe, raw and gzip separately', () => {
    expect(getSizeDelta({ raw: 1500, gzip: 700 }, { raw: 1000, gzip: 500 })).toEqual({ raw: 500, gzip: 200 });
  });

  it('is zero when the import adds nothing', () => {
    expect(getSizeDelta({ raw: 219112, gzip: 59400 }, { raw: 219112, gzip: 59400 })).toEqual({ raw: 0, gzip: 0 });
  });

  it('keeps a negative gzip delta instead of hiding it', () => {
    expect(getSizeDelta({ raw: 1003, gzip: 498 }, { raw: 1000, gzip: 500 })).toEqual({ raw: 3, gzip: -2 });
  });
});
