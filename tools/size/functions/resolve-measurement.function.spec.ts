import { describe, expect, it } from 'vitest';
import type { BuiltEntry } from '../interfaces/built-entry.interface.ts';
import type { SizeMeasurement } from '../interfaces/size-measurement.interface.ts';
import { resolveMeasurement } from './resolve-measurement.function.ts';

const BUILT_ENTRIES: ReadonlyArray<BuiltEntry> = [
  { packageFolder: 'foundry-utils', entry: '', specifier: '@antoniocorraliza/foundry-utils', file: '/dist/utils.mjs', exports: [] },
  {
    packageFolder: 'foundry-utils',
    entry: 'date',
    specifier: '@antoniocorraliza/foundry-utils/date',
    file: '/dist/utils-date.mjs',
    exports: ['formatDate', 'parseDate'],
  },
  {
    packageFolder: 'foundry-core',
    entry: 'testing',
    specifier: '@antoniocorraliza/foundry-core/testing',
    file: '/dist/t.mjs',
    exports: [],
  },
];

function measurementOf(overrides: Partial<SizeMeasurement>): SizeMeasurement {
  return { name: 'probe', packageFolder: 'foundry-utils', target: 'bundle', imports: [], budget: null, ...overrides };
}

describe('resolveMeasurement', () => {
  it('measures named symbols that the built entry exports', () => {
    const measurement: SizeMeasurement = measurementOf({ imports: [{ entry: 'date', symbols: ['parseDate', 'formatDate'] }] });
    expect(resolveMeasurement(measurement, { entries: BUILT_ENTRIES, files: new Set() })).toEqual({
      status: 'measurable',
      measurement,
      imports: [{ specifier: '@antoniocorraliza/foundry-utils/date', symbols: ['parseDate', 'formatDate'] }],
    });
  });

  it('leaves pending, without failing, an entry that is not built yet', () => {
    const measurement: SizeMeasurement = measurementOf({ imports: [{ entry: 'csv', symbols: 'whole-entry' }] });
    expect(resolveMeasurement(measurement, { entries: BUILT_ENTRIES, files: new Set() })).toEqual({
      status: 'pending',
      measurement,
      reason: "entry 'csv' is not built yet",
    });
  });

  it('leaves pending a symbol that the entry does not export yet', () => {
    const measurement: SizeMeasurement = measurementOf({ imports: [{ entry: 'date', symbols: ['parseDate', 'parseCalendarDay'] }] });
    expect(resolveMeasurement(measurement, { entries: BUILT_ENTRIES, files: new Set() })).toEqual({
      status: 'pending',
      measurement,
      reason: '@antoniocorraliza/foundry-utils/date does not export parseCalendarDay yet',
    });
  });

  it('measures every built entry of the package except testing', () => {
    expect(resolveMeasurement(measurementOf({ imports: 'every-entry' }), { entries: BUILT_ENTRIES, files: new Set() })).toMatchObject({
      status: 'measurable',
      imports: [
        { specifier: '@antoniocorraliza/foundry-utils', symbols: 'whole-entry' },
        { specifier: '@antoniocorraliza/foundry-utils/date', symbols: 'whole-entry' },
      ],
    });
    expect(
      resolveMeasurement(measurementOf({ packageFolder: 'foundry-core', imports: 'every-entry' }), {
        entries: BUILT_ENTRIES,
        files: new Set(),
      }),
    ).toMatchObject({
      status: 'pending',
      reason: 'no entry is built yet',
    });
  });

  it('measures stylesheets only when every file is built', () => {
    const measurement: SizeMeasurement = measurementOf({
      packageFolder: 'foundry-ui',
      target: 'stylesheets',
      files: ['styles/a.css', 'styles/b.css'],
    });
    expect(resolveMeasurement(measurement, { entries: BUILT_ENTRIES, files: new Set(['foundry-ui/styles/a.css']) })).toMatchObject({
      status: 'pending',
      reason: 'not built yet: styles/b.css',
    });
    expect(
      resolveMeasurement(measurement, { entries: BUILT_ENTRIES, files: new Set(['foundry-ui/styles/a.css', 'foundry-ui/styles/b.css']) }),
    ).toMatchObject({
      status: 'measurable',
    });
  });
});
