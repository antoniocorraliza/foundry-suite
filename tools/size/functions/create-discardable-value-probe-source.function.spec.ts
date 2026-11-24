import { describe, expect, it } from 'vitest';
import { createDiscardableValueProbeSource } from './create-discardable-value-probe-source.function.ts';

describe('createDiscardableValueProbeSource', () => {
  it('imports the value without using it, next to a symbol that it keeps', () => {
    expect(
      createDiscardableValueProbeSource('@antoniocorraliza/foundry-utils/csv', {
        packageFolder: 'foundry-utils',
        entry: 'csv',
        valueName: 'excelSpanishCsvOptions',
        keptSymbol: 'toCsv',
        absentText: 'delimiter:";"',
      }),
    ).toBe(
      "import { toCsv as probeKept, excelSpanishCsvOptions as probeUnused } from '@antoniocorraliza/foundry-utils/csv';\nconsole.log([probeKept]);\n",
    );
  });
});
