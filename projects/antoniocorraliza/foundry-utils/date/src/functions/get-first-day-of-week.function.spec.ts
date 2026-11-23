import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { getFirstDayOfWeek } from './get-first-day-of-week.function';

const LOCALE_CASES: ReadonlyArray<[string, number]> = [
  ['es-ES', 1],
  ['en-US', 0],
  ['pt-BR', 0],
  ['pt-PT', 0],
  ['es-MX', 0],
  ['en-GB', 1],
  ['ar-EG', 6],
  ['fa-IR', 6],
  ['dv-MV', 5],
  ['ar-AE', 1],
  ['en', 0],
  ['pt', 0],
  ['ja', 0],
  ['hi', 0],
  ['he', 0],
  ['fr', 1],
  ['de', 1],
  ['zh', 1],
  ['es', 1],
  ['ar', 6],
  ['en-US-u-fw-mon', 1],
  ['es-ES-u-fw-sun', 0],
  ['de-AT-u-fw-sat', 6],
  ['en-u-fw-xyz', 0],
  ['en-u-rg-gbzzzz', 1],
  ['es-u-rg-mxzzzz', 0],
  ['en-u-rg-001zzzz', 0],
  ['es-419', 1],
  ['en-001', 1],
  ['xx', 1],
  ['EN-us', 0],
  ['und-BU', 0],
  ['und', 0],
];

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

describe('getFirstDayOfWeek', () => {
  it.each(LOCALE_CASES)('gives for %s the weekday %i', (locale, expected) => {
    expect(getFirstDayOfWeek(locale)).toBe(expected);
  });

  it('gives the same weekdays without the week data of the engine', () => {
    expect(runWithoutWeekData(() => LOCALE_CASES.map(([locale]) => getFirstDayOfWeek(locale)))).toEqual(
      LOCALE_CASES.map(([, expected]) => expected),
    );
  });

  it.each(['es_ES', '', ' es', 'español'])('throws a RangeError for the invalid tag %j', (locale) => {
    expect(catchThrown(() => getFirstDayOfWeek(locale))).toBeInstanceOf(RangeError);
  });

  it.each<unknown>([123, null, undefined, new Intl.Locale('es-ES'), new String('es-ES')])(
    'throws a TypeError for %s, which is not a text',
    (locale) => {
      expect(catchThrown(() => getFirstDayOfWeek(locale as string))).toBeInstanceOf(TypeError);
    },
  );

  it('ignores a second argument', () => {
    expect((getFirstDayOfWeek as (locale: string, extra: unknown) => number)('en-US', { firstDay: 1 })).toBe(0);
  });

  it('always gives a weekday from 0 to 6 for valid generated tags', () => {
    const language: fc.Arbitrary<string> = fc.constantFrom('en', 'es', 'pt', 'ar', 'fa', 'de', 'ja', 'zh', 'und');
    const region: fc.Arbitrary<string> = fc.constantFrom('', '-US', '-ES', '-GB', '-EG', '-MV', '-IR', '-419', '-001', '-AQ');
    const extension: fc.Arbitrary<string> = fc.constantFrom(
      '',
      '-u-fw-mon',
      '-u-fw-sun',
      '-u-fw-sat',
      '-u-rg-gbzzzz',
      '-u-rg-uszzzz',
      '-u-ca-gregory',
    );
    fc.assert(
      fc.property(language, region, extension, (first, second, third) => {
        const weekday: number = getFirstDayOfWeek(`${first}${second}${third}`);
        return Number.isInteger(weekday) && weekday >= 0 && weekday <= 6;
      }),
    );
  });
});
