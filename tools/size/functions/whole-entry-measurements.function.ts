import { DEFAULT_SIZE_TARGETS } from '../constants/default-size-targets.constant.ts';
import { NOT_MEASURED_ENTRIES } from '../constants/size-settings.constant.ts';
import type { BuiltEntry } from '../interfaces/built-entry.interface.ts';
import type { SizeMeasurement } from '../interfaces/size-measurement.interface.ts';
import { entryMeasurementName } from './entry-measurement-name.function.ts';

export function wholeEntryMeasurements(entries: ReadonlyArray<BuiltEntry>, rows: ReadonlyArray<SizeMeasurement>): Array<SizeMeasurement> {
  const explicitNames: ReadonlySet<string> = new Set(rows.map((measurement) => measurement.name));
  return entries
    .filter((builtEntry) => !NOT_MEASURED_ENTRIES.includes(builtEntry.entry))
    .map((builtEntry) => ({
      name: entryMeasurementName(builtEntry.packageFolder, builtEntry.entry),
      packageFolder: builtEntry.packageFolder,
      target: DEFAULT_SIZE_TARGETS[builtEntry.packageFolder],
      imports: [{ entry: builtEntry.entry, symbols: 'whole-entry' as const }],
      budget: null,
    }))
    .filter((measurement) => !explicitNames.has(measurement.name));
}
