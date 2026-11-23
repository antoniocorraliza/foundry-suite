import type { CivilDate } from './civil-date.interface';

/** Holds the day read at the start of a text and the text that follows it. */
export interface DateTextReading {
  readonly date: CivilDate;
  readonly rest: string;
}
