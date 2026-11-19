import type { SizeMeasurement } from './size-measurement.interface.ts';

export interface PendingMeasurement {
  readonly status: 'pending';
  readonly measurement: SizeMeasurement;
  readonly reason: string;
}
