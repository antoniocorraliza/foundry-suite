import { describe, expect, it } from 'vitest';
import { createExhaustiveReport } from './create-exhaustive-report.function.ts';

describe('createExhaustiveReport', () => {
  it('lists each spec with its result and the sum of its test times, slowest first, and the total', () => {
    const lines: Array<string> = createExhaustiveReport(
      {
        testResults: [
          {
            name: '/repo/date/src/functions/a.exhaustive.function.spec.ts',
            status: 'passed',
            assertionResults: [{ status: 'passed', duration: 1200 }],
          },
          {
            name: '/repo/date/src/functions/b.exhaustive.function.spec.ts',
            status: 'failed',
            assertionResults: [
              { status: 'passed', duration: 30_000 },
              { status: 'failed', duration: 12_600 },
              { status: 'skipped', duration: null },
            ],
          },
        ],
      },
      'America/Santiago',
    );
    expect(lines).toEqual([
      '### Exhaustive date specs: America/Santiago',
      '',
      '| Spec | Result | Time |',
      '| :-- | :-- | --: |',
      '| b.exhaustive.function.spec.ts | failed | 42.6 s |',
      '| a.exhaustive.function.spec.ts | passed | 1.2 s |',
      '| **total** | | **43.8 s** |',
      '',
    ]);
  });
});
