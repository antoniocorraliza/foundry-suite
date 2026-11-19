import { describe, expect, it } from 'vitest';
import { referenceProblems } from './reference-problems.function.ts';

describe('referenceProblems', () => {
  it('accepts sizes identical to the reference', () => {
    const sizes: Parameters<typeof referenceProblems>[0] = {
      'utils/date': { esbuild: { raw: 10, gzip: 8 }, rollup: { raw: 12, gzip: 9 } },
    };
    expect(referenceProblems(sizes, sizes)).toEqual([]);
  });

  it('fails when an entry grows, even by one byte', () => {
    expect(
      referenceProblems({ 'core (root)': { angular: { raw: 13, gzip: 17 } } }, { 'core (root)': { angular: { raw: 12, gzip: 17 } } }),
    ).toEqual(['core (root) [angular]: grew by +1 B (gzip 0 B), now 0.01 kB, gzip 0.02 kB']);
  });

  it('fails when only the gzip size grows', () => {
    expect(referenceProblems({ 'ui/icon': { angular: { raw: 12, gzip: 31 } } }, { 'ui/icon': { angular: { raw: 12, gzip: 30 } } })).toEqual(
      ['ui/icon [angular]: grew by 0 B (gzip +1 B), now 0.01 kB, gzip 0.03 kB'],
    );
  });

  it('fails when an entry shrinks and the reference was not updated', () => {
    expect(
      referenceProblems({ 'utils/date': { esbuild: { raw: 900, gzip: 500 } } }, { 'utils/date': { esbuild: { raw: 1000, gzip: 520 } } }),
    ).toEqual(['utils/date [esbuild]: shrank by -100 B (gzip -20 B), now 0.90 kB, gzip 0.50 kB']);
  });

  it('fails on a new measurement and on one that is no longer measured', () => {
    expect(
      referenceProblems({ 'utils/text': { esbuild: { raw: 1, gzip: 1 } } }, { 'utils/csv': { esbuild: { raw: 1, gzip: 1 } } }),
    ).toEqual(['utils/csv: in the reference but no longer measured', 'utils/text: new, not in the reference yet']);
  });

  it('fails when a tool appears or disappears for a measurement', () => {
    expect(
      referenceProblems({ 'utils/date': { esbuild: { raw: 1, gzip: 1 } } }, { 'utils/date': { rollup: { raw: 1, gzip: 1 } } }),
    ).toEqual(['utils/date [esbuild]: new, not in the reference yet', 'utils/date [rollup]: in the reference but no longer measured']);
  });
});
