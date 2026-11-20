import { describe, expect, it } from 'vitest';
import { createProbeSource } from './create-probe-source.function.ts';

describe('createProbeSource', () => {
  it('keeps every imported symbol alive through a single console.log', () => {
    expect(
      createProbeSource([
        { specifier: '@antoniocorraliza/foundry-utils/date', symbols: ['parseDate', 'formatDate'] },
        { specifier: '@antoniocorraliza/foundry-utils/csv', symbols: 'whole-entry' },
      ]),
    ).toBe(
      [
        "import { parseDate as probe0_0, formatDate as probe0_1 } from '@antoniocorraliza/foundry-utils/date';",
        "import * as probe1 from '@antoniocorraliza/foundry-utils/csv';",
        'console.log([probe0_0, probe0_1, probe1]);',
        '',
      ].join('\n'),
    );
  });

  it('gives the empty base the same sink, so the delta is only the import', () => {
    expect(createProbeSource([])).toBe('console.log([]);\n');
  });
});
