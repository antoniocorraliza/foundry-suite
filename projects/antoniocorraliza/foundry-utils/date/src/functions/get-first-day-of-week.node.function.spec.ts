import { describe, expect, it } from 'vitest';
import { runWithoutWeekData } from '@foundry-test/functions/run-without-week-data.function';
import { listTwoLetterRegions } from '../../../../../../tools/cldr/functions/list-two-letter-regions.function';
import { readLocaleFirstDay } from '../../../../../../tools/cldr/functions/read-locale-first-day.function';
import { getFirstDayOfWeek } from './get-first-day-of-week.function';

const LANGUAGES: ReadonlyArray<string> = ['en', 'pt', 'ja', 'hi', 'he', 'fr', 'de', 'zh', 'es', 'ar'];

describe('getFirstDayOfWeek against the CLDR data of Node', () => {
  it('gives the first day of the week of Node for every two-letter region', () => {
    const mismatches: Array<string> = listTwoLetterRegions()
      .map((region) => `und-${region}`)
      .filter((tag) => readLocaleFirstDay(tag) !== getFirstDayOfWeek(tag))
      .map((tag) => `${tag}: engine ${String(readLocaleFirstDay(tag))}, table ${getFirstDayOfWeek(tag)}`);
    expect(mismatches).toEqual([]);
  });

  it.each(LANGUAGES)('gives the first day of the week of Node for %s, without a region', (language) => {
    expect(getFirstDayOfWeek(language)).toBe(readLocaleFirstDay(language));
  });

  it('reads an old region code as the current one, as Node does: und-BU is Myanmar and starts on Sunday', () => {
    expect(getFirstDayOfWeek('und-BU')).toBe(0);
    expect(runWithoutWeekData(() => getFirstDayOfWeek('und-BU'))).toBe(0);
  });
});
