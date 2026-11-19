import type { ResolvedImport } from './resolved-import.interface.ts';
import type { SizeMeasurement } from './size-measurement.interface.ts';

export interface ResolvedMeasurement {
  readonly status: 'measurable';
  readonly measurement: SizeMeasurement;
  readonly imports: ReadonlyArray<ResolvedImport>;
}
