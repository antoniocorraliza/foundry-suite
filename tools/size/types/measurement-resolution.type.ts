import type { PendingMeasurement } from '../interfaces/pending-measurement.interface.ts';
import type { ResolvedMeasurement } from '../interfaces/resolved-measurement.interface.ts';

export type MeasurementResolution = ResolvedMeasurement | PendingMeasurement;
