import type { SizeReference } from '../types/size-reference.type.ts';
import type { PendingMeasurement } from './pending-measurement.interface.ts';
import type { SizeMeasurement } from './size-measurement.interface.ts';

export interface SizeReport {
  readonly measured: SizeReference;
  readonly measurements: ReadonlyArray<SizeMeasurement>;
  readonly pending: ReadonlyArray<PendingMeasurement>;
}
