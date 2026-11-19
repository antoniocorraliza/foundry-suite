import { describe, expect, it } from 'vitest';
import { budgetProblems } from './budget-problems.function.ts';

describe('budgetProblems', () => {
  it('accepts a size equal to the budget', () => {
    expect(budgetProblems('utils/date', { esbuild: { raw: 7000, gzip: 2800 } }, { rawKilobytes: 7, gzipKilobytes: 2.8 })).toEqual([]);
  });

  it('reports one byte over the raw budget', () => {
    expect(budgetProblems('utils/date', { esbuild: { raw: 7001, gzip: 100 } }, { rawKilobytes: 7, gzipKilobytes: 2.8 })).toEqual([
      'utils/date [esbuild]: 7.00 kB is over its budget of 7 kB',
    ]);
  });

  it('reports the gzip budget separately', () => {
    expect(budgetProblems('core/configuration', { angular: { raw: 900, gzip: 601 } }, { rawKilobytes: 1.2, gzipKilobytes: 0.6 })).toEqual([
      'core/configuration [angular]: 0.60 kB gzip is over its budget of 0.6 kB',
    ]);
  });

  it('applies the raw budget to Rollup but not the gzip one', () => {
    const figures: Parameters<typeof budgetProblems>[1] = { esbuild: { raw: 100, gzip: 100 }, rollup: { raw: 300, gzip: 300 } };
    expect(budgetProblems('utils/browser', figures, { rawKilobytes: 0.3, gzipKilobytes: 0.2 })).toEqual([]);
    expect(budgetProblems('utils/browser', { rollup: { raw: 301, gzip: 0 } }, { rawKilobytes: 0.3, gzipKilobytes: 0.2 })).toEqual([
      'utils/browser [rollup]: 0.30 kB is over its budget of 0.3 kB',
    ]);
  });

  it('never fails a measurement without a budget', () => {
    expect(budgetProblems('core/security', { angular: { raw: 999999, gzip: 999999 } }, null)).toEqual([]);
  });
});
