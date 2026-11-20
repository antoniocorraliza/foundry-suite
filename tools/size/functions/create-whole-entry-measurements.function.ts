import { DEFAULT_SIZE_TARGETS } from '../constants/default-size-targets.constant.ts';
import { NOT_MEASURED_ENTRIES } from '../constants/not-measured-entries.constant.ts';
import type { SizeMeasurement } from '../interfaces/size-measurement.interface.ts';
import type { WholeEntryMeasurementRequest } from '../interfaces/whole-entry-measurement-request.interface.ts';
import { getEntryMeasurementName } from './get-entry-measurement-name.function.ts';

export function createWholeEntryMeasurements(request: WholeEntryMeasurementRequest): Array<SizeMeasurement> {
  const explicitNames: ReadonlySet<string> = new Set(request.explicitMeasurements.map((measurement) => measurement.name));
  return request.builtEntries
    .filter((builtEntry) => !NOT_MEASURED_ENTRIES.includes(builtEntry.entry))
    .map((builtEntry) => ({
      name: getEntryMeasurementName(builtEntry.packageFolder, builtEntry.entry),
      packageFolder: builtEntry.packageFolder,
      target: DEFAULT_SIZE_TARGETS[builtEntry.packageFolder],
      imports: [{ entry: builtEntry.entry, symbols: 'whole-entry' as const }],
      budget: null,
    }))
    .filter((measurement) => !explicitNames.has(measurement.name));
}
