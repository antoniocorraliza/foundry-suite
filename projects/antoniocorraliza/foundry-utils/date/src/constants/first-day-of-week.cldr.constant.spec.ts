import { describe, expect, it } from 'vitest';
import { getFirstDayOfWeek } from '../functions/get-first-day-of-week.function';

interface EngineWeekInfo {
  readonly firstDay: number;
}

interface LocaleWithWeekInfo {
  readonly region?: string;
  readonly weekInfo?: EngineWeekInfo;
  readonly getWeekInfo?: () => EngineWeekInfo;
}

const LETTERS: Array<string> = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

const LANGUAGES: ReadonlyArray<string> = ['en', 'pt', 'ja', 'hi', 'he', 'fr', 'de', 'zh', 'es', 'ar'];

function readEngineFirstDay(tag: string): number | null {
  const locale: LocaleWithWeekInfo = new Intl.Locale(tag) as LocaleWithWeekInfo;
  const weekInfo: EngineWeekInfo | undefined = locale.getWeekInfo?.() ?? locale.weekInfo;
  return weekInfo === undefined ? null : weekInfo.firstDay % 7;
}

describe('FIRST_DAY_OF_WEEK_REGIONS', () => {
  it('gives the first day of the week of the engine for every two-letter region', () => {
    const tags: Array<string> = LETTERS.flatMap((first) => LETTERS.map((second) => `und-${first}${second}`));
    const mismatches: Array<string> = tags
      .filter((tag) => readEngineFirstDay(tag) !== getFirstDayOfWeek(tag))
      .map((tag) => `${tag}: engine ${String(readEngineFirstDay(tag))}, table ${getFirstDayOfWeek(tag)}`);
    expect(mismatches).toEqual([]);
  });

  it.each(LANGUAGES)('gives the first day of the week of the engine for %s, without a region', (language) => {
    expect(getFirstDayOfWeek(language)).toBe(readEngineFirstDay(language));
  });
});
