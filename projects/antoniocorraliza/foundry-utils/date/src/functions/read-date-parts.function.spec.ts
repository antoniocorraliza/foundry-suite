import { describe, expect, it } from 'vitest';
import { readWallClock } from '@foundry-test/functions/read-wall-clock.function';
import { parseCalendarDay } from './parse-calendar-day.function';
import { parseDate } from './parse-date.function';
import { parseLocalDateTime } from './parse-local-date-time.function';

type ReadParts = (value: unknown) => string | null;

interface PartsReader {
  readonly name: string;
  readonly parts: Readonly<Record<string, number>>;
  readonly read: ReadParts;
  readonly expected: string;
}

class Appointment {}

const READERS: ReadonlyArray<PartsReader> = [
  {
    name: 'parseDate',
    parts: { year: 2026, month: 3, day: 1 },
    read: (value) => readWallClock(parseDate(value)),
    expected: '2026-03-01T00:00:00.000',
  },
  { name: 'parseCalendarDay', parts: { year: 2026, month: 9, day: 1 }, read: (value) => parseCalendarDay(value), expected: '2026-09-01' },
  {
    name: 'parseLocalDateTime',
    parts: { year: 2026, month: 11, day: 14, hours: 9, minutes: 30 },
    read: (value) => parseLocalDateTime(value),
    expected: '2026-11-14T09:30',
  },
];

describe('readDateParts', () => {
  describe.each(READERS)('through $name', ({ parts, read, expected }) => {
    it('reads a plain object and an object with a null prototype', () => {
      expect(read({ ...parts })).toBe(expected);
      expect(read(Object.assign(Object.create(null) as object, parts))).toBe(expected);
    });

    it('gives null for an array, a map, a class instance and inherited parts', () => {
      expect(read(Object.values(parts))).toBeNull();
      expect(read(new Map(Object.entries(parts)))).toBeNull();
      expect(read(Object.assign(new Appointment(), parts))).toBeNull();
      expect(read(Object.create(parts) as object)).toBeNull();
    });

    it('never runs a getter of the parts and counts it as missing', () => {
      const partsWithoutYear: object = Object.fromEntries(Object.entries(parts).filter(([name]) => name !== 'year'));
      const withGetter: object = Object.defineProperty(partsWithoutYear, 'year', {
        enumerable: true,
        get: (): never => {
          throw new Error('[test]: the getter ran');
        },
      });
      expect(read(withGetter)).toBeNull();
    });
  });
});
