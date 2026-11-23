import { describe, expect, it } from 'vitest';
import { getFirstDayOfWeek } from './get-first-day-of-week.function';

interface EngineWeekInfo {
  readonly firstDay: number;
}

interface LocaleWithWeekInfo {
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

function runWithoutWeekData<T>(action: () => T): T {
  const prototype: object = Intl.Locale.prototype;
  const descriptors: Array<[string, PropertyDescriptor | undefined]> = ['weekInfo', 'getWeekInfo'].map((key) => [
    key,
    Object.getOwnPropertyDescriptor(prototype, key),
  ]);
  descriptors.forEach(([key]) => Reflect.deleteProperty(prototype, key));
  try {
    return action();
  } finally {
    descriptors.forEach(([key, descriptor]) => {
      if (descriptor !== undefined) Object.defineProperty(prototype, key, descriptor);
    });
  }
}

describe('getFirstDayOfWeek against the CLDR data of Node', () => {
  it('gives the first day of the week of Node for every two-letter region', () => {
    const tags: Array<string> = LETTERS.flatMap((first) => LETTERS.map((second) => `und-${first}${second}`));
    const mismatches: Array<string> = tags
      .filter((tag) => readEngineFirstDay(tag) !== getFirstDayOfWeek(tag))
      .map((tag) => `${tag}: engine ${String(readEngineFirstDay(tag))}, table ${getFirstDayOfWeek(tag)}`);
    expect(mismatches).toEqual([]);
  });

  it.each(LANGUAGES)('gives the first day of the week of Node for %s, without a region', (language) => {
    expect(getFirstDayOfWeek(language)).toBe(readEngineFirstDay(language));
  });

  it('reads an old region code as the current one, as Node does: und-BU is Myanmar and starts on Sunday', () => {
    expect(getFirstDayOfWeek('und-BU')).toBe(0);
    expect(runWithoutWeekData(() => getFirstDayOfWeek('und-BU'))).toBe(0);
  });
});
