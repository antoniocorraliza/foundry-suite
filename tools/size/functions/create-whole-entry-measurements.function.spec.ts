import { describe, expect, it } from 'vitest';
import type { BuiltEntry } from '../interfaces/built-entry.interface.ts';
import type { SizeMeasurement } from '../interfaces/size-measurement.interface.ts';
import { createWholeEntryMeasurements } from './create-whole-entry-measurements.function.ts';

function createBuiltEntry(packageFolder: BuiltEntry['packageFolder'], entry: string): BuiltEntry {
  return { packageFolder, entry, specifier: `@antoniocorraliza/${packageFolder}/${entry}`, file: '', exports: [] };
}

describe('createWholeEntryMeasurements', () => {
  it('measures each built entry whole, without a budget, with the default target of its package', () => {
    expect(
      createWholeEntryMeasurements({
        builtEntries: [createBuiltEntry('foundry-ui', 'icon'), createBuiltEntry('foundry-core', '')],
        explicitMeasurements: [],
      }),
    ).toEqual([
      {
        name: 'ui/icon',
        packageFolder: 'foundry-ui',
        target: 'angular-app-with-forms',
        imports: [{ entry: 'icon', symbols: 'whole-entry' }],
        budget: null,
      },
      {
        name: 'core (root)',
        packageFolder: 'foundry-core',
        target: 'angular-app',
        imports: [{ entry: '', symbols: 'whole-entry' }],
        budget: null,
      },
    ]);
  });

  it('skips the entries that already have a row and the testing entry', () => {
    const explicit: ReadonlyArray<SizeMeasurement> = [
      {
        name: 'utils/date',
        packageFolder: 'foundry-utils',
        target: 'bundle',
        imports: 'every-entry',
        budget: { rawKilobytes: 7, gzipKilobytes: 2.8 },
      },
    ];
    expect(
      createWholeEntryMeasurements({
        builtEntries: [createBuiltEntry('foundry-utils', 'date'), createBuiltEntry('foundry-core', 'testing')],
        explicitMeasurements: explicit,
      }),
    ).toEqual([]);
  });
});
