import type { BuiltEntry } from './built-entry.interface.ts';
import type { SizeMeasurement } from './size-measurement.interface.ts';

export interface WholeEntryMeasurementRequest {
  readonly builtEntries: ReadonlyArray<BuiltEntry>;
  readonly explicitMeasurements: ReadonlyArray<SizeMeasurement>;
}
