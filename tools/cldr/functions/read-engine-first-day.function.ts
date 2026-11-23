import type { LocaleWithWeekInfo } from '../interfaces/locale-with-week-info.interface.ts';
import type { WeekInfo } from '../interfaces/week-info.interface.ts';

// Returns null for a code that the engine turns into another region (BU becomes MM), so each region appears once.
export function readEngineFirstDay(region: string): number | null {
  const locale: LocaleWithWeekInfo = new Intl.Locale(`und-${region}`) as LocaleWithWeekInfo;
  const weekInfo: WeekInfo | undefined = locale.getWeekInfo?.() ?? locale.weekInfo;
  if (locale.region !== region || weekInfo === undefined) return null;
  return weekInfo.firstDay % 7;
}
