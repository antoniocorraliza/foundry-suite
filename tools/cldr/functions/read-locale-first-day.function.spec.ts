import { describe, expect, it } from 'vitest';
import { readLocaleFirstDay } from './read-locale-first-day.function.ts';

describe('readLocaleFirstDay', () => {
  it('gives the first day of the week of a locale, with Sunday as 0', () => {
    expect([readLocaleFirstDay('en-US'), readLocaleFirstDay('es-ES'), readLocaleFirstDay('und-EG')]).toEqual([0, 1, 6]);
  });

  it('reads an old region code as the engine does: und-BU is Myanmar', () => {
    expect(readLocaleFirstDay('und-BU')).toBe(readLocaleFirstDay('und-MM'));
  });
});
