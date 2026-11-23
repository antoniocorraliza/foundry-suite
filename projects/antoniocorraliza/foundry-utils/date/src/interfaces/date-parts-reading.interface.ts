import type { CivilDate } from './civil-date.interface';
import type { PartsTime } from './parts-time.interface';

/** Holds the day of a parts object and its time, which is `null` when a time part is invalid or missing above another. */
export interface DatePartsReading {
  readonly date: CivilDate;
  readonly time: PartsTime | null;
}
