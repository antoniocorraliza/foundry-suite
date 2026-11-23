import type { CivilDate } from './civil-date.interface';
import type { ClockTime } from './clock-time.interface';

/** Day and clock time of a canonical `'YYYY-MM-DDTHH:mm'` value. */
export interface CivilDateTime {
  readonly date: CivilDate;
  readonly time: ClockTime;
}
