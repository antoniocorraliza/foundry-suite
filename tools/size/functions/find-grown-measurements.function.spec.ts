import { describe, expect, it } from 'vitest';
import { findGrownMeasurements } from './find-grown-measurements.function.ts';

describe('findGrownMeasurements', () => {
  it('lists the measurements that grew in any tool, raw or gzip', () => {
    const before: Parameters<typeof findGrownMeasurements>[0] = {
      'utils/date': { esbuild: { raw: 100, gzip: 50 }, rollup: { raw: 120, gzip: 60 } },
      'utils/csv': { esbuild: { raw: 100, gzip: 50 } },
      'core (root)': { angular: { raw: 10, gzip: 10 } },
    };
    const after: Parameters<typeof findGrownMeasurements>[1] = {
      'utils/date': { esbuild: { raw: 100, gzip: 50 }, rollup: { raw: 120, gzip: 61 } },
      'utils/csv': { esbuild: { raw: 90, gzip: 45 } },
      'core (root)': { angular: { raw: 11, gzip: 10 } },
    };
    expect(findGrownMeasurements(before, after)).toEqual(['core (root)', 'utils/date']);
  });

  it('does not count a new measurement as grown', () => {
    expect(findGrownMeasurements({}, { 'utils/text': { esbuild: { raw: 500, gzip: 300 } } })).toEqual([]);
  });
});
