import type { WeekInfo } from './week-info.interface.ts';

// Node 22 only has the weekInfo property; newer engines replace it with getWeekInfo().
export interface LocaleWithWeekInfo {
  readonly region?: string;
  readonly weekInfo?: WeekInfo;
  readonly getWeekInfo?: () => WeekInfo;
}
