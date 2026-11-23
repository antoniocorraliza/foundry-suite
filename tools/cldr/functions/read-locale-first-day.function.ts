import type { LocaleWithWeekInfo } from '../interfaces/locale-with-week-info.interface.ts';
import type { WeekInfo } from '../interfaces/week-info.interface.ts';

export function readLocaleFirstDay(tag: string): number | null {
  const locale: LocaleWithWeekInfo = new Intl.Locale(tag) as LocaleWithWeekInfo;
  const weekInfo: WeekInfo | undefined = locale.getWeekInfo?.() ?? locale.weekInfo;
  return weekInfo === undefined ? null : weekInfo.firstDay % 7;
}
